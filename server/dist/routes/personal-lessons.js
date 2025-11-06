"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const PersonalLesson_1 = require("../models/PersonalLesson");
const User_1 = require("../models/User");
const laneAllocationService_1 = require("../services/laneAllocationService");
const Payment_1 = require("../models/Payment");
const settlementService_1 = require("../services/settlementService");
const router = express_1.default.Router();
router.post('/external-request', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestedCenterId, instructorId, date, startTime, endTime, duration, lessonType, skillLevel, goals, notes, poolType = 'mainPool', laneNumber, requestLaneRental = false, instructorFee, laneRentalFee } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        const userCenterId = user.centerId || user.studentInfo?.centerId;
        const isExternalMember = !userCenterId || (requestedCenterId && userCenterId.toString() !== requestedCenterId.toString());
        if (!requestedCenterId) {
            return res.status(400).json({
                success: false,
                message: '요청할 센터를 선택해주세요.'
            });
        }
        const Center = mongoose_1.default.model('Center');
        const requestedCenter = await Center.findById(requestedCenterId);
        if (!requestedCenter) {
            return res.status(400).json({
                success: false,
                message: '요청한 센터를 찾을 수 없습니다.'
            });
        }
        let instructor = null;
        let isExternalInstructor = false;
        let calculatedInstructorFee = instructorFee || 0;
        if (instructorId) {
            instructor = await User_1.User.findById(instructorId);
            if (!instructor || instructor.userType !== 'instructor') {
                return res.status(400).json({
                    success: false,
                    message: '유효하지 않은 강사입니다.'
                });
            }
            const instructorCenters = instructor.instructorInfo?.assignedCenters || [];
            isExternalInstructor = !instructorCenters.some((centerId) => centerId.toString() === requestedCenterId.toString());
            if (!calculatedInstructorFee && instructor.instructorInfo?.personalLessonSettings?.lessonTypes) {
                const lessonType = instructor.instructorInfo.personalLessonSettings.lessonTypes.find((lt) => lt.type === '1:1');
                calculatedInstructorFee = lessonType?.pricePerSession || 80000;
            }
            else if (!calculatedInstructorFee) {
                calculatedInstructorFee = 80000;
            }
        }
        let calculatedLaneRentalFee = laneRentalFee || 0;
        if (requestLaneRental && !calculatedLaneRentalFee) {
            calculatedLaneRentalFee = (duration / 60) * 20000;
        }
        const platformFeeRate = 0.1;
        const calculatedPlatformFee = Math.round(calculatedInstructorFee * platformFeeRate);
        const totalAmount = calculatedInstructorFee + calculatedLaneRentalFee + calculatedPlatformFee;
        let laneRentalId = null;
        if (requestLaneRental && laneNumber) {
            const LaneRental = mongoose_1.default.model('LaneRental');
            const conflicts = await laneAllocationService_1.LaneAllocationService.checkLaneConflicts(date, startTime, requestedCenterId, duration);
            const laneConflicts = conflicts.filter(conflict => conflict.lanes.includes(laneNumber));
            if (laneConflicts.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: '해당 레인은 이미 사용 중입니다.',
                    conflicts: laneConflicts
                });
            }
            const laneRental = new LaneRental({
                userId,
                centerId: requestedCenterId,
                date: new Date(date),
                startTime,
                endTime: endTime || (() => {
                    const [h, m] = startTime.split(':').map(Number);
                    const end = new Date(2000, 0, 1, h, m + duration, 0);
                    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                })(),
                duration,
                laneNumber,
                poolType,
                purpose: '개인레슨',
                notes: `개인레슨 요청: ${goals}`,
                status: 'pending',
                price: calculatedLaneRentalFee
            });
            await laneRental.save();
            laneRentalId = laneRental._id;
        }
        const personalLesson = new PersonalLesson_1.PersonalLesson({
            studentId: userId,
            instructorId: instructorId || undefined,
            centerId: requestedCenterId,
            requestedCenterId,
            isExternalMember,
            isExternalInstructor,
            date: new Date(date),
            startTime,
            endTime,
            time: startTime,
            duration,
            lessonType,
            skillLevel,
            goals,
            notes,
            poolType,
            assignedLane: laneNumber,
            laneRentalId,
            locationStatus: requestLaneRental && laneRentalId ? 'pending' : 'pending',
            instructorFee: calculatedInstructorFee,
            laneRentalFee: calculatedLaneRentalFee,
            platformFee: calculatedPlatformFee,
            totalAmount: totalAmount,
            price: totalAmount,
            status: 'pending',
            paymentStatus: 'pending'
        });
        await personalLesson.save();
        res.status(201).json({
            success: true,
            message: '개인레슨 요청이 완료되었습니다. 결제 후 센터 승인을 기다려주세요.',
            data: {
                personalLesson: personalLesson.toObject(),
                laneRental: laneRentalId ? { _id: laneRentalId } : null,
                pricing: {
                    instructorFee: calculatedInstructorFee,
                    laneRentalFee: calculatedLaneRentalFee,
                    platformFee: calculatedPlatformFee,
                    totalAmount: totalAmount,
                    isExternalInstructor: isExternalInstructor
                }
            }
        });
    }
    catch (error) {
        console.error('외부 회원 개인레슨 요청 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, time, startTime, endTime, duration, lessonType, skillLevel, goals, notes } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user || user.userType !== 'student') {
            return res.status(400).json({
                success: false,
                message: '학생만 개인레슨을 신청할 수 있습니다.'
            });
        }
        const centerId = user.centerId;
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '소속 센터가 없습니다.'
            });
        }
        const actualStartTime = startTime || time;
        const actualEndTime = endTime || (() => {
            const [h, m] = actualStartTime.split(':').map(Number);
            const end = new Date(2000, 0, 1, h, m + (duration || 60), 0);
            return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        })();
        const conflicts = await laneAllocationService_1.LaneAllocationService.checkLaneConflicts(date, actualStartTime, centerId?.toString() || '', duration || 60);
        if (conflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: '해당 시간에는 다른 수업이 진행됩니다.',
                conflicts
            });
        }
        const personalLesson = new PersonalLesson_1.PersonalLesson({
            studentId: userId,
            centerId,
            isExternalMember: false,
            date: new Date(date),
            startTime: actualStartTime,
            endTime: actualEndTime,
            time: actualStartTime,
            duration: duration || 60,
            lessonType,
            skillLevel,
            goals,
            notes,
            status: 'pending'
        });
        const adjustmentResult = await laneAllocationService_1.LaneAllocationService.adjustLanesForPersonalLesson({
            date,
            time: actualStartTime,
            centerId
        });
        personalLesson.assignedLane = adjustmentResult.personalLessonLane || 1;
        await personalLesson.save();
        res.status(201).json({
            success: true,
            message: '개인레슨 신청이 완료되었습니다.',
            data: {
                ...personalLesson.toObject(),
                assignedLane: adjustmentResult.personalLessonLane || 1
            }
        });
    }
    catch (error) {
        console.error('개인레슨 신청 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;
        const query = { studentId: userId };
        if (status && status !== 'all') {
            query.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const personalLessons = await PersonalLesson_1.PersonalLesson.find(query)
            .populate('instructorId', 'name email phone')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await PersonalLesson_1.PersonalLesson.countDocuments(query);
        res.json({
            success: true,
            message: '개인레슨 목록 조회 성공',
            data: {
                personalLessons,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: personalLessons.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('개인레슨 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const personalLesson = await PersonalLesson_1.PersonalLesson.findOne({
            _id: id,
            studentId: userId
        }).populate('instructorId', 'name email phone');
        if (!personalLesson) {
            return res.status(404).json({
                success: false,
                message: '개인레슨을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '개인레슨 상세 조회 성공',
            data: personalLesson
        });
    }
    catch (error) {
        console.error('개인레슨 상세 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const personalLesson = await PersonalLesson_1.PersonalLesson.findOne({
            _id: id,
            studentId: userId
        });
        if (!personalLesson) {
            return res.status(404).json({
                success: false,
                message: '개인레슨을 찾을 수 없습니다.'
            });
        }
        if (personalLesson.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: '완료된 수업은 취소할 수 없습니다.'
            });
        }
        await laneAllocationService_1.LaneAllocationService.restoreLanesAfterPersonalLessonCancellation(id);
        await PersonalLesson_1.PersonalLesson.findByIdAndUpdate(id, {
            status: 'cancelled'
        });
        res.json({
            success: true,
            message: '개인레슨이 취소되었습니다.'
        });
    }
    catch (error) {
        console.error('개인레슨 취소 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/:id/payment', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { paymentMethod = 'online' } = req.body;
        const personalLesson = await PersonalLesson_1.PersonalLesson.findById(id)
            .populate('instructorId', 'name email instructorInfo')
            .populate('centerId', 'name');
        if (!personalLesson) {
            return res.status(404).json({
                success: false,
                message: '개인레슨을 찾을 수 없습니다.'
            });
        }
        if (personalLesson.studentId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: '본인의 개인레슨만 결제할 수 있습니다.'
            });
        }
        if (personalLesson.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: '이미 결제가 완료된 개인레슨입니다.'
            });
        }
        const totalAmount = personalLesson.totalAmount || personalLesson.price;
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: '결제 금액이 설정되지 않았습니다.'
            });
        }
        const transactionId = `PL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const payment = new Payment_1.Payment({
            user: userId,
            amount: totalAmount,
            currency: 'KRW',
            paymentMethod,
            status: 'pending',
            purpose: 'booking',
            relatedBooking: id,
            centerId: personalLesson.centerId,
            transactionId,
            pricingInfo: {
                userType: 'student',
                pricingTier: 'standard',
                baseAmount: totalAmount,
                discountAmount: 0,
                discountReason: '',
                centerId: personalLesson.centerId,
                isCenterSponsored: false
            },
            notes: `외부 개인레슨 결제 - 강사: ${personalLesson.instructorId?.name || '미정'}, 센터: ${personalLesson.centerId?.name || '미정'}`
        });
        await payment.save();
        personalLesson.paymentId = payment._id;
        await personalLesson.save();
        res.status(201).json({
            success: true,
            message: '결제가 생성되었습니다.',
            data: {
                payment: payment.toObject(),
                personalLesson: {
                    id: personalLesson._id,
                    instructorFee: personalLesson.instructorFee,
                    laneRentalFee: personalLesson.laneRentalFee,
                    platformFee: personalLesson.platformFee,
                    totalAmount: personalLesson.totalAmount
                }
            }
        });
    }
    catch (error) {
        console.error('결제 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/:id/payment/complete', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { transactionId, receiptUrl } = req.body;
        const personalLesson = await PersonalLesson_1.PersonalLesson.findById(id)
            .populate('instructorId', 'name email instructorInfo')
            .populate('centerId', 'name')
            .populate('paymentId');
        if (!personalLesson) {
            return res.status(404).json({
                success: false,
                message: '개인레슨을 찾을 수 없습니다.'
            });
        }
        if (personalLesson.studentId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: '본인의 개인레슨만 결제할 수 있습니다.'
            });
        }
        if (!personalLesson.paymentId) {
            return res.status(400).json({
                success: false,
                message: '결제 정보가 없습니다.'
            });
        }
        const payment = await Payment_1.Payment.findById(personalLesson.paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: '결제 정보를 찾을 수 없습니다.'
            });
        }
        payment.status = 'completed';
        payment.processedAt = new Date();
        if (transactionId)
            payment.transactionId = transactionId;
        if (receiptUrl)
            payment.receiptUrl = receiptUrl;
        await payment.save();
        personalLesson.paymentStatus = 'completed';
        await personalLesson.save();
        try {
            await (0, settlementService_1.createSettlementItem)(personalLesson._id.toString());
        }
        catch (settlementError) {
            console.error('정산 항목 생성 실패:', settlementError);
        }
        res.json({
            success: true,
            message: '결제가 완료되었습니다.',
            data: {
                payment: payment.toObject(),
                personalLesson: {
                    id: personalLesson._id,
                    status: personalLesson.status,
                    paymentStatus: personalLesson.paymentStatus,
                    instructorFee: personalLesson.instructorFee,
                    laneRentalFee: personalLesson.laneRentalFee,
                    platformFee: personalLesson.platformFee,
                    totalAmount: personalLesson.totalAmount,
                    isExternalInstructor: personalLesson.isExternalInstructor
                },
                settlement: {
                    instructorAmount: (personalLesson.instructorFee || 0) - (personalLesson.platformFee || 0),
                    centerAmount: personalLesson.laneRentalFee || 0,
                    platformAmount: personalLesson.platformFee || 0
                }
            }
        });
    }
    catch (error) {
        console.error('결제 완료 처리 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=personal-lessons.js.map