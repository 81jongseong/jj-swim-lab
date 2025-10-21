/**
 * 특정 강좌의 schedule 수정 스크립트
 * 
 * 사용법:
 * node server/scripts/fix-course-schedule.js
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function fixCourseSchedule() {
  try {
    // MongoDB 연결
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // Course 모델 가져오기
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

    // 배영 중급반 찾기
    const course = await Course.findOne({ name: /배영.*중급/i });
    
    if (!course) {
      console.log('❌ 배영 중급반을 찾을 수 없습니다.');
      process.exit(0);
    }

    console.log('\n📋 현재 schedule:', JSON.stringify(course.schedule, null, 2));

    // 토요일 제거하고 화, 목만 남기기
    const newSchedule = course.schedule.filter(sch => {
      const day = sch.day || sch.dayOfWeek || '';
      return day.toLowerCase() === 'tuesday' || day.toLowerCase() === 'thursday' ||
             day === '화' || day === '목';
    });

    console.log('\n📝 새로운 schedule:', JSON.stringify(newSchedule, null, 2));

    // 업데이트
    course.schedule = newSchedule;
    await course.save();

    console.log('\n✅ 배영 중급반 schedule 업데이트 완료!');

    // 검증
    const updated = await Course.findById(course._id);
    console.log('\n🔍 업데이트 후 schedule:', JSON.stringify(updated.schedule, null, 2));

  } catch (error) {
    console.error('💥 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

fixCourseSchedule();

