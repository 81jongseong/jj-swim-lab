/**
 * 🏊‍♂️ JJ Swim Lab - 예약 API 테스트 스크립트
 * 
 * 예약 관리 API 엔드포인트를 테스트합니다.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 임포트
const { PersonalLesson } = require('./dist/models/PersonalLesson');
const { LaneRental } = require('./dist/models/LaneRental');
const { User } = require('./dist/models/User');
const { Center } = require('./dist/models/Center');

async function testBookingAPI() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 센터 찾기
    const center = await Center.findOne({ name: 'JJ Swim Center' });
    if (!center) {
      console.log('❌ 센터를 찾을 수 없습니다.');
      return;
    }

    console.log('🏢 센터:', center.name);

    // 개인레슨 데이터 조회
    const personalLessons = await PersonalLesson.find({ centerId: center._id })
      .populate('studentId', 'name email phone')
      .populate('instructorId', 'name')
      .sort({ createdAt: -1 });

    console.log(`📚 개인레슨 ${personalLessons.length}개 발견:`);
    personalLessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.studentId.name} - ${lesson.instructorId?.name || '미배정'} - ${lesson.status} - ${lesson.price}원`);
    });

    // 레인대여 데이터 조회
    const laneRentals = await LaneRental.find({ centerId: center._id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(`🏊‍♀️ 레인대여 ${laneRentals.length}개 발견:`);
    laneRentals.forEach((rental, index) => {
      console.log(`  ${index + 1}. ${rental.userId.name} - 레인 ${rental.laneNumber} - ${rental.status} - ${rental.price}원`);
    });

    // 통합 예약 목록 생성 (API와 동일한 로직)
    const allBookings = [
      ...personalLessons.map(lesson => ({
        _id: lesson._id,
        type: 'personal-lesson',
        memberId: lesson.studentId._id,
        memberName: lesson.studentId.name,
        instructorId: lesson.instructorId?._id,
        instructorName: lesson.instructorId?.name,
        date: lesson.date,
        time: lesson.time,
        duration: lesson.duration,
        status: lesson.status,
        price: lesson.price || 0,
        createdAt: lesson.createdAt
      })),
      ...laneRentals.map(rental => ({
        _id: rental._id,
        type: 'lane-rental',
        memberId: rental.userId._id,
        memberName: rental.userId.name,
        date: rental.date,
        time: rental.startTime,
        duration: rental.duration,
        status: rental.status,
        price: rental.price || 0,
        createdAt: rental.createdAt
      }))
    ];

    console.log(`📊 통합 예약 목록 ${allBookings.length}개:`);
    allBookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.type} - ${booking.memberName} - ${booking.status} - ${booking.price}원`);
    });

    // 대시보드 통계 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await PersonalLesson.countDocuments({
      centerId: center._id,
      date: { $gte: today, $lt: tomorrow }
    }) + await LaneRental.countDocuments({
      centerId: center._id,
      date: { $gte: today, $lt: tomorrow }
    });

    const pendingPersonalLessons = await PersonalLesson.countDocuments({
      centerId: center._id,
      status: 'pending'
    });

    const pendingLaneRentals = await LaneRental.countDocuments({
      centerId: center._id,
      status: 'pending'
    });

    console.log('📈 대시보드 통계:');
    console.log(`  오늘 예약: ${todayBookings}개`);
    console.log(`  대기 중인 개인레슨: ${pendingPersonalLessons}개`);
    console.log(`  대기 중인 레인대여: ${pendingLaneRentals}개`);

    console.log('✅ API 테스트 완료!');

  } catch (error) {
    console.error('❌ API 테스트 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
testBookingAPI();


