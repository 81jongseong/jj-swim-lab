/**
 * 🏊‍♂️ JJ Swim Lab - 예약 테스트 데이터 생성 스크립트
 * 
 * 개인레슨과 레인대여 테스트 데이터를 생성합니다.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 임포트
const { PersonalLesson } = require('./dist/models/PersonalLesson');
const { LaneRental } = require('./dist/models/LaneRental');
const { User } = require('./dist/models/User');
const { Center } = require('./dist/models/Center');

async function createBookingTestData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 테스트 데이터 삭제
    console.log('🧹 기존 테스트 데이터 삭제 중...');
    await PersonalLesson.deleteMany({});
    await LaneRental.deleteMany({});
    console.log('✅ 기존 테스트 데이터 삭제 완료');

    // 센터 찾기 또는 생성
    let center = await Center.findOne({ name: 'JJ Swim Center' });
    if (!center) {
      center = new Center({
        name: 'JJ Swim Center',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'center@swim.com',
        capacity: 100,
        facilities: ['수영장', '샤워실', '락커룸'],
        operatingHours: {
          open: '06:00',
          close: '22:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }
      });
      await center.save();
      console.log('✅ 센터 생성 완료');
    } else {
      console.log('✅ 기존 센터 사용');
    }

    // 학생 사용자 찾기
    const students = await User.find({ userType: 'student' }).limit(3);
    if (students.length === 0) {
      console.log('❌ 학생 사용자가 없습니다. 먼저 사용자를 생성해주세요.');
      return;
    }

    // 강사 사용자 찾기
    const instructors = await User.find({ userType: 'instructor' }).limit(2);
    if (instructors.length === 0) {
      console.log('❌ 강사 사용자가 없습니다. 먼저 강사를 생성해주세요.');
      return;
    }

    console.log(`👥 학생 ${students.length}명, 강사 ${instructors.length}명 발견`);

    // 개인레슨 테스트 데이터 생성
    const personalLessons = [
      {
        studentId: students[0]._id,
        instructorId: instructors[0]._id,
        centerId: center._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일
        time: '10:00',
        duration: 60,
        status: 'pending',
        lessonType: 'freestyle',
        skillLevel: 'beginner',
        goals: '자유형 기초 배우기',
        price: 50000,
        specialRequests: '초보자 친화적인 지도 부탁드립니다',
        paymentStatus: 'pending'
      },
      {
        studentId: students[1]._id,
        instructorId: instructors[1]._id,
        centerId: center._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
        time: '14:00',
        duration: 90,
        status: 'approved',
        lessonType: 'backstroke',
        skillLevel: 'intermediate',
        goals: '배영 기술 향상',
        price: 75000,
        paymentStatus: 'completed'
      },
      {
        studentId: students[2]._id,
        instructorId: instructors[0]._id,
        centerId: center._id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        time: '16:00',
        duration: 60,
        status: 'pending',
        lessonType: 'breaststroke',
        skillLevel: 'advanced',
        goals: '평영 완성',
        price: 60000,
        paymentStatus: 'pending'
      }
    ];

    // 레인대여 테스트 데이터 생성
    const laneRentals = [
      {
        userId: students[0]._id,
        centerId: center._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        laneNumber: 1,
        poolType: 'mainPool',
        status: 'pending',
        purpose: '자유수영',
        price: 15000,
        paymentStatus: 'pending'
      },
      {
        userId: students[1]._id,
        centerId: center._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
        startTime: '11:00',
        endTime: '12:30',
        duration: 90,
        laneNumber: 2,
        poolType: 'mainPool',
        status: 'approved',
        purpose: '연습',
        price: 22500,
        paymentStatus: 'completed'
      },
      {
        userId: students[2]._id,
        centerId: center._id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        startTime: '15:00',
        endTime: '16:00',
        duration: 60,
        laneNumber: 3,
        poolType: 'mainPool',
        status: 'pending',
        purpose: '경기준비',
        price: 20000,
        paymentStatus: 'pending'
      }
    ];

    // 데이터베이스에 저장
    console.log('💾 개인레슨 테스트 데이터 저장 중...');
    const savedPersonalLessons = await PersonalLesson.insertMany(personalLessons);
    console.log(`✅ 개인레슨 ${savedPersonalLessons.length}개 생성 완료`);

    console.log('💾 레인대여 테스트 데이터 저장 중...');
    const savedLaneRentals = await LaneRental.insertMany(laneRentals);
    console.log(`✅ 레인대여 ${savedLaneRentals.length}개 생성 완료`);

    console.log('🎉 예약 테스트 데이터 생성 완료!');
    console.log(`📊 총 개인레슨: ${savedPersonalLessons.length}개`);
    console.log(`📊 총 레인대여: ${savedLaneRentals.length}개`);

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
createBookingTestData();