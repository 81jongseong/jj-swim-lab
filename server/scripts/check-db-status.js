/**
 * 📊 JJ Swim Lab - 데이터베이스 상태 확인 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');

// 스키마 정의
const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  email: String,
  password: String,
  name: String,
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

// 데이터베이스 상태 확인
const checkDatabaseStatus = async () => {
  try {
    console.log('📊 현재 데이터베이스 상태:');
    
    // 전체 문서 수
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalApprovals = await Approval.countDocuments();
    
    console.log(`- Users: ${totalUsers}개`);
    console.log(`- Courses: ${totalCourses}개`);
    console.log(`- Bookings: ${totalBookings}개`);
    console.log(`- Payments: ${totalPayments}개`);
    console.log(`- Approvals: ${totalApprovals}개`);
    
    // 활성 상태별 통계
    const activeUsers = await User.countDocuments({ status: 'active' });
    const activeCourses = await Course.countDocuments({ status: 'active' });
    const activeBookings = await Booking.countDocuments({ 
      status: { $in: ['confirmed', 'pending'] } 
    });
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingApprovals = await Approval.countDocuments({ status: 'pending' });
    
    console.log('\n📈 활성 상태별 통계:');
    console.log(`- 활성 사용자: ${activeUsers}명`);
    console.log(`- 활성 과정: ${activeCourses}개`);
    console.log(`- 활성 예약: ${activeBookings}건`);
    console.log(`- 완료된 결제: ${completedPayments}건`);
    console.log(`- 승인 대기: ${pendingApprovals}건`);
    
    // 사용자 타입별 통계
    const userTypeStats = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    
    console.log('\n👥 사용자 타입별 통계:');
    userTypeStats.forEach(stat => {
      console.log(`  - ${stat._id}: ${stat.count}명`);
    });
    
    // 총 매출액 계산
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    console.log(`\n💰 총 매출액: ${revenue.toLocaleString()}원`);
    
  } catch (error) {
    console.error('❌ 데이터베이스 상태 확인 중 오류 발생:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 데이터베이스 연결을 종료합니다.');
  }
};

// 스크립트 실행
if (require.main === module) {
  checkDatabaseStatus();
}

module.exports = { checkDatabaseStatus };
