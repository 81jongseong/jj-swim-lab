// 강사 데이터 최종 수정 (isActive 필드 추가)
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
    
    // 1. 강사 데이터 수정
    const instructors = await User.find({ userType: 'instructor', centerId: centerId });
    console.log(`\n👨‍🏫 강사 ${instructors.length}명 수정 중...`);
    
    for (const instructor of instructors) {
      // isActive 필드 추가
      instructor.isActive = true;
      instructor.status = 'active';
      
      // instructorInfo가 없는 경우 추가
      if (!instructor.instructorInfo) {
        instructor.instructorInfo = {
          experience: 5,
          rating: 4.8,
          specialties: ['자유형', '배영'],
          certifications: ['생활스포츠지도사'],
          assignedCenters: [centerId]
        };
      }
      
      await instructor.save();
      console.log(`✅ ${instructor.name} 강사 데이터 수정 완료 (isActive: ${instructor.isActive})`);
    }
    
    // 2. 강습 과정 데이터 수정
    const courses = await Course.find({ centerId: centerId });
    console.log(`\n📚 강습 과정 ${courses.length}개 수정 중...`);
    
    for (const course of courses) {
      course.isActive = true;
      course.status = 'active';
      await course.save();
      console.log(`✅ ${course.name} 강습 과정 데이터 수정 완료 (isActive: ${course.isActive})`);
    }
    
    // 3. 최종 확인
    console.log('\n📊 최종 확인:');
    const finalInstructors = await User.find({ 
      userType: 'instructor', 
      centerId: new mongoose.Types.ObjectId(centerId),
      isActive: true 
    });
    const finalCourses = await Course.find({ 
      centerId: new mongoose.Types.ObjectId(centerId),
      isActive: true 
    });
    console.log(`- 활성 강사: ${finalInstructors.length}명`);
    console.log(`- 활성 강습 과정: ${finalCourses.length}개`);
    
    console.log('\n🎉 데이터 수정 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



