/**
 * 강습 과정 조회 API 테스트 스크립트
 */

const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

// Course 모델 정의
const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-clattery.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function testCourseAPI() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');

    // 센터 관리자용 강습 과정 조회 API 테스트
    console.log('\n📚 센터 관리자용 강습 과정 조회 API 테스트...');
    
    const centerId = '68f10983ccca24669078e1b4';
    
    // 센터의 강습 과정 조회 (강사 정보 포함)
    const courses = await Course.find({
      centerId: new mongoose.Types.ObjectId(centerId)
    });

    console.log(`총 ${courses.length}개의 강습 과정을 찾았습니다:`);

    // 강습 과정 데이터 변환
    const coursesData = courses.map((course) => ({
      _id: course._id,
      name: course.name,
      description: course.description,
      level: course.level,
      maxStudents: course.maxStudents,
      currentStudents: course.currentStudents || 0,
      price: course.price,
      instructorId: course.instructorId || course.instructor,
      instructorName: course.instructorName || '미배정',
      instructorEmail: '',
      schedule: course.schedule,
      isPersonalLesson: course.isPersonalLesson || false,
      courseType: course.courseType || 'group',
      startDate: course.startDate,
      endDate: course.endDate,
      lanes: course.lanes || [1],
      poolType: course.poolType || 'main',
      enrolledStudents: course.enrolledStudents || [],
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));

    coursesData.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name}`);
      console.log(`     - instructorId: ${course.instructorId}`);
      console.log(`     - instructorName: ${course.instructorName}`);
      console.log(`     - instructorEmail: ${course.instructorEmail}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    console.log('\n🔌 MongoDB 연결 종료');
    await mongoose.disconnect();
  }
}

testCourseAPI();
