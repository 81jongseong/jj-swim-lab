"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const PersonalLesson_1 = require("../models/PersonalLesson");
const User_1 = require("../models/User");
const laneAllocationService_1 = require("../services/laneAllocationService");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, time, duration, lessonType, skillLevel, goals, notes } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user || user.userType !== 'student') {
            return res.status(400).json({
                success: false,
                message: '학생만 개인레슨을 신청할 수 있습니다.'
            });
        }
        const centerId = user.studentInfo?.centerId;
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '소속 센터가 없습니다.'
            });
        }
        const conflicts = await laneAllocationService_1.LaneAllocationService.checkLaneConflicts(date, time, centerId, duration);
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
            date: new Date(date),
            time,
            duration,
            lessonType,
            skillLevel,
            goals,
            notes,
            status: 'pending'
        });
        const adjustmentResult = await laneAllocationService_1.LaneAllocationService.adjustLanesForPersonalLesson({
            date,
            time,
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
exports.default = router;
//# sourceMappingURL=personal-lessons.js.map