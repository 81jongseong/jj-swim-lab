"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Booking_1 = require("../models/Booking");
const Payment_1 = require("../models/Payment");
const router = express_1.default.Router();
const requireCenterAdmin = (0, auth_1.requireRole)(['centerAdmin']);
router.get('/dashboard', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const totalMembers = await User_1.User.countDocuments({
            $or: [
                { 'studentInfo.centerId': centerId },
                { 'instructorInfo.assignedCenters': centerId }
            ],
            isActive: true
        });
        const activeInstructors = await User_1.User.countDocuments({
            userType: 'instructor',
            'instructorInfo.assignedCenters': centerId,
            isActive: true
        });
        const activeCourses = await Course_1.Course.countDocuments({
            centerId,
            status: 'active'
        });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    centerId,
                    status: 'completed',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayBookings = await Booking_1.Booking.countDocuments({
            centerId,
            date: {
                $gte: today,
                $lt: tomorrow
            },
            status: 'confirmed'
        });
        const pendingApprovals = await Booking_1.Booking.countDocuments({
            centerId,
            status: 'pending'
        });
        res.json({
            success: true,
            message: '센터 관리자 대시보드 데이터 조회 성공!',
            data: {
                totalMembers,
                activeInstructors,
                activeCourses,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                todayBookings,
                pendingApprovals,
                monthlyGrowth: 12.5,
                averageRating: 4.7
            }
        });
    }
    catch (error) {
        console.error('센터 관리자 대시보드 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/users', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, search = '', userType = 'all' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {
            $or: [
                { 'studentInfo.centerId': centerId },
                { 'instructorInfo.assignedCenters': centerId }
            ],
            isActive: true
        };
        if (userType !== 'all') {
            query.userType = userType;
        }
        if (search) {
            query.$and = [
                query,
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }
        const users = await User_1.User.find(query)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(query);
        res.json({
            success: true,
            message: '센터 회원 목록 조회 성공!',
            data: {
                users,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: users.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 회원 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {
            userType: 'instructor',
            'instructorInfo.assignedCenters': centerId,
            isActive: true
        };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const instructors = await User_1.User.find(query)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(query);
        res.json({
            success: true,
            message: '센터 강사 목록 조회 성공!',
            data: {
                instructors,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: instructors.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 강사 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/courses', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, status = 'all' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = { centerId };
        if (status !== 'all') {
            query.status = status;
        }
        const courses = await Course_1.Course.find(query)
            .populate('instructorId', 'name email')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Course_1.Course.countDocuments(query);
        res.json({
            success: true,
            message: '센터 강의 목록 조회 성공!',
            data: {
                courses,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: courses.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 강의 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/bookings', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, status = 'all', date } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = { centerId };
        if (status !== 'all') {
            query.status = status;
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        const bookings = await Booking_1.Booking.find(query)
            .populate('userId', 'name email phone')
            .populate('courseId', 'name level')
            .skip(skip)
            .limit(Number(limit))
            .sort({ date: -1 });
        const total = await Booking_1.Booking.countDocuments(query);
        res.json({
            success: true,
            message: '센터 예약 목록 조회 성공!',
            data: {
                bookings,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: bookings.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 예약 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/payments', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, status = 'all', startDate, endDate } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = { centerId };
        if (status !== 'all') {
            query.status = status;
        }
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const payments = await Payment_1.Payment.find(query)
            .populate('userId', 'name email')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Payment_1.Payment.countDocuments(query);
        res.json({
            success: true,
            message: '센터 결제 목록 조회 성공!',
            data: {
                payments,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: payments.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 결제 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/reports', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const monthlyRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    centerId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
                $limit: 12
            }
        ]);
        const courseStats = await Course_1.Course.aggregate([
            {
                $match: { centerId }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'courseId',
                    as: 'bookings'
                }
            },
            {
                $project: {
                    name: 1,
                    level: 1,
                    studentCount: { $size: '$bookings' }
                }
            }
        ]);
        res.json({
            success: true,
            message: '센터 통계 조회 성공!',
            data: {
                monthlyRevenue,
                courseStats
            }
        });
    }
    catch (error) {
        console.error('센터 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-admin.js.map