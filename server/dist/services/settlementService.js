"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSettlementItem = createSettlementItem;
exports.processSettlements = processSettlements;
exports.getSettlementStats = getSettlementStats;
const mongoose_1 = __importDefault(require("mongoose"));
const Settlement_1 = require("../models/Settlement");
const PersonalLesson_1 = require("../models/PersonalLesson");
const Payment_1 = require("../models/Payment");
async function createSettlementItem(personalLessonId) {
    try {
        const personalLesson = await PersonalLesson_1.PersonalLesson.findById(personalLessonId)
            .populate('instructorId')
            .populate('centerId')
            .populate('paymentId');
        if (!personalLesson || personalLesson.paymentStatus !== 'completed') {
            return;
        }
        const payment = await Payment_1.Payment.findById(personalLesson.paymentId);
        if (!payment || payment.status !== 'completed') {
            return;
        }
        if (personalLesson.instructorId && personalLesson.isExternalInstructor) {
            const instructorAmount = (personalLesson.instructorFee || 0) - (personalLesson.platformFee || 0);
            if (instructorAmount > 0) {
                const periodStart = new Date(personalLesson.date);
                periodStart.setDate(1);
                const periodEnd = new Date(periodStart);
                periodEnd.setMonth(periodEnd.getMonth() + 1);
                let settlement = await Settlement_1.Settlement.findOne({
                    recipientType: 'instructor',
                    recipientId: personalLesson.instructorId,
                    periodType: 'monthly',
                    periodStart: periodStart,
                    status: 'pending'
                });
                if (!settlement) {
                    settlement = new Settlement_1.Settlement({
                        recipientType: 'instructor',
                        recipientId: personalLesson.instructorId,
                        recipientTypeModel: 'User',
                        periodType: 'monthly',
                        periodStart: periodStart,
                        periodEnd: periodEnd,
                        totalAmount: 0,
                        items: [],
                        breakdown: {
                            netAmount: 0
                        },
                        status: 'pending'
                    });
                }
                settlement.items.push({
                    personalLessonId: personalLesson._id,
                    paymentId: payment._id,
                    amount: instructorAmount,
                    description: `개인레슨 수업료 (${personalLesson.date.toLocaleDateString('ko-KR')})`,
                    date: personalLesson.date
                });
                settlement.totalAmount += instructorAmount;
                settlement.breakdown.instructorFee = (settlement.breakdown.instructorFee || 0) + (personalLesson.instructorFee || 0);
                settlement.breakdown.platformFee = (settlement.breakdown.platformFee || 0) + (personalLesson.platformFee || 0);
                settlement.breakdown.deductedAmount = (settlement.breakdown.deductedAmount || 0) + (personalLesson.platformFee || 0);
                settlement.breakdown.netAmount = settlement.totalAmount;
                await settlement.save();
            }
        }
        if (personalLesson.laneRentalFee && personalLesson.laneRentalFee > 0) {
            const periodStart = new Date(personalLesson.date);
            periodStart.setDate(1);
            const periodEnd = new Date(periodStart);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            let settlement = await Settlement_1.Settlement.findOne({
                recipientType: 'center',
                recipientId: personalLesson.centerId,
                periodType: 'monthly',
                periodStart: periodStart,
                status: 'pending'
            });
            if (!settlement) {
                settlement = new Settlement_1.Settlement({
                    recipientType: 'center',
                    recipientId: personalLesson.centerId,
                    recipientTypeModel: 'Center',
                    periodType: 'monthly',
                    periodStart: periodStart,
                    periodEnd: periodEnd,
                    totalAmount: 0,
                    items: [],
                    breakdown: {
                        netAmount: 0
                    },
                    status: 'pending'
                });
            }
            settlement.items.push({
                personalLessonId: personalLesson._id,
                paymentId: payment._id,
                amount: personalLesson.laneRentalFee,
                description: `레인대여 비용 (${personalLesson.date.toLocaleDateString('ko-KR')})`,
                date: personalLesson.date
            });
            settlement.totalAmount += personalLesson.laneRentalFee;
            settlement.breakdown.laneRentalFee = (settlement.breakdown.laneRentalFee || 0) + personalLesson.laneRentalFee;
            settlement.breakdown.netAmount = settlement.totalAmount;
            await settlement.save();
        }
        if (personalLesson.platformFee && personalLesson.platformFee > 0) {
            const periodStart = new Date(personalLesson.date);
            periodStart.setDate(1);
            const periodEnd = new Date(periodStart);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            let settlement = await Settlement_1.Settlement.findOne({
                recipientType: 'platform',
                recipientId: new mongoose_1.default.Types.ObjectId('000000000000000000000000'),
                periodType: 'monthly',
                periodStart: periodStart,
                status: 'pending'
            });
            if (!settlement) {
                settlement = new Settlement_1.Settlement({
                    recipientType: 'platform',
                    recipientId: new mongoose_1.default.Types.ObjectId('000000000000000000000000'),
                    recipientTypeModel: 'User',
                    periodType: 'monthly',
                    periodStart: periodStart,
                    periodEnd: periodEnd,
                    totalAmount: 0,
                    items: [],
                    breakdown: {
                        netAmount: 0
                    },
                    status: 'pending'
                });
            }
            settlement.items.push({
                personalLessonId: personalLesson._id,
                paymentId: payment._id,
                amount: personalLesson.platformFee,
                description: `플랫폼 수수료 (${personalLesson.date.toLocaleDateString('ko-KR')})`,
                date: personalLesson.date
            });
            settlement.totalAmount += personalLesson.platformFee;
            settlement.breakdown.platformFee = (settlement.breakdown.platformFee || 0) + personalLesson.platformFee;
            settlement.breakdown.netAmount = settlement.totalAmount;
            await settlement.save();
        }
    }
    catch (error) {
        console.error('정산 항목 생성 실패:', error);
        throw error;
    }
}
async function processSettlements(periodStart, periodEnd) {
    const errors = [];
    let processed = 0;
    let totalAmount = 0;
    try {
        const pendingSettlements = await Settlement_1.Settlement.find({
            status: 'pending',
            periodStart: { $gte: periodStart, $lt: periodEnd }
        });
        for (const settlement of pendingSettlements) {
            try {
                settlement.status = 'processing';
                await settlement.save();
                const transactionId = `SETTLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                settlement.status = 'completed';
                settlement.processedAt = new Date();
                settlement.transactionId = transactionId;
                await settlement.save();
                processed++;
                totalAmount += settlement.totalAmount;
            }
            catch (error) {
                settlement.status = 'failed';
                settlement.errorMessage = error.message || '정산 처리 실패';
                await settlement.save();
                errors.push(`정산 ID ${settlement._id}: ${error.message}`);
            }
        }
        return { processed, totalAmount, errors };
    }
    catch (error) {
        console.error('정산 처리 실패:', error);
        throw error;
    }
}
async function getSettlementStats(recipientType, recipientId, startDate, endDate) {
    try {
        const query = {};
        if (recipientType)
            query.recipientType = recipientType;
        if (recipientId)
            query.recipientId = recipientId;
        if (startDate || endDate) {
            query.periodStart = {};
            if (startDate)
                query.periodStart.$gte = startDate;
            if (endDate)
                query.periodStart.$lte = endDate;
        }
        const settlements = await Settlement_1.Settlement.find(query);
        const totalSettlements = settlements.length;
        const totalAmount = settlements.reduce((sum, s) => sum + s.totalAmount, 0);
        const pendingAmount = settlements
            .filter(s => s.status === 'pending')
            .reduce((sum, s) => sum + s.totalAmount, 0);
        const completedAmount = settlements
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + s.totalAmount, 0);
        const byPeriodMap = new Map();
        settlements.forEach(s => {
            const periodKey = s.periodStart.toISOString().slice(0, 7);
            const existing = byPeriodMap.get(periodKey) || { amount: 0, count: 0 };
            existing.amount += s.totalAmount;
            existing.count += 1;
            byPeriodMap.set(periodKey, existing);
        });
        const byPeriod = Array.from(byPeriodMap.entries()).map(([period, data]) => ({
            period,
            ...data
        })).sort((a, b) => a.period.localeCompare(b.period));
        return {
            totalSettlements,
            totalAmount,
            pendingAmount,
            completedAmount,
            byPeriod
        };
    }
    catch (error) {
        console.error('정산 통계 조회 실패:', error);
        throw error;
    }
}
//# sourceMappingURL=settlementService.js.map