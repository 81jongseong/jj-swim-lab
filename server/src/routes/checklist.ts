import * as express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { logInfo, logError } from '../utils/logger';
import Checklist from '../models/Checklist';
import TeachingMethod from '../models/TeachingMethod';
import { Course } from '../models/Course';

const router: express.Router = express.Router();

// 체크리스트 목록 조회
router.get('/', auth, cache({ ttl: 300 }), async (req: express.Request, res: express.Response) => {
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
router.get('/instructor/:instructorId', auth, requireRole(['instructor']), async (req: express.Request, res: express.Response) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = { instructorId };
    if (status) filter.status = status;
    
    const checklists = await Checklist.find(filter)
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
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

// 학생별 체크리스트 조회
router.get('/student/:studentId/course/:courseId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { studentId, courseId } = req.params;
    
    const checklist = await Checklist.findOne({ studentId, courseId })
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('instructorId', 'name email')
      .populate('teachingMethodId', 'name');
    
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
router.post('/generate', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { studentId, courseId, teachingMethodId } = req.body;
    
    if (!studentId || !courseId || !teachingMethodId) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    // 기존 체크리스트 확인
    const existingChecklist = await Checklist.findOne({ studentId, courseId });
    if (existingChecklist) {
      return res.status(400).json({ error: '이미 체크리스트가 존재합니다.' });
    }
    
    // 강습법 정보 가져오기
    const teachingMethod = await TeachingMethod.findById(teachingMethodId);
    if (!teachingMethod) {
      return res.status(404).json({ error: '강습법을 찾을 수 없습니다.' });
    }
    
    // 체크리스트 아이템 생성
    const items = teachingMethod.steps.map((step: any, index: number) => ({
      stepName: step.name || `단계 ${index + 1}`,
      stepOrder: index + 1,
      category: step.category || 'general',
      difficulty: step.difficulty || 'beginner',
      tips: step.tips || '',
      isCompleted: false
    }));
    
    const checklist = new Checklist({
      studentId,
      courseId,
      instructorId: (req as any).user._id,
      teachingMethodId,
      items,
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
router.get('/:checklistId', auth, async (req: express.Request, res: express.Response) => {
  try {
    const checklist = await Checklist.findById(req.params.checklistId)
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('instructorId', 'name email')
      .populate('teachingMethodId', 'name');
    
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
router.patch('/:checklistId/items/:itemIndex', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
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
router.patch('/:checklistId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
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
router.delete('/:checklistId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
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

export default router;
