/**
 * 📋 JJ Swim Lab - 통합 거래 관리 페이지용 테스트 데이터 생성
 * 
 * 📋 **생성 데이터**
 * - 결제 데이터 (다양한 상태)
 * - 승인 요청 데이터 (강습 신청, 결제 승인, 일정 변경, 환불 요청)
 * - 센터 관리자가 볼 수 있는 실제 데이터
 * 
 * 🗄️ **데이터 연동**
 * - User 모델 (학생, 강사)
 * - Center 모델
 * - Course 모델
 * - Payment 모델
 * - Approval 모델
 * - PersonalLesson 모델
 * - LaneRental 모델
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-09: 통합 거래 관리 페이지용 테스트 데이터 생성 스크립트 작성
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const User = require('../dist/models/User').User;
const Center = require('../dist/models/Center').Center;
const Course = require('../dist/models/Course').Course;
const Payment = require('../dist/models/Payment').Payment;
const Approval = require('../dist/models/Approval').Approval;
const PersonalLesson = require('../dist/models/PersonalLesson').PersonalLesson;
const LaneRental = require('../dist/models/LaneRental').LaneRental;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function seedIntegratedManagementData() {
  try {
    console.log('🚀 통합 거래 관리 페이지용 테스트 데이터 생성 시작...');
    
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 조회
    const centerAdmin = await User.findOne({ 
      userType: { $in: ['centerAdmin', 'center-admin'] },
      email: { $ne: 'admin@swim.com' }
    });
    
    if (!centerAdmin) {
      console.log('❌ 센터 관리자를 찾을 수 없습니다.');
      return;
    }

    const centerId = centerAdmin.centerId || centerAdmin.centerAdminInfo?.managedCenters?.[0];
    
    if (!centerId) {
      console.log('❌ 센터 ID를 찾을 수 없습니다.');
      return;
    }

    console.log(`🏢 센터 ID: ${centerId}`);

    // 기존 데이터 조회
    const students = await User.find({ 
      userType: 'student',
      centerId: centerId 
    }).limit(5);
    
    const instructors = await User.find({ 
      userType: 'instructor',
      centerId: centerId 
    }).limit(3);
    
    const courses = await Course.find({ centerId: centerId }).limit(3);

    if (students.length === 0) {
      console.log('⚠️ 학생 데이터가 없습니다. 먼저 학생을 생성해주세요.');
      return;
    }

    console.log(`📊 기존 데이터: 학생 ${students.length}명, 강사 ${instructors.length}명, 과정 ${courses.length}개`);

    // 기존 테스트 데이터 정리 (선택적)
    console.log('🧹 기존 테스트 데이터 정리 중...');
    await Payment.deleteMany({ 
      centerId: centerId,
      description: { $regex: /테스트|초급|중급|고급|클래스/ }
    });
    await Approval.deleteMany({ 
      centerId: centerId,
      title: { $regex: /테스트|강습 신청|결제 승인/ }
    });
    console.log('✅ 기존 테스트 데이터 정리 완료');

    // 1. 결제 데이터 생성
    console.log('💳 결제 데이터 생성 중...');
    const payments = [];
    
    const paymentStatuses = ['pending', 'completed', 'completed', 'completed', 'failed'];
    const paymentMethods = ['card', 'transfer', 'cash', 'card', 'card']; // 'bank_transfer' → 'transfer'
    const paymentPurposes = ['course', 'booking', 'course', 'membership', 'course'];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const course = courses[i % courses.length] || courses[0];
      const status = paymentStatuses[i % paymentStatuses.length];
      const method = paymentMethods[i % paymentMethods.length];
      const purpose = paymentPurposes[i % paymentPurposes.length];

      const paymentData = {
        user: student._id,
        centerId: centerId,
        amount: [80000, 100000, 120000, 150000, 90000][i],
        currency: 'KRW',
        paymentMethod: method,
        status: status,
        purpose: purpose,
        relatedCourse: course?._id,
        description: `${course?.name || '강습'} 수강료`,
        transactionId: `TXN_${Date.now()}_${i}`,
        pricingInfo: {
          userType: 'student',
          pricingTier: 'standard',
          baseAmount: [80000, 100000, 120000, 150000, 90000][i],
          discountAmount: 0,
          centerId: centerId
        }
      };

      if (status === 'completed') {
        paymentData.processedAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      }

      const payment = new Payment(paymentData);

      payments.push(payment);
    }

    // 환불된 결제 추가
    if (payments.length > 0 && payments[0].status === 'completed') {
      const refundPayment = new Payment({
        user: students[0]._id,
        centerId: centerId,
        amount: 80000,
        currency: 'KRW',
        paymentMethod: 'card',
        status: 'refunded',
        purpose: 'course',
        description: '초급 자유형 클래스 수강료 (환불)',
        transactionId: `TXN_REFUND_${Date.now()}`,
        pricingInfo: {
          userType: 'student',
          pricingTier: 'standard',
          baseAmount: 80000,
          discountAmount: 0,
          centerId: centerId
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      });
      payments.push(refundPayment);
    }

    const createdPayments = await Payment.insertMany(payments);
    console.log(`✅ ${createdPayments.length}개의 결제 데이터 생성 완료`);

    // 2. 승인 요청 데이터 생성
    console.log('✅ 승인 요청 데이터 생성 중...');
    const approvals = [];

    // 강습 신청 승인
    approvals.push({
      type: 'course_enrollment',
      userId: students[0]._id,
      courseId: courses[0]?._id,
      instructorId: instructors[0]?._id,
      title: '자유형 기초 강습 신청',
      description: `${students[0].name}님이 자유형 기초 강습에 신청하였습니다.`,
      status: 'pending',
      priority: 'medium',
      estimatedAmount: courses[0]?.price || 150000,
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      centerId: centerId
    });

    // 결제 승인 요청
    if (createdPayments.length > 0) {
      const pendingPayment = createdPayments.find(p => p.status === 'pending');
      if (pendingPayment) {
        approvals.push({
          type: 'payment_approval',
          userId: pendingPayment.user,
          paymentId: pendingPayment._id,
          title: '강습비 결제 승인 요청',
          description: `${students[1]?.name || '회원'}님의 배영 강습 결제 승인이 필요합니다.`,
          status: 'pending',
          priority: 'high',
          estimatedAmount: pendingPayment.amount,
          requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          centerId: centerId
        });
      }
    }

    // 일정 변경 요청
    if (students.length > 2) {
      approvals.push({
        type: 'schedule_change',
        userId: students[2]._id,
        title: '강습 일정 변경 요청',
        description: `${students[2].name}님이 강습 일정 변경을 요청하였습니다.`,
        status: 'pending',
        priority: 'medium',
        requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        centerId: centerId
      });
    }

    // 환불 요청
    if (students.length > 3 && courses.length > 1) {
      approvals.push({
        type: 'refund_request',
        userId: students[3]._id,
        courseId: courses[1]._id,
        title: '강습비 환불 요청',
        description: `${students[3].name}님이 개인 사정으로 환불을 요청하였습니다.`,
        status: 'pending',
        priority: 'low',
        estimatedAmount: courses[1].price || 120000,
        requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        centerId: centerId
      });
    }

    // 이미 승인된 요청 (테스트용)
    if (students.length > 1 && courses.length > 1) {
      approvals.push({
        type: 'course_enrollment',
        userId: students[1]._id,
        courseId: courses[1]?._id,
        instructorId: instructors[1]?._id,
        title: '중급 수영 과정 수강 신청',
        description: `${students[1].name}님이 ${courses[1]?.name || '중급 과정'}에 수강을 신청했습니다.`,
        status: 'approved',
        priority: 'medium',
        estimatedAmount: courses[1]?.price || 200000,
        requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        processedBy: centerAdmin._id,
        processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        reason: '수강 조건 충족',
        centerId: centerId
      });
    }

    // 거부된 요청 (테스트용)
    if (students.length > 0) {
      approvals.push({
        type: 'refund_request',
        userId: students[0]._id,
        courseId: courses[0]?._id,
        title: '환불 요청 (거부됨)',
        description: `${students[0].name}님의 환불 요청입니다.`,
        status: 'rejected',
        priority: 'low',
        estimatedAmount: courses[0]?.price || 150000,
        requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        processedBy: centerAdmin._id,
        processedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        reason: '환불 기한 초과',
        centerId: centerId
      });
    }

    const createdApprovals = await Approval.insertMany(approvals);
    console.log(`✅ ${createdApprovals.length}개의 승인 요청 생성 완료`);

    // 통계 출력
    console.log('\n📊 생성된 데이터 통계:');
    console.log(`💳 결제: ${createdPayments.length}건`);
    console.log(`   - 완료: ${createdPayments.filter(p => p.status === 'completed').length}건`);
    console.log(`   - 대기: ${createdPayments.filter(p => p.status === 'pending').length}건`);
    console.log(`   - 환불: ${createdPayments.filter(p => p.status === 'refunded').length}건`);
    console.log(`✅ 승인 요청: ${createdApprovals.length}건`);
    console.log(`   - 대기 중: ${createdApprovals.filter(a => a.status === 'pending').length}건`);
    console.log(`   - 승인됨: ${createdApprovals.filter(a => a.status === 'approved').length}건`);
    console.log(`   - 거부됨: ${createdApprovals.filter(a => a.status === 'rejected').length}건`);

    const totalRevenue = createdPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    console.log(`💰 총 매출액: ${totalRevenue.toLocaleString()}원`);

    console.log('\n🎉 통합 거래 관리 페이지용 테스트 데이터 생성 완료!');

  } catch (error) {
    console.error('❌ 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
    process.exit(0);
  }
}

// 스크립트 실행
seedIntegratedManagementData();

