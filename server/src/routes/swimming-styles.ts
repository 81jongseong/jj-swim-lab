/**
 * 🏊‍♂️ 수영 영법 API 라우트
 * 
 * 📋 엔드포인트:
 * - GET    /api/swimming-styles - 영법 목록 조회
 * - GET    /api/swimming-styles/:id - 영법 상세 조회
 * - POST   /api/swimming-styles - 영법 생성 (관리자만)
 * - PUT    /api/swimming-styles/:id - 영법 수정 (관리자만)
 * - DELETE /api/swimming-styles/:id - 영법 삭제 (관리자만)
 */

import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { SwimmingStyle } from '../models/SwimmingStyle';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

// 영법 목록 조회 (공개)
router.get('/', async (req, res) => {
  try {
    const { isPublicDemo, isActive } = req.query;
    
    const query: any = {};
    if (isPublicDemo !== undefined) query.isPublicDemo = isPublicDemo === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const styles = await SwimmingStyle.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: styles
    });
  } catch (error) {
    logError('영법 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '영법 목록 조회에 실패했습니다.'
    });
  }
});

// 영법 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const style = await SwimmingStyle.findById(req.params.id);

    if (!style) {
      return res.status(404).json({
        success: false,
        message: '영법을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: style
    });
  } catch (error) {
    logError('영법 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '영법 조회에 실패했습니다.'
    });
  }
});

// 영법 생성 (관리자만)
router.post('/', authMiddleware, requireRole(['superAdmin', 'centerAdmin']), async (req, res) => {
  try {
    const style = new SwimmingStyle(req.body);
    await style.save();

    res.status(201).json({
      success: true,
      message: '영법이 생성되었습니다.',
      data: style
    });
  } catch (error) {
    logError('영법 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '영법 생성에 실패했습니다.'
    });
  }
});

// 영법 수정 (관리자만)
router.put('/:id', authMiddleware, requireRole(['superAdmin', 'centerAdmin']), async (req, res) => {
  try {
    const style = await SwimmingStyle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!style) {
      return res.status(404).json({
        success: false,
        message: '영법을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '영법이 수정되었습니다.',
      data: style
    });
  } catch (error) {
    logError('영법 수정 실패:', error);
    res.status(500).json({
      success: false,
      message: '영법 수정에 실패했습니다.'
    });
  }
});

// 영법 삭제 (관리자만)
router.delete('/:id', authMiddleware, requireRole(['superAdmin', 'centerAdmin']), async (req, res) => {
  try {
    const style = await SwimmingStyle.findByIdAndDelete(req.params.id);

    if (!style) {
      return res.status(404).json({
        success: false,
        message: '영법을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '영법이 삭제되었습니다.'
    });
  } catch (error) {
    logError('영법 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '영법 삭제에 실패했습니다.'
    });
  }
});

export default router;

