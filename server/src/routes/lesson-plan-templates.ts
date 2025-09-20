/**
 * @file 강습 계획 템플릿 API 라우트
 * @description 최고관리자용 템플릿 생성 및 센터관리자용 템플릿 선택 API
 * @date 2025-09-20
 * @author JJ Swim Lab
 */

import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { LessonPlanTemplate } from '../models/LessonPlanTemplate';
import { LessonPlan } from '../models/LessonPlan';

const router = express.Router();

// 1. 템플릿 목록 조회 (모든 권한)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { category, level, search, page = 1, limit = 20 } = req.query;
    const user = (req as any).user;

    const filter: any = { isActive: true };

    // 센터관리자는 공개 템플릿만 조회 가능
    if (user.userType === 'centerAdmin') {
      filter.isPublic = true;
    }

    // 필터 조건 추가
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (level && level !== 'all') {
      filter.level = level;
    }
    if (search) {
      filter.$or = [
        { templateName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const templates = await LessonPlanTemplate.find(filter)
      .populate('createdBy', 'name')
      .sort({ usageCount: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await LessonPlanTemplate.countDocuments(filter);

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
    console.error('템플릿 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 2. 템플릿 상세 조회
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const template = await LessonPlanTemplate.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('템플릿 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

// 3. 템플릿 생성 (최고관리자만)
router.post('/', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const templateData = {
      ...req.body,
      createdBy: userId,
      usageCount: 0,
      rating: 0
    };

    const template = new LessonPlanTemplate(templateData);
    await template.save();

    res.status(201).json({
      success: true,
      message: '강습 계획 템플릿이 생성되었습니다.',
      data: template
    });
  } catch (error) {
    console.error('템플릿 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 생성 중 오류가 발생했습니다.'
    });
  }
});

// 4. 템플릿 수정 (최고관리자만)
router.put('/:id', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const template = await LessonPlanTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '템플릿이 수정되었습니다.',
      data: template
    });
  } catch (error) {
    console.error('템플릿 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 수정 중 오류가 발생했습니다.'
    });
  }
});

// 5. 템플릿 삭제 (최고관리자만)
router.delete('/:id', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const template = await LessonPlanTemplate.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '템플릿이 비활성화되었습니다.'
    });
  } catch (error) {
    console.error('템플릿 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 6. 템플릿으로부터 강습 계획 생성 (센터관리자)
router.post('/:templateId/create-plan', authMiddleware, requireRole(['centerAdmin']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { templateId } = req.params;
    const { customizations, students, date, time, location } = req.body;

    // 템플릿 조회
    const template = await LessonPlanTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      });
    }

    // 템플릿 기반으로 강습 계획 생성
    const lessonPlan = new LessonPlan({
      instructorId: user._id,
      centerId: user.centerId,
      title: customizations?.title || template.templateName,
      description: customizations?.description || template.description,
      teachingMethods: template.stages.flatMap(stage => stage.teachingMethods),
      students: students || [],
      duration: customizations?.duration || template.sessionDuration,
      date: new Date(date),
      time,
      location,
      objectives: customizations?.objectives || template.stages.flatMap(stage => stage.objectives),
      materials: customizations?.materials || template.stages.flatMap(stage => stage.materials),
      notes: customizations?.notes || '',
      status: 'draft',
      attendance: [],
      feedback: []
    });

    await lessonPlan.save();

    // 템플릿 사용 횟수 증가
    await LessonPlanTemplate.findByIdAndUpdate(templateId, {
      $inc: { usageCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: '템플릿을 기반으로 강습 계획이 생성되었습니다.',
      data: lessonPlan
    });
  } catch (error) {
    console.error('템플릿 기반 강습 계획 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습 계획 생성 중 오류가 발생했습니다.'
    });
  }
});

// 7. 템플릿 평가 (센터관리자)
router.post('/:templateId/rate', authMiddleware, requireRole(['centerAdmin']), async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { rating, feedback } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '평점은 1-5 사이의 값이어야 합니다.'
      });
    }

    const template = await LessonPlanTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      });
    }

    // 간단한 평점 업데이트 (실제로는 별도 평가 모델 필요)
    const newRating = ((template.rating * template.usageCount) + rating) / (template.usageCount + 1);
    
    await LessonPlanTemplate.findByIdAndUpdate(templateId, {
      rating: Math.round(newRating * 10) / 10 // 소수점 1자리까지
    });

    res.json({
      success: true,
      message: '템플릿 평가가 완료되었습니다.'
    });
  } catch (error) {
    console.error('템플릿 평가 오류:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 평가 중 오류가 발생했습니다.'
    });
  }
});

// 8. 템플릿 통계 (최고관리자)
router.get('/stats/overview', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const totalTemplates = await LessonPlanTemplate.countDocuments({ isActive: true });
    const publicTemplates = await LessonPlanTemplate.countDocuments({ isActive: true, isPublic: true });
    
    const categoryStats = await LessonPlanTemplate.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
    ]);

    const levelStats = await LessonPlanTemplate.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 }, avgUsage: { $avg: '$usageCount' } } }
    ]);

    const topTemplates = await LessonPlanTemplate.find({ isActive: true })
      .sort({ usageCount: -1, rating: -1 })
      .limit(5)
      .select('templateName usageCount rating category level');

    res.json({
      success: true,
      data: {
        overview: {
          totalTemplates,
          publicTemplates,
          privateTemplates: totalTemplates - publicTemplates
        },
        categoryStats,
        levelStats,
        topTemplates
      }
    });
  } catch (error) {
    console.error('템플릿 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
