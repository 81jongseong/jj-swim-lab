/**
 * 📅 간단한 예약 테스트 데이터 생성 스크립트
 * 
 * MongoDB에 직접 데이터를 삽입합니다.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority');

async function createSimpleBookingData() {
  try {
    console.log('🚀 간단한 예약 테스트 데이터 생성 시작...');

    const db = mongoose.connection.db;

    // 센터 정보 가져오기
    const center = await db.collection('centers').findOne({ email: 'center@swim.com' });
    if (!center) {
      console.error('❌ 센터를 찾을 수 없습니다.');
      return;
    }
    console.log('🏢 센터 찾음:', center.name);

    // 학생들 가져오기
    const students = await db.collection('users').find({ 
      userType: 'student',
      'studentInfo.centerId': center._id 
    }).limit(5).toArray();
    console.log('👥 학생 수:', students.length);

    // 강사들 가져오기
    const instructors = await db.collection('users').find({ 
      userType: 'instructor',
      'instructorInfo.assignedCenters': center._id 
    }).limit(3).toArray();
    console.log('👨‍🏫 강사 수:', instructors.length);

    // 개인레슨 테스트 데이터 생성
    const personalLessonData = [
      {
        studentId: students[0]._id,
        instructorId: instructors[0]._id,
        centerId: center._id,
        date: new Date('2025-01-15'),
        time: '09:00',
        duration: 60,
        status: 'pending',
        lessonType: 'freestyle',
        skillLevel: 'beginner',
        goals: '자유형 기초 배우기',
        notes: '첫 개인레슨 신청입니다.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: students[1]._id,
        instructorId: instructors[1]._id,
        centerId: center._id,
        date: new Date('2025-01-16'),
        time: '14:00',
        duration: 90,
        status: 'confirmed',
        lessonType: 'backstroke',
        skillLevel: 'intermediate',
        goals: '배영 완성하기',
        notes: '중급자 개인레슨',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: students[2]._id,
        instructorId: instructors[0]._id,
        centerId: center._id,
        date: new Date('2025-01-17'),
        time: '16:00',
        duration: 60,
        status: 'pending',
        lessonType: 'breaststroke',
        skillLevel: 'advanced',
        goals: '평영 기술 향상',
        notes: '고급자 개인레슨',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 레인대여 테스트 데이터 생성
    const laneRentalData = [
      {
        userId: students[3]._id,
        centerId: center._id,
        date: new Date('2025-01-15'),
        startTime: '07:00',
        endTime: '08:00',
        duration: 60,
        laneNumber: 1,
        status: 'pending',
        purpose: '자유수영',
        notes: '아침 자유수영',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: students[4]._id,
        centerId: center._id,
        date: new Date('2025-01-16'),
        startTime: '19:00',
        endTime: '20:00',
        duration: 60,
        laneNumber: 2,
        status: 'confirmed',
        purpose: '자유수영',
        notes: '저녁 자유수영',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: students[0]._id,
        centerId: center._id,
        date: new Date('2025-01-17'),
        startTime: '18:00',
        endTime: '19:00',
        duration: 60,
        laneNumber: 3,
        status: 'pending',
        purpose: '자유수영',
        notes: '주말 자유수영',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 기존 데이터 삭제
    await db.collection('personallessons').deleteMany({ centerId: center._id });
    await db.collection('lanerentals').deleteMany({ centerId: center._id });
    console.log('🗑️ 기존 예약 데이터 삭제 완료');

    // 개인레슨 데이터 생성
    const personalLessonResult = await db.collection('personallessons').insertMany(personalLessonData);
    console.log('✅ 개인레슨 테스트 데이터 생성 완료:', personalLessonResult.insertedCount, '개');

    // 레인대여 데이터 생성
    const laneRentalResult = await db.collection('lanerentals').insertMany(laneRentalData);
    console.log('✅ 레인대여 테스트 데이터 생성 완료:', laneRentalResult.insertedCount, '개');

    console.log('🎉 예약 테스트 데이터 생성 완료!');
    console.log('📊 생성된 데이터:');
    console.log('  - 개인레슨:', personalLessonResult.insertedCount, '개');
    console.log('  - 레인대여:', laneRentalResult.insertedCount, '개');

  } catch (error) {
    console.error('❌ 예약 테스트 데이터 생성 실패:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSimpleBookingData();


