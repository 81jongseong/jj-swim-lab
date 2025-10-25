// MongoDB Atlas에서 현재 배정 상태 확인
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
    console.log('🏢 센터명:', centerAdmin?.name);
    
    // 1. 강사 목록 확인
    const instructors = await User.find({ userType: 'instructor', centerId: centerId });
    console.log(`\n👨‍🏫 강사 목록 (${instructors.length}명):`);
    instructors.forEach(instructor => {
      console.log(`- ${instructor.name}: ${instructor.email}, 센터 ID: ${instructor.centerId}`);
    });
    
    // 2. 회원 목록 확인
    const students = await User.find({ userType: 'student', centerId: centerId });
    console.log(`\n👥 회원 목록 (${students.length}명):`);
    students.forEach(student => {
      console.log(`- ${student.name}: ${student.email}, 센터 ID: ${student.centerId}`);
    });
    
    // 3. 강습 과정 목록 확인
    const courses = await Course.find({ centerId: centerId });
    console.log(`\n📚 강습 과정 목록 (${courses.length}개):`);
    courses.forEach(course => {
      console.log(`- ${course.name}: 강사 ${course.instructorName}, 회원 ${course.currentStudents}명, 센터 ID: ${course.centerId}`);
    });
    
    // 4. 센터별 사용자 수 확인
    const centerUsers = await User.find({ centerId: centerId });
    console.log(`\n📊 ${centerAdmin?.name} 센터에 배정된 사용자:`);
    console.log(`- 총 사용자: ${centerUsers.length}명`);
    console.log(`- 강사: ${instructors.length}명`);
    console.log(`- 회원: ${students.length}명`);
    console.log(`- 강습 과정: ${courses.length}개`);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



