"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Payment_1 = require("../models/Payment");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
const requireAdmin = (req, res, next) => {
    if (!['superAdmin', 'centerAdmin'].includes(req.user.userType)) {
        return res.status(403).json({
            success: false,
            message: '접근 권한이 없습니다.'
        });
    }
    next();
};
router.get('/stats', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { userType, centerId } = req.user;
        let queryCondition = {};
        if (userType === 'centerAdmin' && centerId) {
            queryCondition.centerId = centerId;
        }
        const totalRevenue = await Payment_1.Payment.aggregate([
            { $match: { ...queryCondition, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const instructorRevenue = await Payment_1.Payment.aggregate([
            { $match: { ...queryCondition, status: 'completed' } },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'relatedBooking',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            { $unwind: '$booking' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'booking.instructorId',
                    foreignField: '_id',
                    as: 'instructor'
                }
            },
            { $unwind: '$instructor' },
            {
                $group: {
                    _id: '$booking.instructorId',
                    instructorName: { $first: '$instructor.name' },
                    totalRevenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);
        const courseRevenue = await Payment_1.Payment.aggregate([
            { $match: { ...queryCondition, status: 'completed' } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'relatedCourse',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $group: {
                    _id: '$relatedCourse',
                    courseName: { $first: '$course.name' },
                    totalRevenue: { $sum: '$amount' },
                    enrollmentCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);
        const recentTransactions = await Payment_1.Payment.find({
            ...queryCondition,
            status: 'completed'
        })
            .populate('user', 'name')
            .populate('relatedCourse', 'name')
            .populate({
            path: 'relatedBooking',
            populate: {
                path: 'instructorId',
                select: 'name'
            }
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        const monthlyTrend = await Payment_1.Payment.aggregate([
            { $match: { ...queryCondition, status: 'completed' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);
        res.json({
            success: true,
            data: {
                totalRevenue: totalRevenue[0]?.total || 0,
                instructorRevenue,
                courseRevenue,
                recentTransactions: recentTransactions.map((tx) => ({
                    id: tx._id,
                    studentName: tx.user?.name || '알 수 없음',
                    courseName: tx.relatedCourse?.name || '알 수 없음',
                    instructorName: tx.relatedBooking?.instructorId?.name || '알 수 없음',
                    amount: tx.amount,
                    status: tx.status,
                    date: tx.createdAt
                })),
                monthlyTrend: monthlyTrend.map(item => ({
                    period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                    revenue: item.revenue,
                    count: item.count
                }))
            }
        });
    }
    catch (error) {
        console.error('총매출 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '총매출 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/instructor/:instructorId', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const instructorRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    ...dateFilter
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'relatedBooking',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            { $unwind: '$booking' },
            {
                $match: {
                    'booking.instructorId': new mongoose_1.default.Types.ObjectId(instructorId)
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'relatedCourse',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $group: {
                    _id: '$relatedCourse',
                    courseName: { $first: '$course.name' },
                    totalRevenue: { $sum: '$amount' },
                    studentCount: { $sum: 1 },
                    averageRevenue: { $avg: '$amount' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);
        res.json({
            success: true,
            data: instructorRevenue
        });
    }
    catch (error) {
        console.error('강사별 매출 현황 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강사별 매출 현황 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/course/:courseId', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const courseRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: new mongoose_1.default.Types.ObjectId(courseId),
                    status: 'completed',
                    ...dateFilter
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $group: {
                    _id: '$user',
                    studentName: { $first: '$student.name' },
                    amount: { $first: '$amount' },
                    paymentDate: { $first: '$createdAt' }
                }
            },
            { $sort: { paymentDate: -1 } }
        ]);
        res.json({
            success: true,
            data: courseRevenue
        });
    }
    catch (error) {
        console.error('과정별 매출 현황 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과정별 매출 현황 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=revenue.js.map