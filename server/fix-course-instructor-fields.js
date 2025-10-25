/**
 * 강습 과정의 instructorId 필드 수정 스크립트
 */

const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

// Course 모델 정의
const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function fixCourseInstructorFields() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');

    // 모든 강습 과정 조회
    const courses = await Course.find({});

    console.log(`\n📚 총 ${courses.length}개의 강습 과정을 수정합니다.`);

    for (const course of courses) {
      console.log(`\n🔄 수정 중: ${course.name}`);
      
      // instructorId가 없으면 instructor 값을 instructorId에 복사
      if (!course.instructorId && course.instructor) {
        course.instructorId = course.instructor;
        console.log(`  - instructorId 추가: ${course.instructorId}`);
      }

      // instructorName이 없으면 강사 이름 조회해서 추가
      if (!course.instructorName && course.instructor) {
        const instructor = await User.findById(course.instructor);
        if (instructor) {
          course.instructorName = instructor.name;
          console.log(`  - instructorName 추가: ${instructor.name}`);
        }
      }

      // 강제로 저장
      await Course.findByIdAndUpdate(course._id, {
        instructorId: course.instructorId || course.instructor,
        instructorName: course.instructorName
      });

      console.log(`  ✅ 수정 완료: ${course.name}`);
    }

    console.log('\n✅ 모든 강습 과정 수정 완료!');

    // 수정 결과 확인
    console.log('\n📋 수정 결과 확인:');
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

fixCourseInstructorFields();


