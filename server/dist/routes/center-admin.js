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
const Notice_1 = require("../models/Notice");
const Review_1 = require("../models/Review");
const Report_1 = require("../models/Report");
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
router.get('/notices', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const notices = await Notice_1.Notice.find({ centerId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({
            success: true,
            data: notices
        });
    }
    catch (error) {
        console.error('공지사항 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/notices', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { title, content, isImportant } = req.body;
        const notice = new Notice_1.Notice({
            title,
            content,
            author: centerAdmin.name || '센터 관리자',
            isImportant: isImportant || false,
            status: 'published',
            centerId
        });
        await notice.save();
        res.json({
            success: true,
            data: notice
        });
    }
    catch (error) {
        console.error('공지사항 생성 오류:', error);
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
        const payments = await Payment_1.Payment.find({ centerId })
            .sort({ paymentDate: -1 })
            .limit(100);
        res.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        console.error('결제 내역 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/reviews', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const reviews = await Review_1.Review.find({ centerId })
            .sort({ date: -1 })
            .limit(100);
        res.json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        console.error('리뷰 조회 오류:', error);
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
        const { period = 'month' } = req.query;
        let report = await Report_1.Report.findOne({ centerId, period });
        if (!report) {
            report = new Report_1.Report({
                period,
                totalStudents: 0,
                totalRevenue: 0,
                totalClasses: 0,
                averageRating: 0,
                newStudents: 0,
                retentionRate: 0,
                centerId
            });
            await report.save();
        }
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        console.error('리포트 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/add-sample-data', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        await Notice_1.Notice.deleteMany({ centerId });
        await Payment_1.Payment.deleteMany({ centerId });
        await Review_1.Review.deleteMany({ centerId });
        await Report_1.Report.deleteMany({ centerId });
        const notices = [
            {
                title: '수영장 이용 안내',
                content: '수영장 이용 시 안전수칙을 준수해 주시기 바랍니다.\n\n1. 수영 전 충분한 준비운동을 해주세요.\n2. 수영장 내에서는 뛰지 마세요.\n3. 개인 소지품은 락커에 보관해주세요.',
                author: '센터 관리자',
                isImportant: true,
                status: 'published',
                centerId
            },
            {
                title: '강의 일정 변경 안내',
                content: '다음 주 강의 일정이 변경되었습니다. 확인해 주세요.\n\n- 월요일: 자유형 기초 (오후 2시 → 오후 3시)\n- 수요일: 배영 중급 (오후 4시 → 오후 5시)\n- 금요일: 접영 고급 (오후 6시 → 오후 7시)',
                author: '센터 관리자',
                isImportant: false,
                status: 'published',
                centerId
            },
            {
                title: '새로운 강사 합류',
                content: '새로운 강사가 합류했습니다. 환영해 주세요.\n\n김수영 강사님\n- 전국대회 우승 경력\n- 자유형 전문\n- 친절하고 체계적인 지도',
                author: '센터 관리자',
                isImportant: false,
                status: 'published',
                centerId
            }
        ];
        await Notice_1.Notice.insertMany(notices);
        const payments = [
            {
                studentName: '김학생',
                courseName: '자유형 기초',
                amount: 150000,
                paymentMethod: '카드',
                status: 'completed',
                transactionId: 'TXN123456789',
                centerId
            },
            {
                studentName: '박학생',
                courseName: '배영 중급',
                amount: 200000,
                paymentMethod: '계좌이체',
                status: 'pending',
                transactionId: 'TXN123456790',
                centerId
            },
            {
                studentName: '정학생',
                courseName: '접영 고급',
                amount: 250000,
                paymentMethod: '카드',
                status: 'failed',
                transactionId: 'TXN123456791',
                centerId
            }
        ];
        await Payment_1.Payment.insertMany(payments);
        const reviews = [
            {
                studentName: '김학생',
                instructorName: '이강사',
                courseName: '자유형 기초',
                rating: 5,
                comment: '정말 좋은 강의였습니다. 강사님이 친절하시고 설명도 잘 해주셔요.',
                status: 'approved',
                centerId
            },
            {
                studentName: '박학생',
                instructorName: '최강사',
                courseName: '배영 중급',
                rating: 4,
                comment: '배영 기술이 많이 향상되었어요. 감사합니다.',
                status: 'pending',
                centerId
            },
            {
                studentName: '정학생',
                instructorName: '김강사',
                courseName: '접영 고급',
                rating: 3,
                comment: '강의는 괜찮지만 시간이 좀 부족했어요.',
                status: 'rejected',
                centerId
            }
        ];
        await Review_1.Review.insertMany(reviews);
        const reports = [
            {
                period: 'month',
                totalStudents: 156,
                totalRevenue: 23400000,
                totalClasses: 89,
                averageRating: 4.7,
                newStudents: 23,
                retentionRate: 87.5,
                centerId
            },
            {
                period: 'week',
                totalStudents: 45,
                totalRevenue: 6750000,
                totalClasses: 23,
                averageRating: 4.8,
                newStudents: 8,
                retentionRate: 92.0,
                centerId
            }
        ];
        await Report_1.Report.insertMany(reports);
        res.json({
            success: true,
            message: '예시 데이터가 성공적으로 추가되었습니다.',
            data: {
                notices: notices.length,
                payments: payments.length,
                reviews: reviews.length,
                reports: reports.length
            }
        });
    }
    catch (error) {
        console.error('예시 데이터 추가 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-admin.js.map