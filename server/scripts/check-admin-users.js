const mongoose = require('mongoose');
require('dotenv').config();

// User 모델 import
const User = require('../dist/models/User').User;

async function checkAdminUsers() {
  try {
    // MongoDB 연결
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모든 사용자 조회
    console.log('🔍 모든 사용자 조회 중...');
    const allUsers = await User.find({});
    console.log(`📊 총 사용자 수: ${allUsers.length}`);

    // 사용자 정보 출력
    allUsers.forEach((user, index) => {
      console.log(`\n👤 사용자 ${index + 1}:`);
      console.log(`  - ID: ${user.userId}`);
      console.log(`  - 이름: ${user.name}`);
      console.log(`  - 이메일: ${user.email}`);
      console.log(`  - 타입: ${user.userType}`);
      console.log(`  - 레벨: ${user.level}`);
      console.log(`  - 활성화: ${user.isActive}`);
    });

    // admin 관련 사용자 검색
    console.log('\n🔍 Admin 관련 사용자 검색:');
    const adminUsers = await User.find({
      $or: [
        { userType: 'superAdmin' },
        { userType: 'centerAdmin' },
        { userId: { $regex: /admin/i } },
        { email: { $regex: /admin/i } }
      ]
    });

    if (adminUsers.length > 0) {
      console.log(`✅ Admin 사용자 ${adminUsers.length}명 발견:`);
      adminUsers.forEach((user, index) => {
        console.log(`\n👑 Admin 사용자 ${index + 1}:`);
        console.log(`  - ID: ${user.userId}`);
        console.log(`  - 이름: ${user.name}`);
        console.log(`  - 이메일: ${user.email}`);
        console.log(`  - 타입: ${user.userType}`);
        console.log(`  - 레벨: ${user.level}`);
        console.log(`  - 활성화: ${user.isActive}`);
      });
    } else {
      console.log('❌ Admin 사용자를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ 사용자 조회 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
checkAdminUsers();







