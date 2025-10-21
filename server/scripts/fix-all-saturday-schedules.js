/**
 * 모든 과정의 잘못된 토요일 스케줄 확인 및 수정 스크립트
 */

const path = require('path');
const dotenv = require('dotenv');

// .env 파일 경로 설정
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function fixAllSaturdaySchedules() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    // Course 모델 가져오기
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

    // 모든 과정 조회
    console.log('🔍 모든 강습 과정 조회 중...\n');
    const allCourses = await Course.find({});
    console.log(`📋 총 ${allCourses.length}개 과정 발견\n`);

    // 각 과정의 스케줄 확인
    let fixedCount = 0;
    
    for (const course of allCourses) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📚 ${course.name} (ID: ${course._id})`);
      console.log(`${'='.repeat(50)}`);
      
      if (!course.schedule || course.schedule.length === 0) {
        console.log('⚠️ 스케줄이 없습니다.');
        continue;
      }

      console.log(`\n📋 현재 schedule (${course.schedule.length}개):`);
      course.schedule.forEach((sch, idx) => {
        const day = sch.day || sch.dayOfWeek || '?';
        const start = sch.startTime || '?';
        const end = sch.endTime || '?';
        const isSat = day.toLowerCase() === 'saturday' || day === '토';
        console.log(`  ${idx + 1}. ${day} ${start}-${end} ${isSat ? '🌟 토요일!' : ''}`);
      });

      // 토요일 스케줄이 있는지 확인
      const hasSaturday = course.schedule.some(sch => {
        const day = (sch.day || sch.dayOfWeek || '').toLowerCase();
        return day === 'saturday' || day === '토' || day === 'sat';
      });

      if (!hasSaturday) {
        console.log('✅ 토요일 스케줄 없음 - 수정 불필요');
        continue;
      }

      // 사용자에게 확인 요청
      console.log('\n⚠️ 토요일 스케줄이 포함되어 있습니다!');
      console.log('이 과정의 토요일 스케줄을 삭제하시겠습니까? (배영 중급반, 평영 고급반은 자동 삭제)');
      
      // 특정 과정은 자동 삭제
      const autoDelete = course.name.includes('배영') || course.name.includes('평영');
      
      if (autoDelete) {
        console.log('🔧 자동 삭제 대상 - 토요일 스케줄 제거 중...');
        
        // 토요일이 아닌 스케줄만 유지
        const newSchedule = course.schedule.filter(sch => {
          const day = (sch.day || sch.dayOfWeek || '').toLowerCase();
          const isSaturday = day === 'saturday' || day === '토' || day === 'sat';
          return !isSaturday;
        });

        console.log(`\n✂️ 토요일 제거 후 schedule (${newSchedule.length}개):`);
        newSchedule.forEach((sch, idx) => {
          const day = sch.day || sch.dayOfWeek || '?';
          const start = sch.startTime || '?';
          const end = sch.endTime || '?';
          console.log(`  ${idx + 1}. ${day} ${start}-${end}`);
        });

        // 업데이트
        await Course.updateOne(
          { _id: course._id },
          { $set: { schedule: newSchedule } }
        );

        console.log('✅ 업데이트 완료!');
        fixedCount++;

        // 검증
        const updated = await Course.findById(course._id);
        const stillHasSaturday = updated.schedule.some(sch => {
          const day = (sch.day || sch.dayOfWeek || '').toLowerCase();
          return day === 'saturday' || day === '토' || day === 'sat';
        });

        if (stillHasSaturday) {
          console.warn('⚠️ 토요일이 아직 남아있습니다!');
        } else {
          console.log('🎉 토요일 스케줄 삭제 성공!');
        }
      } else {
        console.log('⏭️ 건너뜀 (자동 삭제 대상 아님)');
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 작업 완료!`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📊 총 ${allCourses.length}개 과정 중 ${fixedCount}개 수정됨`);

  } catch (error) {
    console.error('\n💥 오류 발생:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

fixAllSaturdaySchedules();

