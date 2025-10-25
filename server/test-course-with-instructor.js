/**
 * 강사 정보가 포함된 강습 과정 생성 테스트
 */

const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

// Course 모델 정의
const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function testCourseWithInstructor() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');

    // 강사 정보 조회
    const instructor = await User.findOne({ userType: 'instructor' });
    if (!instructor) {
      console.log('❌ 강사를 찾을 수 없습니다.');
      return;
    }

    console.log(`👨‍🏫 강사 정보: ${instructor.name} (${instructor._id})`);

    // 강습 과정 생성
    const courseData = {
      name: '테스트 강습 과정',
      description: '강사 정보가 포함된 테스트 강습 과정입니다.',
      level: 'beginner',
      duration: 60,
      price: 50000,
      maxStudents: 10,
      instructor: instructor._id,
      instructorId: instructor._id,
      instructorName: instructor.name,
      centerId: '68f10983ccca24669078e1b4',
      schedule: [
        {
          day: 'monday',
          startTime: '19:00',
          endTime: '20:00'
        }
      ],
      isActive: true
    };

    console.log('📚 강습 과정 생성 중...');
    const course = new Course(courseData);
    await course.save();

    console.log('✅ 강습 과정 생성 완료!');
    console.log(`📋 생성된 강습 과정 ID: ${course._id}`);

    // 생성된 강습 과정 확인
    const savedCourse = await Course.findById(course._id);
    console.log('📋 저장된 강습 과정 정보:');
    console.log(`  - 이름: ${savedCourse.name}`);
    console.log(`  - instructor: ${savedCourse.instructor}`);
    console.log(`  - instructorId: ${savedCourse.instructorId}`);
    console.log(`  - instructorName: ${savedCourse.instructorName}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    console.log('\n🔌 MongoDB 연결 종료');
    await mongoose.disconnect();
  }
}

testCourseWithInstructor();


