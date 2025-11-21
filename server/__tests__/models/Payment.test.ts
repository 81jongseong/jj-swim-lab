/**
 * 💳 Payment 모델 테스트
 */

import mongoose from 'mongoose';
import { Payment } from '../../src/models/Payment';
import { clearDatabase } from '../setup';

describe('Payment 모델 테스트', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Payment 생성', () => {
    it('유효한 데이터로 결제를 생성할 수 있어야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        transactionId: 'txn_123456789',
        notes: '수영 강의 수강료',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      const savedPayment = await payment.save();

      expect(savedPayment._id).toBeDefined();
      expect(savedPayment.user.toString()).toBe(paymentData.user);
      expect(savedPayment.amount).toBe(paymentData.amount);
      expect(savedPayment.paymentMethod).toBe(paymentData.paymentMethod);
      expect(savedPayment.purpose).toBe(paymentData.purpose);
    });

    it('필수 필드가 누락된 경우 에러를 발생시켜야 함', async () => {
      const incompleteData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000
        // paymentMethod, purpose 누락
      };

      const payment = new Payment(incompleteData);
      await expect(payment.save()).rejects.toThrow();
    });
  });

  describe('Payment 조회', () => {
    it('사용자별로 결제를 찾을 수 있어야 함', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const paymentData = {
        user: userId,
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await payment.save();

      const userPayments = await Payment.find({ user: userId });
      expect(userPayments.length).toBeGreaterThan(0);
      expect(userPayments[0].user.toString()).toBe(userId);
    });

    it('상태별로 결제를 찾을 수 있어야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        status: 'pending',
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await payment.save();

      const pendingPayments = await Payment.find({ status: 'pending' });
      expect(pendingPayments.length).toBeGreaterThan(0);
      expect(pendingPayments[0].status).toBe('pending');
    });

    it('결제 방법별로 결제를 찾을 수 있어야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'transfer',
        purpose: 'course',
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await payment.save();

      const transferPayments = await Payment.find({ paymentMethod: 'transfer' });
      expect(transferPayments.length).toBeGreaterThan(0);
      expect(transferPayments[0].paymentMethod).toBe('transfer');
    });
  });

  describe('Payment 수정', () => {
    it('결제 정보를 수정할 수 있어야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        status: 'pending',
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await payment.save();

      payment.status = 'completed';
      payment.receiptUrl = 'https://example.com/receipt.pdf';
      const updatedPayment = await payment.save();

      expect(updatedPayment.status).toBe('completed');
      expect(updatedPayment.receiptUrl).toBe('https://example.com/receipt.pdf');
    });
  });

  describe('Payment 삭제', () => {
    it('결제를 삭제할 수 있어야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        status: 'completed',
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await payment.save();

      await Payment.findByIdAndDelete(payment._id);

      const deletedPayment = await Payment.findById(payment._id);
      expect(deletedPayment).toBeNull();
    });
  });

  describe('유효성 검증', () => {
    it('유효하지 않은 결제 방법을 거부해야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'invalid_method', // 유효하지 않은 결제 방법
        purpose: 'course',
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await expect(payment.save()).rejects.toThrow();
    });

    it('유효하지 않은 목적을 거부해야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'invalid_purpose', // 유효하지 않은 목적
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await expect(payment.save()).rejects.toThrow();
    });

    it('유효하지 않은 상태를 거부해야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        status: 'invalid_status', // 유효하지 않은 상태
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const payment = new Payment(paymentData);
      await expect(payment.save()).rejects.toThrow();
    });
  });

  describe('기본값 설정', () => {
    it('기본값이 올바르게 설정되어야 함', async () => {
      const paymentData = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        transactionId: 'txn_123456789',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
        // currency와 status는 기본값 사용
      };

      const payment = new Payment(paymentData);
      const savedPayment = await payment.save();

      expect(savedPayment.currency).toBe('KRW'); // 기본값
      expect(savedPayment.status).toBe('pending'); // 기본값
    });
  });

  describe('고유성 검증', () => {
    it('중복된 거래 ID를 거부해야 함', async () => {
      const paymentData1 = {
        user: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        purpose: 'course',
        transactionId: 'txn_duplicate',
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 50000,
          pricingTier: 'standard'
        }
      };

      const paymentData2 = {
        user: '507f1f77bcf86cd799439012',
        amount: 30000,
        paymentMethod: 'card',
        purpose: 'booking',
        transactionId: 'txn_duplicate', // 동일한 거래 ID
        centerId: new mongoose.Types.ObjectId(),
        pricingInfo: {
          userType: 'student',
          baseAmount: 30000,
          pricingTier: 'standard'
        }
      };

      const payment1 = new Payment(paymentData1);
      await payment1.save();

      const payment2 = new Payment(paymentData2);
      await expect(payment2.save()).rejects.toThrow();
    });
  });
});



