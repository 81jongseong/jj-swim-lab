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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const PersonalLesson_1 = require("../models/PersonalLesson");
const LaneRental_1 = require("../models/LaneRental");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const laneAllocationService_1 = require("../services/laneAllocationService");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router.use(role_1.requireInstructorOrAdmin);
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const { status, date, type } = req.query;
        let centerId = user.centerId;
        if (!centerId && user.userType === 'instructor') {
            const userDoc = await User_1.User.findById(user._id || user.id);
            centerId = userDoc?.centerId || userDoc?.instructorInfo?.assignedCenters?.[0];
        }
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const centerIdObj = typeof centerId === 'string' ? new mongoose_1.default.Types.ObjectId(centerId) : centerId;
        const personalLessonQuery = { centerId: centerIdObj };
        const laneRentalQuery = { centerId: centerIdObj };
        if (status && status !== 'all') {
            personalLessonQuery.status = status;
            laneRentalQuery.status = status;
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            personalLessonQuery.date = { $gte: startDate, $lt: endDate };
            laneRentalQuery.date = { $gte: startDate, $lt: endDate };
        }
        if (user.userType === 'instructor') {
            personalLessonQuery.instructorId = user._id || user.id;
        }
        const personalLessons = type === 'lane-rental' ? [] : await PersonalLesson_1.PersonalLesson.find({
            ...personalLessonQuery,
            startTime: { $exists: true, $nin: [null, ''] }
        })
            .populate('studentId', 'name email phone')
            .populate('instructorId', 'name email phone')
            .sort({ date: -1, startTime: 1 });
        const laneRentals = (type === 'personal-lesson' || user.userType === 'instructor') ? [] : await LaneRental_1.LaneRental.find({
            ...laneRentalQuery,
            startTime: { $exists: true, $nin: [null, ''] }
        })
            .populate('userId', 'name email phone')
            .sort({ date: -1, startTime: 1 });
        const bookings = [
            ...personalLessons.map((lesson) => ({
                _id: lesson._id,
                type: 'personal-lesson',
                student: lesson.studentId,
                instructor: lesson.instructorId,
                date: lesson.date,
                startTime: lesson.startTime || lesson.time,
                endTime: lesson.endTime,
                duration: lesson.duration,
                status: lesson.status,
                lessonType: lesson.lessonType,
                skillLevel: lesson.skillLevel,
                goals: lesson.goals,
                notes: lesson.notes,
                poolType: lesson.poolType || 'mainPool',
                laneNumber: lesson.assignedLane,
                createdAt: lesson.createdAt
            })),
            ...laneRentals.map((rental) => ({
                _id: rental._id,
                type: 'lane-rental',
                user: rental.userId,
                date: rental.date,
                startTime: rental.startTime,
                endTime: rental.endTime,
                duration: rental.duration,
                status: rental.status,
                laneNumber: rental.laneNumber,
                poolType: rental.poolType,
                purpose: rental.purpose,
                notes: rental.notes,
                price: rental.price,
                paymentStatus: rental.paymentStatus,
                createdAt: rental.createdAt
            }))
        ].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB)
                return dateB - dateA;
            return (a.startTime || '').localeCompare(b.startTime || '');
        });
        res.json({
            success: true,
            message: '예약 목록 조회 성공',
            data: {
                bookings,
                total: bookings.length,
                personalLessons: personalLessons.length,
                laneRentals: laneRentals.length
            }
        });
    }
    catch (error) {
        console.error('예약 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
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
        const query = { centerId };
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
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { status } = req.body;
        if (status === 'confirmed') {
            status = 'approved';
        }
        const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `유효하지 않은 상태 값입니다: ${status}`
            });
        }
        const personalLesson = await PersonalLesson_1.PersonalLesson.findById(id);
        if (personalLesson) {
            personalLesson.status = status;
            await personalLesson.save();
            return res.json({
                success: true,
                message: '예약 상태가 변경되었습니다.',
                data: personalLesson
            });
        }
        const laneRental = await LaneRental_1.LaneRental.findById(id);
        if (laneRental) {
            laneRental.status = status;
            await laneRental.save();
            return res.json({
                success: true,
                message: '예약 상태가 변경되었습니다.',
                data: laneRental
            });
        }
        return res.status(404).json({
            success: false,
            message: '예약을 찾을 수 없습니다.'
        });
    }
    catch (error) {
        console.error('예약 상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
router.patch('/personal-lessons/:id/status', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, instructorId, notes } = req.body;
        const currentUser = req.user;
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
            const assignedInstructorId = instructorId.toString();
            const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString() || '';
            if (assignedInstructorId === currentUserId && currentUser?.userType === 'instructor') {
                personalLesson.status = 'approved';
            }
            else {
                personalLesson.status = status;
            }
        }
        else {
            personalLesson.status = status;
        }
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
        const query = { centerId };
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
        void notes;
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
router.patch('/lane-rentals/:id/lane', async (req, res) => {
    try {
        const { id } = req.params;
        const { laneNumber } = req.body;
        const laneRental = await LaneRental_1.LaneRental.findById(id);
        if (!laneRental) {
            return res.status(404).json({ success: false, message: '레인대여를 찾을 수 없습니다.' });
        }
        const newLane = Number(laneNumber);
        if (!newLane || isNaN(newLane) || newLane <= 0) {
            return res.status(400).json({ success: false, message: '올바르지 않은 레인 번호입니다.' });
        }
        const conflict = await LaneRental_1.LaneRental.findOne({
            centerId: laneRental.centerId,
            date: laneRental.date,
            startTime: laneRental.startTime,
            endTime: laneRental.endTime,
            laneNumber: newLane,
            _id: { $ne: laneRental._id },
            status: { $in: ['pending', 'approved', 'completed'] }
        });
        if (conflict) {
            return res.status(400).json({ success: false, message: '해당 시간대에 선택한 레인이 이미 사용 중입니다.' });
        }
        laneRental.laneNumber = newLane;
        await laneRental.save();
        return res.json({ success: true, message: '레인 번호가 변경되었습니다.', data: laneRental });
    }
    catch (error) {
        console.error('레인 번호 변경 오류:', error);
        return res.status(500).json({ success: false, message: '레인 번호 변경 중 오류가 발생했습니다.' });
    }
});
router.get('/lane-rentals/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const laneRental = await LaneRental_1.LaneRental.findById(id);
        if (!laneRental) {
            return res.status(404).json({ success: false, message: '레인대여를 찾을 수 없습니다.' });
        }
        const centerId = laneRental.centerId;
        const date = laneRental.date;
        const startTime = laneRental.startTime;
        const endTime = laneRental.endTime;
        const currentLane = laneRental.laneNumber || null;
        let totalLanes = 6;
        try {
            const Center = require('../models/Center').default || require('../models/Center');
            const center = await Center.findById(centerId).select('poolInfo');
            const lanes = Number(center?.poolInfo?.lanes || 0);
            if (lanes && !Number.isNaN(lanes))
                totalLanes = lanes;
        }
        catch {
        }
        const conflicts = await LaneRental_1.LaneRental.find({
            centerId,
            date,
            startTime,
            endTime,
            status: { $in: ['pending', 'approved', 'completed'] },
            _id: { $ne: id }
        }).select('laneNumber');
        const occupied = Array.from(new Set(conflicts
            .map((c) => Number(c.laneNumber))
            .filter((n) => !!n && !Number.isNaN(n)))).sort((a, b) => a - b);
        const available = [];
        for (let i = 1; i <= totalLanes; i++) {
            if (!occupied.includes(i))
                available.push(i);
        }
        return res.json({
            success: true,
            message: '가용 레인 조회 성공',
            data: { currentLane, totalLanes, occupied, available }
        });
    }
    catch (error) {
        console.error('레인 가용 조회 오류:', error);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.get('/:id/student', async (req, res) => {
    try {
        const { id } = req.params;
        const pl = await PersonalLesson_1.PersonalLesson.findById(id).select('studentId');
        if (pl && pl.studentId) {
            return res.json({ success: true, data: { studentId: pl.studentId } });
        }
        const lr = await LaneRental_1.LaneRental.findById(id).select('userId renter');
        if (lr && lr.userId) {
            return res.json({ success: true, data: { studentId: lr.userId } });
        }
        if (lr && lr.renter) {
            return res.json({ success: true, data: { studentId: lr.renter } });
        }
        return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
    }
    catch (error) {
        console.error('예약 학생 ID 조회 오류:', error);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
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
        const endDate = new Date();
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
        const { instructorId, studentId: requestedStudentId, scheduledDate, startTime, endTime, poolType, laneNumber, lessonType, level, lessonContent, specialRequests } = req.body;
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
        if (!user) {
            return res.status(400).json({ success: false, message: '사용자 정보를 찾을 수 없습니다.' });
        }
        let applicantId = userId;
        if (requestedStudentId) {
            const student = await User_1.User.findById(requestedStudentId);
            if (!student || student.userType !== 'student') {
                return res.status(400).json({ success: false, message: '신청자(회원) 정보가 올바르지 않습니다.' });
            }
            applicantId = student._id.toString();
        }
        const applicant = await User_1.User.findById(applicantId);
        const centerId = applicant?.centerId || user.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({ success: false, message: '센터 정보를 찾을 수 없습니다.' });
        }
        let instructor = null;
        if (instructorId) {
            instructor = await User_1.User.findById(instructorId);
            if (!instructor || instructor.userType !== 'instructor') {
                return res.status(400).json({ success: false, message: '유효하지 않은 강사입니다.' });
            }
        }
        const existingQuery = {
            scheduledDate: new Date(scheduledDate),
            startTime,
            endTime,
            status: { $in: ['requested', 'accepted', 'in_progress'] }
        };
        if (instructorId)
            existingQuery.instructor = instructorId;
        const existingLesson = await PersonalLesson_1.PersonalLesson.findOne(existingQuery);
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
            studentId: applicantId,
            instructorId: instructorId || undefined,
            centerId: centerId,
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
            const query = { student: userId };
            if (status && status !== 'all') {
                query.status = status;
            }
            personalLessons = await PersonalLesson_1.PersonalLesson.find(query)
                .populate('instructor', 'name email phone')
                .sort({ scheduledDate: -1, startTime: -1 });
        }
        if (!type || type === 'lane-rentals') {
            const query = { renter: userId };
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
router.patch('/personal-lessons/:id/instructor', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { instructorId } = req.body || {};
        const currentUser = req.user;
        if (!id || !instructorId) {
            return res.status(400).json({ success: false, message: '예약 ID와 강사 ID가 필요합니다.' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(instructorId)) {
            return res.status(400).json({ success: false, message: '유효하지 않은 강사 ID입니다.' });
        }
        const lesson = await PersonalLesson_1.PersonalLesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: '개인레슨 예약을 찾을 수 없습니다.' });
        }
        lesson.instructorId = new mongoose_1.default.Types.ObjectId(instructorId);
        const assignedInstructorId = instructorId.toString();
        const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString() || '';
        if (assignedInstructorId === currentUserId && currentUser?.userType === 'instructor') {
            if (lesson.status === 'pending') {
                lesson.status = 'approved';
            }
        }
        await lesson.save();
        return res.json({ success: true, message: '강사가 배정되었습니다.', data: lesson });
    }
    catch (error) {
        console.error('개인레슨 강사 배정 오류:', error);
        return res.status(500).json({ success: false, message: '개인레슨 강사 배정 중 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=bookings.js.map