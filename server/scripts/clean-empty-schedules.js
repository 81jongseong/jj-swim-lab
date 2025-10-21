/**
 * 빈 schedule을 가진 강습 과정 정리 스크립트
 * 
 * 옵션:
 * 1. 삭제 (기본값)
 * 2. 기본 schedule 추가
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

async function cleanEmptySchedules() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 완료!');

    // 1. 모든 강습 과정 조회
    const allCourses = await Course.find();
    console.log(`📚 전체 강습 과정: ${allCourses.length}개`);

    // 2. schedule이 비어있는 과정 찾기
    const emptyScheduleCourses = allCourses.filter(course => 
      !course.schedule || course.schedule.length === 0
    );

    console.log(`\n⚠️ schedule이 비어있는 과정: ${emptyScheduleCourses.length}개`);
    
    if (emptyScheduleCourses.length === 0) {
      console.log('✅ 모든 과정에 schedule이 설정되어 있습니다!');
      process.exit(0);
    }

    // 3. 상세 정보 출력
    console.log('\n📋 상세 목록:');
    emptyScheduleCourses.forEach((course, idx) => {
      console.log(`  ${idx + 1}. ${course.name} (ID: ${course._id})`);
      console.log(`     - schedule: ${JSON.stringify(course.schedule)}`);
      console.log(`     - instructor: ${course.instructor}`);
    });

    // 4. 삭제 여부 선택
    console.log('\n\n🗑️ 이 과정들을 삭제합니다...');
    
    for (const course of emptyScheduleCourses) {
      await Course.findByIdAndDelete(course._id);
      console.log(`   ✅ 삭제: ${course.name}`);
    }

    console.log(`\n✅ 총 ${emptyScheduleCourses.length}개 과정 삭제 완료!`);

    // 5. 검증
    const remaining = await Course.find();
    console.log(`\n📊 남은 강습 과정: ${remaining.length}개`);
    
    const stillEmpty = remaining.filter(c => !c.schedule || c.schedule.length === 0);
    console.log(`   빈 schedule: ${stillEmpty.length}개`);

    process.exit(0);
  } catch (error) {
    console.error('💥 에러 발생:', error);
    process.exit(1);
  }
}

cleanEmptySchedules();

