/**
 * 강습 과정의 강사 정보 확인 스크립트
 */

const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

// Course 모델 정의
const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function checkCourseInstructorData() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');

    // 강사 목록 조회
    console.log('\n👨‍🏫 강사 목록 조회...');
    const instructors = await User.find({ userType: 'instructor' }).select('name email _id');
    console.log(`총 ${instructors.length}명의 강사가 있습니다:`);
    instructors.forEach((instructor, index) => {
      console.log(`  ${index + 1}. ${instructor.name} (${instructor.email}) - ID: ${instructor._id}`);
    });

    // 강습 과정 목록 조회
    console.log('\n📚 강습 과정 목록 조회...');
    const courses = await Course.find({}).select('name instructor instructorId instructorName centerId');
    console.log(`총 ${courses.length}개의 강습 과정이 있습니다:`);
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name}`);
      console.log(`     - instructor: ${course.instructor || '없음'}`);
      console.log(`     - instructorId: ${course.instructorId || '없음'}`);
      console.log(`     - instructorName: ${course.instructorName || '없음'}`);
      console.log(`     - centerId: ${course.centerId || '없음'}`);
    });

    // 강사 정보가 없는 강습 과정 확인
    console.log('\n❌ 강사 정보가 없는 강습 과정:');
    const coursesWithoutInstructor = courses.filter(course => !course.instructorId && !course.instructor);
    if (coursesWithoutInstructor.length > 0) {
      coursesWithoutInstructor.forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.name} - 강사 정보 없음`);
      });
    } else {
      console.log('  모든 강습 과정에 강사 정보가 있습니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    console.log('\n🔌 MongoDB 연결 종료');
    await mongoose.disconnect();
  }
}

checkCourseInstructorData();


