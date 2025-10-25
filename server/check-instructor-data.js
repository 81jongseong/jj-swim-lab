// 강사 데이터 확인 및 수정
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB Atlas 연결 시도...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas 연결 성공');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    
    // center@swim.com 계정 정보 확인
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    const centerId = centerAdmin?.centerId;
    
    if (!centerId) {
      console.log('❌ 센터 ID를 찾을 수 없습니다.');
      mongoose.disconnect();
      return;
    }
    
    console.log('🔍 센터 ID:', centerId);
    
    // 1. 강사 데이터 확인
    const instructors = await User.find({ userType: 'instructor' });
    console.log(`\n👨‍🏫 전체 강사 목록 (${instructors.length}명):`);
    instructors.forEach(instructor => {
      console.log(`- ${instructor.name}: centerId=${instructor.centerId}, assignedCenters=${instructor.instructorInfo?.assignedCenters}`);
    });
    
    // 2. centerId로 강사 검색
    const centerInstructors = await User.find({ 
      userType: 'instructor', 
      centerId: centerId 
    });
    console.log(`\n🏢 센터 강사 목록 (${centerInstructors.length}명):`);
    centerInstructors.forEach(instructor => {
      console.log(`- ${instructor.name}: ${instructor.email}`);
    });
    
    // 3. 강사 데이터 수정 (centerId가 다른 경우)
    if (instructors.length > 0 && centerInstructors.length === 0) {
      console.log('\n🔧 강사 데이터 수정 중...');
      for (const instructor of instructors) {
        instructor.centerId = centerId;
        if (instructor.instructorInfo) {
          instructor.instructorInfo.assignedCenters = [centerId];
        }
        await instructor.save();
        console.log(`✅ ${instructor.name} 강사 센터 배정 완료`);
      }
    }
    
    // 4. 강습 과정 데이터 확인
    const courses = await Course.find({});
    console.log(`\n📚 전체 강습 과정 목록 (${courses.length}개):`);
    courses.forEach(course => {
      console.log(`- ${course.name}: centerId=${course.centerId}`);
    });
    
    // 5. centerId로 강습 과정 검색
    const centerCourses = await Course.find({ centerId: centerId });
    console.log(`\n🏢 센터 강습 과정 목록 (${centerCourses.length}개):`);
    centerCourses.forEach(course => {
      console.log(`- ${course.name}: 강사 ${course.instructorName}`);
    });
    
    // 6. 강습 과정 데이터 수정 (centerId가 다른 경우)
    if (courses.length > 0 && centerCourses.length === 0) {
      console.log('\n🔧 강습 과정 데이터 수정 중...');
      for (const course of courses) {
        course.centerId = centerId;
        await course.save();
        console.log(`✅ ${course.name} 강습 과정 센터 배정 완료`);
      }
    }
    
    // 7. 최종 확인
    console.log('\n📊 최종 확인:');
    const finalInstructors = await User.find({ userType: 'instructor', centerId: centerId });
    const finalCourses = await Course.find({ centerId: centerId });
    console.log(`- 강사: ${finalInstructors.length}명`);
    console.log(`- 강습 과정: ${finalCourses.length}개`);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



