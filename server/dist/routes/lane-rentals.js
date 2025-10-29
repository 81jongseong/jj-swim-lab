"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const LaneRental_1 = require("../models/LaneRental");
const User_1 = require("../models/User");
const laneAllocationService_1 = require("../services/laneAllocationService");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, startTime, endTime, duration, laneNumber, purpose, notes } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        const centerId = user.centerId || user.instructorInfo?.assignedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '소속 센터가 없습니다.'
            });
        }
        const conflicts = await laneAllocationService_1.LaneAllocationService.checkLaneConflicts(date, startTime, centerId?.toString() || '', duration);
        const laneConflicts = conflicts.filter(conflict => conflict.lanes.includes(laneNumber));
        if (laneConflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: '해당 레인은 이미 사용 중입니다.',
                conflicts: laneConflicts
            });
        }
        const laneRental = new LaneRental_1.LaneRental({
            userId,
            centerId: centerId,
            date: new Date(date),
            startTime,
            endTime,
            duration,
            laneNumber,
            purpose,
            notes,
            status: 'pending'
        });
        await laneRental.save();
        res.status(201).json({
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
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;
        const query = { userId };
        if (status && status !== 'all') {
            query.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const laneRentals = await LaneRental_1.LaneRental.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await LaneRental_1.LaneRental.countDocuments(query);
        res.json({
            success: true,
            message: '레인대여 목록 조회 성공',
            data: {
                laneRentals,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: laneRentals.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('레인대여 목록 조회 실패:', error);
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
        const laneRental = await LaneRental_1.LaneRental.findOne({
            _id: id,
            userId
        });
        if (!laneRental) {
            return res.status(404).json({
                success: false,
                message: '레인대여를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '레인대여 상세 조회 성공',
            data: laneRental
        });
    }
    catch (error) {
        console.error('레인대여 상세 조회 실패:', error);
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
        const laneRental = await LaneRental_1.LaneRental.findOne({
            _id: id,
            userId
        });
        if (!laneRental) {
            return res.status(404).json({
                success: false,
                message: '레인대여를 찾을 수 없습니다.'
            });
        }
        if (laneRental.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: '완료된 대여는 취소할 수 없습니다.'
            });
        }
        await LaneRental_1.LaneRental.findByIdAndUpdate(id, {
            status: 'cancelled'
        });
        res.json({
            success: true,
            message: '레인대여가 취소되었습니다.'
        });
    }
    catch (error) {
        console.error('레인대여 취소 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/availability/:date/:time', auth_1.authMiddleware, async (req, res) => {
    try {
        const { date, time } = req.params;
        const { duration = 60 } = req.query;
        const user = await User_1.User.findById(req.user._id);
        const centerId = user?.centerId || user?.instructorInfo?.assignedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '소속 센터가 없습니다.'
            });
        }
        const availability = await laneAllocationService_1.LaneAllocationService.findAvailableLanes(date, time, centerId?.toString() || '', Number(duration));
        res.json({
            success: true,
            message: '사용 가능한 레인 조회 성공',
            data: availability
        });
    }
    catch (error) {
        console.error('사용 가능한 레인 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=lane-rentals.js.map