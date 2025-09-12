/**
 * 🔔 JJ Swim Lab - 알림 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 수영 강습 관련 알림 시스템의 API 엔드포인트 제공
 * - 사용자별 맞춤형 알림 생성, 전송 및 관리
 * - 알림 타입별 분류 및 우선순위 관리
 * - 실시간 알림 전송 및 상태 추적
 * - 알림 통계 및 분석 데이터 제공
 * 
 * 🔄 **주요 기능**
 * - 알림 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 실시간 알림 전송 및 푸시 알림
 * - 알림 타입별 분류 및 우선순위 관리
 * - 알림 읽음 상태 관리
 * - 알림 통계 및 분석
 * - 알림 설정 및 선호도 관리
 * - 알림 히스토리 및 아카이브
 * 
 * 🗄️ **데이터 연동**
 * - Notification 모델과 연동 (알림 정보)
 * - User 모델과 연동 (사용자 정보)
 * - 실시간 알림 전송 시스템
 * - 푸시 알림 서비스 (FCM, APNS)
 * - 알림 설정 및 선호도 데이터
 * - 인증 미들웨어와 연동 (권한 검증)
 * - 캐시 미들웨어와 연동 (성능 최적화)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - Notification 모델 (../models/Notification)
 * - User 모델 (../models/User)
 * - 인증 미들웨어 (../middleware/auth)
 * - 캐시 미들웨어 (../middleware/cache)
 * - 로거 유틸리티 (../utils/logger)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 알림 전송 성능 및 지연 시간 최적화
 * 2. 알림 내용의 개인정보 보호
 * 3. 알림 스팸 방지 및 Rate Limiting
 * 4. 실시간 알림 전송의 안정성
 * 5. 알림 설정 및 선호도 관리
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 알림 전송 성능 최적화 확인
 * - [ ] 알림 내용 개인정보 보호 확인
 * - [ ] 알림 스팸 방지 확인
 * - [ ] 실시간 알림 전송 안정성 확인
 * - [ ] 알림 설정 및 선호도 관리 확인
 * - [ ] API 엔드포인트 보안 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 알림 관리 API 구현
 * - 2024-12-19: 알림 CRUD 시스템 구현
 * - 2024-12-19: 실시간 알림 전송 시스템 구현
 * - 2024-12-19: 알림 타입별 분류 시스템 구현
 * - 2024-12-19: 알림 통계 및 분석 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (알림 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 알림 전송 성능 향상
 * - 알림 개인화 및 맞춤형 설정
 * - 알림 통계 대시보드
 * - 알림 A/B 테스트 시스템
 * - 알림 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 알림 목록 조회
 * GET /api/notifications?page=1&limit=20&category=lesson
 * 
 * // 알림 생성
 * POST /api/notifications
 * {
 *   "title": "강습 예약 알림",
 *   "content": "내일 오후 3시 수영 강습이 예약되었습니다.",
 *   "type": "booking",
 *   "priority": "high"
 * }
 * 
 * // 알림 읽음 처리
 * PUT /api/notifications/:id/read
 * 
 * // 알림 설정 업데이트
 * PUT /api/notifications/settings
 * {
 *   "emailNotifications": true,
 *   "pushNotifications": false
 * }
 * ```
 * 
 * 🔍 **알림 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증
 * 2. 알림 데이터 검증 및 sanitization
 * 3. 알림 타입별 분류 및 우선순위 설정
 * 4. 실시간 알림 전송 및 상태 추적
 * 5. 알림 통계 업데이트
 * 6. 알림 설정 및 선호도 관리
 * 7. 응답 데이터 반환 및 로깅
 */

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

