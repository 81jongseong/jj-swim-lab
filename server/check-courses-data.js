const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function checkCoursesData() {
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

    // 2. 해당 센터의 강습 과정 확인
    const courses = await Course.find({ centerId: centerId });
    console.log('\n📚 센터의 강습 과정 목록:');
    console.log(`- 총 강습 과정 수: ${courses.length}개`);
    
    if (courses.length === 0) {
      console.log('❌ 강습 과정이 없습니다!');
      
      // 3. 전체 강습 과정 확인
      const allCourses = await Course.find({});
      console.log('\n📚 전체 강습 과정 목록:');
      console.log(`- 전체 강습 과정 수: ${allCourses.length}개`);
      
      allCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.name} (센터 ID: ${course.centerId})`);
      });
    } else {
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.name}`);
        console.log(`   - 레벨: ${course.level}`);
        console.log(`   - 최대 수강생: ${course.maxStudents}`);
        console.log(`   - 현재 수강생: ${course.enrolledStudents?.length || 0}`);
        console.log(`   - 상태: ${course.status}`);
        console.log(`   - 강사 ID: ${course.instructorId}`);
      });
    }

    // 4. 강사 정보 확인
    console.log('\n👨‍🏫 센터의 강사 목록:');
    const instructors = await User.find({ 
      userType: 'instructor', 
      centerId: centerId 
    });
    
    console.log(`- 총 강사 수: ${instructors.length}명`);
    instructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.name} (${instructor.email})`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkCoursesData();

