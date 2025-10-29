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
const express_1 = __importDefault(require("express"));
const PersonalLesson_1 = require("../models/PersonalLesson");
const LaneRental_1 = require("../models/LaneRental");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const laneAllocationService_1 = require("../services/laneAllocationService");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router.use(role_1.requireCenterAdmin);
router.get('/dashboard', async (req, res) => {
    try {
        console.log('📊 대시보드 요청 받음:', {
            userId: req.user?.id,
            userType: req.user?.userType,
            centerId: req.user?.centerId,
            hasToken: !!req.headers.authorization
        });
        const centerId = req.user.centerId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const personalLessonStats = await PersonalLesson_1.PersonalLesson.aggregate([
            { $match: { centerId: centerId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const laneRentalStats = await LaneRental_1.LaneRental.aggregate([
            { $match: { centerId: centerId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const todayBookings = await PersonalLesson_1.PersonalLesson.find({
            centerId: centerId,
            scheduledDate: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('student instructor', 'name email phone');
        const todayRentals = await LaneRental_1.LaneRental.find({
            centerId: centerId,
            rentalDate: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('renter', 'name email phone');
        const weekBookings = await PersonalLesson_1.PersonalLesson.find({
            centerId: centerId,
            scheduledDate: {
                $gte: weekStart,
                $lte: weekEnd
            }
        }).populate('student instructor', 'name email phone');
        const weekRentals = await LaneRental_1.LaneRental.find({
            centerId: centerId,
            rentalDate: {
                $gte: weekStart,
                $lte: weekEnd
            }
        }).populate('renter', 'name email phone');
        res.json({
            success: true,
            data: {
                personalLessonStats,
                laneRentalStats,
                todayBookings,
                todayRentals,
                weekBookings,
                weekRentals
            }
        });
    }
    catch (error) {
        console.error('예약 현황 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.get('/personal-lessons', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { status, date, instructor } = req.query;
        let query = { centerId };
        if (status) {
            query.status = status;
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            query.scheduledDate = { $gte: startDate, $lt: endDate };
        }
        if (instructor) {
            query.instructor = instructor;
        }
        const personalLessons = await PersonalLesson_1.PersonalLesson.find(query)
            .populate('student', 'name email phone')
            .populate('instructor', 'name email phone')
            .sort({ scheduledDate: -1, startTime: 1 });
        res.json({
            success: true,
            data: personalLessons
        });
    }
    catch (error) {
        console.error('개인레슨 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.patch('/personal-lessons/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, instructorId, notes } = req.body;
        const personalLesson = await PersonalLesson_1.PersonalLesson.findById(id);
        if (!personalLesson) {
            return res.status(404).json({ success: false, message: '개인레슨을 찾을 수 없습니다.' });
        }
        if (status === 'accepted') {
            if (!instructorId) {
                return res.status(400).json({ success: false, message: '강사 ID가 필요합니다.' });
            }
            const conflict = await PersonalLesson_1.PersonalLesson.findOne({
                instructorId: instructorId,
                date: personalLesson.date,
                time: personalLesson.time,
                status: { $in: ['pending', 'approved', 'completed'] }
            });
            if (conflict) {
                return res.status(400).json({ success: false, message: '강사 스케줄이 충돌합니다.' });
            }
            personalLesson.instructorId = instructorId;
        }
        personalLesson.status = status;
        if (notes) {
            personalLesson.specialRequests = notes;
        }
        await personalLesson.save();
        res.json({
            success: true,
            message: '개인레슨 상태가 변경되었습니다.',
            data: personalLesson
        });
    }
    catch (error) {
        console.error('개인레슨 상태 변경 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.get('/lane-rentals', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { status, date } = req.query;
        let query = { centerId };
        if (status) {
            query.status = status;
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            query.rentalDate = { $gte: startDate, $lt: endDate };
        }
        const laneRentals = await LaneRental_1.LaneRental.find(query)
            .populate('renter', 'name email phone')
            .populate('approval.approvedBy', 'name email')
            .sort({ rentalDate: -1, startTime: 1 });
        res.json({
            success: true,
            data: laneRentals
        });
    }
    catch (error) {
        console.error('레인대여 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.patch('/lane-rentals/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const laneRental = await LaneRental_1.LaneRental.findById(id);
        if (!laneRental) {
            return res.status(404).json({ success: false, message: '레인대여를 찾을 수 없습니다.' });
        }
        if (status === 'approved') {
            const conflict = await LaneRental_1.LaneRental.findOne({
                centerId: laneRental.centerId,
                date: laneRental.date,
                startTime: laneRental.startTime,
                endTime: laneRental.endTime,
                laneNumber: laneRental.laneNumber,
                status: { $in: ['pending', 'approved', 'completed'] }
            });
            if (conflict) {
                return res.status(400).json({ success: false, message: '레인 사용 시간이 충돌합니다.' });
            }
        }
        laneRental.status = status;
        await laneRental.save();
        res.json({
            success: true,
            message: '레인대여 상태가 변경되었습니다.',
            data: laneRental
        });
    }
    catch (error) {
        console.error('레인대여 상태 변경 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.get('/instructors', async (req, res) => {
    try {
        console.log('👨‍🏫 강사 목록 요청 받음:', {
            userId: req.user?.id,
            userType: req.user?.userType,
            centerId: req.user?.centerId,
            hasToken: !!req.headers.authorization
        });
        const centerId = req.user.centerId;
        const instructors = await User_1.User.find({
            userType: 'instructor',
            centerId: centerId
        }).select('name email phone instructorInfo');
        res.json({
            success: true,
            data: instructors
        });
    }
    catch (error) {
        console.error('강사 목록 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.get('/statistics', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { period = 'week' } = req.query;
        let startDate;
        let endDate = new Date();
        switch (period) {
            case 'week':
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date();
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 7);
        }
        const personalLessonStats = await PersonalLesson_1.PersonalLesson.aggregate([
            {
                $match: {
                    centerId: centerId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$payment.amount' }
                }
            }
        ]);
        const laneRentalStats = await LaneRental_1.LaneRental.aggregate([
            {
                $match: {
                    centerId: centerId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.finalAmount' }
                }
            }
        ]);
        res.json({
            success: true,
            data: {
                personalLessonStats,
                laneRentalStats,
                period,
                startDate,
                endDate
            }
        });
    }
    catch (error) {
        console.error('예약 통계 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.post('/personal-lessons/request', async (req, res) => {
    try {
        const userId = req.user.id;
        const { instructorId, scheduledDate, startTime, endTime, poolType, laneNumber, lessonType, level, lessonContent, specialRequests } = req.body;
        console.log('📝 개인레슨 신청:', {
            userId,
            instructorId,
            scheduledDate,
            startTime,
            endTime,
            poolType,
            laneNumber,
            lessonType,
            level
        });
        const user = await User_1.User.findById(userId);
        if (!user || !user.centerId) {
            return res.status(400).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const instructor = await User_1.User.findById(instructorId);
        if (!instructor || instructor.userType !== 'instructor') {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 강사입니다.'
            });
        }
        const existingLesson = await PersonalLesson_1.PersonalLesson.findOne({
            instructor: instructorId,
            scheduledDate: new Date(scheduledDate),
            startTime,
            endTime,
            status: { $in: ['requested', 'accepted', 'in_progress'] }
        });
        if (existingLesson) {
            return res.status(400).json({
                success: false,
                message: '해당 시간대에 이미 예약이 있습니다.'
            });
        }
        let adjustmentResult;
        let assignedLane = 1;
        try {
            adjustmentResult = await laneAllocationService_1.LaneAllocationService.adjustLanesForPersonalLesson({
                date: scheduledDate,
                time: startTime,
                centerId: user.centerId
            });
            assignedLane = adjustmentResult.personalLessonLane || 1;
            console.log('✅ 레인 자동 조정 완료:', adjustmentResult);
        }
        catch (adjustmentError) {
            console.error('⚠️ 레인 자동 조정 실패:', adjustmentError);
        }
        const personalLesson = new PersonalLesson_1.PersonalLesson({
            studentId: userId,
            instructorId: instructorId,
            centerId: user.centerId,
            date: new Date(scheduledDate),
            time: startTime,
            duration: 60,
            lessonType: lessonType || 'freestyle',
            skillLevel: level || 'beginner',
            goals: '개인 맞춤 레슨',
            notes: lessonContent || '',
            price: 50000,
            specialRequests: specialRequests || '',
            paymentStatus: 'pending',
            status: 'pending',
            assignedLane: assignedLane
        });
        await personalLesson.save();
        await updateInstructorBookingCount(instructorId, startTime, '', 1);
        res.json({
            success: true,
            message: '개인레슨 신청이 완료되었습니다.',
            data: personalLesson
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
async function updateInstructorBookingCount(instructorId, startTime, endTime, increment) {
    try {
        const { CenterSchedule } = await Promise.resolve().then(() => __importStar(require('../models/CenterSchedule')));
        const schedules = await CenterSchedule.find({
            'instructorAvailability.instructorId': instructorId
        });
        for (const schedule of schedules) {
            const instructorIndex = schedule.instructorAvailability.findIndex((instructor) => instructor.instructorId.toString() === instructorId);
            if (instructorIndex >= 0) {
                const timeSlotIndex = schedule.instructorAvailability[instructorIndex].timeSlots.findIndex((slot) => slot.startTime === startTime && slot.endTime === endTime);
                if (timeSlotIndex >= 0) {
                    schedule.instructorAvailability[instructorIndex].timeSlots[timeSlotIndex].currentBookings += increment;
                    schedule.instructorAvailability[instructorIndex].timeSlots[timeSlotIndex].currentBookings = Math.max(0, schedule.instructorAvailability[instructorIndex].timeSlots[timeSlotIndex].currentBookings);
                    await schedule.save();
                }
            }
        }
    }
    catch (error) {
        console.error('강사별 예약 수 업데이트 실패:', error);
    }
}
router.post('/lane-rentals/request', async (req, res) => {
    try {
        const userId = req.user.id;
        const { rentalDate, startTime, endTime, laneNumbers, poolType, purpose, notes } = req.body;
        console.log('🏊 레인대여 신청:', {
            userId,
            rentalDate,
            startTime,
            endTime,
            laneNumbers,
            poolType,
            purpose
        });
        const user = await User_1.User.findById(userId);
        if (!user || !user.centerId) {
            return res.status(400).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const existingRental = await LaneRental_1.LaneRental.findOne({
            rentalDate: new Date(rentalDate),
            startTime,
            endTime,
            laneNumbers: { $in: laneNumbers },
            poolType,
            status: { $in: ['requested', 'approved', 'in_progress'] }
        });
        if (existingRental) {
            return res.status(400).json({
                success: false,
                message: '해당 시간대에 이미 레인 대여가 있습니다.'
            });
        }
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const laneRental = new LaneRental_1.LaneRental({
            renter: userId,
            centerId: user.centerId,
            rentalDate: new Date(rentalDate),
            startTime,
            endTime,
            laneNumbers,
            poolType: poolType || 'mainPool',
            purpose: purpose || 'practice',
            status: 'requested',
            notes: notes || '',
            pricing: {
                hourlyRate: 20000,
                totalHours,
                totalAmount: totalHours * 20000 * laneNumbers.length,
                finalAmount: totalHours * 20000 * laneNumbers.length
            },
            payment: {
                status: 'pending',
                paymentMethod: 'card'
            }
        });
        await laneRental.save();
        res.json({
            success: true,
            message: '레인대여 신청이 완료되었습니다.',
            data: laneRental
        });
    }
    catch (error) {
        console.error('레인대여 신청 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/my-bookings', async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, status } = req.query;
        console.log('📋 회원 예약 내역 조회:', {
            userId,
            type,
            status
        });
        let personalLessons = [];
        let laneRentals = [];
        if (!type || type === 'personal-lessons') {
            let query = { student: userId };
            if (status && status !== 'all') {
                query.status = status;
            }
            personalLessons = await PersonalLesson_1.PersonalLesson.find(query)
                .populate('instructor', 'name email phone')
                .sort({ scheduledDate: -1, startTime: -1 });
        }
        if (!type || type === 'lane-rentals') {
            let query = { renter: userId };
            if (status && status !== 'all') {
                query.status = status;
            }
            laneRentals = await LaneRental_1.LaneRental.find(query)
                .sort({ rentalDate: -1, startTime: -1 });
        }
        res.json({
            success: true,
            data: {
                personalLessons,
                laneRentals
            }
        });
    }
    catch (error) {
        console.error('회원 예약 내역 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=bookings.js.map