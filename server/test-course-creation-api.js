/**
 * 강습 과정 생성 API 테스트 스크립트
 */

const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

// Course 모델 정의
const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function testCourseCreationAPI() {
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

    // 강습 과정 생성 데이터 (실제 API 요청과 동일한 형태)
    const courseData = {
      name: 'API 테스트 강습 과정',
      description: 'API를 통해 생성된 테스트 강습 과정입니다.',
      level: 'beginner',
      duration: 60,
      price: 50000,
      maxStudents: 10,
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
    console.log('📋 생성할 강습 과정 데이터:', courseData);
    
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

    // 센터 관리자용 강습 과정 조회 API 테스트
    console.log('\n📚 센터 관리자용 강습 과정 조회 API 테스트...');
    
    const centerId = '68f10983ccca24669078e1b4';
    
    // 센터의 강습 과정 조회
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
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    console.log('\n🔌 MongoDB 연결 종료');
    await mongoose.disconnect();
  }
}

testCourseCreationAPI();