/**
 * 🏊 JJ Swim Lab - 수영 훈련법 API
 * 
 * 📋 **API 목적**
 * - 수영 훈련법 CRUD API 제공
 * - 카테고리별 필터링 지원
 * - 센터별 커스텀 훈련법 관리
 * 
 * 🔗 **연동 파일:**
 * - server/src/models/SwimTrainingMethod.ts
 * - client/app/admin/swim-training-engine/page.tsx
 */

import express from 'express';
import { SwimTrainingMethod } from '../models/SwimTrainingMethod';
import { auth } from '../middleware/auth';

const router = express.Router();

// GET /api/swim-training-methods - 모든 훈련법 조회
router.get('/', async (req, res) => {
  try {
    const { category, centerId, isActive = 'true' } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (centerId) filter.$or = [{ centerId }, { centerId: null }]; // 센터별 + 기본
    if (isActive) filter.isActive = isActive === 'true';
    
    const methods = await SwimTrainingMethod.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();
    
    res.json({
      success: true,
      count: methods.length,
      data: methods
    });
  } catch (error: any) {
    console.error('훈련법 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '훈련법 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// GET /api/swim-training-methods/:id - 특정 훈련법 조회
router.get('/:id', async (req, res) => {
  try {
    const method = await SwimTrainingMethod.findOne({ id: req.params.id }).lean();
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: '훈련법을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: method
    });
  } catch (error: any) {
    console.error('훈련법 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '훈련법 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// POST /api/swim-training-methods - 새 훈련법 추가 (인증 필요)
router.post('/', auth, async (req, res) => {
  try {
    const methodData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const method = new SwimTrainingMethod(methodData);
    await method.save();
    
    res.status(201).json({
      success: true,
      message: '훈련법이 추가되었습니다',
      data: method
    });
  } catch (error: any) {
    console.error('훈련법 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '훈련법 추가 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// PUT /api/swim-training-methods/:id - 훈련법 수정 (인증 필요)
router.put('/:id', auth, async (req, res) => {
  try {
    const method = await SwimTrainingMethod.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: '훈련법을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      message: '훈련법이 수정되었습니다',
      data: method
    });
  } catch (error: any) {
    console.error('훈련법 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '훈련법 수정 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// DELETE /api/swim-training-methods/:id - 훈련법 삭제 (인증 필요)
router.delete('/:id', auth, async (req, res) => {
  try {
    const method = await SwimTrainingMethod.findOneAndDelete({ id: req.params.id });
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: '훈련법을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      message: '훈련법이 삭제되었습니다'
    });
  } catch (error: any) {
    console.error('훈련법 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '훈련법 삭제 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

export default router;

