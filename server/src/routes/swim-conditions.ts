/**
 * 🏊 JJ Swim Lab - 수영 질환/컨디션 API
 * 
 * 📋 **API 목적**
 * - 수영 관련 질환 CRUD API 제공
 * - 카테고리, 그룹, 키워드별 필터링 지원
 * - 센터별 커스텀 질환 관리
 * 
 * 🔗 **연동 파일:**
 * - server/src/models/SwimCondition.ts
 * - client/app/admin/swim-training-engine/page.tsx
 */

import express from 'express';
import { SwimCondition } from '../models/SwimCondition';
import { auth } from '../middleware/auth';

const router = express.Router();

// GET /api/swim-conditions - 모든 질환 조회
router.get('/', async (req, res) => {
  try {
    const { category, group, keyword, isMSK28, centerId, isActive = 'true' } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (group) filter.group = group;
    if (keyword) filter.keywords = keyword;
    if (isMSK28 !== undefined) filter.isMSK28 = isMSK28 === 'true';
    if (centerId) filter.$or = [{ centerId }, { centerId: null }];
    if (isActive) filter.isActive = isActive === 'true';
    
    const conditions = await SwimCondition.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();
    
    res.json({
      success: true,
      count: conditions.length,
      data: conditions
    });
  } catch (error: any) {
    console.error('질환 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '질환 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// GET /api/swim-conditions/:id - 특정 질환 조회
router.get('/:id', async (req, res) => {
  try {
    const condition = await SwimCondition.findOne({ id: req.params.id }).lean();
    
    if (!condition) {
      return res.status(404).json({
        success: false,
        message: '질환을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: condition
    });
  } catch (error: any) {
    console.error('질환 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '질환 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// POST /api/swim-conditions - 새 질환 추가 (인증 필요)
router.post('/', auth, async (req, res) => {
  try {
    const conditionData = {
      ...req.body,
      createdBy: (req as any).user._id
    };
    
    const condition = new SwimCondition(conditionData);
    await condition.save();
    
    res.status(201).json({
      success: true,
      message: '질환이 추가되었습니다',
      data: condition
    });
  } catch (error: any) {
    console.error('질환 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '질환 추가 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// PUT /api/swim-conditions/:id - 질환 수정 (인증 필요)
router.put('/:id', auth, async (req, res) => {
  try {
    const condition = await SwimCondition.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!condition) {
      return res.status(404).json({
        success: false,
        message: '질환을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      message: '질환이 수정되었습니다',
      data: condition
    });
  } catch (error: any) {
    console.error('질환 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '질환 수정 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// DELETE /api/swim-conditions/:id - 질환 삭제 (인증 필요)
router.delete('/:id', auth, async (req, res) => {
  try {
    const condition = await SwimCondition.findOneAndDelete({ id: req.params.id });
    
    if (!condition) {
      return res.status(404).json({
        success: false,
        message: '질환을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      message: '질환이 삭제되었습니다'
    });
  } catch (error: any) {
    console.error('질환 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '질환 삭제 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

export default router;

