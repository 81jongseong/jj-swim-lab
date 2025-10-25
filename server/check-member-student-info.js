const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function checkMemberStudentInfo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      studentInfo: mongoose.Schema.Types.Mixed
    });

    const User = mongoose.model('User', userSchema);

    console.log('\n🔍 센터 회원들의 studentInfo 구조 확인');
    console.log('='.repeat(60));

    // 센터 관리자가 관리하는 센터의 회원들 확인
    const centerId = '68fb75b111747a8229d6cf5d';
    const members = await User.find({
      userType: 'student',
      centerId: centerId
    }).select('name email studentInfo');

    console.log(`👥 센터 회원 ${members.length}명:`);

    for (const member of members) {
      console.log(`\n👤 ${member.name} (${member.email}):`);
      console.log(`   - ID: ${member._id}`);
      console.log(`   - studentInfo 전체:`, JSON.stringify(member.studentInfo, null, 2));
      
      if (member.studentInfo) {
        console.log(`   - studentInfo 키들:`, Object.keys(member.studentInfo));
        console.log(`   - level 필드:`, member.studentInfo.level);
        console.log(`   - swimmingLevel 필드:`, member.studentInfo.swimmingLevel);
        console.log(`   - currentLevel 필드:`, member.studentInfo.currentLevel);
      }
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB 연결 종료');
  }
}

checkMemberStudentInfo();

