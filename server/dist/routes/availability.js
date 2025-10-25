"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CenterSchedule_1 = require("../models/CenterSchedule");
const PersonalLesson_1 = require("../models/PersonalLesson");
const LaneRental_1 = require("../models/LaneRental");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router.get('/personal-lesson/availability', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { date, instructorId, poolType } = req.query;
        console.log('📅 개인레슨 가능 시간 조회:', {
            centerId,
            date,
            instructorId,
            poolType
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        if (!schedule.personalLessonSettings.isAvailable) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: '개인레슨 서비스가 비활성화되어 있습니다.',
                    timeSlots: []
                }
            });
        }
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (!schedule.personalLessonSettings.availableDays.includes(dayOfWeek)) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: '해당 요일에는 개인레슨이 불가능합니다.',
                    timeSlots: []
                }
            });
        }
        const specialSchedule = schedule.specialSchedules.find(s => {
            const scheduleDate = new Date(s.date);
            return scheduleDate.toDateString() === requestedDate.toDateString() &&
                (s.affectedServices.includes('personalLesson') || s.affectedServices.includes('all'));
        });
        if (specialSchedule && !specialSchedule.isOpen) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: specialSchedule.title || '해당 날짜에는 개인레슨이 불가능합니다.',
                    timeSlots: []
                }
            });
        }
        const existingLessons = await PersonalLesson_1.PersonalLesson.find({
            centerId,
            scheduledDate: {
                $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
            },
            status: { $in: ['requested', 'accepted', 'in_progress'] }
        });
        let availableTimeSlots = schedule.personalLessonSettings.timeSlots;
        if (instructorId) {
            const instructorSchedule = schedule.instructorAvailability.find(ia => ia.instructorId.toString() === instructorId && ia.isActive);
            if (instructorSchedule) {
                availableTimeSlots = schedule.personalLessonSettings.timeSlots.filter(slot => {
                    return instructorSchedule.timeSlots.some(instructorSlot => instructorSlot.startTime === slot.startTime &&
                        instructorSlot.endTime === slot.endTime &&
                        (!poolType || instructorSlot.poolType === poolType));
                });
            }
        }
        if (poolType) {
            availableTimeSlots = availableTimeSlots.filter(slot => slot.poolType === poolType);
        }
        const availableSlots = availableTimeSlots.map(slot => {
            const existingCount = existingLessons.filter(lesson => {
                const lessonStart = lesson.startTime;
                const lessonEnd = lesson.endTime;
                return lessonStart === slot.startTime && lessonEnd === slot.endTime;
            }).length;
            let instructorBookings = 0;
            if (instructorId) {
                instructorBookings = existingLessons.filter(lesson => lesson.instructor?.toString() === instructorId &&
                    lesson.startTime === slot.startTime &&
                    lesson.endTime === slot.endTime).length;
            }
            const isAvailable = existingCount < slot.maxLessons;
            const instructorAvailable = instructorId ? instructorBookings < slot.instructorCapacity : true;
            return {
                startTime: slot.startTime,
                endTime: slot.endTime,
                poolType: slot.poolType,
                maxLessons: slot.maxLessons,
                instructorCapacity: slot.instructorCapacity,
                availableLessons: slot.maxLessons - existingCount,
                instructorAvailableCapacity: instructorId ? slot.instructorCapacity - instructorBookings : slot.instructorCapacity,
                isAvailable: isAvailable && instructorAvailable,
                existingBookings: existingCount,
                instructorBookings: instructorBookings
            };
        });
        res.json({
            success: true,
            data: {
                available: true,
                date: requestedDate.toISOString().split('T')[0],
                dayOfWeek,
                timeSlots: availableSlots,
                settings: {
                    advanceBookingDays: schedule.personalLessonSettings.advanceBookingDays,
                    cancellationHours: schedule.personalLessonSettings.cancellationHours,
                    lessonDuration: schedule.personalLessonSettings.lessonDuration,
                    bufferTime: schedule.personalLessonSettings.bufferTime
                }
            }
        });
    }
    catch (error) {
        console.error('개인레슨 가능 시간 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/lane-rental/availability', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { date, poolType, duration } = req.query;
        console.log('🏊 레인대여 가능 시간 조회:', {
            centerId,
            date,
            poolType,
            duration
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        if (!schedule.laneRentalSettings.isAvailable) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: '레인대여 서비스가 비활성화되어 있습니다.',
                    lanes: []
                }
            });
        }
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (!schedule.laneRentalSettings.availableDays.includes(dayOfWeek)) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: '해당 요일에는 레인대여가 불가능합니다.',
                    lanes: []
                }
            });
        }
        const specialSchedule = schedule.specialSchedules.find(s => {
            const scheduleDate = new Date(s.date);
            return scheduleDate.toDateString() === requestedDate.toDateString() &&
                (s.affectedServices.includes('laneRental') || s.affectedServices.includes('all'));
        });
        if (specialSchedule && !specialSchedule.isOpen) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: specialSchedule.title || '해당 날짜에는 레인대여가 불가능합니다.',
                    lanes: []
                }
            });
        }
        const existingRentals = await LaneRental_1.LaneRental.find({
            centerId,
            rentalDate: {
                $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
            },
            status: { $in: ['requested', 'approved', 'in_progress'] }
        });
        const poolTypes = poolType ? [poolType] : ['mainPool', 'kidsPool', 'auxiliaryPool'];
        const laneAvailability = [];
        for (const pType of poolTypes) {
            const poolLanes = schedule.laneAvailability.filter(la => la.poolType === pType);
            for (const lane of poolLanes) {
                const laneRentals = existingRentals.filter(rental => rental.poolType === pType &&
                    rental.laneNumbers.includes(lane.laneNumber));
                const timeSlots = schedule.laneRentalSettings.timeSlots
                    .filter(slot => slot.poolType === pType)
                    .map(slot => {
                    const slotRentals = laneRentals.filter(rental => rental.startTime === slot.startTime &&
                        rental.endTime === slot.endTime);
                    const isAvailable = slotRentals.length < slot.maxRentals;
                    const availableRentals = slot.maxRentals - slotRentals.length;
                    return {
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        isAvailable,
                        availableRentals,
                        existingRentals: slotRentals.length,
                        maxRentals: slot.maxRentals
                    };
                });
                laneAvailability.push({
                    poolType: pType,
                    laneNumber: lane.laneNumber,
                    isAvailable: lane.isAvailable,
                    timeSlots,
                    maintenanceSchedule: lane.maintenanceSchedule,
                    restrictions: lane.restrictions
                });
            }
        }
        res.json({
            success: true,
            data: {
                available: true,
                date: requestedDate.toISOString().split('T')[0],
                dayOfWeek,
                lanes: laneAvailability,
                settings: {
                    advanceBookingDays: schedule.laneRentalSettings.advanceBookingDays,
                    cancellationHours: schedule.laneRentalSettings.cancellationHours,
                    minRentalDuration: schedule.laneRentalSettings.minRentalDuration,
                    maxRentalDuration: schedule.laneRentalSettings.maxRentalDuration,
                    bufferTime: schedule.laneRentalSettings.bufferTime
                }
            }
        });
    }
    catch (error) {
        console.error('레인대여 가능 시간 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructor/:instructorId/availability', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { instructorId } = req.params;
        const { date } = req.query;
        console.log('👨‍🏫 강사 가능 시간 조회:', {
            centerId,
            instructorId,
            date
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const instructor = await User_1.User.findById(instructorId);
        if (!instructor || instructor.userType !== 'instructor') {
            return res.status(404).json({
                success: false,
                message: '강사를 찾을 수 없습니다.'
            });
        }
        const instructorSchedule = schedule.instructorAvailability.find(ia => ia.instructorId.toString() === instructorId && ia.isActive);
        if (!instructorSchedule) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: '해당 강사의 스케줄이 설정되지 않았습니다.',
                    timeSlots: []
                }
            });
        }
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (!instructorSchedule.availableDays.includes(dayOfWeek)) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: '해당 요일에는 강사가 불가능합니다.',
                    timeSlots: []
                }
            });
        }
        const existingLessons = await PersonalLesson_1.PersonalLesson.find({
            centerId,
            instructor: instructorId,
            scheduledDate: {
                $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
            },
            status: { $in: ['requested', 'accepted', 'in_progress'] }
        });
        const availableSlots = instructorSchedule.timeSlots.map(slot => {
            const existingCount = existingLessons.filter(lesson => lesson.startTime === slot.startTime &&
                lesson.endTime === slot.endTime).length;
            const isAvailable = existingCount < slot.maxStudents;
            const availableCapacity = slot.maxStudents - existingCount;
            return {
                startTime: slot.startTime,
                endTime: slot.endTime,
                poolType: slot.poolType,
                maxStudents: slot.maxStudents,
                availableCapacity,
                isAvailable,
                existingBookings: existingCount,
                lessonTypes: slot.lessonTypes
            };
        });
        res.json({
            success: true,
            data: {
                available: true,
                instructor: {
                    id: instructor._id,
                    name: instructor.name,
                    email: instructor.email
                },
                date: requestedDate.toISOString().split('T')[0],
                dayOfWeek,
                timeSlots: availableSlots
            }
        });
    }
    catch (error) {
        console.error('강사 가능 시간 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=availability.js.map