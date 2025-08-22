import { Router, Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { auth as authenticateToken, requireRole } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { logInfo, logError } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 사용자 알림 목록 조회
router.get('/', authenticateToken, cache({ ttl: 60 }), async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, category, isRead, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = { userId: req.user._id };
    
    if (category) filter.category = category;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;
    
    const notifications = await Notification.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });
    
    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    logError('알림 목록 조회 실패', error);
    res.status(500).json({ error: '알림을 불러오는데 실패했습니다.' });
  }
});

// 특정 알림 조회
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }
    
    res.json({ notification });
  } catch (error) {
    logError('알림 조회 실패', error);
    res.status(500).json({ error: '알림을 불러오는데 실패했습니다.' });
  }
});

// 알림 읽음 처리
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }
    
    res.json({ notification });
  } catch (error) {
    logError('알림 읽음 처리 실패', error);
    res.status(500).json({ error: '알림 읽음 처리에 실패했습니다.' });
  }
});

// 모든 알림 읽음 처리
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: '모든 알림이 읽음 처리되었습니다.' });
  } catch (error) {
    logError('전체 알림 읽음 처리 실패', error);
    res.status(500).json({ error: '알림 읽음 처리에 실패했습니다.' });
  }
});

// 알림 삭제
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '알림이 삭제되었습니다.' });
  } catch (error) {
    logError('알림 삭제 실패', error);
    res.status(500).json({ error: '알림 삭제에 실패했습니다.' });
  }
});

// 알림 설정 조회
router.get('/settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings');
    res.json({ settings: {} });
  } catch (error) {
    logError('알림 설정 조회 실패', error);
    res.status(500).json({ error: '알림 설정을 불러오는데 실패했습니다.' });
  }
});

// 알림 설정 업데이트
router.put('/settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { email, push, sms, categories } = req.body;
    
    const updateData: any = {};
    if (email !== undefined) updateData['notificationSettings.email'] = email;
    if (push !== undefined) updateData['notificationSettings.push'] = push;
    if (sms !== undefined) updateData['notificationSettings.sms'] = sms;
    if (categories) updateData['notificationSettings.categories'] = categories;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('notificationSettings');
    
    res.json({ settings: {} });
  } catch (error) {
    logError('알림 설정 업데이트 실패', error);
    res.status(500).json({ error: '알림 설정 업데이트에 실패했습니다.' });
  }
});

// 관리자: 전체 알림 발송
router.post('/broadcast', authenticateToken, requireRole(['superAdmin', 'centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, type, category, priority, scheduledAt, expiresAt, targetUsers } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: '제목과 메시지는 필수입니다.' });
    }
    
    const filter: any = {};
    if (targetUsers && targetUsers.length > 0) {
      filter._id = { $in: targetUsers };
    }
    
    const users = await User.find(filter).select('_id');
    
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type: type || 'info',
      category: category || 'general',
      priority: priority || 'medium',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      metadata: { broadcast: true, sender: req.user._id }
    }));
    
    await Notification.insertMany(notifications);
    
    logInfo('브로드캐스트 알림 발송', { 
      count: notifications.length, 
      title, 
      sender: req.user._id 
    });
    
    res.json({ 
      message: `${notifications.length}명에게 알림이 발송되었습니다.`,
      count: notifications.length
    });
  } catch (error) {
    logError('브로드캐스트 알림 발송 실패', error);
    res.status(500).json({ error: '알림 발송에 실패했습니다.' });
  }
});

// 관리자: 알림 통계
router.get('/stats/overview', authenticateToken, requireRole(['superAdmin', 'centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const todayNotifications = await Notification.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    const categoryStats = await Notification.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const typeStats = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      total: totalNotifications,
      unread: unreadNotifications,
      today: todayNotifications,
      byCategory: categoryStats,
      byType: typeStats
    });
  } catch (error) {
    logError('알림 통계 조회 실패', error);
    res.status(500).json({ error: '알림 통계를 불러오는데 실패했습니다.' });
  }
});

export default router;

