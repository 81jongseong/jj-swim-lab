/**
 * 💰 JJ Swim Lab - 정산 서비스
 * 
 * 자동 정산 시스템을 위한 서비스 로직
 * 
 * 🔄 **연동 파일**
 * - server/src/models/Settlement.ts (정산 모델)
 * - server/src/models/PersonalLesson.ts (개인레슨 모델)
 * - server/src/models/Payment.ts (결제 모델)
 * - server/src/routes/settlements.ts (정산 API)
 */

import mongoose from 'mongoose';
import { Settlement } from '../models/Settlement';
import { PersonalLesson } from '../models/PersonalLesson';
import { Payment } from '../models/Payment';

/**
 * 개인레슨 결제 완료 시 정산 대기 항목 생성
 */
export async function createSettlementItem(personalLessonId: string): Promise<void> {
  try {
    const personalLesson = await PersonalLesson.findById(personalLessonId)
      .populate('instructorId')
      .populate('centerId')
      .populate('paymentId');

    if (!personalLesson || personalLesson.paymentStatus !== 'completed') {
      return;
    }

    const payment = await Payment.findById(personalLesson.paymentId);
    if (!payment || payment.status !== 'completed') {
      return;
    }

    // 강사 정산 항목 생성 (외부 강사인 경우)
    if (personalLesson.instructorId && personalLesson.isExternalInstructor) {
      const instructorAmount = (personalLesson.instructorFee || 0) - (personalLesson.platformFee || 0);
      
      if (instructorAmount > 0) {
        // 해당 기간의 정산 항목 찾기 또는 생성
        const periodStart = new Date(personalLesson.date);
        periodStart.setDate(1); // 월초
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1); // 다음 달 초

        let settlement = await Settlement.findOne({
          recipientType: 'instructor',
          recipientId: personalLesson.instructorId,
          periodType: 'monthly',
          periodStart: periodStart,
          status: 'pending'
        });

        if (!settlement) {
          settlement = new Settlement({
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

    // 센터 정산 항목 생성
    if (personalLesson.laneRentalFee && personalLesson.laneRentalFee > 0) {
      const periodStart = new Date(personalLesson.date);
      periodStart.setDate(1); // 월초
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1); // 다음 달 초

      let settlement = await Settlement.findOne({
        recipientType: 'center',
        recipientId: personalLesson.centerId,
        periodType: 'monthly',
        periodStart: periodStart,
        status: 'pending'
      });

      if (!settlement) {
        settlement = new Settlement({
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

    // 플랫폼 수수료 정산 항목 생성
    if (personalLesson.platformFee && personalLesson.platformFee > 0) {
      const periodStart = new Date(personalLesson.date);
      periodStart.setDate(1); // 월초
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1); // 다음 달 초

      let settlement = await Settlement.findOne({
        recipientType: 'platform',
        recipientId: new mongoose.Types.ObjectId('000000000000000000000000'), // 플랫폼 ID (더미)
        periodType: 'monthly',
        periodStart: periodStart,
        status: 'pending'
      });

      if (!settlement) {
        settlement = new Settlement({
          recipientType: 'platform',
          recipientId: new mongoose.Types.ObjectId('000000000000000000000000'),
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

  } catch (error) {
    console.error('정산 항목 생성 실패:', error);
    throw error;
  }
}

/**
 * 정산 실행 (매월 자동 실행)
 */
export async function processSettlements(periodStart: Date, periodEnd: Date): Promise<{
  processed: number;
  totalAmount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let totalAmount = 0;

  try {
    // 대기 중인 정산 조회
    const pendingSettlements = await Settlement.find({
      status: 'pending',
      periodStart: { $gte: periodStart, $lt: periodEnd }
    });

    for (const settlement of pendingSettlements) {
      try {
        settlement.status = 'processing';
        await settlement.save();

        // TODO: 실제 정산 처리 로직 (은행 API 연동 등)
        // 현재는 시뮬레이션
        const transactionId = `SETTLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        settlement.status = 'completed';
        settlement.processedAt = new Date();
        settlement.transactionId = transactionId;
        await settlement.save();

        processed++;
        totalAmount += settlement.totalAmount;

      } catch (error: any) {
        settlement.status = 'failed';
        settlement.errorMessage = error.message || '정산 처리 실패';
        await settlement.save();
        errors.push(`정산 ID ${settlement._id}: ${error.message}`);
      }
    }

    return { processed, totalAmount, errors };

  } catch (error) {
    console.error('정산 처리 실패:', error);
    throw error;
  }
}

/**
 * 정산 통계 조회
 */
export async function getSettlementStats(
  recipientType?: 'instructor' | 'center' | 'platform',
  recipientId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalSettlements: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  byPeriod: Array<{
    period: string;
    amount: number;
    count: number;
  }>;
}> {
  try {
    const query: any = {};
    if (recipientType) query.recipientType = recipientType;
    if (recipientId) query.recipientId = recipientId;
    if (startDate || endDate) {
      query.periodStart = {};
      if (startDate) query.periodStart.$gte = startDate;
      if (endDate) query.periodStart.$lte = endDate;
    }

    const settlements = await Settlement.find(query);

    const totalSettlements = settlements.length;
    const totalAmount = settlements.reduce((sum, s) => sum + s.totalAmount, 0);
    const pendingAmount = settlements
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const completedAmount = settlements
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.totalAmount, 0);

    // 기간별 통계
    const byPeriodMap = new Map<string, { amount: number; count: number }>();
    settlements.forEach(s => {
      const periodKey = s.periodStart.toISOString().slice(0, 7); // YYYY-MM
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

  } catch (error) {
    console.error('정산 통계 조회 실패:', error);
    throw error;
  }
}

