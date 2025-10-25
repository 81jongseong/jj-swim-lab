/**
 * 기존 강습 과정들의 instructorId 필드 업데이트 스크립트
 */

const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

// Course 모델 정의
const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function updateExistingCourses() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');

    // instructorId가 없는 강습 과정들 조회
    const coursesWithoutInstructorId = await Course.find({
      instructor: { $exists: true },
      instructorId: { $exists: false }
    });

    console.log(`\n📚 instructorId가 없는 강습 과정: ${coursesWithoutInstructorId.length}개`);

    for (const course of coursesWithoutInstructorId) {
      console.log(`\n🔄 업데이트 중: ${course.name}`);
      console.log(`  - 현재 instructor: ${course.instructor}`);
      console.log(`  - 현재 instructorName: ${course.instructorName || '없음'}`);

      // instructorId 필드 추가
      course.instructorId = course.instructor;
      
      // instructorName이 없으면 강사 이름 조회해서 추가
      if (!course.instructorName && course.instructor) {
        const instructor = await User.findById(course.instructor);
        if (instructor) {
          course.instructorName = instructor.name;
          console.log(`  - 강사 이름 추가: ${instructor.name}`);
        }
      }

      await course.save();
      console.log(`  ✅ 업데이트 완료: ${course.name}`);
    }

    console.log('\n✅ 모든 강습 과정 업데이트 완료!');

    // 업데이트 결과 확인
    console.log('\n📋 업데이트 결과 확인:');
    const updatedCourses = await Course.find({}).select('name instructor instructorId instructorName');
    updatedCourses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name}`);
      console.log(`     - instructor: ${course.instructor || '없음'}`);
      console.log(`     - instructorId: ${course.instructorId || '없음'}`);
      console.log(`     - instructorName: ${course.instructorName || '없음'}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    console.log('\n🔌 MongoDB 연결 종료');
    await mongoose.disconnect();
  }
}

updateExistingCourses();


