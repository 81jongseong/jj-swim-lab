/**
 * ✅ JJ Swim Lab - 총매출 API 테스트용 시드 데이터 생성
 * 
 * 📋 **생성 데이터**
 * - 사용자 (학생, 강사)
 * - 과정
 * - 예약
 * - 결제 내역
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const User = require('../dist/models/User').User;
const Course = require('../dist/models/Course').Course;
const Booking = require('../dist/models/Booking').Booking;
const Payment = require('../dist/models/Payment').Payment;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function seedRevenueData() {
  try {
    console.log('🚀 총매출 API 테스트용 시드 데이터 생성 시작...');
    
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 정리
    console.log('🧹 기존 데이터 정리 중...');
    await Payment.deleteMany({});
    await Booking.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({ userType: { $in: ['student', 'instructor'] } });
    console.log('✅ 기존 데이터 정리 완료');

    // 강사 생성
    console.log('👨‍🏫 강사 데이터 생성 중...');
    const instructors = await User.create([
      {
        name: '김수영',
        email: 'kim.swim@jjswim.com',
        password: 'password123',
        userType: 'instructor',
        phone: '010-1234-5678',
        isApproved: true,
        approvedAt: new Date()
      },
      {
        name: '이강사',
        email: 'lee.instructor@jjswim.com',
        password: 'password123',
        userType: 'instructor',
        phone: '010-2345-6789',
        isApproved: true,
        approvedAt: new Date()
      },
      {
        name: '박지도',
        email: 'park.coach@jjswim.com',
        password: 'password123',
        userType: 'instructor',
        phone: '010-3456-7890',
        isApproved: true,
        approvedAt: new Date()
      }
    ]);
    console.log(`✅ ${instructors.length}명의 강사 생성 완료`);

    // 학생 생성
    console.log('👨‍🎓 학생 데이터 생성 중...');
    const students = await User.create([
      {
        name: '김학생',
        email: 'student1@example.com',
        password: 'password123',
        userType: 'student',
        phone: '010-1111-1111'
      },
      {
        name: '이학생',
        email: 'student2@example.com',
        password: 'password123',
        userType: 'student',
        phone: '010-2222-2222'
      },
      {
        name: '박학생',
        email: 'student3@example.com',
        password: 'password123',
        userType: 'student',
        phone: '010-3333-3333'
      },
      {
        name: '최학생',
        email: 'student4@example.com',
        password: 'password123',
        userType: 'student',
        phone: '010-4444-4444'
      },
      {
        name: '정학생',
        email: 'student5@example.com',
        password: 'password123',
        userType: 'student',
        phone: '010-5555-5555'
      }
    ]);
    console.log(`✅ ${students.length}명의 학생 생성 완료`);

    // 과정 생성
    console.log('📚 과정 데이터 생성 중...');
    const courses = await Course.create([
      {
        name: '초급 수영',
        description: '수영을 처음 배우는 분들을 위한 기초 과정',
        price: 120000,
        duration: 8,
        maxStudents: 10,
        instructor: instructors[0]._id,
        level: 'beginner',
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
          endDate: new Date(Date.now() + (7 + 30) * 24 * 60 * 60 * 1000), // 5주 후
          maxCapacity: 10,
          currentEnrollment: 0
        }
      },
      {
        name: '중급 수영',
        description: '기본기를 바탕으로 한 심화 과정',
        price: 150000,
        duration: 10,
        maxStudents: 8,
        instructor: instructors[1]._id,
        level: 'intermediate',
        classInfo: {
          className: '자유형 중급반 B',
          classType: 'regular',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
          endDate: new Date(Date.now() + (7 + 35) * 24 * 60 * 60 * 1000), // 6주 후
          maxCapacity: 8,
          currentEnrollment: 0
        }
      },
      {
        name: '고급 수영',
        description: '전문적인 수영 기술을 익히는 과정',
        price: 180000,
        duration: 12,
        maxStudents: 6,
        instructor: instructors[2]._id,
        level: 'advanced',
        classInfo: {
          className: '자유형 고급반 C',
          classType: 'intensive',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
          endDate: new Date(Date.now() + (7 + 40) * 24 * 60 * 60 * 1000), // 7주 후
          maxCapacity: 6,
          currentEnrollment: 0
        }
      }
    ]);
    console.log(`✅ ${courses.length}개의 과정 생성 완료`);

    // 예약 생성
    console.log('📅 예약 데이터 생성 중...');
    const bookings = [];
    
    // 각 과정별로 여러 학생 예약
    for (let i = 0; i < students.length; i++) {
      const courseIndex = i % courses.length;
      const instructorIndex = courseIndex;
      
      const startDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000); // 1주일 후
      const endDate = new Date(startDate.getTime() + (7 + Math.random() * 30) * 24 * 60 * 60 * 1000); // 1-4주 후
      
      bookings.push({
        user: students[i]._id,
        course: courses[courseIndex]._id,
        instructor: instructors[instructorIndex]._id,
        date: startDate,
        startTime: '09:00',
        endTime: '10:00',
        laneNumber: Math.floor(Math.random() * 6) + 1, // 1-6번 레인
        purpose: 'lesson',
        status: 'confirmed',
        notes: '정기 수업'
      });
    }
    
    const createdBookings = await Booking.create(bookings);
    console.log(`✅ ${createdBookings.length}개의 예약 생성 완료`);

    // 결제 내역 생성
    console.log('💰 결제 내역 생성 중...');
    const payments = [];
    
    for (let i = 0; i < createdBookings.length; i++) {
      const booking = createdBookings[i];
      const course = courses.find(c => c._id.equals(booking.course));
      
      if (!course) {
        console.log(`⚠️ 과정을 찾을 수 없음: ${booking.course}`);
        continue;
      }
      
      // 완료된 결제
      payments.push({
        user: booking.user,
        amount: course.price,
        currency: 'KRW',
        paymentMethod: 'card',
        status: 'completed',
        purpose: 'course',
        relatedCourse: course._id,
        relatedBooking: booking._id,
        transactionId: `TXN${Date.now()}-${i}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 최근 30일 내
      });
      
      // 대기 중인 결제 (일부만)
      if (i % 3 === 0) {
        payments.push({
          user: booking.user,
          amount: course.price,
          currency: 'KRW',
          paymentMethod: 'transfer',
          status: 'pending',
          purpose: 'course',
          relatedCourse: course._id,
          relatedBooking: booking._id,
          transactionId: `TXN${Date.now()}-${i}-pending`,
          createdAt: new Date()
        });
      }
    }
    
    const createdPayments = await Payment.create(payments);
    console.log(`✅ ${createdPayments.length}개의 결제 내역 생성 완료`);

    // 통계 출력
    console.log('\n📊 생성된 데이터 통계:');
    console.log(`   - 강사: ${instructors.length}명`);
    console.log(`   - 학생: ${students.length}명`);
    console.log(`   - 과정: ${courses.length}개`);
    console.log(`   - 예약: ${createdBookings.length}개`);
    console.log(`   - 결제: ${createdPayments.length}개`);
    
    const totalRevenue = createdPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    console.log(`   - 총 매출: ${totalRevenue.toLocaleString()}원`);

    console.log('\n🎉 총매출 API 테스트용 시드 데이터 생성 완료!');
    console.log('💡 이제 /api/revenue/stats 엔드포인트를 테스트해보세요.');

  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
    process.exit(0);
  }
}

// 스크립트 실행
seedRevenueData();
