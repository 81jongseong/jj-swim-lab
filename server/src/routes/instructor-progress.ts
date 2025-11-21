/**
 * @file 강사용 레슨 진행/출석 관리 API
 * @description 출석, 코멘트, 과제 정보를 저장/조회하는 라우트
 * 연동 모델: InstructorProgress, User, Checklist, StudentProgress, TeachingMethod
 */

import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import { authMiddleware, requireRole } from '../middleware/auth';
import { InstructorProgress } from '../models/InstructorProgress';
import { Checklist } from '../models/Checklist';
import { StudentProgress } from '../models/StudentProgress';
import { ClassChecklist } from '../models/ClassChecklist';
import { TeachingMethod } from '../models/TeachingMethod';
import { User } from '../models/User';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';
// import { Course } from '../models/Course'; // 사용되지 않음

const router = express.Router();

// 레벨 체크리스트 집계 함수
const aggregateLevelChecklist = async (studentId: Types.ObjectId, studentLevel: string): Promise<any[]> => {
  const studentObjectId = new Types.ObjectId(studentId);
  
  // 1. 학생의 현재 레벨과 다음 레벨 결정
  // const levelMap: { [key: string]: string } = { // 사용되지 않음
  //   'beginner': '초급',
  //   'intermediate': '중급',
  //   'advanced': '고급'
  // };
  
  const reverseLevelMap: { [key: string]: string } = {
    '초급': 'beginner',
    '중급': 'intermediate',
    '고급': 'advanced'
  };
  
  const currentLevelEnglish = reverseLevelMap[studentLevel] || 'beginner';
  const nextLevelEnglish = currentLevelEnglish === 'beginner' ? 'intermediate' : 
                          currentLevelEnglish === 'intermediate' ? 'advanced' : 'advanced';
  
  // 2. 해당 레벨의 강습법 조회 (최고관리자 또는 일반 강습법)
  const teachingMethods = await TeachingMethod.find({
    isActive: true,
    level: { $in: [currentLevelEnglish, nextLevelEnglish] },
    $or: [
      { createdByRole: 'superAdmin' },
      { createdByRole: { $exists: false } },
      { createdByRole: null }
    ]
  }).sort({ order: 1, createdAt: 1 });
  
  // 3. 학생의 모든 실제 체크리스트에서 완료된 항목 수집
  // 개별 체크리스트 (Checklist)
  const individualChecklists = await Checklist.find({
    studentId: studentObjectId,
    status: { $in: ['active', 'completed'] }
  }).lean();
  
  // 반 체크리스트의 학생 진행도 (StudentProgress)
  const studentProgressRecords = await StudentProgress.find({
    studentId: studentObjectId,
    status: { $in: ['active', 'completed'] }
  }).populate('classChecklistId').lean();
  
  // 완료된 항목 맵 생성 (teachingMethodId + stepName 기준)
  const completedItemsMap = new Map<string, { completedAt?: Date; checked: boolean }>();
  
  // 개별 체크리스트에서 완료된 항목 수집
  individualChecklists.forEach((checklist: any) => {
    checklist.items?.forEach((item: any) => {
      if (item.isCompleted && item.teachingMethodId && item.stepName) {
        const key = `${item.teachingMethodId.toString()}-${item.stepName}`;
        const existing = completedItemsMap.get(key);
        if (!existing || !existing.completedAt || (item.completedAt && new Date(item.completedAt) > new Date(existing.completedAt))) {
          completedItemsMap.set(key, {
            completedAt: item.completedAt ? new Date(item.completedAt) : new Date(),
            checked: true
          });
        }
      }
    });
  });
  
  // 반 체크리스트 진행도에서 완료된 항목 수집
  for (const progress of studentProgressRecords) {
    const classChecklist = (progress as any).classChecklistId;
    if (!classChecklist) continue;
    
    // ClassChecklist에서 각 항목의 teachingMethodId 찾기
    const classChecklistData = await ClassChecklist.findById(classChecklist._id || classChecklist).lean();
    if (!classChecklistData) continue;
    
    (progress.items || []).forEach((item: any) => {
      if (item.isCompleted && item.stepName) {
        // stepName으로 ClassChecklist의 항목 찾기
        const classItem = (classChecklistData.items || []).find((ci: any) => 
          ci.stepName === item.stepName || ci.stepOrder === item.stepOrder
        );
        
        if (classItem && classItem.teachingMethodId) {
          const key = `${classItem.teachingMethodId.toString()}-${item.stepName}`;
          const existing = completedItemsMap.get(key);
          if (!existing || !existing.completedAt || (item.completedAt && new Date(item.completedAt) > new Date(existing.completedAt))) {
            completedItemsMap.set(key, {
              completedAt: item.completedAt ? new Date(item.completedAt) : new Date(),
              checked: true
            });
          }
        }
      }
    });
  }
  
  // 4. 강습법의 체크리스트 항목과 매칭하여 레벨 체크리스트 생성
  const levelChecklist: any[] = [];
  const usedSlugs = new Set<string>();
  
  teachingMethods.forEach((method: any) => {
    const checklistItems = Array.isArray(method.checklist) ? method.checklist : [];
    
    checklistItems.forEach((item: string, index: number) => {
      const slug = `${method._id.toString()}-${item}-${index}`;
      
      if (usedSlugs.has(slug)) return;
      usedSlugs.add(slug);
      
      const key = `${method._id.toString()}-${item}`;
      const completedInfo = completedItemsMap.get(key);
      
      // 레벨 매핑
      const methodLevel = method.level === 'beginner' ? 'beginner' :
                         method.level === 'intermediate' ? 'intermediate' :
                         method.level === 'advanced' ? 'advanced' : 'beginner';
      
      // 카테고리 매핑
      const category = method.category?.includes('stroke') ? 'stroke' :
                      method.category?.includes('endurance') ? 'endurance' :
                      method.category?.includes('safety') ? 'safety' : 'technique';
      
      levelChecklist.push({
        itemId: slug,
        label: item,
        description: method.name ? `${method.name} · ${method.description || '핵심 체크포인트'}` : method.description,
        category,
        level: methodLevel,
        checked: completedInfo?.checked || false,
        checkedAt: completedInfo?.completedAt || null,
        sourceMethodId: method._id.toString(),
        sourceMethodName: method.name || null
      });
    });
  });
  
  return levelChecklist.slice(0, 100); // 최대 100개 제한
};

router.get('/student/:studentId', authMiddleware, requireRole(['instructor']), async (req: Request & { user?: any }, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { studentId } = req.params;

    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 학생 ID 입니다.' });
    }

    const studentObjectId = new Types.ObjectId(studentId);
    
    // 학생 정보 조회 (레벨 확인용)
    const student = await User.findById(studentObjectId).lean();
    const studentLevel = (student as any)?.studentInfo?.currentLevel || (student as any)?.studentInfo?.swimmingLevel || '초급';
    
    // 기존 진행 관리 데이터 조회
    const progress = await InstructorProgress.findOne({
      instructorId: new Types.ObjectId(instructorId),
      studentId: studentObjectId
    }).lean();

    // 레벨 체크리스트를 실제 수업 체크리스트에서 실시간 집계
    const levelChecklist = await aggregateLevelChecklist(studentObjectId, studentLevel);

    // 기존 진행 관리 데이터와 집계된 레벨 체크리스트 병합
    const result = progress ? {
      ...progress,
      levelChecklist // 집계된 레벨 체크리스트로 덮어쓰기
    } : {
      instructorId: new Types.ObjectId(instructorId),
      studentId: studentObjectId,
      levelChecklist,
      sessions: [],
      notes: [],
      homework: []
    };

    res.json({ success: true, data: result });
  } catch (error) {
    logError('진행 관리 조회 실패', error);
    res.status(500).json({ success: false, message: '진행 관리 데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});

router.post('/student/:studentId', authMiddleware, requireRole(['instructor']), async (req: Request & { user?: any }, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { studentId } = req.params;
    const { courseName, sessions = [], notes = [], homework = [] } = req.body || {};
    // levelChecklist는 서버에서 집계되므로 클라이언트에서 전송하지 않음

    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 학생 ID 입니다.' });
    }

    const instructorObjectId = new Types.ObjectId(instructorId);
    const studentObjectId = new Types.ObjectId(studentId);

    const normalizedSessions = Array.isArray(sessions)
      ? sessions.map((session: any) => ({
          sessionId: session.sessionId,
          sessionDate: session.sessionDate ? new Date(session.sessionDate) : new Date(),
          startTime: session.startTime,
          endTime: session.endTime,
          activity: session.activity,
          location: session.location,
          sessionType: session.sessionType || 'group',
          courseName: session.courseName,
          status: session.status || 'absent'
        }))
      : [];

    const normalizedNotes = Array.isArray(notes)
      ? notes.map((note: any) => ({
          noteId: note.noteId,
          sessionId: note.sessionId,
          content: note.content,
          authorName: note.authorName,
          createdAt: note.createdAt ? new Date(note.createdAt) : new Date()
        }))
      : [];

    const normalizedHomework = Array.isArray(homework)
      ? homework.map((task: any) => ({
          taskId: task.taskId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          completed: Boolean(task.completed),
          completedAt: task.completedAt ? new Date(task.completedAt) : null
        }))
      : [];

    // 레벨 체크리스트는 실제 수업 체크리스트에서 실시간 집계하므로 저장하지 않음
    // 저장 시에는 다른 데이터만 저장하고, 조회 시 집계된 레벨 체크리스트 반환
    
    const updated = await InstructorProgress.findOneAndUpdate(
      { instructorId: instructorObjectId, studentId: studentObjectId },
      {
        instructorId: instructorObjectId,
        studentId: studentObjectId,
        courseName,
        sessions: normalizedSessions,
        notes: normalizedNotes,
        homework: normalizedHomework
        // levelChecklist는 저장하지 않음 (실시간 집계)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    
    // 학생 레벨 조회
    const student = await User.findById(studentObjectId).lean();
    const studentLevel = (student as any)?.studentInfo?.currentLevel || (student as any)?.studentInfo?.swimmingLevel || '초급';
    
    // 집계된 레벨 체크리스트 추가
    const aggregatedLevelChecklist = await aggregateLevelChecklist(studentObjectId, studentLevel);

    res.json({ 
      success: true, 
      data: {
        ...updated,
        levelChecklist: aggregatedLevelChecklist // 집계된 레벨 체크리스트 포함
      }
    });
  } catch (error) {
    logError('진행 관리 저장 실패', error);
    res.status(500).json({ success: false, message: '진행 관리 데이터를 저장하는 중 오류가 발생했습니다.' });
  }
});

export default router;
