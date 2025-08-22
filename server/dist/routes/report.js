"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const logger_1 = require("../utils/logger");
const Report_1 = require("../models/Report");
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Booking_1 = require("../models/Booking");
const Payment_1 = require("../models/Payment");
const router = express_1.default.Router();
router.get('/', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (type)
            filter.type = type;
        if (status)
            filter.status = status;
        const reports = await Report_1.ReportTemplate.find(filter)
            .populate('createdBy', 'name')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Report_1.ReportTemplate.countDocuments(filter);
        res.json({
            reports,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('보고서 목록 조회 실패', error);
        res.status(500).json({ error: '보고서 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const report = await Report_1.ReportTemplate.findById(req.params.id)
            .populate('createdBy', 'name');
        if (!report) {
            return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
        }
        res.json(report);
    }
    catch (error) {
        (0, logger_1.logError)('보고서 상세 조회 실패', error);
        return res.status(500).json({ error: '보고서 정보를 불러오는데 실패했습니다.' });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { title, type, description, parameters, schedule, status = 'draft' } = req.body;
        const report = new Report_1.ReportTemplate({
            title,
            type,
            description,
            parameters,
            schedule,
            status,
            createdBy: req.user._id
        });
        await report.save();
        (0, logger_1.logInfo)('보고서 생성', { reportId: report._id, createdBy: req.user._id });
        res.status(201).json(report);
    }
    catch (error) {
        (0, logger_1.logError)('보고서 생성 실패', error);
        return res.status(500).json({ error: '보고서 생성에 실패했습니다.' });
    }
});
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const { title, type, description, parameters, schedule, status } = req.body;
        const report = await Report_1.ReportTemplate.findByIdAndUpdate(req.params.id, {
            title,
            type,
            description,
            parameters,
            schedule,
            status,
            updatedAt: new Date()
        }, { new: true });
        if (!report) {
            return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('보고서 수정', { reportId: report._id, updatedBy: req.user._id });
        res.json(report);
    }
    catch (error) {
        (0, logger_1.logError)('보고서 수정 실패', error);
        return res.status(500).json({ error: '보고서 수정에 실패했습니다.' });
    }
});
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const report = await Report_1.ReportTemplate.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('보고서 삭제', { reportId: req.params.id, deletedBy: req.user._id });
        res.json({ message: '보고서가 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('보고서 삭제 실패', error);
        return res.status(500).json({ error: '보고서 삭제에 실패했습니다.' });
    }
});
router.post('/:id/execute', auth_1.auth, async (req, res) => {
    try {
        const report = await Report_1.ReportTemplate.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ error: '보고서를 찾을 수 없습니다.' });
        }
        const generatedReport = new Report_1.GeneratedReport({
            template: report._id,
            executedBy: req.user._id,
            parameters: req.body.parameters || report.parameters,
            status: 'completed',
            result: {
                message: '보고서가 성공적으로 생성되었습니다.',
                data: {}
            }
        });
        await generatedReport.save();
        (0, logger_1.logInfo)('보고서 실행', { reportId: report._id, executedBy: req.user._id });
        res.json(generatedReport);
    }
    catch (error) {
        (0, logger_1.logError)('보고서 실행 실패', error);
        return res.status(500).json({ error: '보고서 실행에 실패했습니다.' });
    }
});
router.get('/generated', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { page = 1, limit = 10, templateId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (templateId)
            filter.template = templateId;
        const reports = await Report_1.GeneratedReport.find(filter)
            .populate('template', 'title type')
            .populate('executedBy', 'name')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Report_1.GeneratedReport.countDocuments(filter);
        res.json({
            reports,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('생성된 보고서 목록 조회 실패', error);
        res.status(500).json({ error: '생성된 보고서 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/stats/users', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const totalUsers = await User_1.User.countDocuments(filter);
        const newUsers = await User_1.User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        const userTypes = await User_1.User.aggregate([
            { $match: filter },
            { $group: { _id: '$userType', count: { $sum: 1 } } }
        ]);
        res.json({
            totalUsers,
            newUsers,
            userTypes,
            generatedAt: new Date().toISOString()
        });
    }
    catch (error) {
        (0, logger_1.logError)('사용자 통계 조회 실패', error);
        res.status(500).json({ error: '사용자 통계를 불러오는데 실패했습니다.' });
    }
});
router.get('/stats/courses', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const totalCourses = await Course_1.Course.countDocuments(filter);
        const activeCourses = await Course_1.Course.countDocuments({ ...filter, isActive: true });
        const courseLevels = await Course_1.Course.aggregate([
            { $match: filter },
            { $group: { _id: '$level', count: { $sum: 1 } } }
        ]);
        res.json({
            totalCourses,
            activeCourses,
            courseLevels,
            generatedAt: new Date().toISOString()
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 통계 조회 실패', error);
        res.status(500).json({ error: '강습 과정 통계를 불러오는데 실패했습니다.' });
    }
});
router.get('/stats/bookings', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const totalBookings = await Booking_1.Booking.countDocuments(filter);
        const completedBookings = await Booking_1.Booking.countDocuments({ ...filter, status: 'completed' });
        const cancelledBookings = await Booking_1.Booking.countDocuments({ ...filter, status: 'cancelled' });
        const bookingStatuses = await Booking_1.Booking.aggregate([
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
    }
    catch (error) {
        (0, logger_1.logError)('예약 통계 조회 실패', error);
        res.status(500).json({ error: '예약 통계를 불러오는데 실패했습니다.' });
    }
});
router.get('/stats/payments', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const totalPayments = await Payment_1.Payment.countDocuments(filter);
        const totalAmount = await Payment_1.Payment.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const paymentMethods = await Payment_1.Payment.aggregate([
            { $match: filter },
            { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]);
        const monthlyRevenue = await Payment_1.Payment.aggregate([
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
    }
    catch (error) {
        (0, logger_1.logError)('결제 통계 조회 실패', error);
        res.status(500).json({ error: '결제 통계를 불러오는데 실패했습니다.' });
    }
});
router.get('/dashboard/overview', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const todayUsers = await User_1.User.countDocuments({
            createdAt: { $gte: today }
        });
        const todayBookings = await Booking_1.Booking.countDocuments({
            createdAt: { $gte: today }
        });
        const todayRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    status: 'completed'
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const thisMonthUsers = await User_1.User.countDocuments({
            createdAt: { $gte: thisMonth }
        });
        const thisMonthRevenue = await Payment_1.Payment.aggregate([
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
    }
    catch (error) {
        (0, logger_1.logError)('대시보드 통계 조회 실패', error);
        res.status(500).json({ error: '대시보드 통계를 불러오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=report.js.map