/**
 * 📋 JJ Swim Lab - 승인 데이터 생성 스크립트
 * 
 * 📋 **기능**
 * - 승인 요청 샘플 데이터 생성
 * - 다양한 유형의 승인 요청 생성
 * - 대시보드 통계와 일치하는 데이터 생성
 * 
 * 🔄 **연동 파일**
 * - models/Approval.ts
 * - routes/approvals.ts
 * - client/app/admin/approvals/page.tsx
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Approval 모델 스키마 정의
const approvalSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['course_enrollment', 'instructor_registration', 'payment_approval', 'schedule_change', 'refund_request', 'center_registration']
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  requestDate: { type: Date, default: Date.now },
  estimatedAmount: { type: Number },
  approvalInfo: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    comments: { type: String },
    rejectionReason: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Approval = mongoose.model('Approval', approvalSchema);

// User 모델 (참조용)
const userSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  userType: String,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);

async function createApprovalData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 승인 데이터 확인
    const existingApprovals = await Approval.countDocuments();
    console.log(`📊 기존 승인 데이터: ${existingApprovals}개`);

    if (existingApprovals >= 7) {
      console.log('✅ 이미 충분한 승인 데이터가 있습니다.');
      await mongoose.disconnect();
      return;
    }

    // 사용자 데이터 확인
    const users = await User.find({ isActive: true }).select('_id name email userType').lean();
    console.log(`👥 활성 사용자: ${users.length}명`);

    if (users.length === 0) {
      console.log('❌ 사용자 데이터가 없어 승인 데이터를 생성할 수 없습니다.');
      await mongoose.disconnect();
      return;
    }

    // 학생과 강사 사용자 분리
    const students = users.filter(user => user.userType === 'student');
    const instructors = users.filter(user => user.userType === 'instructor');

    // 승인 샘플 데이터 생성
    const approvalData = [
      {
        type: 'course_enrollment',
        title: '초급 자유형 과정 수강 신청',
        description: '수영 초보자를 위한 자유형 기초 과정 수강을 신청합니다.',
        userId: students[0]?._id || users[0]._id,
        status: 'pending',
        priority: 'medium',
        requestDate: new Date(),
        estimatedAmount: 120000
      },
      {
        type: 'instructor_registration',
        title: '신규 강사 등록 신청',
        description: '수영 지도 경력 5년의 전문 강사 등록을 신청합니다.',
        userId: instructors[0]?._id || users[1]?._id || users[0]._id,
        status: 'pending',
        priority: 'high',
        requestDate: new Date()
      },
      {
        type: 'payment_approval',
        title: '강습료 결제 승인 요청',
        description: '월 강습료 결제에 대한 승인이 필요합니다.',
        userId: students[1]?._id || users[2]?._id || users[0]._id,
        status: 'pending',
        priority: 'medium',
        requestDate: new Date(),
        estimatedAmount: 150000
      },
      {
        type: 'schedule_change',
        title: '수업 일정 변경 요청',
        description: '개인 사정으로 인한 수업 일정 변경을 요청합니다.',
        userId: students[2]?._id || users[3]?._id || users[0]._id,
        status: 'pending',
        priority: 'low',
        requestDate: new Date()
      },
      {
        type: 'refund_request',
        title: '강습료 환불 요청',
        description: '이사로 인한 강습 중단 및 환불을 요청합니다.',
        userId: students[3]?._id || users[4]?._id || users[0]._id,
        status: 'pending',
        priority: 'high',
        requestDate: new Date(),
        estimatedAmount: 100000
      },
      {
        type: 'course_enrollment',
        title: '중급 배영 과정 수강 신청',
        description: '배영 중급 과정 수강을 신청합니다.',
        userId: students[0]?._id || users[0]._id,
        status: 'approved',
        priority: 'medium',
        requestDate: new Date(Date.now() - 86400000), // 1일 전
        estimatedAmount: 180000,
        approvalInfo: {
          reviewedAt: new Date(),
          comments: '수강 자격 확인 완료, 승인합니다.'
        }
      },
      {
        type: 'instructor_registration',
        title: '강사 자격 갱신 승인',
        description: '기존 강사의 자격 갱신 승인이 완료되었습니다.',
        userId: instructors[1]?._id || users[1]?._id || users[0]._id,
        status: 'approved',
        priority: 'high',
        requestDate: new Date(Date.now() - 172800000), // 2일 전
        approvalInfo: {
          reviewedAt: new Date(),
          comments: '자격 갱신 승인 완료'
        }
      }
    ];

    // 승인 데이터 생성
    console.log('📝 승인 데이터 생성 중...');
    for (const data of approvalData) {
      const approval = new Approval(data);
      await approval.save();
      console.log(`✅ 승인 요청 생성: ${data.title}`);
    }

    // 최종 승인 데이터 개수 확인
    const finalCount = await Approval.countDocuments();
    const pendingCount = await Approval.countDocuments({ status: 'pending' });
    const approvedCount = await Approval.countDocuments({ status: 'approved' });

    console.log('\n📊 승인 데이터 생성 완료!');
    console.log(`📋 총 승인 요청: ${finalCount}개`);
    console.log(`⏳ 대기 중: ${pendingCount}개`);
    console.log(`✅ 승인됨: ${approvedCount}개`);
    console.log(`❌ 거부됨: ${finalCount - pendingCount - approvedCount}개`);

  } catch (error) {
    console.error('❌ 승인 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
createApprovalData();
