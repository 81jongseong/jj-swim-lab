import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { ChecklistTemplate } from '../models/ChecklistTemplate';
import { logInfo, logError } from '../utils/logger';

const router = express.Router();

// 체크리스트 템플릿 생성
router.post('/', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, levels, items, isPublic, tags } = req.body;
    const creatorId = req.user?._id;
    const creatorType = req.user?.userType === 'centerAdmin' ? 'center' : 'instructor';
    const centerId = req.user?.centerId;

    if (!name || !levels || !items || !Array.isArray(levels) || !Array.isArray(items)) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    // 템플릿 생성
    const template = new ChecklistTemplate({
      name,
      description: description || '',
      creatorId,
      creatorType,
      centerId,
      levels,
      items: items.map((item: any, index: number) => ({
        ...item,
        stepOrder: index + 1
      })),
      isPublic: isPublic || false,
      tags: tags || [],
      isActive: true
    });

    await template.save();

    logInfo('체크리스트 템플릿 생성', { 
      templateId: template._id, 
      name, 
      creatorId, 
      levels: levels.length,
      itemCount: items.length 
    });

    res.status(201).json({ 
      success: true,
      message: '체크리스트 템플릿이 성공적으로 생성되었습니다.',
      template 
    });
  } catch (error) {
    logError('체크리스트 템플릿 생성 실패', error);
    res.status(500).json({ error: '체크리스트 템플릿 생성에 실패했습니다.' });
  }
});

// 사용 가능한 템플릿 목록 조회
router.get('/', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?._id;
    const centerId = req.user?.centerId;
    const userType = req.user?.userType;

    const query: any = { isActive: true };

    // 센터 관리자는 자신의 센터 템플릿과 공개 템플릿만
    if (userType === 'centerAdmin') {
      query.$or = [
        { creatorId: userId },
        { centerId: centerId },
        { isPublic: true }
      ];
    } else {
      // 강사는 자신이 생성한 템플릿, 센터 템플릿, 공개 템플릿
      query.$or = [
        { creatorId: userId },
        { centerId: centerId },
        { isPublic: true }
      ];
    }

    const templates = await ChecklistTemplate.find(query)
      .populate('creatorId', 'name')
      .populate('centerId', 'name')
      .sort({ createdAt: -1 });

    logInfo('체크리스트 템플릿 목록 조회', { 
      userId, 
      templateCount: templates.length 
    });

    res.json({ 
      success: true,
      templates 
    });
  } catch (error) {
    logError('체크리스트 템플릿 목록 조회 실패', error);
    res.status(500).json({ error: '체크리스트 템플릿 목록 조회에 실패했습니다.' });
  }
});

// 특정 템플릿 조회
router.get('/:templateId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?._id;
    const centerId = req.user?.centerId;

    const template = await ChecklistTemplate.findById(templateId)
      .populate('creatorId', 'name')
      .populate('centerId', 'name');

    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }

    // 접근 권한 확인
    const hasAccess = template.creatorId.equals(userId) || 
                     template.centerId?.equals(centerId) || 
                     template.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ error: '이 템플릿에 접근할 권한이 없습니다.' });
    }

    res.json({ 
      success: true,
      template 
    });
  } catch (error) {
    logError('체크리스트 템플릿 조회 실패', error);
    res.status(500).json({ error: '체크리스트 템플릿 조회에 실패했습니다.' });
  }
});

// 템플릿 수정
router.put('/:templateId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { templateId } = req.params;
    const { name, description, levels, items, isPublic, tags } = req.body;
    const userId = req.user?._id;

    const template = await ChecklistTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }

    // 수정 권한 확인
    if (!template.creatorId.equals(userId)) {
      return res.status(403).json({ error: '이 템플릿을 수정할 권한이 없습니다.' });
    }

    // 템플릿 업데이트
    template.name = name || template.name;
    template.description = description || template.description;
    template.levels = levels || template.levels;
    template.items = items ? items.map((item: any, index: number) => ({
      ...item,
      stepOrder: index + 1
    })) : template.items;
    template.isPublic = isPublic !== undefined ? isPublic : template.isPublic;
    template.tags = tags || template.tags;

    await template.save();

    logInfo('체크리스트 템플릿 수정', { 
      templateId, 
      userId 
    });

    res.json({ 
      success: true,
      message: '체크리스트 템플릿이 성공적으로 수정되었습니다.',
      template 
    });
  } catch (error) {
    logError('체크리스트 템플릿 수정 실패', error);
    res.status(500).json({ error: '체크리스트 템플릿 수정에 실패했습니다.' });
  }
});

// 템플릿 삭제 (비활성화)
router.delete('/:templateId', auth, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?._id;

    const template = await ChecklistTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }

    // 삭제 권한 확인
    if (!template.creatorId.equals(userId)) {
      return res.status(403).json({ error: '이 템플릿을 삭제할 권한이 없습니다.' });
    }

    // 템플릿 비활성화
    template.isActive = false;
    await template.save();

    logInfo('체크리스트 템플릿 비활성화', { 
      templateId, 
      userId 
    });

    res.json({ 
      success: true,
      message: '체크리스트 템플릿이 성공적으로 비활성화되었습니다.' 
    });
  } catch (error) {
    logError('체크리스트 템플릿 삭제 실패', error);
    res.status(500).json({ error: '체크리스트 템플릿 삭제에 실패했습니다.' });
  }
});

export default router;






