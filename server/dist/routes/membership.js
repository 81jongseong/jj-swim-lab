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
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const logger_1 = require("../utils/logger");
const Membership_1 = require("../models/Membership");
const router = express.Router();
router.get('/', auth_1.authMiddleware, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        const memberships = await Membership_1.UserMembership.find(filter)
            .populate('userId', 'name email phone')
            .populate('planId', 'name description')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Membership_1.UserMembership.countDocuments(filter);
        res.json({
            memberships,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 목록 조회 실패', error);
        res.status(500).json({ error: '멤버십 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const membership = await Membership_1.UserMembership.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('planId', 'name description');
        if (!membership) {
            return res.status(404).json({ error: '멤버십을 찾을 수 없습니다.' });
        }
        res.json(membership);
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 상세 조회 실패', error);
        return res.status(500).json({ error: '멤버십 정보를 불러오는데 실패했습니다.' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId, centerId, type, startDate, endDate, price, status = 'active' } = req.body;
        void type;
        const membership = new Membership_1.UserMembership({
            userId,
            planId: req.body.planId,
            startDate,
            endDate,
            status,
            totalPaid: price
        });
        await membership.save();
        (0, logger_1.logInfo)('멤버십 생성', { membershipId: membership._id, userId, centerId });
        res.status(201).json(membership);
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 생성 실패', error);
        return res.status(500).json({ error: '멤버십 생성에 실패했습니다.' });
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { type, startDate, endDate, price, status } = req.body;
        void type;
        void price;
        const membership = await Membership_1.UserMembership.findByIdAndUpdate(req.params.id, { startDate, endDate, status }, { new: true });
        if (!membership) {
            return res.status(404).json({ error: '멤버십을 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('멤버십 수정', { membershipId: membership._id });
        res.json(membership);
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 수정 실패', error);
        return res.status(500).json({ error: '멤버십 수정에 실패했습니다.' });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const membership = await Membership_1.UserMembership.findByIdAndDelete(req.params.id);
        if (!membership) {
            return res.status(404).json({ error: '멤버십을 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('멤버십 삭제', { membershipId: req.params.id });
        res.json({ message: '멤버십이 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 삭제 실패', error);
        return res.status(500).json({ error: '멤버십 삭제에 실패했습니다.' });
    }
});
router.get('/plans/list', auth_1.authMiddleware, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const plans = await Membership_1.MembershipPlan.find({ isActive: true }).sort({ price: 1 });
        res.json({ plans });
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 플랜 조회 실패', error);
        res.status(500).json({ error: '멤버십 플랜을 불러오는데 실패했습니다.' });
    }
});
router.post('/plans', auth_1.authMiddleware, async (req, res) => {
    try {
        const { name, description, price, duration, features, maxClassesPerMonth, maxVideoUploads, prioritySupport } = req.body;
        const plan = new Membership_1.MembershipPlan({
            name,
            description,
            price,
            duration,
            features,
            maxClassesPerMonth,
            maxVideoUploads,
            prioritySupport
        });
        await plan.save();
        (0, logger_1.logInfo)('멤버십 플랜 생성', { planId: plan._id, name });
        res.status(201).json(plan);
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 플랜 생성 실패', error);
        res.status(500).json({ error: '멤버십 플랜 생성에 실패했습니다.' });
    }
});
router.get('/payments', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const payments = await Membership_1.MembershipPayment.find()
            .populate('userId', 'name email')
            .populate('membershipId', 'planId')
            .skip(skip)
            .limit(Number(limit))
            .sort({ paymentDate: -1 });
        const total = await Membership_1.MembershipPayment.countDocuments();
        res.json({
            payments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 결제 내역 조회 실패', error);
        res.status(500).json({ error: '결제 내역을 불러오는데 실패했습니다.' });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, (0, cache_1.cache)({ ttl: 600 }), async (req, res) => {
    try {
        const totalMemberships = await Membership_1.UserMembership.countDocuments();
        const activeMemberships = await Membership_1.UserMembership.countDocuments({ status: 'active' });
        const expiredMemberships = await Membership_1.UserMembership.countDocuments({
            endDate: { $lt: new Date() }
        });
        const monthlyRevenue = await Membership_1.UserMembership.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price' }
                }
            }
        ]);
        res.json({
            total: totalMemberships,
            active: activeMemberships,
            expired: expiredMemberships,
            monthlyRevenue: monthlyRevenue[0]?.total || 0
        });
    }
    catch (error) {
        (0, logger_1.logError)('멤버십 통계 조회 실패', error);
        res.status(500).json({ error: '멤버십 통계를 불러오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=membership.js.map