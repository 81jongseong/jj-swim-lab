/**
 * ✅ JJ Swim Lab - 승인대기 API 테스트용 시드 데이터 생성
 * 
 * 📋 **생성 데이터**
 * - 승인 요청 (수강 신청, 강사 등록, 결제 승인 등)
 * - 다양한 상태와 우선순위
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const User = require('../dist/models/User').User;
const Course = require('../dist/models/Course').Course;
const Payment = require('../dist/models/Payment').Payment;
const Approval = require('../dist/models/Approval').Approval;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function seedApprovalsData() {
  try {
    console.log('🚀 승인대기 API 테스트용 시드 데이터 생성 시작...');
    
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 승인 데이터 정리
    console.log('🧹 기존 승인 데이터 정리 중...');
    await Approval.deleteMany({});
    console.log('✅ 기존 승인 데이터 정리 완료');

    // 사용자 데이터 조회 (기존 데이터 사용)
    const students = await User.find({ userType: 'student' }).limit(3);
    const instructors = await User.find({ userType: 'instructor' }).limit(2);
    const courses = await Course.find().limit(2);
    const payments = await Payment.find({ status: 'pending' }).limit(2);

    if (students.length === 0 || instructors.length === 0 || courses.length === 0) {
      console.log('⚠️ 필요한 기본 데이터가 없습니다. 먼저 revenue 시드 데이터를 실행해주세요.');
      return;
    }

    console.log(`📊 기존 데이터 확인: 학생 ${students.length}명, 강사 ${instructors.length}명, 과정 ${courses.length}개`);

    // 승인 요청 데이터 생성
    console.log('📝 승인 요청 데이터 생성 중...');
    const approvals = [];

    // 1. 수강 신청 승인 요청
    approvals.push({
      type: 'course_enrollment',
      userId: students[0]._id,
      courseId: courses[0]._id,
      instructorId: instructors[0]._id,
      title: '초급 수영 과정 수강 신청',
      description: `${students[0].name}님이 ${courses[0].name} 과정에 수강을 신청했습니다.`,
      status: 'pending',
      priority: 'medium',
      estimatedAmount: courses[0].price,
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
      centerId: null
    });

    // 2. 강사 등록 승인 요청
    approvals.push({
      type: 'instructor_registration',
      userId: students[1]._id,
      title: '새 강사 등록 신청',
      description: `${students[1].name}님이 새로운 강사로 등록을 신청했습니다.`,
      status: 'pending',
      priority: 'high',
      requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
      centerId: null
    });

    // 3. 결제 승인 요청
    if (payments.length > 0) {
      approvals.push({
        type: 'payment_approval',
        userId: students[2]._id,
        paymentId: payments[0]._id,
        title: '결제 승인 요청',
        description: `${students[2].name}님의 결제 승인을 요청합니다.`,
        status: 'pending',
        priority: 'medium',
        estimatedAmount: payments[0].amount,
        requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
        centerId: null
      });
    }

    // 4. 일정 변경 승인 요청
    approvals.push({
      type: 'schedule_change',
      userId: instructors[0]._id,
      title: '수업 일정 변경 요청',
      description: '수영장 정비로 인한 수업 일정 변경을 요청합니다.',
      status: 'pending',
      priority: 'high',
      requestDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4일 전
      centerId: null
    });

    // 5. 환불 요청
    approvals.push({
      type: 'refund_request',
      userId: students[0]._id,
      courseId: courses[1]._id,
      title: '환불 요청',
      description: '개인 사정으로 인한 환불을 요청합니다.',
      status: 'pending',
      priority: 'low',
      estimatedAmount: courses[1].price,
      requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
      centerId: null
    });

    // 6. 이미 승인된 요청 (테스트용)
    approvals.push({
      type: 'course_enrollment',
      userId: students[1]._id,
      courseId: courses[1]._id,
      instructorId: instructors[1]._id,
      title: '중급 수영 과정 수강 신청',
      description: `${students[1].name}님이 ${courses[1].name} 과정에 수강을 신청했습니다.`,
      status: 'approved',
      priority: 'medium',
      estimatedAmount: courses[1].price,
      requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
      processedBy: instructors[0]._id,
      processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6일 전
      reason: '수강 조건 충족',
      centerId: null
    });

    // 7. 거부된 요청 (테스트용)
    approvals.push({
      type: 'instructor_registration',
      userId: students[2]._id,
      title: '강사 등록 신청',
      description: `${students[2].name}님이 강사 등록을 신청했습니다.`,
      status: 'rejected',
      priority: 'medium',
      requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10일 전
      processedBy: instructors[0]._id,
      processedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9일 전
      reason: '자격 요건 미충족',
      centerId: null
    });

    const createdApprovals = await Approval.create(approvals);
    console.log(`✅ ${createdApprovals.length}개의 승인 요청 생성 완료`);

    // 통계 출력
    console.log('\n📊 생성된 승인 요청 통계:');
    
    const pendingCount = createdApprovals.filter(a => a.status === 'pending').length;
    const approvedCount = createdApprovals.filter(a => a.status === 'approved').length;
    const rejectedCount = createdApprovals.filter(a => a.status === 'rejected').length;
    
    console.log(`   - 대기 중: ${pendingCount}건`);
    console.log(`   - 승인됨: ${approvedCount}건`);
    console.log(`   - 거부됨: ${rejectedCount}건`);
    console.log(`   - 총 요청: ${createdApprovals.length}건`);

    // 유형별 통계
    const typeStats = {};
    createdApprovals.forEach(approval => {
      typeStats[approval.type] = (typeStats[approval.type] || 0) + 1;
    });
    
    console.log('\n📋 유형별 통계:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}건`);
    });

    console.log('\n🎉 승인대기 API 테스트용 시드 데이터 생성 완료!');
    console.log('💡 이제 /api/approvals 엔드포인트를 테스트해보세요.');

  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
    process.exit(0);
  }
}

// 스크립트 실행
seedApprovalsData();

