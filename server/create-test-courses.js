const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function createTestCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const courseSchema = new mongoose.Schema({
      name: String,
      description: String,
      level: String,
      instructorId: mongoose.Schema.Types.ObjectId,
      centerId: mongoose.Schema.Types.ObjectId,
      maxStudents: Number,
      enrolledStudents: [mongoose.Schema.Types.Mixed],
      status: String,
      price: Number,
      duration: Number,
      schedule: mongoose.Schema.Types.Mixed,
      createdAt: Date,
      updatedAt: Date
    });

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      centerAdminInfo: {
        managedCenters: [mongoose.Schema.Types.ObjectId]
      }
    });

    const Course = mongoose.model('Course', courseSchema);
    const User = mongoose.model('User', userSchema);

    // 1. 센터 관리자 확인
    const centerAdmin = await User.findOne({ 
      email: 'center-admin@jjswimlab.com',
      userType: 'center-admin'
    });
    
    if (!centerAdmin) {
      console.error('❌ center-admin@jjswimlab.com 사용자를 찾을 수 없습니다.');
      return;
    }

    const centerId = centerAdmin.centerAdminInfo?.managedCenters?.[0];
    console.log('📋 센터 관리자:', centerAdmin.name);
    console.log('📋 관리 센터 ID:', centerId);

    // 2. 해당 센터의 강사 목록 확인
    const instructors = await User.find({ 
      userType: 'instructor', 
      centerId: centerId 
    });
    
    console.log(`\n👨‍🏫 센터의 강사 수: ${instructors.length}명`);
    if (instructors.length === 0) {
      console.error('❌ 강사가 없어서 강습 과정을 생성할 수 없습니다.');
      return;
    }

    // 3. 테스트 강습 과정 생성
    const testCourses = [
      {
        name: '초급 자유형',
        description: '수영을 처음 시작하는 분들을 위한 초급 자유형 강습',
        level: 'beginner',
        instructorId: instructors[0]._id,
        centerId: centerId,
        maxStudents: 8,
        enrolledStudents: [],
        status: 'active',
        price: 80000,
        duration: 60,
        schedule: {
          days: ['월', '수', '금'],
          time: '19:00-20:00'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '중급 배영',
        description: '배영 기본기를 다지는 중급 강습',
        level: 'intermediate',
        instructorId: instructors[1]._id,
        centerId: centerId,
        maxStudents: 6,
        enrolledStudents: [],
        status: 'active',
        price: 90000,
        duration: 60,
        schedule: {
          days: ['화', '목'],
          time: '20:00-21:00'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '고급 접영',
        description: '접영 마스터를 위한 고급 강습',
        level: 'advanced',
        instructorId: instructors[2]._id,
        centerId: centerId,
        maxStudents: 4,
        enrolledStudents: [],
        status: 'active',
        price: 100000,
        duration: 60,
        schedule: {
          days: ['월', '수', '금'],
          time: '21:00-22:00'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '개인 레슨',
        description: '1:1 맞춤형 개인 레슨',
        level: 'all',
        instructorId: instructors[0]._id,
        centerId: centerId,
        maxStudents: 1,
        enrolledStudents: [],
        status: 'active',
        price: 120000,
        duration: 60,
        schedule: {
          days: ['토', '일'],
          time: '10:00-11:00'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log('\n📚 테스트 강습 과정 생성 중...');
    const createdCourses = [];
    
    for (const courseData of testCourses) {
      try {
        const newCourse = new Course(courseData);
        const savedCourse = await newCourse.save();
        createdCourses.push(savedCourse);
        console.log(`✅ 강습 과정 생성: ${savedCourse.name}`);
      } catch (error) {
        console.error(`❌ 강습 과정 생성 실패: ${courseData.name}`, error.message);
      }
    }

    console.log(`\n📊 생성 결과: ${createdCourses.length}개 강습 과정 생성 완료`);
    
    // 4. 생성된 강습 과정 확인
    const finalCourses = await Course.find({ centerId: centerId });
    console.log('\n📚 최종 강습 과정 목록:');
    finalCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name}`);
      console.log(`   - 레벨: ${course.level}`);
      console.log(`   - 강사: ${instructors.find(i => i._id.toString() === course.instructorId.toString())?.name || '미배정'}`);
      console.log(`   - 최대 수강생: ${course.maxStudents}`);
      console.log(`   - 가격: ${course.price?.toLocaleString() || 0}원`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

createTestCourses();

