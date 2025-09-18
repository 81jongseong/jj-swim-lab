/**
 * 📊 JJ Swim Lab - 예약/결제/강의 샘플 데이터 생성
 * 대시보드에 표시될 실제 데이터 생성
 */

const mongoose = require('mongoose');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 모델 import (컴파일된 JS 파일 사용)
const { User } = require('../dist/models/User');
const { Course } = require('../dist/models/Course');
const { Booking } = require('../dist/models/Booking');
const { Payment } = require('../dist/models/Payment');
const { ExerciseData } = require('../dist/models/ExerciseData');

async function addBookingPaymentData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 완료');

    // 사용자 찾기
    const student = await User.findOne({ userId: 'student1' });
    const instructor = await User.findOne({ userId: 'instructor1' });
    const center = await User.findOne({ userType: 'centerAdmin' });

    if (!student || !instructor) {
      console.error('❌ 필요한 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('👤 사용자 확인 완료:', {
      student: student.name,
      instructor: instructor.name,
      centerId: student.centerId
    });

    // 1. 강의 데이터 생성
    console.log('\n📚 강의 데이터 생성 중...');
    await Course.deleteMany({ centerId: student.centerId });
    
    const courses = [
      {
        name: '수영 기초반',
        description: '초보자를 위한 기본 수영 강습',
        instructor: instructor._id,
        centerId: student.centerId,
        classInfo: {
          schedule: {
            dayOfWeek: [1, 3, 5], // 월, 수, 금
            startTime: '14:00',
            endTime: '15:00'
          },
          duration: 60,
          maxCapacity: 8,
          currentEnrollment: 5
        },
        courseInfo: {
          level: 'beginner',
          techniques: ['freestyle', 'floating'],
          equipment: ['kickboard', 'pool_noodle'],
          objectives: ['기본 자세 습득', '물에 대한 두려움 극복']
        },
        pricing: {
          basePrice: 50000,
          discountPrice: 45000,
          currency: 'KRW'
        },
        isActive: true,
        status: 'active'
      },
      {
        name: '자유형 중급반',
        description: '자유형 기술 향상 강습',
        instructor: instructor._id,
        centerId: student.centerId,
        classInfo: {
          schedule: {
            dayOfWeek: [2, 4, 6], // 화, 목, 토
            startTime: '15:00',
            endTime: '16:00'
          },
          duration: 60,
          maxCapacity: 6,
          currentEnrollment: 4
        },
        courseInfo: {
          level: 'intermediate',
          techniques: ['freestyle'],
          equipment: ['fins', 'hand_paddles'],
          objectives: ['스트로크 개선', '속도 향상']
        },
        pricing: {
          basePrice: 70000,
          discountPrice: 65000,
          currency: 'KRW'
        },
        isActive: true,
        status: 'active'
      }
    ];

    const savedCourses = [];
    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
      savedCourses.push(course);
      console.log(`  ✅ 강의 생성: ${course.name}`);
    }

    // 2. 예약 데이터 생성
    console.log('\n📅 예약 데이터 생성 중...');
    await Booking.deleteMany({ centerId: student.centerId });

    const bookings = [];
    for (let i = 0; i < 10; i++) {
      const course = savedCourses[Math.floor(Math.random() * savedCourses.length)];
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30) - 15); // 지난 15일 ~ 앞으로 15일

      const booking = new Booking({
        studentId: student._id,
        courseId: course._id,
        instructorId: instructor._id,
        centerId: student.centerId,
        date: bookingDate,
        time: course.classInfo.schedule.startTime,
        duration: course.classInfo.duration,
        status: i < 7 ? 'completed' : 'confirmed', // 7개는 완료, 3개는 예정
        paymentStatus: 'paid',
        notes: `${course.name} 예약 ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });

      await booking.save();
      bookings.push(booking);
    }
    console.log(`  ✅ 예약 생성: ${bookings.length}개`);

    // 3. 결제 데이터 생성
    console.log('\n💳 결제 데이터 생성 중...');
    await Payment.deleteMany({ userId: student._id });

    for (const booking of bookings) {
      const course = savedCourses.find(c => c._id.equals(booking.courseId));
      const payment = new Payment({
        userId: student._id,
        bookingId: booking._id,
        courseId: course._id,
        centerId: student.centerId,
        amount: course.pricing.discountPrice,
        paymentMethod: ['card', 'transfer', 'cash'][Math.floor(Math.random() * 3)],
        status: 'completed',
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paidAt: booking.createdAt,
        createdAt: booking.createdAt
      });

      await payment.save();
    }
    console.log(`  ✅ 결제 생성: ${bookings.length}개`);

    // 4. 운동 기록 데이터 생성
    console.log('\n🏊‍♂️ 운동 기록 생성 중...');
    await ExerciseData.deleteMany({ userId: student._id });

    for (let i = 0; i < 15; i++) {
      const sessionDate = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000);
      const exerciseData = new ExerciseData({
        userId: student._id,
        sessionId: `session_${student._id}_${i}`,
        sessionInfo: {
          date: sessionDate,
          startTime: new Date(sessionDate.getTime() + 14 * 60 * 60 * 1000),
          endTime: new Date(sessionDate.getTime() + 15 * 60 * 60 * 1000),
          duration: 60,
          technique: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'][Math.floor(Math.random() * 4)],
          poolLength: 25,
          totalDistance: 800 + Math.floor(Math.random() * 400)
        },
        performanceMetrics: {
          averageSpeed: 1.0 + Math.random() * 0.5,
          maxSpeed: 1.2 + Math.random() * 0.6,
          totalCalories: 250 + Math.floor(Math.random() * 200),
          averageHeartRate: 130 + Math.floor(Math.random() * 30),
          maxHeartRate: 150 + Math.floor(Math.random() * 30),
          strokeCount: 600 + Math.floor(Math.random() * 400),
          efficiency: 70 + Math.floor(Math.random() * 30)
        },
        poseAnalysis: {
          overallScore: 70 + Math.floor(Math.random() * 30),
          headPosition: 75 + Math.floor(Math.random() * 20),
          bodyAlignment: 70 + Math.floor(Math.random() * 25),
          armMovement: 80 + Math.floor(Math.random() * 15),
          legKick: 75 + Math.floor(Math.random() * 20),
          breathing: 70 + Math.floor(Math.random() * 25),
          recommendations: [
            '머리 위치를 더 안정적으로 유지하세요',
            '팔 동작의 일관성을 높여보세요',
            '호흡 타이밍을 개선해보세요'
          ]
        }
      });
      await exerciseData.save();
    }
    console.log(`  ✅ 운동 기록 생성: 15개`);

    console.log('\n🎉 모든 대시보드 데이터 생성 완료!');
    console.log('\n📊 생성된 데이터:');
    console.log(`- 강의: ${savedCourses.length}개`);
    console.log(`- 예약: ${bookings.length}개`);
    console.log(`- 결제: ${bookings.length}개`);
    console.log('- 운동 기록: 15개');
    console.log('\n🎯 확인 방법:');
    console.log('1. student1 / 101010 로그인');
    console.log('2. 대시보드 페이지 접속');
    console.log('3. 통계 데이터 확인 (더 이상 0이 아님)');

  } catch (error) {
    console.error('❌ 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  addBookingPaymentData();
}

module.exports = { addBookingPaymentData };
