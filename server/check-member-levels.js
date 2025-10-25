const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function checkMemberLevels() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      studentInfo: {
        level: String,
        emergencyContact: { name: String, phone: String },
        medicalConditions: [{ condition: String, allergy: String }],
      }
    });

    const User = mongoose.model('User', userSchema);

    console.log('\n🔍 센터 회원들의 레벨 정보 확인');
    console.log('='.repeat(60));

    // 센터 관리자가 관리하는 센터의 회원들 확인
    const centerId = '68fb75b111747a8229d6cf5d';
    const members = await User.find({
      userType: 'student',
      centerId: centerId
    }).select('name email studentInfo.level');

    console.log(`👥 센터 회원 ${members.length}명:`);

    for (const member of members) {
      console.log(`\n👤 ${member.name} (${member.email}):`);
      console.log(`   - ID: ${member._id}`);
      console.log(`   - 레벨: ${member.studentInfo?.level || '미설정'}`);
      console.log(`   - studentInfo 전체:`, JSON.stringify(member.studentInfo, null, 2));
    }

    // 김철수 특별 확인
    console.log(`\n🔍 김철수 상세 정보:`);
    const kimCheolSu = await User.findById('68fbf65aa173fd3f9b813f47');
    if (kimCheolSu) {
      console.log(`   - 이름: ${kimCheolSu.name}`);
      console.log(`   - 이메일: ${kimCheolSu.email}`);
      console.log(`   - 레벨: ${kimCheolSu.studentInfo?.level || '미설정'}`);
      console.log(`   - studentInfo 전체:`, JSON.stringify(kimCheolSu.studentInfo, null, 2));
    } else {
      console.log(`   - 김철수를 찾을 수 없음`);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB 연결 종료');
  }
}

checkMemberLevels();