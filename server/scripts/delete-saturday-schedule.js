/**
 * 배영 중급반의 토요일 스케줄 삭제 스크립트
 */

const path = require('path');
const dotenv = require('dotenv');

// .env 파일 경로 설정
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function deleteSaturdaySchedule() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    console.log('📍 URI:', process.env.MONGODB_URI ? 'URI 존재' : 'URI 없음');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
      console.log('💡 server/.env 파일을 확인하세요!');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    // Course 모델 가져오기
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

    // 배영 중급반 찾기
    console.log('🔍 배영 중급반 검색 중...');
    const course = await Course.findOne({ name: /배영.*중급/i });
    
    if (!course) {
      console.log('❌ 배영 중급반을 찾을 수 없습니다.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`✅ 찾음: ${course.name} (ID: ${course._id})`);
    console.log(`\n📋 현재 schedule (${course.schedule.length}개):`);
    course.schedule.forEach((sch, idx) => {
      console.log(`  ${idx + 1}. ${sch.day || sch.dayOfWeek} ${sch.startTime}-${sch.endTime}`);
    });

    // 토요일이 아닌 스케줄만 유지 (화, 목만 남김)
    const newSchedule = course.schedule.filter(sch => {
      const day = (sch.day || sch.dayOfWeek || '').toLowerCase();
      const isSaturday = day === 'saturday' || day === '토' || day === 'sat';
      return !isSaturday;
    });

    console.log(`\n✂️ 토요일 스케줄 제거 중...`);
    console.log(`📝 새로운 schedule (${newSchedule.length}개):`);
    newSchedule.forEach((sch, idx) => {
      console.log(`  ${idx + 1}. ${sch.day || sch.dayOfWeek} ${sch.startTime}-${sch.endTime}`);
    });

    // 업데이트 (schedule 배열 완전 교체)
    await Course.updateOne(
      { _id: course._id },
      { $set: { schedule: newSchedule } }
    );

    console.log('\n✅ 업데이트 완료!');

    // 검증
    const updated = await Course.findById(course._id);
    console.log(`\n🔍 검증 - 업데이트 후 schedule (${updated.schedule.length}개):`);
    updated.schedule.forEach((sch, idx) => {
      console.log(`  ${idx + 1}. ${sch.day || sch.dayOfWeek} ${sch.startTime}-${sch.endTime}`);
    });

    if (updated.schedule.length === 2) {
      console.log('\n🎉 성공! 토요일 스케줄이 삭제되었습니다!');
    } else {
      console.warn('\n⚠️ 예상과 다릅니다. schedule 개수를 확인하세요.');
    }

  } catch (error) {
    console.error('\n💥 오류 발생:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

deleteSaturdaySchedule();

