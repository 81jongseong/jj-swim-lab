/**
 * 🏊 JJ Swim Lab - 수영 드릴 API
 * 
 * 📋 **API 목적**
 * - 수영 드릴 CRUD API 제공
 * - 카테고리 및 태그별 필터링 지원
 * - 센터별 커스텀 드릴 관리
 * 
 * 🔗 **연동 파일:**
 * - server/src/models/SwimDrill.ts
 * - client/app/admin/swim-training-engine/page.tsx
 */

import express from 'express';
import { SwimDrill } from '../models/SwimDrill';
import { auth } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

// GET /api/swim-drills - 모든 드릴 조회
router.get('/', async (req, res) => {
  try {
    const { category, tag, centerId, isActive = 'true' } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (centerId) filter.$or = [{ centerId }, { centerId: null }];
    if (isActive) filter.isActive = isActive === 'true';
    
    const drills = await SwimDrill.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();
    
    res.json({
      success: true,
      count: drills.length,
      data: drills
    });
  } catch (error: any) {
    logError('드릴 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '드릴 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// GET /api/swim-drills/:id - 특정 드릴 조회
router.get('/:id', async (req, res) => {
  try {
    const drill = await SwimDrill.findOne({ id: req.params.id }).lean();
    
    if (!drill) {
      return res.status(404).json({
        success: false,
        message: '드릴을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: drill
    });
  } catch (error: any) {
    logError('드릴 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '드릴 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// POST /api/swim-drills - 새 드릴 추가 (인증 필요)
router.post('/', auth, async (req, res) => {
  try {
    const drillData = {
      ...req.body,
      createdBy: (req as any).user._id
    };
    
    const drill = new SwimDrill(drillData);
    await drill.save();
    
    res.status(201).json({
      success: true,
      message: '드릴이 추가되었습니다',
      data: drill
    });
  } catch (error: any) {
    logError('드릴 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '드릴 추가 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// PUT /api/swim-drills/:id - 드릴 수정 (인증 필요)
router.put('/:id', auth, async (req, res) => {
  try {
    const drill = await SwimDrill.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!drill) {
      return res.status(404).json({
        success: false,
        message: '드릴을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      message: '드릴이 수정되었습니다',
      data: drill
    });
  } catch (error: any) {
    logError('드릴 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '드릴 수정 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// DELETE /api/swim-drills/:id - 드릴 삭제 (인증 필요)
router.delete('/:id', auth, async (req, res) => {
  try {
    const drill = await SwimDrill.findOneAndDelete({ id: req.params.id });
    
    if (!drill) {
      return res.status(404).json({
        success: false,
        message: '드릴을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      message: '드릴이 삭제되었습니다'
    });
  } catch (error: any) {
    logError('드릴 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '드릴 삭제 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

export default router;

