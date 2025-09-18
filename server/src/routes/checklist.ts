import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware, requireRole } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { logInfo, logError } from '../utils/logger';
import { Checklist } from '../models/Checklist';
import { ChecklistTemplate } from '../models/ChecklistTemplate';
import { TeachingMethod } from '../models/TeachingMethod';
import { Course } from '../models/Course';
import { User } from '../models/User';

const router: express.Router = express.Router();

// 체크리스트 목록 조회
router.get('/', authMiddleware, cache({ ttl: 300 }), async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 20, status, studentId, courseId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    
    const checklists = await Checklist.find(filter)
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('instructorId', 'name email')
      .populate('teachingMethodId', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ lastUpdated: -1 });
    
    const total = await Checklist.countDocuments(filter);
    
    res.json({
      checklists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('체크리스트 목록 조회 실패', error);
    res.status(500).json({ error: '체크리스트 목록을 불러오는데 실패했습니다.' });
  }
});

// 강사별 체크리스트 조회
router.get('/instructor/:instructorId', authMiddleware, requireRole(['instructor']), async (req: express.Request, res: express.Response) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = { instructorId };
    if (status) filter.status = status;
    
    const checklists = await Checklist.find(filter)
      .populate('studentId', 'name email phone currentLevel lastLesson nextLesson attendance totalLessons')
      .populate('courseId', 'name level')
      .populate('teachingMethodId', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ lastUpdated: -1 });
    
    const total = await Checklist.countDocuments(filter);
    
    res.json({
      checklists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('강사별 체크리스트 조회 실패', error);
    res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
  }
});

// 현재 로그인한 강사의 체크리스트 조회
router.get('/instructor/me', authMiddleware, requireRole(['instructor']), async (req: express.Request, res: express.Response) => {
  try {
    const instructorId = (req as any).user._id;
    
    const checklists = await Checklist.find({ instructorId })
      .populate('studentId', 'name email phone currentLevel lastLesson nextLesson attendance totalLessons')
      .populate('courseId', 'name level')
      .populate('teachingMethodId', 'name')
      .sort({ lastUpdated: -1 });
    
    res.json({ checklists });
  } catch (error) {
    logError('현재 강사 체크리스트 조회 실패', error);
    res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
  }
});

// 학생별 체크리스트 조회
router.get('/student/:studentId/course/:courseId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { studentId, courseId } = req.params;
    
    const checklist = await Checklist.findOne({ studentId, courseId })
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('instructorId', 'name email');
      // teachingMethodId populate 제거 - 해당 필드가 더 이상 존재하지 않음
    
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    res.json({ checklist });
  } catch (error) {
    logError('학생별 체크리스트 조회 실패', error);
    res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
  }
});

// 체크리스트 생성
router.post('/generate', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { studentId, courseId, studentLevel } = req.body;
    
    if (!studentId || !courseId || !studentLevel) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    // 기존 체크리스트 확인
    const existingChecklist = await Checklist.findOne({ studentId, courseId });
    if (existingChecklist) {
      return res.status(400).json({ error: '이미 체크리스트가 존재합니다.' });
    }
    
    // 강습법 정보 가져오기 (레벨별로 모든 강습법 가져오기)
    const englishLevel = studentLevel === '초급' ? 'beginner' : 
                        studentLevel === '중급' ? 'intermediate' : 
                        studentLevel === '고급' ? 'advanced' : 'beginner';
    
    const teachingMethods = await TeachingMethod.find({ level: englishLevel });
    if (!teachingMethods || teachingMethods.length === 0) {
      return res.status(404).json({ error: '해당 레벨의 강습법을 찾을 수 없습니다.' });
    }
    
    // 모든 강습법의 단계를 하나의 체크리스트로 통합
    const allItems: any[] = [];
    let stepOrder = 1;
    
    teachingMethods.forEach((method, methodIndex) => {
      method.steps.forEach((step: string, stepIndex: number) => {
        allItems.push({
          stepName: step,
          stepOrder: stepOrder++,
          category: method.category || 'general',
          difficulty: method.level || 'beginner',
          tips: method.tips[stepIndex] || '',
          teachingMethodId: method._id, // 어떤 강습법에서 온 것인지 추적
          isCompleted: false
        });
      });
    });
    
    const checklist = new Checklist({
      studentId,
      courseId,
      instructorId: (req as any).user._id,
      // teachingMethodId 제거 - items에 이미 포함되어 있음
      items: allItems,
      overallProgress: 0,
      status: 'active',
      startDate: new Date()
    });
    
    await checklist.save();
    
    logInfo('체크리스트 생성', { checklistId: checklist._id, studentId, courseId });
    res.status(201).json({ checklist });
  } catch (error) {
    logError('체크리스트 생성 실패', error);
    res.status(500).json({ error: '체크리스트 생성에 실패했습니다.' });
  }
});

// 체크리스트 상세 조회
router.get('/:checklistId', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const checklist = await Checklist.findById(req.params.checklistId)
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('instructorId', 'name email');
      // teachingMethodId populate 제거 - 해당 필드가 더 이상 존재하지 않음
    
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    res.json({ checklist });
  } catch (error) {
    logError('체크리스트 상세 조회 실패', error);
    res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
  }
});

// 체크리스트 아이템 상태 변경
router.patch('/:checklistId/items/:itemIndex', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId, itemIndex } = req.params;
    const { isCompleted, notes } = req.body;
    
    const checklist = await Checklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    const itemIndexNum = Number(itemIndex);
    if (itemIndexNum < 0 || itemIndexNum >= checklist.items.length) {
      return res.status(400).json({ error: '유효하지 않은 아이템 인덱스입니다.' });
    }
    
    const item = checklist.items[itemIndexNum];
    if (isCompleted !== undefined) {
      item.isCompleted = isCompleted;
      if (isCompleted) {
        item.completedAt = new Date();
      } else {
        item.completedAt = undefined;
      }
    }
    if (notes !== undefined) {
      item.notes = notes;
    }
    
    await checklist.save();
    
    logInfo('체크리스트 아이템 상태 변경', { checklistId, itemIndex, isCompleted });
    res.json({ checklist });
  } catch (error) {
    logError('체크리스트 아이템 상태 변경 실패', error);
    res.status(500).json({ error: '아이템 상태 변경에 실패했습니다.' });
  }
});

// 체크리스트 수정
router.patch('/:checklistId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { status, notes, targetCompletionDate } = req.body;
    
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (targetCompletionDate !== undefined) updateData.targetCompletionDate = targetCompletionDate;
    
    const checklist = await Checklist.findByIdAndUpdate(
      req.params.checklistId,
      updateData,
      { new: true }
    );
    
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    logInfo('체크리스트 수정', { checklistId: checklist._id, status });
    res.json({ checklist });
  } catch (error) {
    logError('체크리스트 수정 실패', error);
    res.status(500).json({ error: '체크리스트 수정에 실패했습니다.' });
  }
});

// 체크리스트 삭제
router.delete('/:checklistId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const checklist = await Checklist.findByIdAndDelete(req.params.checklistId);
    
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    logInfo('체크리스트 삭제', { checklistId: req.params.checklistId });
    res.json({ message: '체크리스트가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    logError('체크리스트 삭제 실패', error);
    res.status(500).json({ error: '체크리스트 삭제에 실패했습니다.' });
  }
});

// 체크리스트 상태 업데이트 (강사만)
router.put('/:checklistId/status', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId } = req.params;
    const { status, notes } = req.body;
    
    if (!['active', 'completed', 'paused'].includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태입니다.' });
    }
    
    // 체크리스트 조회
    const checklist = await Checklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    // 권한 확인 (강사가 해당 체크리스트의 담당자인지)
    if (checklist.instructorId.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: '이 체크리스트를 수정할 권한이 없습니다.' });
    }
    
    // 상태 업데이트
    checklist.status = status;
    if (notes !== undefined) checklist.notes = notes;
    checklist.lastUpdated = new Date();
    
    // 완료 상태로 변경 시 완료일 설정
    if (status === 'completed' && !checklist.completedAt) {
      checklist.completedAt = new Date();
    }
    
    await checklist.save();
    
    res.json({
      success: true,
      message: '체크리스트 상태가 업데이트되었습니다.',
      data: {
        status: checklist.status,
        lastUpdated: checklist.lastUpdated,
        completedAt: checklist.completedAt
      }
    });
  } catch (error) {
    logError('체크리스트 상태 업데이트 실패', error);
    res.status(500).json({ error: '체크리스트 상태 업데이트에 실패했습니다.' });
  }
});

// 강사별 성과 분석 (센터 관리자만)
router.get('/instructor/:instructorId/performance', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { instructorId } = req.params;
    
    // 강사 정보 조회
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.userType !== 'instructor') {
      return res.status(404).json({ error: '강사를 찾을 수 없습니다.' });
    }
    
    // 강사별 체크리스트 통계
    const totalChecklists = await Checklist.countDocuments({ instructorId });
    const completedChecklists = await Checklist.countDocuments({ 
      instructorId, 
      status: 'completed' 
    });
    
    // 평균 진행률 계산
    const checklists = await Checklist.find({ instructorId });
    const averageProgress = checklists.length > 0 
      ? Math.round(checklists.reduce((sum, checklist) => sum + checklist.overallProgress, 0) / checklists.length)
      : 0;
    
    // 학생 통계 (체크리스트를 가진 학생 수)
    const uniqueStudents = await Checklist.distinct('studentId', { instructorId });
    const activeStudents = await Checklist.distinct('studentId', { 
      instructorId, 
      status: 'active' 
    });
    
    // 최근 활동 (최근 업데이트된 체크리스트)
    const recentChecklists = await Checklist.find({ instructorId })
      .populate('studentId', 'name')
      .sort({ lastUpdated: -1 })
      .limit(5);
    
    const recentActivity = recentChecklists.map(checklist => ({
      date: checklist.lastUpdated.toISOString().split('T')[0],
      action: checklist.status === 'completed' ? '체크리스트 완료' : '진행도 업데이트',
      student: (checklist.studentId as any)?.name || '알 수 없음'
    }));
    
    res.json({
      success: true,
      data: {
        totalChecklists,
        completedChecklists,
        averageProgress,
        totalStudents: uniqueStudents.length,
        activeStudents: activeStudents.length,
        recentActivity
      }
    });
  } catch (error) {
    logError('강사 성과 분석 실패', error);
    res.status(500).json({ error: '성과 분석에 실패했습니다.' });
  }
});

// 체크리스트 템플릿 목록 조회
router.get('/templates', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 20, level, creatorType } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { isActive: true };
    
    if (level && level !== 'all') {
      filter.levels = level;
    }
    
    if (creatorType) {
      filter.creatorType = creatorType;
    }

    // 사용자가 볼 수 있는 템플릿 필터링 (공개 템플릿 또는 자신이 생성한 템플릿)
    const user = (req as any).user;
    if (user.userType === 'instructor') {
      filter.$or = [
        { isPublic: true },
        { creatorId: user._id, creatorType: 'instructor' }
      ];
    } else if (user.userType === 'centerAdmin') {
      // 센터 관리자는 공개 템플릿과 자신의 센터 템플릿을 볼 수 있음
      filter.$or = [
        { isPublic: true },
        { creatorType: 'center' }
      ];
    }

    const templates = await ChecklistTemplate.find(filter)
      .populate('creatorId', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ChecklistTemplate.countDocuments(filter);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('템플릿 목록 조회 실패', error);
    res.status(500).json({ error: '템플릿 목록 조회에 실패했습니다.' });
  }
});

// 체크리스트 템플릿 생성
router.post('/templates', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, levels, items, tags, isPublic } = req.body;
    const user = (req as any).user;

    if (!name || !description || !items || items.length === 0) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    const templateData: any = {
      name,
      description,
      levels: levels || [],
      items: items.map((item: any, index: number) => ({
        ...item,
        stepOrder: index + 1
      })),
      tags: tags || [],
      isPublic: isPublic || false,
      creatorId: user._id,
      creatorType: user.userType === 'instructor' ? 'instructor' : 'center',
      isActive: true
    };

    // 센터 관리자인 경우 centerId 추가
    if (user.userType === 'centerAdmin' && (user as any).centerAdminInfo?.managedCenters?.[0]) {
      templateData.centerId = (user as any).centerAdminInfo.managedCenters[0];
    }

    const template = new ChecklistTemplate(templateData);
    await template.save();

    res.status(201).json({
      success: true,
      message: '템플릿이 성공적으로 생성되었습니다.',
      data: template
    });
  } catch (error) {
    logError('템플릿 생성 실패', error);
    res.status(500).json({ error: '템플릿 생성에 실패했습니다.' });
  }
});

// 체크리스트 템플릿 삭제
router.delete('/templates/:id', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const template = await ChecklistTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }

    // 권한 확인: 생성자이거나 센터 관리자여야 함
    const canDelete = template.creatorId.toString() === user._id.toString() ||
                     user.userType === 'superAdmin' ||
                     (user.userType === 'centerAdmin' && template.creatorType === 'center');

    if (!canDelete) {
      return res.status(403).json({ error: '템플릿을 삭제할 권한이 없습니다.' });
    }

    await ChecklistTemplate.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '템플릿이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    logError('템플릿 삭제 실패', error);
    res.status(500).json({ error: '템플릿 삭제에 실패했습니다.' });
  }
});

// 템플릿으로부터 체크리스트 생성
router.post('/from-template/:templateId', authMiddleware, requireRole(['instructor']), async (req: express.Request, res: express.Response) => {
  try {
    const { templateId } = req.params;
    const { studentId, courseId } = req.body;
    const user = (req as any).user;

    if (!studentId || !courseId) {
      return res.status(400).json({ error: '학생 ID와 과정 ID가 필요합니다.' });
    }

    const template = await ChecklistTemplate.findById(templateId);
    if (!template || !template.isActive) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }

    // 학생과 과정 확인
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || student.userType !== 'student') {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }

    if (!course) {
      return res.status(404).json({ error: '과정을 찾을 수 없습니다.' });
    }

    // 체크리스트 생성
    const checklistData = {
      studentId,
      courseId,
      instructorId: user._id,
      items: template.items.map((item: any) => ({
        stepName: item.stepName,
        stepOrder: item.stepOrder,
        category: item.category,
        difficulty: item.difficulty,
        tips: item.tips,
        isCompleted: false
      })),
      overallProgress: 0,
      status: 'active',
      startDate: new Date()
    };

    const checklist = new Checklist(checklistData);
    await checklist.save();

    res.status(201).json({
      success: true,
      message: '템플릿으로부터 체크리스트가 생성되었습니다.',
      data: checklist
    });
  } catch (error) {
    logError('템플릿 기반 체크리스트 생성 실패', error);
    res.status(500).json({ error: '체크리스트 생성에 실패했습니다.' });
  }
});

export default router;
