import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';

const router: express.Router = express.Router();

// 반별 학생 진행도 조회
router.get('/class/:classId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { classId } = req.params;
    
    // TODO: 실제 학생 진행도 모델과 연동
    const mockProgress = [
      {
        _id: 'progress1',
        studentId: 'student1',
        studentName: '김학생',
        checklistId: 'checklist1',
        completedItems: ['item1'],
        totalItems: 3,
        progressPercentage: 33,
        lastUpdated: new Date()
      },
      {
        _id: 'progress2',
        studentId: 'student2',
        studentName: '이학생',
        checklistId: 'checklist1',
        completedItems: ['item1', 'item2'],
        totalItems: 3,
        progressPercentage: 67,
        lastUpdated: new Date()
      }
    ];
    
    logInfo('학생 진행도 조회', { classId, studentCount: mockProgress.length });
    
    res.json({ 
      success: true,
      data: mockProgress 
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

