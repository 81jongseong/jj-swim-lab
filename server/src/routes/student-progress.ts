import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';
import { StudentProgress } from '../models/StudentProgress';
import { Course } from '../models/Course';
// import { User } from '../models/User'; // 사용되지 않음

const router: express.Router = express.Router();

// 반별 학생 진행도 조회 - StudentProgress 모델과 연동
router.get('/class/:classId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { classId } = req.params;
    
    // Course에서 등록된 학생 목록 가져오기
    const course = await Course.findById(classId)
      .populate('enrolledStudents.student', 'name email');
    
    if (!course) {
      return res.status(404).json({ error: '반을 찾을 수 없습니다.' });
    }
    
    // 등록된 학생들 필터링
    const enrolledStudents = course.enrolledStudents.filter(
      (enrollment: any) => enrollment.status === 'enrolled' || enrollment.status === 'active'
    );
    
    // 각 학생의 진행도 조회
    const progressList = await Promise.all(
      enrolledStudents.map(async (enrollment: any) => {
        const studentId = enrollment.student?._id || enrollment.student;
        
        // StudentProgress에서 해당 학생의 진행도 조회
        const progress = await StudentProgress.findOne({
          studentId: studentId,
          classId: classId
        }).populate('classChecklistId');
        
        if (progress) {
          const totalItems = progress.items.length;
          const completedItems = progress.items.filter((item: any) => item.isCompleted);
          
          return {
            _id: progress._id.toString(),
            studentId: studentId.toString(),
            studentName: (enrollment.student as any)?.name || '이름 없음',
            checklistId: progress.classChecklistId?.toString() || '',
            completedItems: completedItems.map((item: any) => item._id.toString()),
            totalItems: totalItems,
            progressPercentage: progress.overallProgress || 0,
            lastUpdated: progress.lastUpdated || new Date()
          };
        } else {
          // 진행도가 없으면 기본값 반환
          return {
            _id: '',
            studentId: studentId.toString(),
            studentName: (enrollment.student as any)?.name || '이름 없음',
            checklistId: '',
            completedItems: [],
            totalItems: 0,
            progressPercentage: 0,
            lastUpdated: new Date()
          };
        }
      })
    );
    
    logInfo('학생 진행도 조회', { classId, studentCount: progressList.length });
    
    res.json({ 
      success: true,
      data: progressList 
    });
  } catch (error) {
    logError('학생 진행도 조회 실패', error);
    res.status(500).json({ error: '학생 진행도를 불러오는데 실패했습니다.' });
  }
});

// 학생 진행도 업데이트
router.put('/:studentId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { studentId } = req.params;
    const { checklistId, completedItems } = req.body;
    
    if (!checklistId || !completedItems) {
      return res.status(400).json({ error: '체크리스트 ID와 완료된 항목이 필요합니다.' });
    }
    
    // TODO: 실제 학생 진행도 모델과 연동
    logInfo('학생 진행도 업데이트', { 
      studentId, 
      checklistId, 
      completedItemsCount: completedItems.length 
    });
    
    res.json({ 
      success: true,
      message: '학생 진행도가 업데이트되었습니다.' 
    });
  } catch (error) {
    logError('학생 진행도 업데이트 실패', error);
    res.status(500).json({ error: '학생 진행도 업데이트에 실패했습니다.' });
  }
});

// 학생별 진행도 조회
router.get('/student/:studentId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { studentId } = req.params;
    
    // TODO: 실제 학생 진행도 모델과 연동
    const mockProgress = {
      _id: 'progress1',
      studentId: studentId,
      studentName: '김학생',
      checklistId: 'checklist1',
      completedItems: ['item1'],
      totalItems: 3,
      progressPercentage: 33,
      lastUpdated: new Date()
    };
    
    logInfo('개별 학생 진행도 조회', { studentId });
    
    res.json({ 
      success: true,
      data: mockProgress 
    });
  } catch (error) {
    logError('개별 학생 진행도 조회 실패', error);
    res.status(500).json({ error: '학생 진행도를 불러오는데 실패했습니다.' });
  }
});

export default router;

