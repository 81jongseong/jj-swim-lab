const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');
const { CenterLevel } = require('../dist/models/CenterLevel');

async function checkCurrentData() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    // 사용자 데이터 확인
    console.log('\n👥 === 사용자 데이터 ===');
    const users = await User.find({}, 'name email userType instructorInfo studentInfo');
    console.log(`총 ${users.length}명의 사용자`);
    
    users.forEach(user => {
      if (user.userType === 'instructor') {
        console.log(`   - 강사: ${user.name} (${user.email}) - ${user.instructorInfo?.instructorLevel || 'N/A'}`);
      } else if (user.userType === 'student') {
        console.log(`   - 학생: ${user.name} (${user.email}) - ${user.studentInfo?.currentLevel || 'N/A'}`);
      } else {
        console.log(`   - ${user.userType}: ${user.name} (${user.email})`);
      }
    });
    
    // 센터 레벨 데이터 확인
    console.log('\n🎯 === 센터 레벨 데이터 ===');
    const centerLevels = await CenterLevel.find({}, 'centerId levels');
    console.log(`총 ${centerLevels.length}개의 센터 레벨 설정`);
    
    centerLevels.forEach(center => {
      console.log(`\n📋 센터: ${center.centerId}`);
      center.levels.forEach(level => {
        console.log(`   - ${level.name} (${level.order}순서, ${level.color})`);
      });
    });
    
    console.log('\n🎉 데이터 확인 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 확인 실패:', error.message);
  } finally {
    // MongoDB 연결 해제
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
checkCurrentData();

