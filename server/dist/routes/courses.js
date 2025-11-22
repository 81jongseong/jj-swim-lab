"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Course_1 = require("../models/Course");
const User_1 = require("../models/User");
const Center_1 = require("../models/Center");
const Payment_1 = require("../models/Payment");
const Booking_1 = require("../models/Booking");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const auth_2 = require("../middleware/auth");
router.get('/public/center/:centerId', async (req, res) => {
    try {
        const { centerId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(centerId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 센터 ID입니다.'
            });
        }
        const courses = await Course_1.Course.find({
            centerId,
            status: { $ne: 'inactive' }
        })
            .select('name description level duration price maxStudents classInfo currentStudents instructorName schedule status')
            .sort({ 'classInfo.startDate': 1 });
        const normalized = courses.map(course => ({
            _id: course._id,
            name: course.name,
            description: course.description,
            level: course.level,
            duration: course.duration,
            price: course.price,
            maxStudents: course.maxStudents,
            currentStudents: course.classInfo?.currentEnrollment ?? course.currentStudents ?? 0,
            instructorName: course.instructorName || undefined,
            schedule: (course.schedule || []).map((item) => ({
                day: item.day || item.dayOfWeek || '',
                startTime: item.startTime,
                endTime: item.endTime
            })),
            status: course.status
        }));
        return res.json({
            success: true,
            message: '강습 과정 조회 성공!',
            data: normalized
        });
    }
    catch (error) {
        (0, logger_1.logError)('공개 강습 과정 조회 오류', error);
        return res.status(500).json({
            success: false,
            message: '강습 정보를 조회할 수 없습니다.'
        });
    }
});
router.get('/public/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 강습 ID입니다.'
            });
        }
        const course = await Course_1.Course.findById(courseId)
            .populate('instructor', 'name email phone')
            .lean();
        if (!course || course.status === 'inactive' || course.isActive === false) {
            return res.status(404).json({
                success: false,
                message: '강습 정보를 찾을 수 없습니다.'
            });
        }
        const center = await Center_1.Center.findById(course.centerId).lean();
        const activeEnrollment = (course.enrolledStudents || []).filter((enrollment) => enrollment.status !== 'dropped').length;
        const currentEnrollment = course.classInfo?.currentEnrollment ?? activeEnrollment;
        const normalized = {
            _id: course._id,
            name: course.name,
            description: course.description,
            level: course.level,
            duration: course.duration,
            price: course.price,
            maxStudents: course.maxStudents,
            currentStudents: currentEnrollment,
            status: course.status,
            schedule: (course.schedule || []).map((item) => ({
                day: item.day || item.dayOfWeek || '',
                startTime: item.startTime,
                endTime: item.endTime
            })),
            instructor: {
                name: course.instructor?.name || course.instructorName || '',
                email: course.instructor?.email || '',
                phone: course.instructor?.phone || ''
            },
            center: center ? {
                _id: center._id,
                name: center.name,
                address: center.address,
                phone: center.phone,
                email: center.email,
                region: center.region,
                district: center.district,
                city: center.city,
                province: center.province
            } : null,
            tags: course.tags || [],
            classInfo: course.classInfo ? {
                className: course.classInfo.className,
                classType: course.classInfo.classType,
                startDate: course.classInfo.startDate,
                endDate: course.classInfo.endDate
            } : null,
            isPersonalLesson: course.isPersonalLesson,
            courseType: course.courseType
        };
        return res.json({
            success: true,
            message: '강습 과정 조회 성공!',
            data: normalized
        });
    }
    catch (error) {
        (0, logger_1.logError)('공개 강습 상세 조회 오류', error);
        return res.status(500).json({
            success: false,
            message: '강습 정보를 조회할 수 없습니다.'
        });
    }
});
router.post('/public/:courseId/apply', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const { courseId } = req.params;
        const { paymentMethod = 'card', notes = '' } = req.body || {};
        const allowedMethods = new Set(['card', 'cash', 'transfer', 'online']);
        const normalizedMethod = allowedMethods.has(paymentMethod) ? paymentMethod : 'card';
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 강습 ID입니다.'
            });
        }
        const course = await Course_1.Course.findById(courseId);
        if (!course || course.status === 'inactive' || course.isActive === false) {
            return res.status(404).json({
                success: false,
                message: '강습 정보를 찾을 수 없습니다.'
            });
        }
        const isAlreadyEnrolled = (course.enrolledStudents || []).some((enrollment) => enrollment.student && enrollment.student.toString() === req.user.userId.toString());
        if (isAlreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: '이미 해당 강습에 등록되어 있습니다.'
            });
        }
        const existingPayment = await Payment_1.Payment.findOne({
            user: req.user.userId,
            relatedCourse: course._id,
            status: { $in: ['pending', 'completed'] }
        });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: existingPayment.status === 'completed'
                    ? '이미 결제가 완료된 강습입니다.'
                    : '이미 결제가 진행 중입니다. 결제 내역을 확인해주세요.'
            });
        }
        const activeEnrollment = (course.enrolledStudents || []).filter((enrollment) => enrollment.status !== 'dropped').length;
        const currentEnrollment = course.classInfo?.currentEnrollment ?? activeEnrollment;
        if (currentEnrollment >= course.maxStudents || course.status === 'full') {
            return res.status(400).json({
                success: false,
                message: '이미 정원이 가득 찬 강습입니다.'
            });
        }
        const transactionId = `COURSE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const payment = new Payment_1.Payment({
            user: req.user.userId,
            amount: course.price,
            currency: 'KRW',
            pricingInfo: {
                userType: req.user.userType || 'student',
                pricingTier: 'standard',
                baseAmount: course.price,
                discountAmount: 0,
                discountReason: '',
                centerId: course.centerId,
                isCenterSponsored: false
            },
            paymentMethod: normalizedMethod,
            status: 'completed',
            purpose: 'course',
            relatedCourse: course._id,
            transactionId,
            notes: notes || '',
            centerId: course.centerId
        });
        await payment.save();
        try {
            const existingEnrollment = (course.enrolledStudents || []).some((e) => e?.student?.toString?.() === req.user.userId.toString());
            if (!existingEnrollment) {
                course.enrolledStudents = [
                    ...(course.enrolledStudents || []),
                    { student: req.user.userId, enrollmentDate: new Date(), status: 'active' }
                ];
                await course.save();
            }
            if (course.centerId) {
                const student = await User_1.User.findById(req.user.userId);
                if (student && !student.centerId) {
                    student.centerId = course.centerId;
                    await student.save();
                }
            }
        }
        catch (e) {
            (0, logger_1.logWarn)('결제 후 배정 처리 실패(무시)', e);
        }
        return res.status(201).json({
            success: true,
            message: '결제가 완료되었고 수강이 배정되었습니다.',
            data: {
                paymentId: payment._id,
                status: payment.status,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                transactionId: payment.transactionId,
                course: {
                    _id: course._id,
                    name: course.name,
                    price: course.price
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('공개 강습 신청 오류', error);
        return res.status(500).json({
            success: false,
            message: '수강 신청 처리 중 오류가 발생했습니다.'
        });
    }
});
router.get('/student/enrolled', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { PersonalLesson } = require('../models/PersonalLesson');
        const explicitlyEnrolledCourseIds = await Course_1.Course.find({ 'enrolledStudents.student': studentId }, { _id: 1 }).lean();
        const bookingCourseIds = await Booking_1.Booking.distinct('courseId', {
            studentId,
            status: { $in: ['confirmed', 'pending', 'completed'] }
        });
        const paymentCourseIds = await Payment_1.Payment.distinct('relatedCourse', {
            user: studentId,
            status: { $in: ['pending', 'completed'] },
            purpose: 'course'
        });
        const enrolledIdsSet = new Set([
            ...explicitlyEnrolledCourseIds.map((c) => String(c._id)),
            ...bookingCourseIds.map((id) => String(id)),
            ...paymentCourseIds.map((id) => String(id))
        ].filter(Boolean));
        if (enrolledIdsSet.size === 0) {
            return res.json({ success: true, message: '등록/예약/결제된 강습이 없습니다.', data: [] });
        }
        const enrolledIds = Array.from(enrolledIdsSet);
        const courses = await Course_1.Course.find({
            _id: { $in: enrolledIds }
        })
            .populate('instructor', 'name userId email phone')
            .populate('centerId', 'name address phone email region district city province')
            .sort({ 'classInfo.startDate': 1, createdAt: -1 })
            .lean();
        const personalLessonsRaw = await PersonalLesson.find({
            studentId: studentId,
            status: { $in: ['pending', 'approved', 'completed'] }
        })
            .populate('instructorId', 'name email phone')
            .populate('centerId', 'name address phone email region district city province')
            .sort({ date: -1, startTime: -1 });
        const personalLessonsToUpdate = [];
        for (const lesson of personalLessonsRaw) {
            if (lesson.status === 'pending' && lesson.instructorId) {
                lesson.status = 'approved';
                personalLessonsToUpdate.push(lesson);
            }
        }
        if (personalLessonsToUpdate.length > 0) {
            await Promise.all(personalLessonsToUpdate.map(lesson => lesson.save()));
            console.log(`✅ 학생 ${studentId}의 ${personalLessonsToUpdate.length}개 개인레슨 자동 승인 완료`);
        }
        const defaultRefundPolicy = {
            beforeUse: {
                enabled: true,
                timeBefore: 24,
                refundRate: 100,
                description: '이용 전 환불'
            },
            afterUse: {
                enabled: true,
                calculationMethod: 'sessions',
                sessionBased: {
                    enabled: true,
                    refundByRemainingSessions: true,
                    description: '이용한 회수를 제외한 남은 회수 비율로 환불 (소비자 보호법 준수)'
                }
            },
            processingDays: 7,
            refundMethod: '원래 결제 수단으로 환불'
        };
        const formatRefundPolicy = (policy) => {
            const effectivePolicy = policy || defaultRefundPolicy;
            if (typeof effectivePolicy === 'string')
                return effectivePolicy;
            const parts = [];
            if (effectivePolicy.beforeUse?.enabled) {
                parts.push(`이용 ${effectivePolicy.beforeUse.timeBefore || 24}시간 전까지 ${effectivePolicy.beforeUse.refundRate || 100}% 환불`);
            }
            if (effectivePolicy.afterUse?.enabled) {
                const calculationMethod = effectivePolicy.afterUse.calculationMethod || 'sessions';
                if (calculationMethod === 'sessions' && effectivePolicy.afterUse.sessionBased?.enabled) {
                    parts.push('이용 시작 후: 단체반은 경과된 수업을, 개인레슨은 예약된 시간을 이용한 것으로 간주하여 환불');
                }
                else if (calculationMethod === 'days' && effectivePolicy.afterUse.dayBased?.enabled && effectivePolicy.afterUse.dayBased.refundRates) {
                    effectivePolicy.afterUse.dayBased.refundRates.forEach((rate) => {
                        if (rate.daysTo) {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일~${rate.daysTo}일: ${rate.refundRate}% 환불`);
                        }
                        else {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일 이후: ${rate.refundRate}% 환불`);
                        }
                    });
                }
                else if (effectivePolicy.afterUse.refundRates) {
                    effectivePolicy.afterUse.refundRates.forEach((rate) => {
                        if (rate.daysTo) {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일~${rate.daysTo}일: ${rate.refundRate}% 환불`);
                        }
                        else {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일 이후: ${rate.refundRate}% 환불`);
                        }
                    });
                }
            }
            if (effectivePolicy.refundFee?.enabled && effectivePolicy.refundFee.amount > 0) {
                parts.push(`환불 수수료: ${effectivePolicy.refundFee.amount.toLocaleString()}원`);
            }
            if (effectivePolicy.processingDays) {
                parts.push(`환불 처리 기간: ${effectivePolicy.processingDays}일`);
            }
            if (effectivePolicy.refundMethod) {
                parts.push(`환불 방법: ${effectivePolicy.refundMethod}`);
            }
            if (effectivePolicy.customDescription) {
                parts.push(`※ ${effectivePolicy.customDescription}`);
            }
            return parts.length > 0 ? parts.join(', ') : '이용 24시간 전까지 100% 환불, 이용 시작 후: 단체반은 경과된 수업을, 개인레슨은 예약된 시간을 이용한 것으로 간주하여 환불';
        };
        const refundPolicyMap = new Map();
        try {
            const centerIds = [...new Set(courses.map((c) => c.centerId?.toString()).filter(Boolean))];
            if (centerIds.length > 0) {
                const centers = await Center_1.Center.find({ _id: { $in: centerIds } }).select('_id settings').lean();
                centers.forEach((center) => {
                    try {
                        const refundPolicy = center?.settings?.paymentSettings?.refundPolicy;
                        console.log(`🔍 센터 ${center._id} 환불 정책 조회:`, refundPolicy ? '설정됨' : '없음 (기본값 사용)');
                        const formattedPolicy = formatRefundPolicy(refundPolicy);
                        refundPolicyMap.set(center._id.toString(), formattedPolicy);
                        console.log(`✅ 센터 ${center._id} 환불 정책 포맷팅 결과:`, formattedPolicy);
                    }
                    catch (err) {
                        (0, logger_1.logError)('환불 정책 매핑 오류', err);
                    }
                });
            }
        }
        catch (err) {
            (0, logger_1.logError)('센터 환불 정책 조회 오류', err);
        }
        const { Approval } = require('../models/Approval');
        const refundRequests = await Approval.find({
            type: 'refund_request',
            userId: studentId,
            status: 'pending'
        }).select('courseId status').lean();
        const refundRequestMap = new Map();
        refundRequests.forEach((req) => {
            if (req.courseId) {
                refundRequestMap.set(req.courseId.toString(), req.status);
            }
        });
        const normalized = courses.map((course) => {
            const enrollment = (course.enrolledStudents || []).find((enrollmentItem) => {
                if (!enrollmentItem)
                    return false;
                if (typeof enrollmentItem.student === 'string') {
                    return enrollmentItem.student === String(studentId);
                }
                if (typeof enrollmentItem.student === 'object') {
                    return (enrollmentItem.student?._id || enrollmentItem.student)?.toString() === String(studentId);
                }
                return false;
            });
            const instructor = course.instructor || {};
            const center = course.centerId || {};
            const centerIdStr = course.centerId?.toString();
            const refundPolicy = centerIdStr
                ? (refundPolicyMap.get(centerIdStr) || formatRefundPolicy(null))
                : formatRefundPolicy(null);
            const hasRefundRequest = refundRequestMap.has(course._id.toString());
            const activeEnrollments = (course.enrolledStudents || []).filter((e) => e.status === 'active' || !e.status || e.status !== 'dropped' && e.status !== 'cancelled');
            const currentStudentsCount = activeEnrollments.length;
            return {
                _id: course._id,
                name: course.name,
                description: course.description,
                level: course.level,
                duration: course.duration,
                price: course.price,
                maxStudents: course.maxStudents,
                currentStudents: currentStudentsCount || course.classInfo?.currentEnrollment || 0,
                status: course.status,
                schedule: (course.schedule || []).map((item) => ({
                    day: item.day || item.dayOfWeek || '',
                    startTime: item.startTime,
                    endTime: item.endTime
                })),
                instructor: instructor
                    ? {
                        _id: instructor._id,
                        name: instructor.name,
                        email: instructor.email,
                        phone: instructor.phone
                    }
                    : null,
                center: center
                    ? {
                        _id: center._id,
                        name: center.name,
                        address: center.address,
                        phone: center.phone,
                        email: center.email,
                        region: center.region,
                        district: center.district,
                        city: center.city,
                        province: center.province
                    }
                    : null,
                enrollmentStatus: enrollment?.status ?? 'active',
                enrolledAt: enrollment?.enrolledAt ?? null,
                nextClassStart: (() => {
                    try {
                        const schedule = Array.isArray(course.schedule) ? course.schedule : [];
                        if (schedule.length === 0)
                            return null;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        let startDate = today;
                        if (course.classInfo?.startDate) {
                            const sd = new Date(course.classInfo.startDate);
                            if (!isNaN(sd.getTime()))
                                startDate = sd;
                        }
                        else if (course.startDate) {
                            const sd = new Date(course.startDate);
                            if (!isNaN(sd.getTime()))
                                startDate = sd;
                        }
                        let endDate = null;
                        if (course.classInfo?.endDate) {
                            const ed = new Date(course.classInfo.endDate);
                            if (!isNaN(ed.getTime()))
                                endDate = ed;
                        }
                        else if (course.endDate) {
                            const ed = new Date(course.endDate);
                            if (!isNaN(ed.getTime()))
                                endDate = ed;
                        }
                        const dayMap = {
                            'sunday': 0, '일': 0, '0': 0,
                            'monday': 1, '월': 1, '1': 1,
                            'tuesday': 2, '화': 2, '2': 2,
                            'wednesday': 3, '수': 3, '3': 3,
                            'thursday': 4, '목': 4, '4': 4,
                            'friday': 5, '금': 5, '5': 5,
                            'saturday': 6, '토': 6, '6': 6
                        };
                        for (let i = 0; i < 30; i++) {
                            const checkDate = new Date(today);
                            checkDate.setDate(today.getDate() + i);
                            const dayOfWeek = checkDate.getDay();
                            if (checkDate < startDate)
                                continue;
                            if (endDate && checkDate > endDate)
                                break;
                            const daySchedule = schedule.find((s) => {
                                if (!s)
                                    return false;
                                const sDay = String(s.day || s.dayOfWeek || '').toLowerCase();
                                const sDayNumber = dayMap[sDay];
                                return sDayNumber !== undefined && sDayNumber === dayOfWeek;
                            });
                            if (daySchedule && daySchedule.startTime) {
                                try {
                                    const classDateTime = new Date(checkDate);
                                    const timeParts = String(daySchedule.startTime).split(':');
                                    if (timeParts.length >= 2) {
                                        const hours = parseInt(timeParts[0], 10);
                                        const minutes = parseInt(timeParts[1], 10);
                                        if (!isNaN(hours) && !isNaN(minutes)) {
                                            classDateTime.setHours(hours, minutes, 0, 0);
                                            const now = new Date();
                                            if (classDateTime >= now) {
                                                return classDateTime.toISOString();
                                            }
                                        }
                                    }
                                }
                                catch (timeError) {
                                    (0, logger_1.logError)('시간 파싱 오류', timeError);
                                    continue;
                                }
                            }
                        }
                        return null;
                    }
                    catch (err) {
                        (0, logger_1.logError)('다음 수업 날짜 계산 오류', err);
                        return null;
                    }
                })(),
                nextClassEnd: course.classInfo?.endDate ?? null,
                startDate: course.classInfo?.startDate || course.startDate || null,
                classInfo: course.classInfo || null,
                refundPolicy: refundPolicy || formatRefundPolicy(null),
                hasRefundRequest: hasRefundRequest
            };
        });
        const personalLessonsNormalized = personalLessonsRaw.map((pl) => {
            const plObj = pl.toObject ? pl.toObject() : pl;
            const instructor = plObj.instructorId || {};
            const center = plObj.centerId || {};
            const centerIdStr = plObj.centerId?.toString();
            const refundPolicy = centerIdStr
                ? (refundPolicyMap.get(centerIdStr) || formatRefundPolicy(null))
                : formatRefundPolicy(null);
            const hasRefundRequest = false;
            const enrollmentStatus = plObj.instructorId ? 'active' : 'pending';
            const lessonDate = new Date(plObj.date);
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            const dayName = dayNames[lessonDate.getDay()];
            return {
                _id: plObj._id?.toString(),
                name: '개인 레슨',
                description: plObj.goals || '',
                level: plObj.skillLevel || 'beginner',
                duration: plObj.duration || 60,
                price: plObj.price || 0,
                maxStudents: 1,
                currentStudents: 1,
                status: plObj.status === 'completed' ? 'inactive' : 'active',
                schedule: [{
                        day: dayName,
                        startTime: plObj.startTime || plObj.time || '09:00',
                        endTime: plObj.endTime || ''
                    }],
                instructor: instructor && instructor._id
                    ? {
                        _id: instructor._id,
                        name: instructor.name || '강사 미배정',
                        email: instructor.email || '',
                        phone: instructor.phone || ''
                    }
                    : null,
                center: center && center._id
                    ? {
                        _id: center._id,
                        name: center.name || '',
                        address: center.address || '',
                        phone: center.phone || '',
                        email: center.email || '',
                        region: center.region || '',
                        district: center.district || '',
                        city: center.city || '',
                        province: center.province || ''
                    }
                    : null,
                enrollmentStatus: enrollmentStatus,
                enrolledAt: plObj.createdAt || null,
                nextClassStart: plObj.date ? new Date(plObj.date).toISOString() : null,
                nextClassEnd: plObj.endTime ? `${new Date(plObj.date).toISOString().split('T')[0]}T${plObj.endTime}:00` : null,
                startDate: plObj.date ? new Date(plObj.date).toISOString().split('T')[0] : null,
                classInfo: null,
                refundPolicy: refundPolicy || formatRefundPolicy(null),
                hasRefundRequest: hasRefundRequest
            };
        });
        const allCourses = [...normalized, ...personalLessonsNormalized];
        return res.json({
            success: true,
            message: '내 강습 목록을 불러왔습니다.',
            data: allCourses
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 강습 목록 조회 오류', error);
        return res.status(500).json({
            success: false,
            message: '내 강습 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
});
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { level, instructor, isActive, centerId: centerIdQuery } = req.query;
        const filter = {};
        if (level)
            filter.level = level;
        if (instructor)
            filter.instructor = instructor;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const user = req.user;
        const resolvedCenterId = centerIdQuery || user?.centerId || user?.centerAdminInfo?.managedCenters?.[0];
        if (resolvedCenterId)
            filter.centerId = resolvedCenterId;
        const courses = await Course_1.Course.find(filter)
            .populate('instructor', 'name userId')
            .populate('enrolledStudents.student', 'name userId')
            .sort({ createdAt: -1 });
        console.log('📚 강습 과정 조회 응답:', {
            totalCourses: courses.length,
            coursesWithLaneInfo: courses.filter(c => c.poolType || c.lanes || c.laneInfo).length,
            sampleCourse: courses[0] ? {
                name: courses[0].name,
                poolType: courses[0].poolType,
                lanes: courses[0].lanes,
                laneInfo: courses[0].laneInfo
            } : null
        });
        return res.json({ success: true, message: '강습 과정 조회 성공!', data: courses });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 조회 오류', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id)
            .populate('instructor', 'name userId experience certifications specialties')
            .populate('enrolledStudents.student', 'name userId email phone');
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        return res.json({ course });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 조회 오류', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/', auth_2.auth, role_1.requireInstructorOrAdmin, async (req, res) => {
    try {
        console.log('📥 강습 과정 생성 요청:', {
            body: req.body,
            userId: req.user?.userId,
            userType: req.user?.userType
        });
        const { name, description, level, duration, price, maxStudents, schedule, instructorId, instructorName, tags, poolType, lanes, laneInfo, courseType, isPersonalLesson, personalLessonSettings, startDate, endDate } = req.body;
        if (!name || !level || !duration || price === undefined || !maxStudents) {
            (0, logger_1.logError)('필수 필드 누락', { name, level, duration, price, maxStudents });
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const user = await User_1.User.findById(req.user.userId);
        if (!user) {
            (0, logger_1.logError)('사용자를 찾을 수 없음', { userId: req.user.userId });
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        console.log('👤 사용자 정보:', {
            userType: user.userType,
            managedCenters: user.centerAdminInfo?.managedCenters,
            assignedCenters: user.instructorInfo?.assignedCenters
        });
        let centerId = req.body.centerId;
        if (!centerId) {
            if (['centerAdmin', 'center-admin'].includes(user.userType) && user.centerAdminInfo?.managedCenters && user.centerAdminInfo.managedCenters.length > 0) {
                centerId = user.centerAdminInfo.managedCenters[0];
            }
            else if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters && user.instructorInfo.assignedCenters.length > 0) {
                centerId = user.instructorInfo.assignedCenters[0];
            }
            else if (['centerAdmin', 'center-admin'].includes(user.userType) && user.centerId) {
                centerId = user.centerId;
            }
        }
        console.log('🏢 centerId:', centerId, 'userType:', user.userType, 'hasCenterId:', !!user.centerId, 'hasManagedCenters:', !!user.centerAdminInfo?.managedCenters);
        if (!centerId) {
            (0, logger_1.logError)('centerId를 찾을 수 없음', {
                userType: user.userType,
                centerId: user.centerId,
                managedCenters: user.centerAdminInfo?.managedCenters,
                assignedCenters: user.instructorInfo?.assignedCenters
            });
            return res.status(400).json({ error: '센터 ID가 필요합니다. 센터 관리자는 관리하는 센터가 있어야 합니다.' });
        }
        function timeToMinutes(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + (minutes || 0);
        }
        if (isPersonalLesson && schedule && schedule.length > 0) {
            const center = await Center_1.Center.findById(centerId);
            if (!center) {
                return res.status(404).json({ error: '센터 정보를 찾을 수 없습니다.' });
            }
            const personalLessonSettings = center.availabilitySettings?.personalLesson;
            if (!personalLessonSettings?.enabled) {
                return res.status(400).json({ error: '개인레슨 운영이 비활성화되어 있습니다. 센터 관리자에게 문의하세요.' });
            }
            const dayTimeSlots = personalLessonSettings.dayTimeSlots || [];
            if (dayTimeSlots.length === 0) {
                return res.status(400).json({ error: '개인레슨 운영시간이 설정되지 않았습니다. 센터 정보 관리 페이지에서 먼저 운영시간을 설정하세요.' });
            }
            const dayMap = {
                'monday': 'monday',
                'tuesday': 'tuesday',
                'wednesday': 'wednesday',
                'thursday': 'thursday',
                'friday': 'friday',
                'saturday': 'saturday',
                'sunday': 'sunday',
                '월': 'monday',
                '화': 'tuesday',
                '수': 'wednesday',
                '목': 'thursday',
                '금': 'friday',
                '토': 'saturday',
                '일': 'sunday'
            };
            const invalidDays = [];
            for (const scheduleItem of schedule) {
                const startTime = scheduleItem.startTime || '';
                const endTime = scheduleItem.endTime || startTime;
                const dayOfWeekStr = scheduleItem.day || scheduleItem.dayOfWeek || '';
                const days = dayOfWeekStr.split(',').map(d => d.trim()).filter(d => d);
                console.log('🔍 POST 검증할 스케줄:', {
                    dayOfWeekStr,
                    days,
                    startTime,
                    endTime
                });
                for (const day of days) {
                    const dayLower = day.toLowerCase();
                    const englishDay = dayMap[dayLower] || dayLower;
                    const daySlot = dayTimeSlots.find((ds) => ds.day === englishDay);
                    if (!daySlot || !daySlot.timeSlots || daySlot.timeSlots.length === 0) {
                        const koreanDaysMap = {
                            'monday': '월요일',
                            'tuesday': '화요일',
                            'wednesday': '수요일',
                            'thursday': '목요일',
                            'friday': '금요일',
                            'saturday': '토요일',
                            'sunday': '일요일',
                            '월': '월요일',
                            '화': '화요일',
                            '수': '수요일',
                            '목': '목요일',
                            '금': '금요일',
                            '토': '토요일',
                            '일': '일요일'
                        };
                        const koreanDay = koreanDaysMap[dayLower] || `${day}요일`;
                        invalidDays.push(koreanDay);
                        continue;
                    }
                    const scheduleStartMinutes = timeToMinutes(startTime);
                    const scheduleEndMinutes = timeToMinutes(endTime);
                    let isWithinOperatingHours = false;
                    for (const timeSlot of daySlot.timeSlots) {
                        const slotStartMinutes = timeToMinutes(timeSlot.startTime);
                        const slotEndMinutes = timeToMinutes(timeSlot.endTime);
                        if (scheduleStartMinutes >= slotStartMinutes && scheduleEndMinutes <= slotEndMinutes) {
                            isWithinOperatingHours = true;
                            break;
                        }
                    }
                    if (!isWithinOperatingHours) {
                        const availableTimes = daySlot.timeSlots.map((ts) => `${ts.startTime}~${ts.endTime}`).join(', ');
                        return res.status(400).json({
                            error: `${day}요일 ${startTime}는 개인레슨 운영시간이 아닙니다. 운영시간: ${availableTimes}`
                        });
                    }
                }
            }
            if (invalidDays.length > 0) {
                const invalidDaysStr = invalidDays.length === 1
                    ? invalidDays[0]
                    : invalidDays.slice(0, -1).join(', ') + ', ' + invalidDays[invalidDays.length - 1];
                return res.status(400).json({
                    error: `${invalidDaysStr}은 개인레슨 운영시간이 설정되지 않았습니다. 센터 운영시간 설정을 확인하세요.`
                });
            }
        }
        const classInfo = req.body.classInfo || {
            className: name,
            classType: 'regular',
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            maxCapacity: maxStudents,
            currentEnrollment: 0
        };
        let finalInstructorName = instructorName;
        if (!finalInstructorName && instructorId) {
            try {
                const instructor = await User_1.User.findById(instructorId).select('name');
                finalInstructorName = instructor?.name || '';
            }
            catch (error) {
                (0, logger_1.logError)('강사 이름 조회 실패', error);
            }
        }
        let finalPersonalLessonSettings = personalLessonSettings;
        if (isPersonalLesson && !personalLessonSettings) {
            finalPersonalLessonSettings = { timeSlots: [], lessonTypes: [], frequencyOptions: [] };
        }
        const courseData = {
            name,
            description,
            level,
            duration,
            price,
            maxStudents,
            centerId,
            classInfo,
            instructor: instructorId || req.user.userId,
            instructorId: instructorId || req.user.userId,
            instructorName: finalInstructorName,
            schedule: schedule || [],
            tags: tags || [],
            poolType: poolType || 'mainPool',
            lanes: lanes || [],
            laneInfo: laneInfo || {},
            courseType: courseType || 'group',
            isPersonalLesson: isPersonalLesson === true || name?.includes('개인 레슨') || name?.includes('개인레슨'),
            personalLessonSettings: finalPersonalLessonSettings,
            startDate: startDate || new Date(),
            endDate: endDate || new Date(new Date().setMonth(new Date().getMonth() + 1))
        };
        console.log('🎯 isPersonalLesson 판단:', {
            isPersonalLesson,
            name,
            finalValue: courseData.isPersonalLesson
        });
        if (schedule && schedule.length > 0) {
            const dayNameMap = {
                '월': 'monday', '화': 'tuesday', '수': 'wednesday', '목': 'thursday',
                '금': 'friday', '토': 'saturday', '일': 'sunday',
                '월요일': 'monday', '화요일': 'tuesday', '수요일': 'wednesday', '목요일': 'thursday',
                '금요일': 'friday', '토요일': 'saturday', '일요일': 'sunday',
                'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday', 'thursday': 'thursday',
                'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday'
            };
            courseData.schedule = schedule
                .map((sched) => {
                const day = sched.day || sched.dayOfWeek || '';
                const dayArray = day.split(',').map((d) => d.trim()).filter((d) => d);
                const englishDay = dayArray.map((d) => dayNameMap[d.toLowerCase()] || d).join(',');
                const scheduleItem = {
                    ...sched,
                    day: englishDay,
                    lanes: sched.lanes && sched.lanes.assignedLanes ? sched.lanes : {
                        assignedLanes: sched.lanes?.assignedLanes || lanes || [],
                        originalAssignedLanes: sched.lanes?.originalAssignedLanes || lanes || [],
                        isAdjusted: sched.lanes?.isAdjusted || false
                    }
                };
                console.log(`📅 스케줄 변환: ${day} → ${englishDay}`);
                return scheduleItem;
            })
                .filter((sched) => {
                const hasValidDay = sched.day && sched.day.trim() !== '';
                if (!hasValidDay) {
                    console.log(`⚠️ 유효하지 않은 스케줄 제외: day=${sched.day}, startTime=${sched.startTime}`);
                }
                return hasValidDay;
            });
            console.log(`📊 최종 schedule 항목 수: ${courseData.schedule.length}`);
        }
        console.log('📚 강습 과정 생성 데이터:', courseData);
        console.log('💾 저장할 데이터:', courseData);
        console.log('🏷️ 태그:', tags);
        const course = new Course_1.Course(courseData);
        await course.save();
        console.log('✅ 저장 성공:', course._id);
        const populatedCourse = await Course_1.Course.findById(course._id)
            .populate('instructor', 'name userId');
        console.log('📋 생성된 강습 과정 정보:', {
            id: populatedCourse?._id,
            name: populatedCourse?.name,
            instructor: populatedCourse?.instructor,
            instructorId: populatedCourse?.instructorId,
            instructorName: populatedCourse?.instructorName
        });
        return res.status(201).json({
            success: true,
            message: '강습 과정이 생성되었습니다.',
            data: populatedCourse
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 생성 오류', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
router.put('/:id', auth_2.auth, role_1.requireInstructorOrAdmin, async (req, res) => {
    try {
        console.log('📝 강습 과정 수정 요청 시작');
        console.log('📋 courseId:', req.params.id);
        console.log('🏊 body.lanes:', req.body.lanes);
        console.log('🏊 body.poolType:', req.body.poolType);
        console.log('🏊 body.laneInfo:', req.body.laneInfo);
        console.log('🏊 body.personalLessonSettings:', req.body.personalLessonSettings);
        console.log('📦 전체 body:', req.body);
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        console.log('🔍 기존 코스 정보:', {
            isPersonalLesson: course.isPersonalLesson,
            name: course.name,
            schedule: course.schedule
        });
        const user = await User_1.User.findById(req.user.userId);
        const isSuperAdmin = user?.userType === 'superAdmin';
        const isCenterAdmin = user?.userType === 'centerAdmin' || user?.userType === 'center-admin';
        const isOwnCourse = course.instructor ? course.instructor.toString() === String(req.user.userId) : false;
        console.log('🔐 권한 확인:', {
            userType: user?.userType,
            isSuperAdmin,
            isCenterAdmin,
            isOwnCourse,
            courseInstructor: course.instructor ? course.instructor.toString() : 'undefined',
            currentUser: req.user.userId
        });
        if (!isSuperAdmin && !isCenterAdmin && !isOwnCourse) {
            (0, logger_1.logError)('권한 없음', { userType: user?.userType, userId: req.user.userId });
            return res.status(403).json({ error: '수정 권한이 없습니다.' });
        }
        console.log('✅ 권한 확인 통과');
        const { name, description, level, duration, price, maxStudents, instructorId } = req.body;
        void instructorId;
        if (name && typeof name !== 'string') {
            return res.status(400).json({ error: '강습 과정명은 문자열이어야 합니다.' });
        }
        if (description && typeof description !== 'string') {
            return res.status(400).json({ error: '강습 과정 설명은 문자열이어야 합니다.' });
        }
        if (level && typeof level !== 'string') {
            return res.status(400).json({ error: '레벨은 문자열이어야 합니다.' });
        }
        if (duration && (typeof duration !== 'number' || duration <= 0)) {
            return res.status(400).json({ error: '강습 시간은 양수여야 합니다.' });
        }
        if (price && (typeof price !== 'number' || price < 0)) {
            return res.status(400).json({ error: '가격은 0 이상이어야 합니다.' });
        }
        if (maxStudents && (typeof maxStudents !== 'number' || maxStudents <= 0)) {
            return res.status(400).json({ error: '최대 수강생 수는 양수여야 합니다.' });
        }
        const updateData = { ...req.body };
        if (updateData.instructorId) {
            updateData.instructor = updateData.instructorId;
            let instructorName = updateData.instructorName;
            if (!instructorName) {
                try {
                    const instructor = await User_1.User.findById(updateData.instructorId).select('name');
                    instructorName = instructor?.name || '';
                    updateData.instructorName = instructorName;
                }
                catch (error) {
                    (0, logger_1.logError)('강사 이름 조회 실패', error);
                }
            }
            console.log('👨‍🏫 강사 정보 업데이트:', {
                원본: req.body.instructorId,
                instructorId: updateData.instructorId,
                instructor: updateData.instructor,
                instructorName: updateData.instructorName
            });
        }
        if (!updateData.tags) {
            updateData.tags = [];
        }
        console.log('🏷️ 태그 처리:', updateData.tags);
        if (!updateData.lanes) {
            updateData.lanes = [];
        }
        console.log('🏊 레인 처리:', updateData.lanes);
        if (!updateData.laneInfo) {
            updateData.laneInfo = {
                assignedLanes: [],
                maxLanes: 0,
                minLanes: 0
            };
        }
        console.log('🏊 레인 정보 처리:', updateData.laneInfo);
        const isPersonalLessonFromUpdateData = updateData.isPersonalLesson === true;
        const hasPersonalLessonSettings = !!updateData.personalLessonSettings;
        const isPersonalLessonFromCourse = course.isPersonalLesson === true;
        const isPersonalLessonByName = course.name && (course.name.includes('개인 레슨') || course.name.includes('개인레슨'));
        if (isPersonalLessonFromUpdateData || hasPersonalLessonSettings || isPersonalLessonFromCourse || isPersonalLessonByName) {
            updateData.isPersonalLesson = true;
            console.log('⏰ 개인레슨 설정 업데이트:', {
                fromUpdateData: isPersonalLessonFromUpdateData,
                fromSettings: hasPersonalLessonSettings,
                fromCourse: isPersonalLessonFromCourse,
                fromName: isPersonalLessonByName,
                isPersonalLesson: updateData.isPersonalLesson,
                schedule: JSON.stringify(updateData.schedule)
            });
        }
        console.log('🔍 검증 체크:', {
            isPersonalLesson: updateData.isPersonalLesson,
            hasSchedule: !!updateData.schedule,
            scheduleLength: updateData.schedule?.length
        });
        if (updateData.isPersonalLesson && updateData.schedule && updateData.schedule.length > 0) {
            console.log('🔍 개인레슨 운영시간 검증 시작');
            const center = await Center_1.Center.findById(course.centerId);
            if (!center) {
                return res.status(404).json({ error: '센터 정보를 찾을 수 없습니다.' });
            }
            const personalLessonSettings = center.availabilitySettings?.personalLesson;
            if (!personalLessonSettings?.enabled) {
                return res.status(400).json({ error: '개인레슨 운영이 비활성화되어 있습니다. 센터 관리자에게 문의하세요.' });
            }
            const dayTimeSlots = personalLessonSettings.dayTimeSlots || [];
            if (dayTimeSlots.length === 0) {
                return res.status(400).json({ error: '개인레슨 운영시간이 설정되지 않았습니다. 센터 정보 관리 페이지에서 먼저 운영시간을 설정하세요.' });
            }
            const dayMap = {
                'monday': 'monday',
                'tuesday': 'tuesday',
                'wednesday': 'wednesday',
                'thursday': 'thursday',
                'friday': 'friday',
                'saturday': 'saturday',
                'sunday': 'sunday',
                '월': 'monday',
                '화': 'tuesday',
                '수': 'wednesday',
                '목': 'thursday',
                '금': 'friday',
                '토': 'saturday',
                '일': 'sunday'
            };
            function timeToMinutes(timeStr) {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + (minutes || 0);
            }
            const invalidDays = [];
            for (const scheduleItem of updateData.schedule) {
                const startTime = scheduleItem.startTime || '';
                const endTime = scheduleItem.endTime || startTime;
                const dayOfWeekStr = scheduleItem.day || scheduleItem.dayOfWeek || '';
                const days = dayOfWeekStr.split(',').map(d => d.trim()).filter(d => d);
                console.log('🔍 검증할 스케줄:', {
                    dayOfWeekStr,
                    days,
                    startTime,
                    endTime
                });
                for (const day of days) {
                    const dayLower = day.toLowerCase();
                    const englishDay = dayMap[dayLower] || dayLower;
                    const daySlot = dayTimeSlots.find((ds) => ds.day === englishDay);
                    if (!daySlot || !daySlot.timeSlots || daySlot.timeSlots.length === 0) {
                        const koreanDaysMap = {
                            'monday': '월요일',
                            'tuesday': '화요일',
                            'wednesday': '수요일',
                            'thursday': '목요일',
                            'friday': '금요일',
                            'saturday': '토요일',
                            'sunday': '일요일',
                            '월': '월요일',
                            '화': '화요일',
                            '수': '수요일',
                            '목': '목요일',
                            '금': '금요일',
                            '토': '토요일',
                            '일': '일요일'
                        };
                        const koreanDay = koreanDaysMap[dayLower] || `${day}요일`;
                        invalidDays.push(koreanDay);
                        continue;
                    }
                    const scheduleStartMinutes = timeToMinutes(startTime);
                    const scheduleEndMinutes = timeToMinutes(endTime);
                    let isWithinOperatingHours = false;
                    for (const timeSlot of daySlot.timeSlots) {
                        const slotStartMinutes = timeToMinutes(timeSlot.startTime);
                        const slotEndMinutes = timeToMinutes(timeSlot.endTime);
                        if (scheduleStartMinutes >= slotStartMinutes && scheduleEndMinutes <= slotEndMinutes) {
                            isWithinOperatingHours = true;
                            break;
                        }
                    }
                    if (!isWithinOperatingHours) {
                        const availableTimes = daySlot.timeSlots.map((ts) => `${ts.startTime}~${ts.endTime}`).join(', ');
                        return res.status(400).json({
                            error: `${day}요일 ${startTime}는 개인레슨 운영시간이 아닙니다. 운영시간: ${availableTimes}`
                        });
                    }
                }
            }
            if (invalidDays.length > 0) {
                const invalidDaysStr = invalidDays.length === 1
                    ? invalidDays[0]
                    : invalidDays.slice(0, -1).join(', ') + ', ' + invalidDays[invalidDays.length - 1];
                return res.status(400).json({
                    error: `${invalidDaysStr}은 개인레슨 운영시간이 설정되지 않았습니다. 센터 운영시간 설정을 확인하세요.`
                });
            }
        }
        if (updateData.schedule && updateData.schedule.length > 0) {
            updateData.schedule = updateData.schedule.map((sched) => {
                if (sched.lanes && sched.lanes.assignedLanes) {
                    return sched;
                }
                return {
                    ...sched,
                    lanes: {
                        assignedLanes: sched.lanes?.assignedLanes || updateData.lanes || [],
                        originalAssignedLanes: sched.lanes?.originalAssignedLanes || updateData.lanes || [],
                        isAdjusted: sched.lanes?.isAdjusted || false
                    }
                };
            });
        }
        console.log('💾 업데이트할 updateData:');
        console.log('  - lanes:', updateData.lanes);
        console.log('  - poolType:', updateData.poolType);
        console.log('  - laneInfo:', updateData.laneInfo);
        console.log('  - schedule:', JSON.stringify(updateData.schedule, null, 2));
        console.log('💾 전체 updateData:', updateData);
        const updatedCourse = await Course_1.Course.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('instructor', 'name userId');
        console.log('✅ DB 업데이트 완료');
        console.log('🏊 업데이트된 lanes:', updatedCourse?.lanes);
        console.log('🏊 업데이트된 poolType:', updatedCourse?.poolType);
        console.log('🏊 업데이트된 laneInfo:', updatedCourse?.laneInfo);
        console.log('🔍 업데이트 후 강습 과정:', {
            _id: updatedCourse?._id,
            name: updatedCourse?.name,
            instructor: updatedCourse?.instructor,
            instructorId: updatedCourse?.instructorId,
            instructorName: updatedCourse?.instructorName
        });
        console.log('✅ 강습 과정 수정 완료:', {
            courseId: updatedCourse?._id,
            courseName: updatedCourse?.name,
            instructor: updatedCourse?.instructor,
            instructorId: updatedCourse?.instructorId,
            instructorName: updatedCourse?.instructorName,
            tags: updatedCourse?.tags,
            poolType: updatedCourse?.poolType,
            lanes: updatedCourse?.lanes,
            laneInfo: updatedCourse?.laneInfo
        });
        return res.json({
            success: true,
            message: '강습 과정이 수정되었습니다.',
            data: updatedCourse
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 수정 오류', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
router.delete('/:id', auth_2.auth, role_1.requireInstructorOrAdmin, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const user = await User_1.User.findById(req.user.userId);
        const isSuperAdmin = user?.userType === 'superAdmin';
        const isCenterAdmin = ['centerAdmin', 'center-admin'].includes(user?.userType || '');
        const isOwnCourse = course.instructor.toString() === String(req.user.userId);
        console.log('🔐 삭제 권한 확인:', {
            userType: user?.userType,
            isSuperAdmin,
            isCenterAdmin,
            isOwnCourse
        });
        if (!isSuperAdmin && !isCenterAdmin && !isOwnCourse) {
            (0, logger_1.logError)('삭제 권한 없음', { userType: user?.userType, userId: req.user.userId });
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        console.log('🔍 삭제할 코스 정보:', {
            name: course.name,
            isPersonalLesson: course.isPersonalLesson,
            schedule: course.schedule
        });
        const isPersonalLesson = course.isPersonalLesson === true ||
            (course.name && (course.name.includes('개인 레슨') || course.name.includes('개인레슨')));
        console.log('🎯 개인레슨 판단:', {
            isPersonalLessonFlag: course.isPersonalLesson,
            courseName: course.name,
            finalIsPersonalLesson: isPersonalLesson
        });
        if (isPersonalLesson) {
            console.log('🔄 개인레슨 삭제 - 레인 복원 시작...');
            console.log('📅 개인레슨 스케줄:', course.schedule);
            for (const scheduleItem of course.schedule) {
                const dayName = scheduleItem.day;
                const time = scheduleItem.startTime;
                console.log(`🔍 복원 대상 요일/시간: ${dayName} ${time}`);
                const actualDayName = Array.isArray(dayName)
                    ? dayName[0]
                    : dayName.split(',')[0].trim();
                console.log(`🔍 실제 날짜: ${actualDayName}`);
                const otherCourses = await Course_1.Course.find({
                    _id: { $ne: course._id },
                    centerId: course.centerId,
                    isActive: true,
                    $or: [
                        { 'schedule.day': actualDayName },
                        { 'schedule.day': { $regex: actualDayName, $options: 'i' } }
                    ],
                    'schedule.startTime': time
                });
                console.log(`🔍 발견된 다른 강습과정 수: ${otherCourses.length}`);
                for (const otherCourse of otherCourses) {
                    console.log(`🔍 처리 중인 강습과정: ${otherCourse.name}`);
                    const otherScheduleItem = otherCourse.schedule.find((s) => {
                        const sDay = s.day || '';
                        const sDays = Array.isArray(sDay)
                            ? sDay
                            : sDay.split(',').map((d) => d.trim());
                        return sDays.includes(actualDayName) && s.startTime === time;
                    });
                    if (otherScheduleItem) {
                        console.log(`📊 스케줄 항목 발견:`, {
                            day: otherScheduleItem.day,
                            time: otherScheduleItem.startTime,
                            lanes: otherScheduleItem.lanes
                        });
                        if (otherScheduleItem.lanes?.originalAssignedLanes && otherScheduleItem.lanes.originalAssignedLanes.length > 0) {
                            const originalLanes = otherScheduleItem.lanes.originalAssignedLanes;
                            const currentLanes = otherScheduleItem.lanes.assignedLanes;
                            console.log(`🔧 ${otherCourse.name} ${actualDayName} ${time} 레인 복원:`, {
                                current: currentLanes,
                                original: originalLanes
                            });
                            const updatedSchedule = otherCourse.schedule.map((s) => {
                                const sDay = s.day || '';
                                const sDays = Array.isArray(sDay)
                                    ? sDay
                                    : sDay.split(',').map((d) => d.trim());
                                const isMatchingDay = sDays.includes(actualDayName);
                                if (isMatchingDay && s.startTime === time) {
                                    return {
                                        ...s,
                                        lanes: {
                                            assignedLanes: originalLanes,
                                            originalAssignedLanes: originalLanes,
                                            isAdjusted: false
                                        }
                                    };
                                }
                                return s;
                            });
                            await Course_1.Course.findByIdAndUpdate(otherCourse._id, {
                                schedule: updatedSchedule
                            });
                            console.log(`✅ ${otherCourse.name} 레인 복원 완료: [${currentLanes.join(',')}] → [${originalLanes.join(',')}]`);
                        }
                        else {
                            console.log(`⚠️  ${otherCourse.name} ${actualDayName} ${time} 복원할 원본 레인이 없음`);
                        }
                    }
                    else {
                        console.log(`⚠️  ${otherCourse.name} ${actualDayName} ${time} 스케줄 항목을 찾을 수 없음`);
                    }
                }
            }
        }
        await Course_1.Course.findByIdAndDelete(req.params.id);
        console.log('✅ 강습 과정 삭제 완료:', req.params.id);
        return res.json({ success: true, message: '강습 과정이 삭제되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 삭제 오류', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:id/enroll', auth_2.auth, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        if (!course.isActive) {
            return res.status(400).json({ error: '비활성화된 강습 과정입니다.' });
        }
        const alreadyEnrolled = course.enrolledStudents.some(enrollment => enrollment.student && enrollment.student.toString() === String(req.user._id));
        if (alreadyEnrolled) {
            return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
        }
        let activeStudents = 0;
        for (const enrollment of course.enrolledStudents) {
            if (enrollment.status === 'active') {
                activeStudents++;
            }
        }
        if (activeStudents >= course.maxStudents) {
            return res.status(400).json({ error: '강습 과정이 가득 찼습니다.' });
        }
        course.enrolledStudents.push({
            student: req.user._id,
            status: 'active',
            enrolledAt: new Date()
        });
        await course.save();
        return res.json({ message: '강습 과정에 등록되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 등록 오류', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:id/cancel', auth_2.auth, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const enrollmentIndex = course.enrolledStudents.findIndex(enrollment => enrollment.student && enrollment.student.toString() === req.user.userId);
        if (enrollmentIndex === -1) {
            return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
        }
        course.enrolledStudents[enrollmentIndex].status = 'dropped';
        await course.save();
        return res.json({ message: '강습 과정이 취소되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 취소 오류', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:courseId/enroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course || !course.isActive) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let existingEnrollment = null;
        for (const enrollment of course.enrolledStudents) {
            if (enrollment.student && enrollment.student.toString() === studentId.toString()) {
                existingEnrollment = enrollment;
                break;
            }
        }
        if (existingEnrollment) {
            return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
        }
        if (course.enrolledStudents.length >= course.maxStudents) {
            return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
        }
        course.enrolledStudents.push({
            student: studentId,
            enrolledAt: new Date(),
            status: 'active'
        });
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $push: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에 성공적으로 등록되었습니다.',
            data: course
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 등록 오류', error);
        res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
    }
});
router.post('/:courseId/unenroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const enrollmentIndex = course.enrolledStudents.findIndex(enrollment => enrollment.student && enrollment.student.toString() === studentId.toString());
        if (enrollmentIndex === -1) {
            return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
        }
        course.enrolledStudents.splice(enrollmentIndex, 1);
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $pull: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에서 성공적으로 해제되었습니다.',
            data: course
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 해제 오류', error);
        res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
    }
});
router.put('/:courseId/progress/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const { progress, completedSteps, notes } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
        }
        if (!enrollment.progress) {
            enrollment.progress = {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
        }
        enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
        enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
        enrollment.progress.lastUpdated = new Date();
        enrollment.progress.notes = notes || enrollment.progress.notes || '';
        await course.save();
        res.json({
            success: true,
            message: '진도율이 성공적으로 업데이트되었습니다.',
            data: enrollment.progress
        });
    }
    catch (error) {
        (0, logger_1.logError)('진도율 업데이트 오류', error);
        res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
    }
});
router.get('/:courseId/student/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const course = await Course_1.Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('enrolledStudents.student', 'name email studentInfo');
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let studentEnrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student._id.toString() === studentId) {
                studentEnrollment = e;
                break;
            }
        }
        if (!studentEnrollment || !studentEnrollment.student) {
            return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
        }
        res.json({
            success: true,
            message: '학생 정보 조회 성공',
            data: {
                course: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    instructor: course.instructor
                },
                student: studentEnrollment.student,
                enrollment: {
                    enrolledAt: studentEnrollment.enrolledAt,
                    status: studentEnrollment.status,
                    progress: studentEnrollment.progress || {}
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 정보 조회 오류', error);
        res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/students', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const courses = await Course_1.Course.find({
            instructor: instructorId,
            isActive: true
        }).populate('enrolledStudents.student', 'name email studentInfo');
        const studentMap = new Map();
        courses.forEach(course => {
            course.enrolledStudents.forEach(enrollment => {
                if (enrollment.student && enrollment.status === 'active') {
                    const student = enrollment.student;
                    const studentId = student._id.toString();
                    if (!studentMap.has(studentId)) {
                        studentMap.set(studentId, {
                            _id: student._id,
                            name: student.name,
                            email: student.email,
                            swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
                            courses: [],
                            totalProgress: 0,
                            averageProgress: 0
                        });
                    }
                    const studentInfo = studentMap.get(studentId);
                    const progress = enrollment.progress?.percentage || 0;
                    studentInfo.courses.push({
                        courseId: course._id,
                        courseName: course.name,
                        level: course.level,
                        enrolledAt: enrollment.enrolledAt,
                        progress: progress,
                        status: enrollment.status
                    });
                    studentInfo.totalProgress += progress;
                }
            });
        });
        const students = Array.from(studentMap.values()).map(student => ({
            ...student,
            averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
        }));
        students.sort((a, b) => b.averageProgress - a.averageProgress);
        res.json({
            success: true,
            message: '강사별 담당 학생 목록 조회 성공',
            data: {
                instructorId,
                totalStudents: students.length,
                students
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 학생 목록 조회 오류', error);
        res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/stats', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const stats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $group: {
                    _id: null,
                    totalCourses: { $sum: 1 },
                    totalStudents: { $sum: { $size: '$enrolledStudents' } },
                    activeStudents: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$enrolledStudents',
                                    cond: { $eq: ['$$this.status', 'active'] }
                                }
                            }
                        }
                    },
                    averageProgress: {
                        $avg: {
                            $avg: '$enrolledStudents.progress.percentage'
                        }
                    }
                }
            }
        ]);
        const courseStats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $project: {
                    name: 1,
                    level: 1,
                    enrolledCount: { $size: '$enrolledStudents' },
                    averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
                    completionRate: {
                        $divide: [
                            { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
                            { $size: '$enrolledStudents' }
                        ]
                    }
                }
            }
        ]);
        res.json({
            success: true,
            message: '강사별 통계 조회 성공',
            data: {
                instructorId,
                overview: stats[0] || {
                    totalCourses: 0,
                    totalStudents: 0,
                    activeStudents: 0,
                    averageProgress: 0
                },
                courseStats
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 통계 조회 오류', error);
        res.status(500).json({ error: '통계 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/classes', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const classes = await Course_1.Course.find({
            instructor: instructorId
        })
            .populate('instructor', 'name userId')
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .sort({ 'classInfo.startDate': 1 });
        const classesData = [];
        for (const course of classes) {
            classesData.push({
                _id: course._id,
                name: course.name,
                level: course.level,
                classInfo: course.classInfo,
                instructor: course.instructor,
                enrolledStudents: course.enrolledStudents,
                teachingMethods: course.teachingMethods,
                schedule: course.schedule,
                isActive: course.isActive !== false
            });
        }
        res.json({
            success: true,
            data: {
                classes: classesData
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 반 목록 조회 실패', error);
        res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
    }
});
router.get('/class/:classId/students/progress', async (req, res) => {
    try {
        const { classId } = req.params;
        const course = await Course_1.Course.findById(classId)
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .populate('enrolledStudents.progress.completedSteps.methodId');
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        const studentsProgress = [];
        for (const enrollment of course.enrolledStudents) {
            const student = enrollment.student;
            const progress = enrollment.progress || {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
            let totalSteps = 0;
            for (const tm of course.teachingMethods) {
                const method = tm.methodId;
                totalSteps += (method?.steps?.length || 0);
            }
            const completedSteps = progress.completedSteps.length;
            const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            studentsProgress.push({
                student: {
                    _id: student._id,
                    name: student.name || student.userId,
                    userId: student.userId,
                    email: student.email
                },
                enrollment: {
                    enrolledAt: enrollment.enrolledAt,
                    status: enrollment.status,
                    progress: {
                        ...progress,
                        percentage,
                        totalSteps,
                        completedSteps: completedSteps
                    }
                },
                teachingMethods: (() => {
                    const methodsData = [];
                    for (const tm of course.teachingMethods) {
                        const method = tm.methodId;
                        let methodCompletedSteps = 0;
                        for (const step of progress.completedSteps) {
                            if (step.methodId?.toString() === method._id.toString()) {
                                methodCompletedSteps++;
                            }
                        }
                        methodsData.push({
                            _id: method._id,
                            name: method.name,
                            description: method.description,
                            steps: method.steps || [],
                            tips: method.tips || [],
                            order: tm.order,
                            isRequired: tm.isRequired,
                            progress: {
                                totalSteps: method.steps?.length || 0,
                                completedSteps: methodCompletedSteps,
                                percentage: method.steps?.length > 0
                                    ? Math.round((methodCompletedSteps / method.steps.length) * 100)
                                    : 0
                            }
                        });
                    }
                    return methodsData;
                })()
            });
        }
        res.json({
            success: true,
            data: {
                classInfo: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    classInfo: course.classInfo
                },
                studentsProgress
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 회원 진도 조회 실패', error);
        res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
    }
});
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
    try {
        const { classId, studentId } = req.params;
        const { methodId, stepName, notes } = req.body;
        const course = await Course_1.Course.findById(classId);
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
        }
        const progress = enrollment.progress;
        const existingStep = progress.completedSteps.find(step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName);
        if (existingStep) {
            return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
        }
        progress.completedSteps.push({
            methodId,
            stepName,
            completedAt: new Date(),
            notes: notes || ''
        });
        let totalSteps = 0;
        for (const tm of course.teachingMethods) {
            if (tm.methodId.toString() === methodId) {
                totalSteps++;
            }
        }
        progress.percentage = Math.round((progress.completedSteps.length / totalSteps) * 100);
        progress.lastUpdated = new Date();
        await course.save();
        res.json({
            success: true,
            message: '체크리스트 단계가 완료되었습니다.',
            data: {
                completedSteps: progress.completedSteps,
                percentage: progress.percentage
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 단계 완료 처리 실패', error);
        res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
    }
});
router.post('/:courseId/enroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course || !course.isActive) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let existingEnrollment = null;
        for (const enrollment of course.enrolledStudents) {
            if (enrollment.student && enrollment.student.toString() === studentId.toString()) {
                existingEnrollment = enrollment;
                break;
            }
        }
        if (existingEnrollment) {
            return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
        }
        if (course.enrolledStudents.length >= course.maxStudents) {
            return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
        }
        course.enrolledStudents.push({
            student: studentId,
            enrolledAt: new Date(),
            status: 'active'
        });
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $push: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에 성공적으로 등록되었습니다.',
            data: course
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 등록 오류', error);
        res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
    }
});
router.post('/:courseId/unenroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const enrollmentIndex = course.enrolledStudents.findIndex(enrollment => enrollment.student && enrollment.student.toString() === studentId.toString());
        if (enrollmentIndex === -1) {
            return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
        }
        course.enrolledStudents.splice(enrollmentIndex, 1);
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $pull: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에서 성공적으로 해제되었습니다.',
            data: course
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 해제 오류', error);
        res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
    }
});
router.put('/:courseId/progress/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const { progress, completedSteps, notes } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
        }
        if (!enrollment.progress) {
            enrollment.progress = {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
        }
        enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
        enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
        enrollment.progress.lastUpdated = new Date();
        enrollment.progress.notes = notes || enrollment.progress.notes || '';
        await course.save();
        res.json({
            success: true,
            message: '진도율이 성공적으로 업데이트되었습니다.',
            data: enrollment.progress
        });
    }
    catch (error) {
        (0, logger_1.logError)('진도율 업데이트 오류', error);
        res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
    }
});
router.get('/:courseId/student/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const course = await Course_1.Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('enrolledStudents.student', 'name email studentInfo');
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let studentEnrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student._id.toString() === studentId) {
                studentEnrollment = e;
                break;
            }
        }
        if (!studentEnrollment || !studentEnrollment.student) {
            return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
        }
        res.json({
            success: true,
            message: '학생 정보 조회 성공',
            data: {
                course: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    instructor: course.instructor
                },
                student: studentEnrollment.student,
                enrollment: {
                    enrolledAt: studentEnrollment.enrolledAt,
                    status: studentEnrollment.status,
                    progress: studentEnrollment.progress || {}
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 정보 조회 오류', error);
        res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/students', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const courses = await Course_1.Course.find({
            instructor: instructorId,
            isActive: true
        }).populate('enrolledStudents.student', 'name email studentInfo');
        const studentMap = new Map();
        courses.forEach(course => {
            course.enrolledStudents.forEach(enrollment => {
                if (enrollment.student && enrollment.status === 'active') {
                    const student = enrollment.student;
                    const studentId = student._id.toString();
                    if (!studentMap.has(studentId)) {
                        studentMap.set(studentId, {
                            _id: student._id,
                            name: student.name,
                            email: student.email,
                            swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
                            courses: [],
                            totalProgress: 0,
                            averageProgress: 0
                        });
                    }
                    const studentInfo = studentMap.get(studentId);
                    const progress = enrollment.progress?.percentage || 0;
                    studentInfo.courses.push({
                        courseId: course._id,
                        courseName: course.name,
                        level: course.level,
                        enrolledAt: enrollment.enrolledAt,
                        progress: progress,
                        status: enrollment.status
                    });
                    studentInfo.totalProgress += progress;
                }
            });
        });
        const students = Array.from(studentMap.values()).map(student => ({
            ...student,
            averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
        }));
        students.sort((a, b) => b.averageProgress - a.averageProgress);
        res.json({
            success: true,
            message: '강사별 담당 학생 목록 조회 성공',
            data: {
                instructorId,
                totalStudents: students.length,
                students
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 학생 목록 조회 오류', error);
        res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/stats', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const stats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $group: {
                    _id: null,
                    totalCourses: { $sum: 1 },
                    totalStudents: { $sum: { $size: '$enrolledStudents' } },
                    activeStudents: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$enrolledStudents',
                                    cond: { $eq: ['$$this.status', 'active'] }
                                }
                            }
                        }
                    },
                    averageProgress: {
                        $avg: {
                            $avg: '$enrolledStudents.progress.percentage'
                        }
                    }
                }
            }
        ]);
        const courseStats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $project: {
                    name: 1,
                    level: 1,
                    enrolledCount: { $size: '$enrolledStudents' },
                    averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
                    completionRate: {
                        $divide: [
                            { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
                            { $size: '$enrolledStudents' }
                        ]
                    }
                }
            }
        ]);
        res.json({
            success: true,
            message: '강사별 통계 조회 성공',
            data: {
                instructorId,
                overview: stats[0] || {
                    totalCourses: 0,
                    totalStudents: 0,
                    activeStudents: 0,
                    averageProgress: 0
                },
                courseStats
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 통계 조회 오류', error);
        res.status(500).json({ error: '통계 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/classes', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const classes = await Course_1.Course.find({
            instructor: instructorId
        })
            .populate('instructor', 'name userId')
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .sort({ 'classInfo.startDate': 1 });
        const classesData = [];
        for (const course of classes) {
            classesData.push({
                _id: course._id,
                name: course.name,
                level: course.level,
                classInfo: course.classInfo,
                instructor: course.instructor,
                enrolledStudents: course.enrolledStudents,
                teachingMethods: course.teachingMethods,
                schedule: course.schedule,
                isActive: course.isActive !== false
            });
        }
        res.json({
            success: true,
            data: {
                classes: classesData
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 반 목록 조회 실패', error);
        res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
    }
});
router.get('/class/:classId/students/progress', async (req, res) => {
    try {
        const { classId } = req.params;
        const course = await Course_1.Course.findById(classId)
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .populate('enrolledStudents.progress.completedSteps.methodId');
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        const studentsProgress = [];
        for (const enrollment of course.enrolledStudents) {
            const student = enrollment.student;
            const progress = enrollment.progress || {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
            let totalSteps = 0;
            for (const tm of course.teachingMethods) {
                const method = tm.methodId;
                totalSteps += (method?.steps?.length || 0);
            }
            const completedSteps = progress.completedSteps.length;
            const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            studentsProgress.push({
                student: {
                    _id: student._id,
                    name: student.name || student.userId,
                    userId: student.userId,
                    email: student.email
                },
                enrollment: {
                    enrolledAt: enrollment.enrolledAt,
                    status: enrollment.status,
                    progress: {
                        ...progress,
                        percentage,
                        totalSteps,
                        completedSteps: completedSteps
                    }
                },
                teachingMethods: (() => {
                    const methodsData = [];
                    for (const tm of course.teachingMethods) {
                        const method = tm.methodId;
                        let methodCompletedSteps = 0;
                        for (const step of progress.completedSteps) {
                            if (step.methodId?.toString() === method._id.toString()) {
                                methodCompletedSteps++;
                            }
                        }
                        methodsData.push({
                            _id: method._id,
                            name: method.name,
                            description: method.description,
                            steps: method.steps || [],
                            tips: method.tips || [],
                            order: tm.order,
                            isRequired: tm.isRequired,
                            progress: {
                                totalSteps: method.steps?.length || 0,
                                completedSteps: methodCompletedSteps,
                                percentage: method.steps?.length > 0
                                    ? Math.round((methodCompletedSteps / method.steps.length) * 100)
                                    : 0
                            }
                        });
                    }
                    return methodsData;
                })()
            });
        }
        res.json({
            success: true,
            data: {
                classInfo: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    classInfo: course.classInfo
                },
                studentsProgress
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 회원 진도 조회 실패', error);
        res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
    }
});
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
    try {
        const { classId, studentId } = req.params;
        const { methodId, stepName, notes } = req.body;
        const course = await Course_1.Course.findById(classId);
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
        }
        const progress = enrollment.progress;
        const existingStep = progress.completedSteps.find(step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName);
        if (existingStep) {
            return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
        }
        progress.completedSteps.push({
            methodId,
            stepName,
            completedAt: new Date(),
            notes: notes || ''
        });
        let totalSteps = 0;
        for (const tm of course.teachingMethods) {
            if (tm.methodId.toString() === methodId) {
                totalSteps++;
            }
        }
        progress.percentage = Math.round((progress.completedSteps.length / totalSteps) * 100);
        progress.lastUpdated = new Date();
        await course.save();
        res.json({
            success: true,
            message: '체크리스트 단계가 완료되었습니다.',
            data: {
                completedSteps: progress.completedSteps,
                percentage: progress.percentage
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 단계 완료 처리 실패', error);
        res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
    }
});
router.get('/my-courses', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const courses = await Course_1.Course.find({ instructor: instructorId })
            .populate('enrolledStudents.student', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalCourses = await Course_1.Course.countDocuments({ instructor: instructorId });
        res.json({
            success: true,
            message: '강사 강습 과정 조회 성공!',
            data: courses,
            pagination: {
                page,
                limit,
                total: totalCourses,
                pages: Math.ceil(totalCourses / limit)
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 강습 과정 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '강사 강습 과정 조회에 실패했습니다.'
        });
    }
});
router.get('/oversight', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const dummyOversightData = [
            {
                _id: '1',
                title: '초급 자유형 기초반',
                description: '수영 초보자를 위한 자유형 기초 강습',
                level: 'beginner',
                duration: 60,
                maxStudents: 8,
                price: 80000,
                centerId: 'center1',
                centerName: 'JJ 수영장 강남점',
                centerRegion: '서울 강남구',
                instructor: { _id: 'inst1', name: '김강사', rating: 4.5 },
                enrollmentCount: 6,
                revenue: 480000,
                satisfaction: 4.3,
                status: 'active',
                approvalStatus: 'approved',
                createdAt: '2025-01-15',
                lastUpdated: '2025-01-18'
            },
            {
                _id: '2',
                title: '중급 4영법 마스터반',
                description: '4가지 영법을 모두 배우는 중급 과정',
                level: 'intermediate',
                duration: 75,
                maxStudents: 6,
                price: 120000,
                centerId: 'center2',
                centerName: 'JJ 수영장 홍대점',
                centerRegion: '서울 마포구',
                instructor: { _id: 'inst2', name: '이강사', rating: 4.7 },
                enrollmentCount: 4,
                revenue: 480000,
                satisfaction: 4.6,
                status: 'active',
                approvalStatus: 'pending',
                createdAt: '2025-01-10',
                lastUpdated: '2025-01-17'
            },
            {
                _id: '3',
                title: '고급 접영 마스터반',
                description: '접영 마스터 및 경기 준비 과정',
                level: 'advanced',
                duration: 90,
                maxStudents: 4,
                price: 180000,
                centerId: 'center1',
                centerName: 'JJ 수영장 강남점',
                centerRegion: '서울 강남구',
                instructor: { _id: 'inst3', name: '박강사', rating: 4.8 },
                enrollmentCount: 3,
                revenue: 540000,
                satisfaction: 4.9,
                status: 'active',
                approvalStatus: 'approved',
                createdAt: '2025-01-12',
                lastUpdated: '2025-01-16'
            }
        ];
        res.json({
            success: true,
            data: dummyOversightData,
            pagination: {
                current: 1,
                limit: 10,
                total: dummyOversightData.length,
                pages: 1
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 감독 데이터 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '강습 과정 감독 데이터 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/center-stats', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const dummyCenterStats = [
            {
                centerId: 'center1',
                centerName: 'JJ 수영장 강남점',
                region: '서울 강남구',
                totalCourses: 8,
                activeCourses: 7,
                totalEnrollments: 45,
                totalRevenue: 3600000,
                averageSatisfaction: 4.4,
                approvalRate: 87.5
            },
            {
                centerId: 'center2',
                centerName: 'JJ 수영장 홍대점',
                region: '서울 마포구',
                totalCourses: 6,
                activeCourses: 5,
                totalEnrollments: 32,
                totalRevenue: 2400000,
                averageSatisfaction: 4.2,
                approvalRate: 83.3
            },
            {
                centerId: 'center3',
                centerName: 'JJ 수영장 잠실점',
                region: '서울 송파구',
                totalCourses: 10,
                activeCourses: 9,
                totalEnrollments: 58,
                totalRevenue: 4200000,
                averageSatisfaction: 4.6,
                approvalRate: 90.0
            }
        ];
        res.json({
            success: true,
            data: dummyCenterStats
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터별 강습 통계 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '센터별 강습 통계 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:id/approval', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;
        void reason;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 액션입니다. (approve 또는 reject)'
            });
        }
        const course = await Course_1.Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: '강습 과정을 찾을 수 없습니다.'
            });
        }
        course.isActive = action === 'approve';
        await course.save();
        res.json({
            success: true,
            message: `강습 과정이 성공적으로 ${action === 'approve' ? '승인' : '거부'}되었습니다.`,
            data: course
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 승인 처리 오류', error);
        res.status(500).json({
            success: false,
            message: '강습 과정 승인 처리 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:id/teaching-methods', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { teachingMethods } = req.body;
        if (!Array.isArray(teachingMethods)) {
            return res.status(400).json({
                success: false,
                message: 'teachingMethods는 배열이어야 합니다.'
            });
        }
        const course = await Course_1.Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: '강좌를 찾을 수 없습니다.'
            });
        }
        if (req.user.userType === 'instructor') {
            if (course.instructor.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '자신의 강좌만 수정할 수 있습니다.'
                });
            }
        }
        else if (req.user.userType === 'centerAdmin') {
            const userCenterId = req.user.centerId || req.user.centerAdminInfo?.managedCenters?.[0];
            if (!userCenterId || course.centerId.toString() !== userCenterId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '자신의 센터 강좌만 수정할 수 있습니다.'
                });
            }
        }
        const TeachingMethod = (await Promise.resolve().then(() => __importStar(require('../models/TeachingMethod')))).TeachingMethod;
        for (const tm of teachingMethods) {
            if (!tm.methodId || typeof tm.order !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: '각 강습법에는 methodId와 order가 필요합니다.'
                });
            }
            const method = await TeachingMethod.findById(tm.methodId);
            if (!method) {
                return res.status(404).json({
                    success: false,
                    message: `강습법을 찾을 수 없습니다: ${tm.methodId}`
                });
            }
            if (req.user.userType === 'instructor') {
                const isMyMethod = method.createdBy && method.createdBy.toString() === req.user._id.toString();
                const isSuperAdminMethod = method.createdByRole === 'superAdmin';
                if (!isMyMethod && !isSuperAdminMethod) {
                    return res.status(403).json({
                        success: false,
                        message: `다른 강사의 강습법은 사용할 수 없습니다: ${method.name}`
                    });
                }
            }
        }
        course.teachingMethods = teachingMethods.map((tm) => ({
            methodId: new mongoose_1.default.Types.ObjectId(tm.methodId),
            order: tm.order,
            isRequired: tm.isRequired !== undefined ? tm.isRequired : true
        }));
        await course.save();
        const updatedCourse = await Course_1.Course.findById(id)
            .populate('teachingMethods.methodId')
            .populate('instructor', 'name userId')
            .populate('centerId', 'name');
        res.json({
            success: true,
            message: '강좌별 강습법이 성공적으로 지정되었습니다.',
            data: updatedCourse
        });
    }
    catch (error) {
        (0, logger_1.logError)('강좌별 강습법 지정 오류', error);
        res.status(500).json({
            success: false,
            message: '강좌별 강습법 지정 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:id/teaching-methods', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course_1.Course.findById(id)
            .populate('teachingMethods.methodId')
            .select('teachingMethods level name');
        if (!course) {
            return res.status(404).json({
                success: false,
                message: '강좌를 찾을 수 없습니다.'
            });
        }
        const sortedMethods = (course.teachingMethods || []).sort((a, b) => {
            return (a.order || 0) - (b.order || 0);
        });
        res.json({
            success: true,
            message: '강좌별 강습법 조회 성공',
            data: {
                courseId: course._id,
                courseName: course.name,
                level: course.level,
                teachingMethods: sortedMethods.map((tm) => ({
                    methodId: tm.methodId?._id || tm.methodId,
                    methodName: tm.methodId?.name,
                    methodDescription: tm.methodId?.description,
                    methodCategory: tm.methodId?.category,
                    methodLevel: tm.methodId?.level,
                    order: tm.order,
                    isRequired: tm.isRequired,
                    steps: tm.methodId?.steps || [],
                    tips: tm.methodId?.tips || [],
                    checklist: tm.methodId?.checklist || []
                }))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강좌별 강습법 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '강좌별 강습법 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/:courseId/refund-request', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: '강습 과정을 찾을 수 없습니다.' });
        }
        const enrollment = (course.enrolledStudents || []).find((e) => {
            const eStudentId = e.student?.toString() || e.student;
            return eStudentId === String(studentId);
        });
        let isEnrolled = !!enrollment;
        if (!isEnrolled) {
            const { Booking } = require('../models/Booking');
            const { Payment } = require('../models/Payment');
            const booking = await Booking.findOne({
                studentId: studentId,
                courseId: courseId,
                status: { $in: ['confirmed', 'pending', 'completed'] }
            });
            const payment = await Payment.findOne({
                user: studentId,
                relatedCourse: courseId,
                status: { $in: ['pending', 'completed'] },
                purpose: 'course'
            });
            isEnrolled = !!(booking || payment);
        }
        if (!isEnrolled) {
            return res.status(400).json({ success: false, message: '등록된 강습 과정이 아닙니다.' });
        }
        const startDate = course.classInfo?.startDate || course.startDate;
        const isCourseStarted = startDate ? new Date(startDate) <= new Date() : false;
        const { Center } = require('../models/Center');
        const center = await Center.findById(course.centerId).select('settings').lean();
        const refundPolicyRaw = center?.settings?.paymentSettings?.refundPolicy;
        const defaultRefundPolicy = {
            beforeUse: {
                enabled: true,
                timeBefore: 24,
                refundRate: 100,
                description: '이용 전 환불'
            },
            afterUse: {
                enabled: true,
                calculationMethod: 'sessions',
                sessionBased: {
                    enabled: true,
                    refundByRemainingSessions: true,
                    description: '이용한 회수를 제외한 남은 회수 비율로 환불 (소비자 보호법 준수)'
                }
            },
            processingDays: 7,
            refundMethod: '원래 결제 수단으로 환불'
        };
        const formatRefundPolicy = (policy) => {
            const effectivePolicy = policy || defaultRefundPolicy;
            if (typeof effectivePolicy === 'string')
                return effectivePolicy;
            const parts = [];
            if (effectivePolicy.beforeUse?.enabled) {
                parts.push(`이용 ${effectivePolicy.beforeUse.timeBefore || 24}시간 전까지 ${effectivePolicy.beforeUse.refundRate || 100}% 환불`);
            }
            if (effectivePolicy.afterUse?.enabled) {
                const calculationMethod = effectivePolicy.afterUse.calculationMethod || 'sessions';
                if (calculationMethod === 'sessions' && effectivePolicy.afterUse.sessionBased?.enabled) {
                    parts.push('이용 시작 후: 단체반은 경과된 수업을, 개인레슨은 예약된 시간을 이용한 것으로 간주하여 환불');
                }
                else if (calculationMethod === 'days' && effectivePolicy.afterUse.dayBased?.enabled && effectivePolicy.afterUse.dayBased.refundRates) {
                    effectivePolicy.afterUse.dayBased.refundRates.forEach((rate) => {
                        if (rate.daysTo) {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일~${rate.daysTo}일: ${rate.refundRate}% 환불`);
                        }
                        else {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일 이후: ${rate.refundRate}% 환불`);
                        }
                    });
                }
                else if (effectivePolicy.afterUse.refundRates) {
                    effectivePolicy.afterUse.refundRates.forEach((rate) => {
                        if (rate.daysTo) {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일~${rate.daysTo}일: ${rate.refundRate}% 환불`);
                        }
                        else {
                            parts.push(`이용 시작 후 ${rate.daysFromStart}일 이후: ${rate.refundRate}% 환불`);
                        }
                    });
                }
            }
            if (effectivePolicy.refundFee?.enabled && effectivePolicy.refundFee.amount > 0) {
                parts.push(`환불 수수료: ${effectivePolicy.refundFee.amount.toLocaleString()}원`);
            }
            if (effectivePolicy.processingDays) {
                parts.push(`환불 처리 기간: ${effectivePolicy.processingDays}일`);
            }
            if (effectivePolicy.refundMethod) {
                parts.push(`환불 방법: ${effectivePolicy.refundMethod}`);
            }
            if (effectivePolicy.customDescription) {
                parts.push(`※ ${effectivePolicy.customDescription}`);
            }
            return parts.length > 0 ? parts.join(', ') : '이용 24시간 전까지 100% 환불, 이용 시작 후: 단체반은 경과된 수업을, 개인레슨은 예약된 시간을 이용한 것으로 간주하여 환불';
        };
        const refundPolicy = formatRefundPolicy(refundPolicyRaw);
        const { Approval } = require('../models/Approval');
        const existingRefund = await Approval.findOne({
            type: 'refund_request',
            userId: studentId,
            courseId: courseId,
            status: 'pending'
        });
        if (existingRefund) {
            return res.status(400).json({
                success: false,
                message: '이미 환불 신청이 접수되어 있습니다.'
            });
        }
        const refundRequest = new Approval({
            type: 'refund_request',
            userId: studentId,
            courseId: courseId,
            centerId: course.centerId,
            title: `${course.name} 환불 신청`,
            description: isCourseStarted
                ? '강의가 이미 시작되어 센터의 환불 정책에 따라 환불 금액이 결정됩니다.'
                : '환불 신청이 접수되었습니다.',
            status: 'pending',
            priority: 'medium',
            estimatedAmount: course.price,
            requestDate: new Date()
        });
        await refundRequest.save();
        const message = isCourseStarted
            ? '환불 신청이 접수되었습니다. 강의가 이미 시작되어 센터의 환불 정책에 따라 환불 금액이 결정됩니다. 관리자 검토 후 환불이 진행됩니다.'
            : '환불 신청이 접수되었습니다. 관리자 검토 후 환불이 진행됩니다.';
        res.json({
            success: true,
            message: message,
            refundPolicy: refundPolicy,
            isCourseStarted: isCourseStarted,
            refundRequestId: refundRequest._id
        });
    }
    catch (error) {
        (0, logger_1.logError)('환불 신청 오류', error);
        res.status(500).json({ success: false, message: '환불 신청 중 오류가 발생했습니다.' });
    }
});
router.delete('/:courseId/refund-request', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const { Approval } = require('../models/Approval');
        const refundRequest = await Approval.findOne({
            type: 'refund_request',
            userId: studentId,
            courseId: courseId,
            status: 'pending'
        });
        if (!refundRequest) {
            return res.status(404).json({
                success: false,
                message: '환불 신청을 찾을 수 없습니다.'
            });
        }
        await Approval.findByIdAndDelete(refundRequest._id);
        res.json({
            success: true,
            message: '환불 신청이 취소되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('환불 신청 취소 오류', error);
        res.status(500).json({ success: false, message: '환불 신청 취소 중 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map