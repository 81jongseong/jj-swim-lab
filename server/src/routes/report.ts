import express from 'express';
import { auth } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { logInfo, logError } from '../utils/logger';
import { ReportTemplate, GeneratedReport, ReportSchedule } from '../models/Report';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';

const router: express.Router = express.Router();

// ===== 보고서 템플릿 관리 =====

// 보고서 목록 조회 (캐싱 적용)
router.get('/', auth, cache({ ttl: 300 }), async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const reports = await ReportTemplate.find(filter)
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await ReportTemplate.countDocuments(filter);
    
    res.json({
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('보고서 목록 조회 실패', error);
    res.status(500).json({ error: '보고서 목록을 불러오는데 실패했습니다.' });
  }
});

// 보고서 상세 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await ReportTemplate.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!report) {
      return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
    }
    
    res.json(report);
  } catch (error) {
    logError('보고서 상세 조회 실패', error);
    return res.status(500).json({ error: '보고서 정보를 불러오는데 실패했습니다.' });
  }
});

// 보고서 생성
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      type, 
      description, 
      parameters, 
      schedule,
      status = 'draft'
    } = req.body;
    
    const report = new ReportTemplate({
      title,
      type,
      description,
      parameters,
      schedule,
      status,
      createdBy: (req as any).user._id
    });
    
    await report.save();
    
    logInfo('보고서 생성', { reportId: report._id, createdBy: (req as any).user._id });
    res.status(201).json(report);
  } catch (error) {
    logError('보고서 생성 실패', error);
    return res.status(500).json({ error: '보고서 생성에 실패했습니다.' });
  }
});

// 보고서 수정
router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      title, 
      type, 
      description, 
      parameters, 
      schedule,
      status
    } = req.body;
    
    const report = await ReportTemplate.findByIdAndUpdate(
      req.params.id,
      {
        title,
        type,
        description,
        parameters,
        schedule,
        status,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
    }
    
    logInfo('보고서 수정', { reportId: report._id, updatedBy: (req as any).user._id });
    res.json(report);
  } catch (error) {
    logError('보고서 수정 실패', error);
    return res.status(500).json({ error: '보고서 수정에 실패했습니다.' });
  }
});

// 보고서 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await ReportTemplate.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
    }
    
    logInfo('보고서 삭제', { reportId: req.params.id, deletedBy: (req as any).user._id });
    res.json({ message: '보고서가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    logError('보고서 삭제 실패', error);
    return res.status(500).json({ error: '보고서 삭제에 실패했습니다.' });
  }
});

// ===== 보고서 생성 및 실행 =====

// 보고서 실행
router.post('/:id/execute', auth, async (req, res) => {
  try {
    const report = await ReportTemplate.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
    }
    
    // 보고서 실행 로직
    const generatedReport = new GeneratedReport({
      template: report._id,
      executedBy: (req as any).user._id,
      parameters: req.body.parameters || report.parameters,
      status: 'completed',
      result: {
        message: '보고서가 성공적으로 생성되었습니다.',
        data: {}
      }
    });
    
    await generatedReport.save();
    
    logInfo('보고서 실행', { reportId: report._id, executedBy: (req as any).user._id });
    res.json(generatedReport);
  } catch (error) {
    logError('보고서 실행 실패', error);
    return res.status(500).json({ error: '보고서 실행에 실패했습니다.' });
  }
});

// 생성된 보고서 목록 조회
router.get('/generated', auth, cache({ ttl: 300 }), async (req, res) => {
  try {
    const { page = 1, limit = 10, templateId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = {};
    if (templateId) filter.template = templateId;
    
    const reports = await GeneratedReport.find(filter)
      .populate('template', 'title type')
      .populate('executedBy', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await GeneratedReport.countDocuments(filter);
    
    res.json({
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logError('생성된 보고서 목록 조회 실패', error);
    res.status(500).json({ error: '생성된 보고서 목록을 불러오는데 실패했습니다.' });
  }
});

// ===== 통계 보고서 =====

// 사용자 통계
router.get('/stats/users', auth, cache({ ttl: 300 }), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const totalUsers = await User.countDocuments(filter);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const userTypes = await User.aggregate([
      { $match: filter },
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalUsers,
      newUsers,
      userTypes,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logError('사용자 통계 조회 실패', error);
    res.status(500).json({ error: '사용자 통계를 불러오는데 실패했습니다.' });
  }
});

// 강습 과정 통계
router.get('/stats/courses', auth, cache({ ttl: 300 }), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const totalCourses = await Course.countDocuments(filter);
    const activeCourses = await Course.countDocuments({ ...filter, isActive: true });
    
    const courseLevels = await Course.aggregate([
      { $match: filter },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalCourses,
      activeCourses,
      courseLevels,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logError('강습 과정 통계 조회 실패', error);
    res.status(500).json({ error: '강습 과정 통계를 불러오는데 실패했습니다.' });
  }
});

// 예약 통계
router.get('/stats/bookings', auth, cache({ ttl: 300 }), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const totalBookings = await Booking.countDocuments(filter);
    const completedBookings = await Booking.countDocuments({ ...filter, status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ ...filter, status: 'cancelled' });
    
    const bookingStatuses = await Booking.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalBookings,
      completedBookings,
      cancelledBookings,
      bookingStatuses,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logError('예약 통계 조회 실패', error);
    res.status(500).json({ error: '예약 통계를 불러오는데 실패했습니다.' });
  }
});

// 결제 통계
router.get('/stats/payments', auth, cache({ ttl: 300 }), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const totalPayments = await Payment.countDocuments(filter);
    const totalAmount = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const paymentMethods = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    
    const monthlyRevenue = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      paymentMethods,
      monthlyRevenue,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logError('결제 통계 조회 실패', error);
    res.status(500).json({ error: '결제 통계를 불러오는데 실패했습니다.' });
  }
});

// 대시보드 개요 통계
router.get('/dashboard/overview', auth, cache({ ttl: 300 }), async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 오늘 통계
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today }
    });
    
    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // 이번 달 통계
    const thisMonthUsers = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    const thisMonthRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      today: {
        users: todayUsers,
        bookings: todayBookings,
        revenue: todayRevenue[0]?.total || 0
      },
      thisMonth: {
        users: thisMonthUsers,
        revenue: thisMonthRevenue[0]?.total || 0
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logError('대시보드 통계 조회 실패', error);
    res.status(500).json({ error: '대시보드 통계를 불러오는데 실패했습니다.' });
  }
});

export default router; 
