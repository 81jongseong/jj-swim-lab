import * as express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { logInfo, logError } from '../utils/logger';
import ChecklistTemplate from '../models/ChecklistTemplate';

const router: express.Router = express.Router();

// 체크리스트 템플릿 목록 조회
router.get('/', auth, cache({ ttl: 300 }), async (req: express.Request, res: express.Response) => {
  try {
    const { level, category, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = { isActive: true };
    if (level) filter.level = level;
    if (category) filter.category = category;
    
    const templates = await ChecklistTemplate.find(filter)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await ChecklistTemplate.countDocuments(filter);
    
    res.json({
      templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('체크리스트 템플릿 목록 조회 실패', error);
    res.status(500).json({ error: '템플릿 목록을 불러오는데 실패했습니다.' });
  }
});

// 레벨별 체크리스트 템플릿 조회
router.get('/level/:level', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { level } = req.params;
    const { category } = req.query;
    
    const filter: any = { level, isActive: true };
    if (category) filter.category = category;
    
    const templates = await ChecklistTemplate.find(filter)
      .populate('createdBy', 'name email')
      .sort({ name: 1 });
    
    res.json({ templates });
  } catch (error) {
    logError('레벨별 템플릿 조회 실패', error);
    res.status(500).json({ error: '템플릿을 불러오는데 실패했습니다.' });
  }
});

// 특정 체크리스트 템플릿 조회
router.get('/:templateId', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const template = await ChecklistTemplate.findById(req.params.templateId)
      .populate('createdBy', 'name email');
    
    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }
    
    res.json({ template });
  } catch (error) {
    logError('템플릿 상세 조회 실패', error);
    res.status(500).json({ error: '템플릿을 불러오는데 실패했습니다.' });
  }
});

// 체크리스트 템플릿 생성
router.post('/', auth, requireRole(['superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, level, category, items, tags } = req.body;
    
    if (!name || !level || !category) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    const template = new ChecklistTemplate({
      name,
      description,
      level,
      category,
      items: items || [],
      tags: tags || [],
      createdBy: (req as any).user._id
    });
    
    await template.save();
    
    logInfo('체크리스트 템플릿 생성', { templateId: template._id, name, level });
    res.status(201).json({ template });
  } catch (error) {
    logError('템플릿 생성 실패', error);
    res.status(500).json({ error: '템플릿 생성에 실패했습니다.' });
  }
});

// 체크리스트 템플릿 수정
router.put('/:templateId', auth, requireRole(['superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, level, category, items, tags, isActive } = req.body;
    
    const template = await ChecklistTemplate.findByIdAndUpdate(
      req.params.templateId,
      {
        name,
        description,
        level,
        category,
        items,
        tags,
        isActive,
        version: { $inc: 1 }
      },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }
    
    logInfo('템플릿 수정', { templateId: template._id, name });
    res.json({ template });
  } catch (error) {
    logError('템플릿 수정 실패', error);
    res.status(500).json({ error: '템플릿 수정에 실패했습니다.' });
  }
});

// 체크리스트 템플릿 삭제
router.delete('/:templateId', auth, requireRole(['superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const template = await ChecklistTemplate.findByIdAndDelete(req.params.templateId);
    
    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }
    
    logInfo('템플릿 삭제', { templateId: req.params.templateId, name: template.name });
    res.json({ message: '템플릿이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    logError('템플릿 삭제 실패', error);
    res.status(500).json({ error: '템플릿 삭제에 실패했습니다.' });
  }
});

export default router;






