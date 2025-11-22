/**
 * @file 알림 API 라우트
 * @description 실시간 알림 시스템 API 엔드포인트
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

// 알림 목록 조회
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user._id || user.id || user.userId;
    const { page = 1, limit = 20, type, priority, isRead } = req.query;

    const query: any = { userId };
    
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'name email');

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logError('❌ 알림 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '알림 목록 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 읽지 않은 알림 개수 조회
router.get('/unread-count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user._id || user.id || user.userId;
    const count = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logError('❌ 읽지 않은 알림 개수 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '읽지 않은 알림 개수 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 알림 읽음 처리
router.put('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user._id || user.id || user.userId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 알림 ID입니다.'
      });
    }

    const notification = await Notification.findOne({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: '알림이 읽음 처리되었습니다.',
      data: notification
    });
  } catch (error) {
    logError('❌ 알림 읽음 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 모든 알림 읽음 처리
router.put('/read-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user._id || user.id || user.userId;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount}개의 알림이 읽음 처리되었습니다.`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    logError('❌ 모든 알림 읽음 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '모든 알림 읽음 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 알림 삭제
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user._id || user.id || user.userId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 알림 ID입니다.'
      });
    }

    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '알림이 삭제되었습니다.'
    });
  } catch (error) {
    logError('❌ 알림 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '알림 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 알림 생성 (관리자용)
router.post('/', authMiddleware, requireRole(['superAdmin', 'centerAdmin']), async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, data, priority = 'medium', expiresAt } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.'
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.status(201).json({
      success: true,
      message: '알림이 생성되었습니다.',
      data: notification
    });
  } catch (error) {
    logError('❌ 알림 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '알림 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router;