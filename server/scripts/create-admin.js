const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User 모델 import
const User = require('../dist/models/User').User;

async function createAdminUser() {
  try {
    // MongoDB 연결
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 admin 사용자 확인
    const existingAdmin = await User.findOne({ 
      $or: [
        { userType: 'superAdmin' },
        { userType: 'centerAdmin' },
        { email: 'admin@jjswim.com' },
        { userId: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️ 이미 admin 사용자가 존재합니다:');
      console.log(`  - ID: ${existingAdmin.userId}`);
      console.log(`  - 이메일: ${existingAdmin.email}`);
      console.log(`  - 타입: ${existingAdmin.userType}`);
      console.log(`  - 레벨: ${existingAdmin.level}`);
      
      // 기존 admin 사용자를 superAdmin으로 업데이트
      if (existingAdmin.userType !== 'superAdmin') {
        existingAdmin.userType = 'superAdmin';
        existingAdmin.level = 'systemAdmin';
        existingAdmin.superAdminInfo = {
          systemPermissions: {
            canManageAllUsers: true,
            canManageAllCenters: true,
            canManageSystemSettings: true,
            canViewAllReports: true,
            canManageSkillTemplates: true,
          },
          adminLevel: 'systemAdmin'
        };
        await existingAdmin.save();
        console.log('✅ 기존 사용자를 superAdmin으로 업데이트했습니다.');
      }
      
      await mongoose.disconnect();
      return;
    }

    // 새 admin 사용자 생성
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123!', saltRounds);

    const adminUser = new User({
      userId: 'superadmin',
      name: '슈퍼 관리자',
      email: 'superadmin@jjswim.com',
      password: hashedPassword,
      phone: '010-0000-0000',
      address: 'JJ Swim Lab 본사',
      userType: 'superAdmin',
      level: 'systemAdmin',
      isActive: true,
      superAdminInfo: {
        systemPermissions: {
          canManageAllUsers: true,
          canManageAllCenters: true,
          canManageSystemSettings: true,
          canViewAllReports: true,
          canManageSkillTemplates: true,
        },
        adminLevel: 'systemAdmin'
      },
      accessPermissions: {
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
      },
      featureSequence: {
        currentStep: 'dashboard',
        completedSteps: [],
        availableSteps: ['dashboard', 'courses', 'bookings', 'payments', 'notices', 'progress', 'evaluations', 'reports', 'userManagement', 'systemSettings', 'aiConfigManagement']
      }
    });

    await adminUser.save();
    console.log('✅ Admin 사용자 생성 완료!');
    console.log('📋 로그인 정보:');
    console.log('  - ID: superadmin');
    console.log('  - 이메일: superadmin@jjswim.com');
    console.log('  - 비밀번호: admin123!');
    console.log('  - 타입: superAdmin');
    console.log('  - 레벨: systemAdmin');

  } catch (error) {
    console.error('❌ Admin 사용자 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
createAdminUser();