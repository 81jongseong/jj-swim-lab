const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function checkMemberCenterInfo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      studentInfo: mongoose.Schema.Types.Mixed,
      instructorInfo: mongoose.Schema.Types.Mixed,
      centerAdminInfo: mongoose.Schema.Types.Mixed
    });

    const User = mongoose.model('User', userSchema);

    // 1. 센터 관리자 확인
    const centerAdmin = await User.findOne({ 
      email: 'center-admin@jjswimlab.com',
      userType: 'center-admin'
    });
    
    if (centerAdmin) {
      console.log('📋 센터 관리자:', centerAdmin.name);
      console.log('📋 관리 센터 ID:', centerAdmin.centerAdminInfo?.managedCenters);
    }

    // 2. 회원들의 centerId 확인
    console.log('\n👥 회원들의 센터 정보:');
    const members = await User.find({ userType: 'student' }).limit(10);
    members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} (${member.email})`);
      console.log(`   - centerId: ${member.centerId || '없음'}`);
      console.log(`   - userType: ${member.userType}`);
    });

    // 3. 강사들의 centerId 확인
    console.log('\n👨‍🏫 강사들의 센터 정보:');
    const instructors = await User.find({ userType: 'instructor' }).limit(10);
    instructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.name} (${instructor.email})`);
      console.log(`   - centerId: ${instructor.centerId || '없음'}`);
      console.log(`   - userType: ${instructor.userType}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkMemberCenterInfo();

