/**
 * 회원 레벨 확인 스크립트
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

async function verifyLevels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // 개인 PT 회원
    const ptMembers = await User.find({ userId: /^pt_/ });
    console.log('📊 개인 PT 회원:\n');
    ptMembers.forEach(u => {
      console.log(`${u.name} (${u.userId})`);
      console.log(`  - studentInfo.currentLevel: ${u.studentInfo?.currentLevel}`);
      console.log(`  - studentInfo.swimmingLevel: ${u.studentInfo?.swimmingLevel}`);
      console.log(`  - CSS: ${JSON.stringify(u.studentInfo?.swimmingProfile?.css)}`);
      console.log('');
    });

    // 단체반 회원
    const groupMembers = await User.find({ userId: /^group_/ }).limit(3);
    console.log('📚 단체반 회원 (샘플 3명):\n');
    groupMembers.forEach(u => {
      console.log(`${u.name} (${u.userId})`);
      console.log(`  - studentInfo.currentLevel: ${u.studentInfo?.currentLevel}`);
      console.log(`  - CSS: ${JSON.stringify(u.studentInfo?.swimmingProfile?.css)}`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

verifyLevels();








