import * as express from 'express';
import { authMiddleware } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { measurePerformance } from '../utils/performance';
import { logInfo, logError } from '../utils/logger';
import { MembershipPlan, UserMembership, MembershipPayment } from '../models/Membership';

const router: express.Router = express.Router();

// 멤버십 목록 조회 (캐싱 적용)
router.get('/', authMiddleware, cache({ ttl: 300 }), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const memberships = await UserMembership.find(filter)
      .populate('userId', 'name email phone')
      .populate('planId', 'name description')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await UserMembership.countDocuments(filter);
    
    res.json({
      memberships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('멤버십 목록 조회 실패', error);
    res.status(500).json({ error: '멤버십 목록을 불러오는데 실패했습니다.' });
  }
});

// 멤버십 상세 조회
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const membership = await UserMembership.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('planId', 'name description');
    
    if (!membership) {
      return res.status(404).json({ error: '멤버십을 찾을 수 없습니다.' });
    }
    
    res.json(membership);
  } catch (error) {
    logError('멤버십 상세 조회 실패', error);
    return res.status(500).json({ error: '멤버십 정보를 불러오는데 실패했습니다.' });
  }
});

// 멤버십 생성
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, centerId, type, startDate, endDate, price, status = 'active' } = req.body;
    
    const membership = new UserMembership({
      userId,
      planId: req.body.planId,
      startDate,
      endDate,
      status,
      totalPaid: price
    });
    
    await membership.save();
    
    logInfo('멤버십 생성', { membershipId: membership._id, userId, centerId });
    res.status(201).json(membership);
  } catch (error) {
    logError('멤버십 생성 실패', error);
    return res.status(500).json({ error: '멤버십 생성에 실패했습니다.' });
  }
});

// 멤버십 수정
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { type, startDate, endDate, price, status } = req.body;
    
    const membership = await UserMembership.findByIdAndUpdate(
      req.params.id,
      { startDate, endDate, status },
      { new: true }
    );
    
    if (!membership) {
      return res.status(404).json({ error: '멤버십을 찾을 수 없습니다.' });
    }
    
    logInfo('멤버십 수정', { membershipId: membership._id });
    res.json(membership);
  } catch (error) {
    logError('멤버십 수정 실패', error);
    return res.status(500).json({ error: '멤버십 수정에 실패했습니다.' });
  }
});

// 멤버십 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const membership = await UserMembership.findByIdAndDelete(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ error: '멤버십을 찾을 수 없습니다.' });
    }
    
    logInfo('멤버십 삭제', { membershipId: req.params.id });
    res.json({ message: '멤버십이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    logError('멤버십 삭제 실패', error);
    return res.status(500).json({ error: '멤버십 삭제에 실패했습니다.' });
  }
});

// 멤버십 플랜 목록 조회
router.get('/plans/list', authMiddleware, cache({ ttl: 300 }), async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort({ price: 1 });
    res.json({ plans });
  } catch (error) {
    logError('멤버십 플랜 조회 실패', error);
    res.status(500).json({ error: '멤버십 플랜을 불러오는데 실패했습니다.' });
  }
});

// 멤버십 플랜 생성 (관리자만)
router.post('/plans', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, duration, features, maxClassesPerMonth, maxVideoUploads, prioritySupport } = req.body;
    
    const plan = new MembershipPlan({
      name,
      description,
      price,
      duration,
      features,
      maxClassesPerMonth,
      maxVideoUploads,
      prioritySupport
    });
    
    await plan.save();
    
    logInfo('멤버십 플랜 생성', { planId: plan._id, name });
    res.status(201).json(plan);
  } catch (error) {
    logError('멤버십 플랜 생성 실패', error);
    res.status(500).json({ error: '멤버십 플랜 생성에 실패했습니다.' });
  }
});

// 멤버십 결제 내역 조회
router.get('/payments', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const payments = await MembershipPayment.find()
      .populate('userId', 'name email')
      .populate('membershipId', 'planId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ paymentDate: -1 });
    
    const total = await MembershipPayment.countDocuments();
    
    res.json({
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('멤버십 결제 내역 조회 실패', error);
    res.status(500).json({ error: '결제 내역을 불러오는데 실패했습니다.' });
  }
});

// 멤버십 통계
router.get('/stats/overview', authMiddleware, cache({ ttl: 600 }), async (req, res) => {
  try {
    const totalMemberships = await UserMembership.countDocuments();
    const activeMemberships = await UserMembership.countDocuments({ status: 'active' });
    const expiredMemberships = await UserMembership.countDocuments({ 
      endDate: { $lt: new Date() } 
    });
    
    const monthlyRevenue = await UserMembership.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);
    
    res.json({
      total: totalMemberships,
      active: activeMemberships,
      expired: expiredMemberships,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    });
  } catch (error) {
    logError('멤버십 통계 조회 실패', error);
    res.status(500).json({ error: '멤버십 통계를 불러오는데 실패했습니다.' });
  }
});

export default router;





