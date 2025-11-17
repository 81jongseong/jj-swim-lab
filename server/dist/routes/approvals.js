"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Payment_1 = require("../models/Payment");
const Booking_1 = require("../models/Booking");
const Course_1 = require("../models/Course");
const Approval_1 = require("../models/Approval");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
const requireAdmin = (req, res, next) => {
    const userType = req.user.userType;
    if (!['superAdmin', 'centerAdmin', 'center-admin'].includes(userType)) {
        return res.status(403).json({
            success: false,
            message: '승인 관리 권한이 없습니다. 관리자 계정이 필요합니다.'
        });
    }
    next();
};
router.get('/', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        let { userType } = req.user;
        const { centerId } = req.user;
        const { status, type, page = 1, limit = 20 } = req.query;
        if (userType === 'center-admin') {
            userType = 'centerAdmin';
        }
        let finalCenterId = centerId;
        if ((userType === 'centerAdmin' || userType === 'center-admin') && !centerId) {
            const user = await User_1.User.findById(req.user._id);
            const dbCenterId = user?.centerId || user?.centerAdminInfo?.managedCenters?.[0];
            finalCenterId = dbCenterId ? (dbCenterId.toString ? dbCenterId.toString() : dbCenterId) : undefined;
        }
        const queryCondition = {};
        if ((userType === 'centerAdmin' || userType === 'center-admin') && finalCenterId) {
            queryCondition.centerId = finalCenterId;
        }
        if (status && status !== 'all') {
            queryCondition.status = status;
        }
        if (type && type !== 'all') {
            queryCondition.type = type;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const approvals = await Approval_1.Approval.find(queryCondition)
            .populate('userId', 'name email userType')
            .populate('courseId', 'name')
            .populate('instructorId', 'name')
            .sort({ requestDate: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean();
        const isPopulatedUser = (user) => {
            return user && typeof user === 'object' && 'name' in user;
        };
        const isPopulatedCourse = (course) => {
            return course && typeof course === 'object' && 'name' in course;
        };
        const isPopulatedInstructor = (instructor) => {
            return instructor && typeof instructor === 'object' && 'name' in instructor;
        };
        const totalCount = await Approval_1.Approval.countDocuments(queryCondition);
        const formattedApprovals = approvals.map(approval => ({
            id: approval._id,
            type: approval.type,
            title: approval.title,
            description: approval.description,
            requesterName: isPopulatedUser(approval.userId) ? approval.userId.name : '알 수 없음',
            requesterType: isPopulatedUser(approval.userId) ? approval.userId.userType : '알 수 없음',
            requestDate: approval.requestDate,
            status: approval.status,
            priority: approval.priority,
            estimatedAmount: approval.estimatedAmount,
            courseName: isPopulatedCourse(approval.courseId) ? approval.courseId.name : undefined,
            instructorName: isPopulatedInstructor(approval.instructorId) ? approval.instructorId.name : undefined,
            createdAt: approval.createdAt
        }));
        res.json({
            success: true,
            data: {
                approvals: formattedApprovals,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                    totalCount,
                    hasNext: skip + Number(limit) < totalCount,
                    hasPrev: Number(page) > 1
                }
            }
        });
    }
    catch (error) {
        console.error('승인 요청 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '승인 요청 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const approval = await Approval_1.Approval.findById(id)
            .populate('userId', 'name email userType phone')
            .populate('courseId', 'name description price')
            .populate('instructorId', 'name email phone')
            .lean();
        if (!approval) {
            return res.status(404).json({
                success: false,
                message: '승인 요청을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: approval
        });
    }
    catch (error) {
        console.error('승인 요청 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '승인 요청 상세 조회 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:id/process', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: '잘못된 액션입니다. approve 또는 reject만 가능합니다.'
            });
        }
        const approval = await Approval_1.Approval.findById(id);
        if (!approval) {
            return res.status(404).json({
                success: false,
                message: '승인 요청을 찾을 수 없습니다.'
            });
        }
        if (approval.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: '이미 처리된 승인 요청입니다.'
            });
        }
        approval.status = action === 'approve' ? 'approved' : 'rejected';
        approval.processedBy = new mongoose_1.default.Types.ObjectId(req.user._id);
        approval.processedAt = new Date();
        approval.reason = reason;
        await approval.save();
        if (action === 'approve') {
            await processApprovedRequest(approval);
        }
        res.json({
            success: true,
            message: `승인 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`,
            data: approval
        });
    }
    catch (error) {
        console.error('승인 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '승인 처리 중 오류가 발생했습니다.'
        });
    }
});
async function processApprovedRequest(approval) {
    try {
        switch (approval.type) {
            case 'course_enrollment':
                if (approval.courseId && approval.userId) {
                    const existingEnrollment = await Booking_1.Booking.findOne({
                        studentId: approval.userId,
                        courseId: approval.courseId
                    });
                    if (!existingEnrollment) {
                        await Booking_1.Booking.create({
                            studentId: approval.userId,
                            courseId: approval.courseId,
                            instructorId: approval.instructorId,
                            status: 'confirmed',
                            enrollmentDate: new Date()
                        });
                    }
                }
                break;
            case 'instructor_registration':
                if (approval.userId) {
                    await User_1.User.findByIdAndUpdate(approval.userId, {
                        userType: 'instructor',
                        isApproved: true,
                        approvedAt: new Date()
                    });
                }
                break;
            case 'payment_approval':
                if (approval.paymentId) {
                    const updatedPayment = await Payment_1.Payment.findByIdAndUpdate(approval.paymentId, {
                        status: 'completed',
                        approvedAt: new Date(),
                        approvedBy: approval.processedBy
                    }, { new: true }).populate('relatedCourse');
                    const courseId = approval.courseId || updatedPayment?.relatedCourse;
                    const userId = approval.userId || updatedPayment?.user;
                    if (courseId && userId) {
                        const course = await Course_1.Course.findById(courseId);
                        if (course) {
                            const already = (course.enrolledStudents || []).some((e) => e?.student?.toString?.() === userId.toString());
                            if (!already) {
                                course.enrolledStudents = [
                                    ...(course.enrolledStudents || []),
                                    { student: userId, enrollmentDate: new Date(), status: 'active' }
                                ];
                                await course.save();
                            }
                            if (course.centerId) {
                                const student = await User_1.User.findById(userId);
                                if (student && !student.centerId) {
                                    student.centerId = course.centerId;
                                    await student.save();
                                }
                            }
                        }
                    }
                }
                break;
            case 'schedule_change':
                break;
            case 'refund_request':
                if (approval.courseId && approval.userId) {
                    const { Payment } = require('../models/Payment');
                    const { Course } = require('../models/Course');
                    const { Booking } = require('../models/Booking');
                    const { PersonalLesson } = require('../models/PersonalLesson');
                    const payment = await Payment.findOne({
                        user: approval.userId,
                        relatedCourse: approval.courseId,
                        status: { $in: ['completed', 'pending'] }
                    });
                    if (payment) {
                        const refundAmount = approval.estimatedAmount || payment.amount;
                        payment.status = 'refunded';
                        payment.refundAmount = refundAmount;
                        payment.refundedAt = new Date();
                        payment.refundedBy = approval.processedBy;
                        payment.notes = (payment.notes || '') + `\n환불 승인: ${approval.reason || '센터 관리자 승인'}\n환불 금액: ${refundAmount.toLocaleString()}원`;
                        await payment.save();
                        console.log(`✅ Payment ${payment._id} 환불 처리 완료: ${refundAmount.toLocaleString()}원`);
                    }
                    const course = await Course.findById(approval.courseId);
                    if (course && course.enrolledStudents) {
                        const studentIdStr = approval.userId.toString();
                        course.enrolledStudents = (course.enrolledStudents || []).filter((e) => {
                            const eStudentId = e.student?.toString() || e.student?.toString() || e.student;
                            return eStudentId !== studentIdStr;
                        });
                        await course.save();
                        console.log(`✅ Course ${course._id}에서 학생 ${approval.userId} 제거 완료`);
                    }
                    const booking = await Booking.findOne({
                        studentId: approval.userId,
                        courseId: approval.courseId,
                        status: { $in: ['confirmed', 'pending', 'completed'] }
                    });
                    if (booking) {
                        booking.status = 'cancelled';
                        booking.cancelledAt = new Date();
                        booking.cancellationReason = '환불 승인';
                        await booking.save();
                        console.log(`✅ Booking ${booking._id} 취소 처리 완료`);
                    }
                }
                break;
        }
    }
    catch (error) {
        console.error('승인된 요청 처리 오류:', error);
        throw error;
    }
}
router.get('/stats/overview', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { userType, centerId } = req.user;
        const queryCondition = {};
        if (userType === 'centerAdmin' && centerId) {
            queryCondition.centerId = centerId;
        }
        const statusStats = await Approval_1.Approval.aggregate([
            { $match: queryCondition },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const typeStats = await Approval_1.Approval.aggregate([
            { $match: queryCondition },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);
        const priorityStats = await Approval_1.Approval.aggregate([
            { $match: queryCondition },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyTrend = await Approval_1.Approval.aggregate([
            {
                $match: {
                    ...queryCondition,
                    requestDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$requestDate' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);
        res.json({
            success: true,
            data: {
                statusStats,
                typeStats,
                priorityStats,
                dailyTrend
            }
        });
    }
    catch (error) {
        console.error('승인 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '승인 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=approvals.js.map