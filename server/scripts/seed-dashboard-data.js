/**
 * 📊 JJ Swim Lab - 대시보드 시스템 통계 시드 데이터 생성 스크립트
 * 
 * 📋 **목적**
 * - 대시보드에 표시되는 시스템 통계 데이터를 실제 데이터베이스에서 계산
 * - 하드코딩된 더미 데이터를 제거하고 실시간 통계로 대체
 * 
 * 🔄 **생성 데이터**
 * - 전체 사용자 수 (실제 User 테이블 기반)
 * - 강습 과정 수 (실제 Course 테이블 기반)
 * - 총 매출액 (실제 Payment/Booking 테이블 기반)
 * - 활성 예약 수 (실제 Booking 테이블 기반)
 * - 승인 대기 건수 (실제 Approval 테이블 기반)
 * 
 * 🛠️ **실행 방법**
 * node scripts/seed-dashboard-data.js
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// 환경 변수 로드
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 스키마 정의
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  userType: String,
  centerId: String,
  instructorId: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

const courseSchema = new mongoose.Schema({
  name: String,
  description: String,
  instructorId: String,
  centerId: String,
  maxStudents: Number,
  currentStudents: Number,
  price: Number,
  status: String,
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
});

const bookingSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  instructorId: String,
  centerId: String,
  status: String,
  bookingDate: Date,
  startTime: Date,
  endTime: Date,
  totalAmount: Number,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
});

const paymentSchema = new mongoose.Schema({
  userId: String,
  bookingId: String,
  amount: Number,
  paymentMethod: String,
  status: String,
  transactionId: String,
  paymentDate: Date,
  createdAt: Date
});

const approvalSchema = new mongoose.Schema({
  type: String,
  userId: String,
  instructorId: String,
  centerId: String,
  status: String,
  requestDate: Date,
  approvalDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

// 모델 생성
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Approval = mongoose.model('Approval', approvalSchema);

// 임의 데이터 생성 함수들
const generateUsers = async (count = 50) => {
  const users = [];
  const userTypes = ['student', 'instructor', 'centerAdmin', 'superAdmin'];
  const statuses = ['active', 'inactive', 'pending'];
  
  for (let i = 0; i < count; i++) {
    const userType = faker.helpers.arrayElement(userTypes);
    const isInstructor = userType === 'instructor';
    
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      userType,
      centerId: isInstructor ? faker.string.uuid() : null,
      instructorId: userType === 'student' ? faker.string.uuid() : null,
      status: faker.helpers.arrayElement(statuses),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: new Date()
    });
  }
  
  // 기존 사용자 삭제 후 새로 생성
  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length}명의 사용자 생성 완료`);
  
  return createdUsers;
};

const generateCourses = async (instructors, count = 20) => {
  const courses = [];
  const courseNames = [
    '초급 자유형', '중급 자유형', '고급 자유형',
    '초급 배영', '중급 배영', '고급 배영',
    '초급 평영', '중급 평영', '고급 평영',
    '초급 접영', '중급 접영', '고급 접영',
    '혼영 기초', '혼영 중급', '혼영 고급',
    '계영 팀', '개인혼영', '마라톤 수영',
    '생존 수영', '아쿠아 에어로빅', '수영 치료'
  ];
  
  const statuses = ['active', 'inactive', 'full', 'registration'];
  
  for (let i = 0; i < count; i++) {
    const instructor = faker.helpers.arrayElement(instructors.filter(u => u.userType === 'instructor'));
    const maxStudents = faker.helpers.arrayElement([8, 10, 12, 15, 20]);
    const currentStudents = faker.number.int({ min: 0, max: maxStudents });
    
    courses.push({
      name: faker.helpers.arrayElement(courseNames),
      description: faker.lorem.sentence(),
      instructorId: instructor._id.toString(),
      centerId: instructor.centerId,
      maxStudents,
      currentStudents,
      price: faker.number.int({ min: 80000, max: 200000, step: 10000 }),
      status: faker.helpers.arrayElement(statuses),
      startDate: faker.date.soon({ days: 30 }),
      endDate: faker.date.soon({ days: 90 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date()
    });
  }
  
  // 기존 과정 삭제 후 새로 생성
  await Course.deleteMany({});
  const createdCourses = await Course.insertMany(courses);
  console.log(`✅ ${createdCourses.length}개의 강습 과정 생성 완료`);
  
  return createdCourses;
};

const generateBookings = async (users, courses, count = 100) => {
  const bookings = [];
  const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
  const paymentStatuses = ['paid', 'pending', 'failed', 'refunded'];
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users.filter(u => u.userType === 'student'));
    const course = faker.helpers.arrayElement(courses);
    const status = faker.helpers.arrayElement(statuses);
    const paymentStatus = status === 'confirmed' ? 'paid' : faker.helpers.arrayElement(paymentStatuses);
    
    const startTime = faker.date.soon({ days: 30 });
    const duration = faker.number.int({ min: 1, max: 3 }); // 1-3시간
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    bookings.push({
      userId: user._id.toString(),
      courseId: course._id.toString(),
      instructorId: course.instructorId,
      centerId: course.centerId,
      status,
      bookingDate: faker.date.recent({ days: 7 }),
      startTime,
      endTime,
      totalAmount: course.price,
      paymentStatus,
      createdAt: faker.date.past({ days: 30 }),
      updatedAt: new Date()
    });
  }
  
  // 기존 예약 삭제 후 새로 생성
  await Booking.deleteMany({});
  const createdBookings = await Booking.insertMany(bookings);
  console.log(`✅ ${createdBookings.length}개의 예약 생성 완료`);
  
  return createdBookings;
};

const generatePayments = async (bookings, count = 80) => {
  const payments = [];
  const paymentMethods = ['credit_card', 'bank_transfer', 'mobile_payment', 'cash'];
  const statuses = ['completed', 'pending', 'failed', 'refunded'];
  
  for (let i = 0; i < count; i++) {
    const booking = faker.helpers.arrayElement(bookings.filter(b => b.paymentStatus === 'paid'));
    
    payments.push({
      userId: booking.userId,
      bookingId: booking._id.toString(),
      amount: booking.totalAmount,
      paymentMethod: faker.helpers.arrayElement(paymentMethods),
      status: faker.helpers.arrayElement(statuses),
      transactionId: faker.string.alphanumeric(16).toUpperCase(),
      paymentDate: faker.date.recent({ days: 30 }),
      createdAt: faker.date.past({ days: 30 })
    });
  }
  
  // 기존 결제 내역 삭제 후 새로 생성
  await Payment.deleteMany({});
  const createdPayments = await Payment.insertMany(payments);
  console.log(`✅ ${createdPayments.length}개의 결제 내역 생성 완료`);
  
  return createdPayments;
};

const generateApprovals = async (users, count = 15) => {
  const approvals = [];
  const types = ['course_registration', 'instructor_certification', 'center_registration', 'payment_refund'];
  const statuses = ['pending', 'approved', 'rejected'];
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement(types);
    const status = faker.helpers.arrayElement(statuses);
    
    approvals.push({
      type,
      userId: user._id.toString(),
      instructorId: user.userType === 'student' ? user.instructorId : null,
      centerId: user.userType === 'instructor' ? user.centerId : null,
      status,
      requestDate: faker.date.recent({ days: 14 }),
      approvalDate: status !== 'pending' ? faker.date.recent({ days: 7 }) : null,
      notes: faker.lorem.sentence(),
      createdAt: faker.date.past({ days: 30 }),
      updatedAt: new Date()
    });
  }
  
  // 기존 승인 요청 삭제 후 새로 생성
  await Approval.deleteMany({});
  const createdApprovals = await Approval.insertMany(approvals);
  console.log(`✅ ${createdApprovals.length}개의 승인 요청 생성 완료`);
  
  return createdApprovals;
};

// 실시간 통계 계산 함수
const calculateDashboardStats = async () => {
  try {
    console.log('\n📊 실시간 대시보드 통계를 계산합니다...');
    
    // 전체 사용자 수 (활성 상태만)
    const totalUsers = await User.countDocuments({ status: 'active' });
    
    // 활성 강습 과정 수
    const activeCourses = await Course.countDocuments({ status: 'active' });
    
    // 총 매출액 (완료된 결제만)
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    // 활성 예약 수 (확정된 예약만)
    const activeBookings = await Booking.countDocuments({ 
      status: { $in: ['confirmed', 'pending'] } 
    });
    
    // 승인 대기 건수
    const pendingApprovals = await Approval.countDocuments({ status: 'pending' });
    
    // 강사별 학생 수 통계
    const instructorStats = await User.aggregate([
      { $match: { userType: 'instructor', status: 'active' } },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'instructorId',
        as: 'students'
      }},
      { $project: {
        name: 1,
        studentCount: { $size: '$students' }
      }}
    ]);
    
    // 과정별 등록 현황
    const courseStats = await Course.aggregate([
      { $match: { status: 'active' } },
      { $project: {
        name: 1,
        enrollmentRate: { 
          $multiply: [
            { $divide: ['$currentStudents', '$maxStudents'] }, 
            100
          ]
        }
      }}
    ]);
    
    console.log('\n📈 대시보드 통계 요약:');
    console.log(`- 전체 사용자: ${totalUsers}명`);
    console.log(`- 활성 강습 과정: ${activeCourses}개`);
    console.log(`- 총 매출액: ${revenue.toLocaleString()}원`);
    console.log(`- 활성 예약: ${activeBookings}건`);
    console.log(`- 승인 대기: ${pendingApprovals}건`);
    
    console.log('\n👨‍🏫 강사별 학생 현황:');
    instructorStats.forEach(stat => {
      console.log(`  - ${stat.name}: ${stat.studentCount}명`);
    });
    
    console.log('\n📚 과정별 등록률:');
    courseStats.forEach(stat => {
      console.log(`  - ${stat.name}: ${Math.round(stat.enrollmentRate)}%`);
    });
    
    return {
      totalUsers,
      activeCourses,
      totalRevenue: revenue,
      activeBookings,
      pendingApprovals,
      instructorStats,
      courseStats
    };
    
  } catch (error) {
    console.error('❌ 통계 계산 중 오류 발생:', error);
    return null;
  }
};

// 메인 시드 함수
const seedDashboardData = async () => {
  try {
    console.log('📊 대시보드 시스템 통계 시드 데이터 생성을 시작합니다...');
    
    // 1. 사용자 생성
    const users = await generateUsers(50);
    
    // 2. 강습 과정 생성
    const courses = await generateCourses(users, 20);
    
    // 3. 예약 생성
    const bookings = await generateBookings(users, courses, 100);
    
    // 4. 결제 내역 생성
    const payments = await generatePayments(bookings, 80);
    
    // 5. 승인 요청 생성
    const approvals = await generateApprovals(users, 15);
    
    // 6. 실시간 통계 계산
    const stats = await calculateDashboardStats();
    
    if (stats) {
      console.log('\n🎉 대시보드 시드 데이터 생성이 완료되었습니다!');
      console.log('이제 대시보드에서 실제 데이터베이스 기반 통계를 확인할 수 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 데이터베이스 연결을 종료합니다.');
  }
};

// 스크립트 실행
if (require.main === module) {
  seedDashboardData();
}

module.exports = { seedDashboardData, calculateDashboardStats };
