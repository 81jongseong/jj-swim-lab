import express from 'express';
import mongoose from 'mongoose';
import { auth, requireRole } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';
import { ClassChecklist } from '../models/ClassChecklist';
import { TeachingMethod } from '../models/TeachingMethod';

const router = express.Router();

// 반 체크리스트 생성
router.post('/generate', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { classId, level } = req.body;
    
    if (!classId || !level) {
      return res.status(400).json({ error: '반 ID와 레벨이 필요합니다.' });
    }
    
    // 기존 체크리스트 확인
    const existingChecklist = await ClassChecklist.findOne({ classId, level });
    if (existingChecklist) {
      return res.status(400).json({ error: '이미 해당 반의 체크리스트가 존재합니다.' });
    }
    
    // 레벨별 강습법 가져오기
    const englishLevel = level === '초급' ? 'beginner' : 
                        level === '중급' ? 'intermediate' : 
                        level === '고급' ? 'advanced' : 'beginner';
    
    const teachingMethods = await TeachingMethod.find({ level: englishLevel });
    if (!teachingMethods || teachingMethods.length === 0) {
      return res.status(404).json({ error: '해당 레벨의 강습법을 찾을 수 없습니다.' });
    }
    
    // 모든 강습법의 단계를 반 체크리스트로 통합
    let allItems: any[] = [];
    let stepOrder = 1;
    
    teachingMethods.forEach((method) => {
      method.steps.forEach((step: string, stepIndex: number) => {
        allItems.push({
          stepName: step,
          stepOrder: stepOrder++,
          category: method.category || 'general',
          difficulty: method.level || 'beginner',
          tips: method.tips[stepIndex] || '',
          teachingMethodId: method._id
        });
      });
    });
    
    const classChecklist = new ClassChecklist({
      classId,
      level: englishLevel,
      items: allItems,
      isActive: true
    });
    
    await classChecklist.save();
    
    logInfo('반 체크리스트 생성', { 
      checklistId: classChecklist._id, 
      classId, 
      level: englishLevel,
      itemCount: allItems.length 
    });
    
    res.status(201).json({ 
      success: true,
      message: '반 체크리스트가 성공적으로 생성되었습니다.',
      checklist: classChecklist 
    });
  } catch (error) {
    logError('반 체크리스트 생성 실패', error);
    res.status(500).json({ error: '반 체크리스트 생성에 실패했습니다.' });
  }
});

// 반 체크리스트 조회
router.get('/class/:classId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { classId } = req.params;
    
    const checklist = await ClassChecklist.findOne({ classId, isActive: true })
      .populate('classId', 'name level');
    
    if (!checklist) {
      return res.status(404).json({ error: '해당 반의 체크리스트를 찾을 수 없습니다.' });
    }
    
    res.json({ 
      success: true,
      checklist 
    });
  } catch (error) {
    logError('반 체크리스트 조회 실패', error);
    res.status(500).json({ error: '반 체크리스트를 불러오는데 실패했습니다.' });
  }
});

// 반 체크리스트 수정
router.put('/:checklistId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId } = req.params;
    const { items, isActive } = req.body;
    
    const checklist = await ClassChecklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    if (items) checklist.items = items;
    if (isActive !== undefined) checklist.isActive = isActive;
    
    await checklist.save();
    
    logInfo('반 체크리스트 수정', { checklistId });
    res.json({ 
      success: true,
      message: '반 체크리스트가 수정되었습니다.',
      checklist 
    });
  } catch (error) {
    logError('반 체크리스트 수정 실패', error);
    res.status(500).json({ error: '반 체크리스트 수정에 실패했습니다.' });
  }
});

// 반 체크리스트 삭제
router.delete('/:checklistId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId } = req.params;
    
    const checklist = await ClassChecklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    await ClassChecklist.findByIdAndDelete(checklistId);
    
    logInfo('반 체크리스트 삭제', { checklistId });
    res.json({ 
      success: true,
      message: '반 체크리스트가 삭제되었습니다.' 
    });
  } catch (error) {
    logError('반 체크리스트 삭제 실패', error);
    res.status(500).json({ error: '반 체크리스트 삭제에 실패했습니다.' });
  }
});

export default router;
