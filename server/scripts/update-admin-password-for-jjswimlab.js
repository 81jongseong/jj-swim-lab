const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User 모델 import
const User = require('../dist/models/User').User;

async function updateAdminPassword() {
  try {
    // MongoDB 연결
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // admin 사용자 찾기 (admin@jjswimlab.com)
    const adminUser = await User.findOne({ 
      $or: [
        { email: 'admin@jjswimlab.com' },
        { userType: 'superAdmin' }
      ]
    });

    if (!adminUser) {
      console.log('❌ Admin 사용자를 찾을 수 없습니다.');
      await mongoose.disconnect();
      return;
    }

    console.log('🔍 기존 Admin 사용자 정보:');
    console.log(`  - ID: ${adminUser.userId || '없음'}`);
    console.log(`  - 이름: ${adminUser.name}`);
    console.log(`  - 이메일: ${adminUser.email}`);
    console.log(`  - 타입: ${adminUser.userType}`);
    console.log(`  - 레벨: ${adminUser.level || '없음'}`);

    // 비밀번호를 101010으로 업데이트
    const saltRounds = 12;
    const newPassword = '101010';
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    adminUser.password = hashedPassword;
    adminUser.isActive = true;
    
    // superAdmin 권한 확인 및 설정
    if (adminUser.userType !== 'superAdmin') {
      adminUser.userType = 'superAdmin';
      adminUser.level = 'systemAdmin';
    }

    if (!adminUser.superAdminInfo) {
      adminUser.superAdminInfo = {
        systemPermissions: {
          canManageAllUsers: true,
          canManageAllCenters: true,
          canManageSystemSettings: true,
          canViewAllReports: true,
          canManageSkillTemplates: true,
        },
        adminLevel: 'systemAdmin'
      };
    }

    if (!adminUser.accessPermissions) {
      adminUser.accessPermissions = {
        dashboard: true,
        courses: true,
        bookings: true,
        payments: true,
        notices: true,
        progress: true,
        evaluations: true,
        reports: true,
        userManagement: true,
        systemSettings: true,
        aiConfigManagement: true,
      };
    }

    await adminUser.save();
    
    console.log('\n✅ Admin 사용자 비밀번호 업데이트 완료!');
    console.log('📋 최종 로그인 정보:');
    console.log(`  - 이메일: ${adminUser.email}`);
    console.log('  - 비밀번호: 101010');
    console.log(`  - 타입: ${adminUser.userType}`);
    console.log(`  - 레벨: ${adminUser.level || 'systemAdmin'}`);

    // 비밀번호 검증 테스트
    console.log('\n🔍 비밀번호 검증 테스트:');
    const testPassword = '101010';
    const isMatch = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`  - 테스트 비밀번호: ${testPassword}`);
    console.log(`  - 검증 결과: ${isMatch ? '✅ 성공' : '❌ 실패'}`);

  } catch (error) {
    console.error('❌ Admin 사용자 비밀번호 업데이트 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
updateAdminPassword();

