import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';
import { ClassChecklist } from '../models/ClassChecklist';
import { ChecklistTemplate } from '../models/ChecklistTemplate';
import { TeachingMethod } from '../models/TeachingMethod';

const router: express.Router = express.Router();

// 반 체크리스트 생성 또는 업데이트 (기존 방식과 템플릿 방식 모두 지원)
router.post('/generate', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { classId, level, templateId, customLevel, isPrivateLesson } = req.body;
    
    if (!classId) {
      return res.status(400).json({ error: '반 ID가 필요합니다.' });
    }
    
    let items: any[] = [];
    let finalLevel = '';
    
    // 개인레슨인 경우 - 모든 레벨의 항목을 통합
    if (isPrivateLesson) {
      const allTeachingMethods = await TeachingMethod.find({});
      if (!allTeachingMethods || allTeachingMethods.length === 0) {
        return res.status(404).json({ error: '강습법을 찾을 수 없습니다.' });
      }
      
      // 모든 강습법의 단계를 통합하여 개인레슨 체크리스트 생성
      let stepOrder = 1;
      
      allTeachingMethods.forEach((method) => {
        method.steps.forEach((step: string, stepIndex: number) => {
          items.push({
            stepName: step,
            stepOrder: stepOrder++,
            category: method.category || 'general',
            difficulty: method.level || 'beginner',
            tips: method.tips[stepIndex] || '',
            teachingMethodId: method._id
          });
        });
      });
      
      finalLevel = 'personal'; // 개인레슨 전용 레벨
    }
    // 템플릿 기반 방식
    else if (templateId && customLevel) {
      const template = await ChecklistTemplate.findById(templateId);
      if (!template || !template.isActive) {
        return res.status(404).json({ error: '사용할 수 없는 템플릿입니다.' });
      }
      
      // 템플릿 접근 권한 확인
      const userId = (req as any).user?._id;
      const centerId = (req as any).user?.centerId;
      const hasAccess = template.creatorId.equals(userId) || 
                       template.centerId?.equals(centerId) || 
                       template.isPublic;
      
      if (!hasAccess) {
        return res.status(403).json({ error: '이 템플릿에 접근할 권한이 없습니다.' });
      }
      
      // 템플릿에서 해당 레벨의 항목들 가져오기
      items = template.items.filter(item => item.difficulty === customLevel);
      finalLevel = customLevel;
      
      if (items.length === 0) {
        return res.status(400).json({ error: `해당 레벨(${customLevel})의 항목이 템플릿에 없습니다.` });
      }
    } 
    // 기존 방식 (TeachingMethod 기반)
    else if (level) {
      const englishLevel = level === '초급' ? 'beginner' : 
                          level === '중급' ? 'intermediate' : 
                          level === '고급' ? 'advanced' : 'beginner';
      
      const teachingMethods = await TeachingMethod.find({ level: englishLevel });
      if (!teachingMethods || teachingMethods.length === 0) {
        return res.status(404).json({ error: '해당 레벨의 강습법을 찾을 수 없습니다.' });
      }
      
      // 모든 강습법의 단계를 반 체크리스트로 통합
      let stepOrder = 1;
      
      teachingMethods.forEach((method) => {
        method.steps.forEach((step: string, stepIndex: number) => {
          items.push({
            stepName: step,
            stepOrder: stepOrder++,
            category: method.category || 'general',
            difficulty: method.level || 'beginner',
            tips: method.tips[stepIndex] || '',
            teachingMethodId: method._id
          });
        });
      });
      
      finalLevel = englishLevel;
    } else {
      return res.status(400).json({ error: '레벨, 템플릿 정보, 또는 개인레슨 여부가 필요합니다.' });
    }
    
    // 기존 체크리스트 확인
    const existingChecklist = await ClassChecklist.findOne({ classId });
    
    if (existingChecklist) {
      // 기존 체크리스트가 있으면 업데이트
      if (templateId) {
        existingChecklist.templateId = templateId;
        existingChecklist.customLevel = customLevel;
      }
      existingChecklist.level = finalLevel;
      existingChecklist.items = items;
      existingChecklist.isActive = true;
      existingChecklist.updatedAt = new Date();
      
      await existingChecklist.save();
      
      logInfo('반 체크리스트 업데이트', { 
        checklistId: existingChecklist._id, 
        classId, 
        level: finalLevel,
        itemCount: items.length,
        isPrivateLesson: !!isPrivateLesson
      });
      
      res.json({ 
        success: true,
        message: '반 체크리스트가 성공적으로 업데이트되었습니다.',
        checklist: existingChecklist 
      });
    } else {
      // 새 체크리스트 생성
      const classChecklist = new ClassChecklist({
        classId,
        level: finalLevel,
        templateId: templateId || undefined,
        customLevel: customLevel || undefined,
        items: items,
        hiddenItems: [],
        customItems: [],
        isActive: true
      });
      
      await classChecklist.save();
      
      logInfo('반 체크리스트 생성', { 
        checklistId: classChecklist._id, 
        classId, 
        level: finalLevel,
        itemCount: items.length,
        isPrivateLesson: !!isPrivateLesson
      });
      
      res.status(201).json({ 
        success: true,
        message: '반 체크리스트가 성공적으로 생성되었습니다.',
        checklist: classChecklist 
      });
    }
  } catch (error) {
    logError('반 체크리스트 생성/업데이트 실패', error);
    res.status(500).json({ error: '반 체크리스트 생성/업데이트에 실패했습니다.' });
  }
});

// 반 체크리스트 조회
router.get('/class/:classId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { classId } = req.params;
    const { includeHidden = false } = req.query; // 숨겨진 항목 포함 여부
    
    const checklist = await ClassChecklist.findOne({ classId, isActive: true })
      .populate('classId', 'name level');
    
    if (!checklist) {
      return res.status(404).json({ error: '해당 반의 체크리스트를 찾을 수 없습니다.' });
    }
    
    // 응답 데이터 구성
    const responseChecklist = { ...checklist.toObject() };
    
    // 숨겨진 항목을 포함하지 않는 경우, 숨겨진 항목들을 필터링
    if (!includeHidden && checklist.hiddenItems && checklist.hiddenItems.length > 0) {
      responseChecklist.items = checklist.items.filter(item => 
        !checklist.hiddenItems.includes(item._id.toString())
      );
      responseChecklist.customItems = checklist.customItems.filter(item => 
        !checklist.hiddenItems.includes(item._id.toString())
      );
    }
    
    res.json({ 
      success: true,
      checklist: responseChecklist,
      totalItems: checklist.items.length + checklist.customItems.length,
      visibleItems: responseChecklist.items.length + responseChecklist.customItems.length,
      hiddenItems: checklist.hiddenItems.length
    });
  } catch (error) {
    logError('반 체크리스트 조회 실패', error);
    res.status(500).json({ error: '반 체크리스트를 불러오는데 실패했습니다.' });
  }
});

// 반 체크리스트 수정
router.put('/:checklistId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
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
router.delete('/:checklistId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
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

// 체크리스트 항목 순서 변경 및 메시지 추가
router.put('/:checklistId/items', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId } = req.params;
    const { items } = req.body;
    
    const checklist = await ClassChecklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    // 항목 순서와 메시지 업데이트
    checklist.items = items.map((item: any, index: number) => ({
      ...item,
      stepOrder: index + 1, // 순서 자동 재정렬
      updatedAt: new Date()
    }));
    
    await checklist.save();
    
    logInfo('체크리스트 항목 순서 변경', { checklistId, itemCount: items.length });
    res.json({ 
      success: true,
      message: '체크리스트 항목이 수정되었습니다.',
      checklist 
    });
  } catch (error) {
    logError('체크리스트 항목 수정 실패', error);
    res.status(500).json({ error: '체크리스트 항목 수정에 실패했습니다.' });
  }
});

// 체크리스트 항목에 메시지 추가
router.put('/:checklistId/items/:itemId/message', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId, itemId } = req.params;
    const { message } = req.body;
    
    const checklist = await ClassChecklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    const item = checklist.items.find((item: any) => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ error: '체크리스트 항목을 찾을 수 없습니다.' });
    }
    
    // 메시지 추가
    item.instructorMessage = message;
    item.messageUpdatedAt = new Date();
    
    await checklist.save();
    
    logInfo('체크리스트 항목 메시지 추가', { checklistId, itemId, messageLength: message.length });
    res.json({ 
      success: true,
      message: '메시지가 추가되었습니다.',
      item 
    });
  } catch (error) {
    logError('체크리스트 항목 메시지 추가 실패', error);
    res.status(500).json({ error: '메시지 추가에 실패했습니다.' });
  }
});

// 개인레슨 체크리스트 항목 숨김/표시 설정
router.put('/:checklistId/hide-items', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId } = req.params;
    const { hiddenItemIds } = req.body;
    
    const checklist = await ClassChecklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    // 숨겨진 항목 ID들 업데이트
    checklist.hiddenItems = hiddenItemIds || [];
    
    await checklist.save();
    
    logInfo('개인레슨 체크리스트 항목 숨김 설정', { 
      checklistId, 
      hiddenItemCount: checklist.hiddenItems.length 
    });
    
    res.json({ 
      success: true,
      message: '체크리스트 항목 숨김 설정이 업데이트되었습니다.',
      checklist 
    });
  } catch (error) {
    logError('체크리스트 항목 숨김 설정 실패', error);
    res.status(500).json({ error: '항목 숨김 설정에 실패했습니다.' });
  }
});

// 개인레슨 체크리스트 커스텀 항목 추가
router.post('/:checklistId/custom-items', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { checklistId } = req.params;
    const { customItems } = req.body;
    
    const checklist = await ClassChecklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
    }
    
    // 커스텀 항목들 추가
    const newCustomItems = customItems.map((item: any, index: number) => ({
      stepName: item.stepName,
      stepOrder: checklist.items.length + checklist.customItems.length + index + 1,
      category: item.category || 'custom',
      difficulty: item.difficulty || 'custom',
      tips: item.tips || '',
      teachingMethodId: item.teachingMethodId || null,
      instructorMessage: item.instructorMessage || '',
      isCompleted: false
    }));
    
    checklist.customItems = [...checklist.customItems, ...newCustomItems];
    
    await checklist.save();
    
    logInfo('개인레슨 체크리스트 커스텀 항목 추가', { 
      checklistId, 
      addedItemCount: newCustomItems.length,
      totalCustomItems: checklist.customItems.length
    });
    
    res.json({ 
      success: true,
      message: '커스텀 항목이 추가되었습니다.',
      checklist 
    });
  } catch (error) {
    logError('체크리스트 커스텀 항목 추가 실패', error);
    res.status(500).json({ error: '커스텀 항목 추가에 실패했습니다.' });
  }
});

export default router;
