/**
 * 💰 결제 데이터만 추가하는 스크립트
 * 기존 사용자들에게 결제 내역 추가
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');
const { Payment } = require('../dist/models/Payment');
const { Booking } = require('../dist/models/Booking');
const { Course } = require('../dist/models/Course');

async function seedPaymentsOnly() {
  try {
    console.log('🔗 데이터베이스 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 데이터베이스 연결 성공');

    // 기존 사용자들 가져오기
    const users = await User.find({ isActive: true }).limit(10);
    console.log(`👥 기존 사용자 ${users.length}명 발견`);

    if (users.length === 0) {
      console.log('❌ 활성 사용자가 없습니다. 먼저 사용자를 활성화해주세요.');
      return;
    }

    // 기존 과정들 가져오기
    const courses = await Course.find({ isActive: true }).limit(5);
    console.log(`📚 기존 과정 ${courses.length}개 발견`);

    if (courses.length === 0) {
      console.log('❌ 활성 과정이 없습니다.');
      return;
    }

    // 기존 결제 데이터 삭제
    await Payment.deleteMany({});
    console.log('🗑️ 기존 결제 데이터 삭제 완료');

    // 기존 예약 데이터 삭제
    await Booking.deleteMany({});
    console.log('🗑️ 기존 예약 데이터 삭제 완료');

    const payments = [];
    const bookings = [];

    // 각 사용자에게 결제 내역 생성
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const course = courses[i % courses.length];

      // 결제 데이터 생성
      const payment = new Payment({
        userId: user._id,
        courseId: course._id,
        amount: Math.floor(Math.random() * 100000) + 50000, // 5만원 ~ 15만원
        currency: 'KRW',
        paymentMethod: ['card', 'bank_transfer', 'cash'][Math.floor(Math.random() * 3)],
        status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
        paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 최근 30일 내
        description: `${course.name} 수강료`,
        metadata: {
          courseName: course.name,
          userName: user.name,
          paymentType: 'course_fee'
        }
      });

      payments.push(payment);

      // 예약 데이터 생성 (결제가 완료된 경우만)
      if (payment.status === 'completed') {
        const booking = new Booking({
          userId: user._id,
          courseId: course._id,
          instructorId: course.instructorId,
          scheduledDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // 향후 2주 내
          status: ['confirmed', 'pending', 'completed'][Math.floor(Math.random() * 3)],
          paymentId: payment._id,
          notes: '정기 수업 예약'
        });

        bookings.push(booking);
      }
    }

    // 데이터베이스에 저장
    await Payment.insertMany(payments);
    console.log(`✅ ${payments.length}개의 결제 내역 생성 완료`);

    await Booking.insertMany(bookings);
    console.log(`✅ ${bookings.length}개의 예약 내역 생성 완료`);

    // 통계 출력
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    console.log('\n📊 생성된 데이터 통계:');
    console.log(`💰 총 매출액: ${totalRevenue.toLocaleString()}원`);
    console.log(`💳 결제 내역: ${payments.length}건`);
    console.log(`📅 예약 내역: ${bookings.length}건`);
    console.log(`✅ 완료된 결제: ${payments.filter(p => p.status === 'completed').length}건`);

  } catch (error) {
    console.error('❌ 결제 데이터 생성 실패:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

seedPaymentsOnly();
