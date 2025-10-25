// 강사 데이터 수정 (isActive 필드 추가)
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB Atlas 연결 시도...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas 연결 성공');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
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
      instructor.isActive = true;
      instructor.status = 'active';
      await instructor.save();
      console.log(`✅ ${instructor.name} 강사 데이터 수정 완료`);
    }
    
    // 2. 회원 데이터 수정
    const students = await User.find({ userType: 'student', centerId: centerId });
    console.log(`\n👥 회원 ${students.length}명 수정 중...`);
    
    for (const student of students) {
      student.isActive = true;
      student.status = 'active';
      await student.save();
      console.log(`✅ ${student.name} 회원 데이터 수정 완료`);
    }
    
    // 3. 최종 확인
    console.log('\n📊 최종 확인:');
    const finalInstructors = await User.find({ userType: 'instructor', centerId: centerId, isActive: true });
    const finalStudents = await User.find({ userType: 'student', centerId: centerId, isActive: true });
    console.log(`- 활성 강사: ${finalInstructors.length}명`);
    console.log(`- 활성 회원: ${finalStudents.length}명`);
    
    console.log('\n🎉 데이터 수정 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



