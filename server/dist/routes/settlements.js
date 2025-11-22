"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Settlement_1 = require("../models/Settlement");
const settlementService_1 = require("../services/settlementService");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { recipientType, recipientId, status, periodType, startDate, endDate, page = 1, limit = 20 } = req.query;
        const user = req.user;
        const query = {};
        if (user.userType === 'instructor') {
            query.recipientType = 'instructor';
            query.recipientId = user._id;
        }
        else if (user.userType === 'centerAdmin') {
            query.recipientType = 'center';
            const userDoc = await require('mongoose').model('User').findById(user._id);
            const centerId = userDoc?.centerAdminInfo?.managedCenters?.[0];
            if (centerId) {
                query.recipientId = centerId;
            }
        }
        if (recipientType)
            query.recipientType = recipientType;
        if (recipientId)
            query.recipientId = recipientId;
        if (status)
            query.status = status;
        if (periodType)
            query.periodType = periodType;
        if (startDate || endDate) {
            query.periodStart = {};
            if (startDate)
                query.periodStart.$gte = new Date(startDate);
            if (endDate)
                query.periodStart.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const settlements = await Settlement_1.Settlement.find(query)
            .populate('recipientId', 'name email')
            .populate('processedBy', 'name email')
            .sort({ periodStart: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Settlement_1.Settlement.countDocuments(query);
        res.json({
            success: true,
            message: '정산 목록 조회 성공',
            data: {
                settlements,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: settlements.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('정산 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const settlement = await Settlement_1.Settlement.findById(id)
            .populate('recipientId', 'name email phone')
            .populate('processedBy', 'name email')
            .populate('items.personalLessonId')
            .populate('items.paymentId');
        if (!settlement) {
            return res.status(404).json({
                success: false,
                message: '정산 내역을 찾을 수 없습니다.'
            });
        }
        if (user.userType === 'instructor' && settlement.recipientType === 'instructor') {
            if (settlement.recipientId.toString() !== user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '본인의 정산 내역만 조회할 수 있습니다.'
                });
            }
        }
        res.json({
            success: true,
            message: '정산 상세 조회 성공',
            data: settlement
        });
    }
    catch (error) {
        (0, logger_1.logError)('정산 상세 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, async (req, res) => {
    try {
        const { recipientType, recipientId, startDate, endDate } = req.query;
        const user = req.user;
        let finalRecipientType = recipientType;
        let finalRecipientId = recipientId;
        if (user.userType === 'instructor') {
            finalRecipientType = 'instructor';
            finalRecipientId = user._id.toString();
        }
        else if (user.userType === 'centerAdmin') {
            finalRecipientType = 'center';
            const userDoc = await require('mongoose').model('User').findById(user._id);
            const centerId = userDoc?.centerAdminInfo?.managedCenters?.[0];
            if (centerId) {
                finalRecipientId = centerId.toString();
            }
        }
        const stats = await (0, settlementService_1.getSettlementStats)(finalRecipientType, finalRecipientId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json({
            success: true,
            message: '정산 통계 조회 성공',
            data: stats
        });
    }
    catch (error) {
        (0, logger_1.logError)('정산 통계 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/process', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const { periodStart, periodEnd } = req.body;
        if (!periodStart || !periodEnd) {
            return res.status(400).json({
                success: false,
                message: '정산 기간을 입력해주세요.'
            });
        }
        const result = await (0, settlementService_1.processSettlements)(new Date(periodStart), new Date(periodEnd));
        res.json({
            success: true,
            message: '정산 처리가 완료되었습니다.',
            data: result
        });
    }
    catch (error) {
        (0, logger_1.logError)('정산 처리 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=settlements.js.map