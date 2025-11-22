"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CenterSchedule_1 = require("../models/CenterSchedule");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router.use(role_1.requireCenterAdmin);
router.get('/', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        console.log('📅 센터 스케줄 조회:', { centerId });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId })
            .populate('instructorAvailability.instructorId', 'name email phone instructorInfo')
            .populate('updatedBy', 'name email');
        if (!schedule) {
            const defaultSchedule = new CenterSchedule_1.CenterSchedule({
                centerId,
                operatingHours: {
                    weekdays: { isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
                    weekends: { isOpen: true, openTime: '08:00', closeTime: '20:00', breaks: [] },
                    holidays: { isOpen: false, openTime: '09:00', closeTime: '18:00', breaks: [] }
                },
                personalLessonSettings: {
                    isAvailable: true,
                    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    timeSlots: [
                        { startTime: '09:00', endTime: '10:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '10:00', endTime: '11:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '11:00', endTime: '12:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '14:00', endTime: '15:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '15:00', endTime: '16:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '16:00', endTime: '17:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '17:00', endTime: '18:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '18:00', endTime: '19:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
                        { startTime: '19:00', endTime: '20:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' }
                    ],
                    advanceBookingDays: 7,
                    cancellationHours: 24,
                    lessonDuration: 60,
                    bufferTime: 15
                },
                laneRentalSettings: {
                    isAvailable: true,
                    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    timeSlots: [
                        { startTime: '06:00', endTime: '08:00', maxRentals: 1, poolType: 'mainPool' },
                        { startTime: '08:00', endTime: '10:00', maxRentals: 1, poolType: 'mainPool' },
                        { startTime: '10:00', endTime: '12:00', maxRentals: 1, poolType: 'mainPool' },
                        { startTime: '12:00', endTime: '14:00', maxRentals: 1, poolType: 'mainPool' },
                        { startTime: '14:00', endTime: '16:00', maxRentals: 1, poolType: 'mainPool' },
                        { startTime: '16:00', endTime: '18:00', maxRentals: 1, poolType: 'mainPool' },
                        { startTime: '18:00', endTime: '20:00', maxRentals: 1, poolType: 'mainPool' },
                        { startTime: '20:00', endTime: '22:00', maxRentals: 1, poolType: 'mainPool' }
                    ],
                    advanceBookingDays: 14,
                    cancellationHours: 48,
                    minRentalDuration: 60,
                    maxRentalDuration: 240,
                    bufferTime: 30
                },
                instructorAvailability: [],
                laneAvailability: [
                    { poolType: 'mainPool', laneNumber: 1, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
                    { poolType: 'mainPool', laneNumber: 2, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
                    { poolType: 'mainPool', laneNumber: 3, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
                    { poolType: 'mainPool', laneNumber: 4, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
                    { poolType: 'mainPool', laneNumber: 5, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
                    { poolType: 'mainPool', laneNumber: 6, isAvailable: true, maintenanceSchedule: [], restrictions: [] }
                ],
                specialSchedules: [],
                settings: {
                    timeZone: 'Asia/Seoul',
                    currency: 'KRW',
                    language: 'ko',
                    autoConfirm: false,
                    requireApproval: true,
                    maxConcurrentBookings: 10,
                    notificationSettings: {
                        emailNotifications: true,
                        smsNotifications: false,
                        reminderHours: 24
                    }
                },
                updatedBy: req.user.id
            });
            await defaultSchedule.save();
            res.json({
                success: true,
                data: defaultSchedule
            });
        }
        else {
            res.json({
                success: true,
                data: schedule
            });
        }
    }
    catch (error) {
        (0, logger_1.logError)('센터 스케줄 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const updateData = req.body;
        console.log('📅 센터 스케줄 업데이트:', {
            centerId,
            updateData: Object.keys(updateData)
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOneAndUpdate({ centerId }, {
            ...updateData,
            lastUpdated: new Date(),
            updatedBy: req.user.id
        }, { new: true, upsert: true });
        res.json({
            success: true,
            message: '센터 스케줄이 업데이트되었습니다.',
            data: schedule
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 스케줄 업데이트 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/operating-hours', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { weekdays, weekends, holidays } = req.body;
        console.log('🕐 운영 시간 설정:', {
            centerId,
            weekdays,
            weekends,
            holidays
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOneAndUpdate({ centerId }, {
            $set: {
                'operatingHours.weekdays': weekdays,
                'operatingHours.weekends': weekends,
                'operatingHours.holidays': holidays,
                lastUpdated: new Date(),
                updatedBy: req.user.id
            }
        }, { new: true, upsert: true });
        res.json({
            success: true,
            message: '운영 시간이 설정되었습니다.',
            data: schedule.operatingHours
        });
    }
    catch (error) {
        (0, logger_1.logError)('운영 시간 설정 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/personal-lesson', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const personalLessonSettings = req.body;
        console.log('🏊 개인레슨 설정:', {
            centerId,
            settings: Object.keys(personalLessonSettings)
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOneAndUpdate({ centerId }, {
            $set: {
                personalLessonSettings,
                lastUpdated: new Date(),
                updatedBy: req.user.id
            }
        }, { new: true, upsert: true });
        res.json({
            success: true,
            message: '개인레슨 설정이 업데이트되었습니다.',
            data: schedule.personalLessonSettings
        });
    }
    catch (error) {
        (0, logger_1.logError)('개인레슨 설정 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/lane-rental', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const laneRentalSettings = req.body;
        console.log('🏊‍♀️ 레인대여 설정:', {
            centerId,
            settings: Object.keys(laneRentalSettings)
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOneAndUpdate({ centerId }, {
            $set: {
                laneRentalSettings,
                lastUpdated: new Date(),
                updatedBy: req.user.id
            }
        }, { new: true, upsert: true });
        res.json({
            success: true,
            message: '레인대여 설정이 업데이트되었습니다.',
            data: schedule.laneRentalSettings
        });
    }
    catch (error) {
        (0, logger_1.logError)('레인대여 설정 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/instructor/:instructorId/availability', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { instructorId } = req.params;
        const availabilityData = req.body;
        console.log('👨‍🏫 강사 가능 시간 설정:', {
            centerId,
            instructorId,
            availabilityData
        });
        const instructor = await User_1.User.findById(instructorId);
        if (!instructor || instructor.userType !== 'instructor') {
            return res.status(404).json({
                success: false,
                message: '강사를 찾을 수 없습니다.'
            });
        }
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const instructorIndex = schedule.instructorAvailability.findIndex(ia => ia.instructorId.toString() === instructorId);
        const instructorAvailability = {
            instructorId,
            ...availabilityData,
            isActive: true
        };
        if (instructorIndex >= 0) {
            schedule.instructorAvailability[instructorIndex] = instructorAvailability;
        }
        else {
            schedule.instructorAvailability.push(instructorAvailability);
        }
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '강사 가능 시간이 설정되었습니다.',
            data: instructorAvailability
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 가능 시간 설정 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/lane-availability', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const laneAvailability = req.body;
        console.log('🏊 레인 사용 가능 상태 설정:', {
            centerId,
            laneCount: laneAvailability.length
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOneAndUpdate({ centerId }, {
            $set: {
                laneAvailability,
                lastUpdated: new Date(),
                updatedBy: req.user.id
            }
        }, { new: true, upsert: true });
        res.json({
            success: true,
            message: '레인 사용 가능 상태가 설정되었습니다.',
            data: schedule.laneAvailability
        });
    }
    catch (error) {
        (0, logger_1.logError)('레인 사용 가능 상태 설정 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/special-schedule', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const specialSchedule = req.body;
        console.log('📅 특별 일정 추가:', {
            centerId,
            specialSchedule
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOneAndUpdate({ centerId }, {
            $push: {
                specialSchedules: specialSchedule
            },
            $set: {
                lastUpdated: new Date(),
                updatedBy: req.user.id
            }
        }, { new: true, upsert: true });
        res.json({
            success: true,
            message: '특별 일정이 추가되었습니다.',
            data: schedule.specialSchedules
        });
    }
    catch (error) {
        (0, logger_1.logError)('특별 일정 추가 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.delete('/special-schedule/:scheduleId', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { scheduleId } = req.params;
        console.log('🗑️ 특별 일정 삭제:', {
            centerId,
            scheduleId
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOneAndUpdate({ centerId }, {
            $pull: {
                specialSchedules: { _id: scheduleId }
            },
            $set: {
                lastUpdated: new Date(),
                updatedBy: req.user.id
            }
        }, { new: true });
        res.json({
            success: true,
            message: '특별 일정이 삭제되었습니다.',
            data: schedule.specialSchedules
        });
    }
    catch (error) {
        (0, logger_1.logError)('특별 일정 삭제 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/personal-lesson/time-slots', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { startTime, endTime, poolType, maxLessons, instructorCapacity, price, notes } = req.body;
        console.log('⏰ 개인레슨 시간 슬롯 생성:', {
            centerId,
            startTime,
            endTime,
            poolType,
            maxLessons,
            instructorCapacity
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const existingSlot = schedule.personalLessonSettings.timeSlots.find(slot => slot.startTime === startTime && slot.endTime === endTime && slot.poolType === poolType);
        if (existingSlot) {
            return res.status(400).json({
                success: false,
                message: '이미 존재하는 시간 슬롯입니다.'
            });
        }
        schedule.personalLessonSettings.timeSlots.push({
            startTime,
            endTime,
            isActive: true,
            maxLessons: maxLessons || 1,
            instructorCapacity: instructorCapacity || 1,
            poolType: poolType || 'mainPool',
            price: price || 0,
            notes: notes || ''
        });
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '개인레슨 시간 슬롯이 생성되었습니다.',
            data: schedule.personalLessonSettings.timeSlots
        });
    }
    catch (error) {
        (0, logger_1.logError)('개인레슨 시간 슬롯 생성 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/personal-lesson/time-slots/:slotIndex', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { slotIndex } = req.params;
        const updateData = req.body;
        console.log('⏰ 개인레슨 시간 슬롯 업데이트:', {
            centerId,
            slotIndex,
            updateData
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const slotIdx = parseInt(slotIndex);
        if (slotIdx < 0 || slotIdx >= schedule.personalLessonSettings.timeSlots.length) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 시간 슬롯 인덱스입니다.'
            });
        }
        Object.assign(schedule.personalLessonSettings.timeSlots[slotIdx], updateData);
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '개인레슨 시간 슬롯이 업데이트되었습니다.',
            data: schedule.personalLessonSettings.timeSlots[slotIdx]
        });
    }
    catch (error) {
        (0, logger_1.logError)('개인레슨 시간 슬롯 업데이트 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.delete('/personal-lesson/time-slots/:slotIndex', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { slotIndex } = req.params;
        console.log('🗑️ 개인레슨 시간 슬롯 삭제:', {
            centerId,
            slotIndex
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const slotIdx = parseInt(slotIndex);
        if (slotIdx < 0 || slotIdx >= schedule.personalLessonSettings.timeSlots.length) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 시간 슬롯 인덱스입니다.'
            });
        }
        schedule.personalLessonSettings.timeSlots.splice(slotIdx, 1);
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '개인레슨 시간 슬롯이 삭제되었습니다.',
            data: schedule.personalLessonSettings.timeSlots
        });
    }
    catch (error) {
        (0, logger_1.logError)('개인레슨 시간 슬롯 삭제 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/lane-rental/time-slots', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { startTime, endTime, poolType, maxRentals, hourlyRate, notes } = req.body;
        console.log('🏊 레인대여 시간 슬롯 생성:', {
            centerId,
            startTime,
            endTime,
            poolType,
            maxRentals,
            hourlyRate
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const existingSlot = schedule.laneRentalSettings.timeSlots.find(slot => slot.startTime === startTime && slot.endTime === endTime && slot.poolType === poolType);
        if (existingSlot) {
            return res.status(400).json({
                success: false,
                message: '이미 존재하는 시간 슬롯입니다.'
            });
        }
        schedule.laneRentalSettings.timeSlots.push({
            startTime,
            endTime,
            isActive: true,
            maxRentals: maxRentals || 1,
            poolType: poolType || 'mainPool',
            hourlyRate: hourlyRate || 0,
            notes: notes || ''
        });
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '레인대여 시간 슬롯이 생성되었습니다.',
            data: schedule.laneRentalSettings.timeSlots
        });
    }
    catch (error) {
        (0, logger_1.logError)('레인대여 시간 슬롯 생성 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/lane-rental/time-slots/:slotIndex', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { slotIndex } = req.params;
        const updateData = req.body;
        console.log('🏊 레인대여 시간 슬롯 업데이트:', {
            centerId,
            slotIndex,
            updateData
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const slotIdx = parseInt(slotIndex);
        if (slotIdx < 0 || slotIdx >= schedule.laneRentalSettings.timeSlots.length) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 시간 슬롯 인덱스입니다.'
            });
        }
        Object.assign(schedule.laneRentalSettings.timeSlots[slotIdx], updateData);
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '레인대여 시간 슬롯이 업데이트되었습니다.',
            data: schedule.laneRentalSettings.timeSlots[slotIdx]
        });
    }
    catch (error) {
        (0, logger_1.logError)('레인대여 시간 슬롯 업데이트 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.delete('/lane-rental/time-slots/:slotIndex', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { slotIndex } = req.params;
        console.log('🗑️ 레인대여 시간 슬롯 삭제:', {
            centerId,
            slotIndex
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const slotIdx = parseInt(slotIndex);
        if (slotIdx < 0 || slotIdx >= schedule.laneRentalSettings.timeSlots.length) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 시간 슬롯 인덱스입니다.'
            });
        }
        schedule.laneRentalSettings.timeSlots.splice(slotIdx, 1);
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '레인대여 시간 슬롯이 삭제되었습니다.',
            data: schedule.laneRentalSettings.timeSlots
        });
    }
    catch (error) {
        (0, logger_1.logError)('레인대여 시간 슬롯 삭제 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructor-availability', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: schedule.instructorAvailability || []
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 가능 시간 조회 실패', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/instructor-availability', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { instructorId, instructorName, instructorType, timeSlots, availableDays } = req.body;
        console.log('👨‍🏫 강사별 가능 시간 설정:', {
            centerId,
            instructorId,
            instructorName,
            instructorType,
            timeSlotsCount: timeSlots?.length || 0
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const existingInstructorIndex = schedule.instructorAvailability.findIndex((instructor) => instructor.instructorId.toString() === instructorId);
        const instructorData = {
            instructorId,
            instructorName,
            instructorType: instructorType || 'instructor',
            availableDays: availableDays || [],
            timeSlots: timeSlots || [],
            isActive: true,
            lastUpdated: new Date()
        };
        if (existingInstructorIndex >= 0) {
            schedule.instructorAvailability[existingInstructorIndex] = instructorData;
        }
        else {
            schedule.instructorAvailability.push(instructorData);
        }
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '강사별 가능 시간이 설정되었습니다.',
            data: instructorData
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 가능 시간 설정 실패', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.delete('/instructor-availability/:instructorId', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { instructorId } = req.params;
        console.log('🗑️ 강사별 가능 시간 삭제:', {
            centerId,
            instructorId
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        schedule.instructorAvailability = schedule.instructorAvailability.filter((instructor) => instructor.instructorId.toString() !== instructorId);
        schedule.lastUpdated = new Date();
        schedule.updatedBy = req.user.id;
        await schedule.save();
        res.json({
            success: true,
            message: '강사별 가능 시간이 삭제되었습니다.',
            data: schedule.instructorAvailability
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 가능 시간 삭제 실패', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/available-instructors', async (req, res) => {
    try {
        const centerId = req.user.centerId;
        const { date, startTime, endTime, poolType, lessonType, skillLevel } = req.query;
        console.log('🔍 가능한 강사 조회:', {
            centerId,
            date,
            startTime,
            endTime,
            poolType,
            lessonType,
            skillLevel
        });
        const schedule = await CenterSchedule_1.CenterSchedule.findOne({ centerId });
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '센터 스케줄을 찾을 수 없습니다.'
            });
        }
        const availableInstructors = schedule.instructorAvailability.filter((instructor) => {
            if (!instructor.isActive)
                return false;
            return instructor.timeSlots.some((slot) => {
                if (!slot.isActive)
                    return false;
                if (slot.startTime !== startTime || slot.endTime !== endTime)
                    return false;
                if (poolType && slot.poolType !== poolType)
                    return false;
                if (lessonType && !slot.lessonTypes.includes(lessonType))
                    return false;
                if (skillLevel && !slot.skillLevels.includes(skillLevel))
                    return false;
                if (slot.currentBookings >= slot.maxStudents)
                    return false;
                return true;
            });
        });
        res.json({
            success: true,
            data: availableInstructors.map((instructor) => ({
                instructorId: instructor.instructorId,
                instructorName: instructor.instructorName,
                instructorType: instructor.instructorType,
                availableSlots: instructor.timeSlots.filter((slot) => slot.startTime === startTime && slot.endTime === endTime && slot.isActive)
            }))
        });
    }
    catch (error) {
        (0, logger_1.logError)('가능한 강사 조회 실패', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-schedule.js.map