"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Payment_1 = require("../models/Payment");
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const auth_1 = require("../middleware/auth");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const { status, purpose, startDate, endDate } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (purpose)
            filter.purpose = purpose;
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const currentUser = req.user;
        if (currentUser?.userType !== 'superAdmin') {
            filter.user = currentUser._id;
        }
        const payments = await Payment_1.Payment.find(filter)
            .populate('user', 'name userId')
            .populate('relatedCourse', 'name')
            .populate('relatedBooking', 'date startTime endTime')
            .sort({ createdAt: -1 });
        return res.json({ payments });
    }
    catch (error) {
        console.error('결제 내역 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const payment = await Payment_1.Payment.findById(req.params.id)
            .populate('user', 'name userId email phone')
            .populate('relatedCourse', 'name description price')
            .populate('relatedBooking', 'date startTime endTime purpose');
        if (!payment) {
            return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
        }
        const currentUser = await User_1.User.findById(req.user.userId);
        if (currentUser?.userType !== 'superAdmin' && payment.user.toString() !== req.user.userId) {
            return res.status(403).json({ error: '조회 권한이 없습니다.' });
        }
        return res.json({ payment });
    }
    catch (error) {
        console.error('결제 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { amount, paymentMethod, purpose, relatedCourse, relatedBooking, notes } = req.body;
        if (!amount || !paymentMethod || !purpose) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        if (amount <= 0) {
            return res.status(400).json({ error: '유효하지 않은 금액입니다.' });
        }
        if (purpose === 'course' && !relatedCourse) {
            return res.status(400).json({ error: '강습 과정 정보가 필요합니다.' });
        }
        if (purpose === 'booking' && !relatedBooking) {
            return res.status(400).json({ error: '예약 정보가 필요합니다.' });
        }
        const transactionId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const paymentData = {
            user: req.user._id,
            amount,
            paymentMethod,
            purpose,
            relatedCourse,
            relatedBooking,
            notes: notes || '',
            transactionId,
            status: 'pending',
        };
        const payment = new Payment_1.Payment(paymentData);
        await payment.save();
        const populatedPayment = await Payment_1.Payment.findById(payment._id)
            .populate('user', 'name userId')
            .populate('relatedCourse', 'name')
            .populate('relatedBooking', 'date startTime endTime');
        try {
            const io = req.app.get('io');
            if (io)
                io.to(`user:${String(req.user._id)}`).emit('notification', {
                    type: 'payment:created',
                    message: '결제가 생성되었습니다. 결제 완료 대기 중입니다.',
                });
        }
        catch { }
        return res.status(201).json({
            message: '결제가 생성되었습니다.',
            payment: populatedPayment
        });
    }
    catch (error) {
        console.error('결제 생성 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:id/complete', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { receiptUrl } = req.body;
        const payment = await Payment_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
        }
        if (payment.status !== 'pending') {
            return res.status(400).json({ error: '처리 대기 중인 결제만 완료할 수 있습니다.' });
        }
        payment.status = 'completed';
        payment.processedAt = new Date();
        if (receiptUrl) {
            payment.receiptUrl = receiptUrl;
        }
        await payment.save();
        if (payment.purpose === 'course' && payment.relatedCourse) {
            const course = await Course_1.Course.findById(payment.relatedCourse);
            if (course) {
                let existingEnrollment = null;
                for (const enrollment of course.enrolledStudents) {
                    if (enrollment.student && enrollment.student.toString() === payment.user.toString()) {
                        existingEnrollment = enrollment;
                        break;
                    }
                }
                if (!existingEnrollment) {
                    course.enrolledStudents.push({
                        student: payment.user,
                        status: 'active',
                        enrolledAt: new Date()
                    });
                    await course.save();
                }
            }
        }
        const updatedPayment = await Payment_1.Payment.findById(payment._id)
            .populate('user', 'name userId')
            .populate('relatedCourse', 'name')
            .populate('relatedBooking', 'date startTime endTime');
        try {
            const io = req.app.get('io');
            if (io && updatedPayment)
                io.to(`user:${String(updatedPayment.user)}`).emit('notification', {
                    type: 'payment:completed',
                    message: '결제가 완료되었습니다.',
                });
        }
        catch { }
        return res.json({
            message: '결제가 완료되었습니다.',
            payment: updatedPayment
        });
    }
    catch (error) {
        console.error('결제 완료 처리 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:id/refund', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { reason } = req.body;
        const payment = await Payment_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
        }
        if (payment.status !== 'completed') {
            return res.status(400).json({ error: '완료된 결제만 환불할 수 있습니다.' });
        }
        payment.status = 'refunded';
        payment.notes = payment.notes + `\n환불 사유: ${reason || '관리자 요청'}`;
        await payment.save();
        if (payment.purpose === 'course' && payment.relatedCourse) {
            const course = await Course_1.Course.findById(payment.relatedCourse);
            if (course) {
                const enrollmentIndex = course.enrolledStudents.findIndex(enrollment => enrollment.student && enrollment.student.toString() === payment.user.toString());
                if (enrollmentIndex !== -1) {
                    course.enrolledStudents[enrollmentIndex].status = 'dropped';
                    await course.save();
                }
            }
        }
        const updatedPayment = await Payment_1.Payment.findById(payment._id)
            .populate('user', 'name userId')
            .populate('relatedCourse', 'name')
            .populate('relatedBooking', 'date startTime endTime');
        try {
            const io = req.app.get('io');
            if (io && updatedPayment)
                io.to(`user:${String(updatedPayment.user)}`).emit('notification', {
                    type: 'payment:refunded',
                    message: '결제가 환불되었습니다.',
                });
        }
        catch { }
        return res.json({
            message: '결제가 환불되었습니다.',
            payment: updatedPayment
        });
    }
    catch (error) {
        console.error('결제 환불 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/stats/summary', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = { status: 'completed' };
        if (startDate && endDate) {
            filter.processedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const payments = await Payment_1.Payment.find(filter);
        let totalAmount = 0;
        const paymentMethodStats = {};
        const purposeStats = {};
        for (const payment of payments) {
            totalAmount += payment.amount;
            paymentMethodStats[payment.paymentMethod] = (paymentMethodStats[payment.paymentMethod] || 0) + 1;
            purposeStats[payment.purpose] = (purposeStats[payment.purpose] || 0) + 1;
        }
        return res.json({
            totalPayments: payments.length,
            totalAmount,
            paymentMethodStats,
            purposeStats,
            averageAmount: payments.length > 0 ? totalAmount / payments.length : 0
        });
    }
    catch (error) {
        console.error('결제 통계 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/course/:courseId/stats', auth_1.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const stats = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: new mongoose_1.default.Types.ObjectId(courseId),
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' },
                    paymentMethods: { $addToSet: '$paymentMethod' }
                }
            }
        ]);
        const monthlyTrend = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: new mongoose_1.default.Types.ObjectId(courseId),
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);
        const methodStats = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: new mongoose_1.default.Types.ObjectId(courseId),
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        res.json({
            success: true,
            message: '강습 과정별 결제 통계 조회 성공',
            data: {
                courseId,
                period,
                overview: stats[0] || {
                    totalPayments: 0,
                    totalAmount: 0,
                    averageAmount: 0,
                    paymentMethods: []
                },
                monthlyTrend,
                methodStats
            }
        });
    }
    catch (error) {
        console.error('강습 과정별 결제 통계 조회 오류:', error);
        res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
    }
});
router.get('/student/:studentId/courses', auth_1.auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        if (req.user._id !== studentId &&
            req.user.userType !== 'instructor' &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const payments = await Payment_1.Payment.find({
            user: studentId,
            relatedCourse: { $exists: true, $ne: null }
        })
            .populate('relatedCourse', 'name level price')
            .sort({ createdAt: -1 });
        const coursePayments = new Map();
        payments.forEach(payment => {
            if (payment.relatedCourse) {
                const course = payment.relatedCourse;
                const courseId = course._id.toString();
                if (!coursePayments.has(courseId)) {
                    coursePayments.set(courseId, {
                        course: {
                            _id: course._id,
                            name: course.name,
                            level: course.level,
                            price: course.price
                        },
                        totalPayments: 0,
                        totalAmount: 0,
                        payments: []
                    });
                }
                const courseInfo = coursePayments.get(courseId);
                courseInfo.totalPayments++;
                courseInfo.totalAmount += payment.amount;
                courseInfo.payments.push(payment);
            }
        });
        res.json({
            success: true,
            message: '학생별 강습 과정 결제 내역 조회 성공',
            data: {
                studentId,
                totalCourses: coursePayments.size,
                coursePayments: Array.from(coursePayments.values())
            }
        });
    }
    catch (error) {
        console.error('학생별 강습 과정 결제 내역 조회 오류:', error);
        res.status(500).json({ error: '결제 내역 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/courses', auth_1.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const courseIds = await Course_1.Course.find({ instructor: instructorId }).distinct('_id');
        const stats = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: { $in: courseIds },
                    status: 'completed',
                    createdAt: { $gte: startDate }
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
            {
                $unwind: '$course'
            },
            {
                $group: {
                    _id: '$relatedCourse',
                    courseName: { $first: '$course.name' },
                    courseLevel: { $first: '$course.level' },
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);
        res.json({
            success: true,
            message: '강사별 강습 과정 결제 통계 조회 성공',
            data: {
                instructorId,
                period,
                totalCourses: stats.length,
                courseStats: stats
            }
        });
    }
    catch (error) {
        console.error('강사별 강습 과정 결제 통계 조회 오류:', error);
        res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
    }
});
router.get('/course/:courseId/stats', auth_1.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const stats = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: new mongoose_1.default.Types.ObjectId(courseId),
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' },
                    paymentMethods: { $addToSet: '$paymentMethod' }
                }
            }
        ]);
        const monthlyTrend = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: new mongoose_1.default.Types.ObjectId(courseId),
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);
        const methodStats = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: new mongoose_1.default.Types.ObjectId(courseId),
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        res.json({
            success: true,
            message: '강습 과정별 결제 통계 조회 성공',
            data: {
                courseId,
                period,
                overview: stats[0] || {
                    totalPayments: 0,
                    totalAmount: 0,
                    averageAmount: 0,
                    paymentMethods: []
                },
                monthlyTrend,
                methodStats
            }
        });
    }
    catch (error) {
        console.error('강습 과정별 결제 통계 조회 오류:', error);
        res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
    }
});
router.get('/student/:studentId/courses', auth_1.auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        if (req.user._id !== studentId &&
            req.user.userType !== 'instructor' &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const payments = await Payment_1.Payment.find({
            user: studentId,
            relatedCourse: { $exists: true, $ne: null }
        })
            .populate('relatedCourse', 'name level price')
            .sort({ createdAt: -1 });
        const coursePayments = new Map();
        payments.forEach(payment => {
            if (payment.relatedCourse) {
                const course = payment.relatedCourse;
                const courseId = course._id.toString();
                if (!coursePayments.has(courseId)) {
                    coursePayments.set(courseId, {
                        course: {
                            _id: course._id,
                            name: course.name,
                            level: course.level,
                            price: course.price
                        },
                        totalPayments: 0,
                        totalAmount: 0,
                        payments: []
                    });
                }
                const courseInfo = coursePayments.get(courseId);
                courseInfo.totalPayments++;
                courseInfo.totalAmount += payment.amount;
                courseInfo.payments.push(payment);
            }
        });
        res.json({
            success: true,
            message: '학생별 강습 과정 결제 내역 조회 성공',
            data: {
                studentId,
                totalCourses: coursePayments.size,
                coursePayments: Array.from(coursePayments.values())
            }
        });
    }
    catch (error) {
        console.error('학생별 강습 과정 결제 내역 조회 오류:', error);
        res.status(500).json({ error: '결제 내역 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/courses', auth_1.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const courseIds = await Course_1.Course.find({ instructor: instructorId }).distinct('_id');
        const stats = await Payment_1.Payment.aggregate([
            {
                $match: {
                    relatedCourse: { $in: courseIds },
                    status: 'completed',
                    createdAt: { $gte: startDate }
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
            {
                $unwind: '$course'
            },
            {
                $group: {
                    _id: '$relatedCourse',
                    courseName: { $first: '$course.name' },
                    courseLevel: { $first: '$course.level' },
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);
        res.json({
            success: true,
            message: '강사별 강습 과정 결제 통계 조회 성공',
            data: {
                instructorId,
                period,
                totalCourses: stats.length,
                courseStats: stats
            }
        });
    }
    catch (error) {
        console.error('강사별 강습 과정 결제 통계 조회 오류:', error);
        res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map