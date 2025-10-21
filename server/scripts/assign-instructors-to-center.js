/**
 * 강사를 센터에 배정하는 스크립트
 * 
 * 실행 방법:
 * node server/scripts/assign-instructors-to-center.js
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 연결 성공!');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const centerSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const SwimmingCenter = mongoose.model('SwimmingCenter', centerSchema);

// 강사 배정
const assignInstructorsToCenter = async () => {
  try {
    console.log('🔍 센터 및 강사 검색 중...\n');

    // 센터 찾기 (첫 번째 센터 사용)
    let center = await SwimmingCenter.findOne();
    
    if (!center) {
      console.log('⚠️ 센터가 없습니다. 테스트 센터를 생성합니다...');
      center = await SwimmingCenter.create({
        name: 'JJ 수영 센터',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'jjswimcenter@example.com',
        status: 'active',
        createdAt: new Date()
      });
      console.log('✅ 테스트 센터 생성 완료:', center.name);
    }

    console.log(`📍 센터: ${center.name} (ID: ${center._id})\n`);

    // 강사 찾기
    const instructors = await User.find({
      email: {
        $in: [
          'instructor1@jjswimlab.com',
          'instructor2@jjswimlab.com',
          'instructor3@jjswimlab.com'
        ]
      }
    });

    if (instructors.length === 0) {
      console.log('❌ 강사가 없습니다. run-instructor-seed.bat를 먼저 실행하세요.');
      return;
    }

    console.log(`👨‍🏫 강사 ${instructors.length}명 발견\n`);

    // 강사들을 센터에 배정
    for (const instructor of instructors) {
      // $addToSet을 사용하여 중복 없이 센터 추가
      const result = await User.updateOne(
        { _id: instructor._id },
        { 
          $addToSet: { 
            'instructorInfo.assignedCenters': center._id 
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${instructor.name} → ${center.name} 배정 완료`);
      } else {
        console.log(`ℹ️  ${instructor.name} → 이미 배정됨`);
      }
    }

    console.log('\n─────────────────────────────────────────────────');
    console.log('✅ 강사 배정 완료!\n');
    console.log(`📊 요약:`);
    console.log(`   센터: ${center.name}`);
    console.log(`   배정된 강사: ${instructors.length}명`);
    console.log(`   - ${instructors.map(i => i.name).join(', ')}`);
    console.log('─────────────────────────────────────────────────\n');

    // 센터 관리자 확인/생성
    console.log('🔍 센터 관리자 확인 중...\n');
    
    let centerAdmin = await User.findOne({ 
      email: 'centeradmin@jjswimlab.com' 
    });

    if (!centerAdmin) {
      console.log('⚠️ 센터 관리자가 없습니다. 생성합니다...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('centeradmin123!', salt);

      centerAdmin = await User.create({
        userId: 'centeradmin_001',
        name: '센터관리자',
        email: 'centeradmin@jjswimlab.com',
        password: hashedPassword,
        phone: '010-9999-0000',
        userType: 'centerAdmin',
        level: 'manager',
        isActive: true,
        createdAt: new Date(),
        centerAdminInfo: {
          managedCenters: [center._id],
          adminLevel: 'manager',
          permissions: {
            canManageUsers: true,
            canManageCourses: true,
            canManageBookings: true,
            canManagePayments: true,
            canManageNotices: true,
            canViewReports: true
          }
        }
      });
      console.log('✅ 센터 관리자 생성 완료\n');
    } else {
      // 기존 센터 관리자의 managedCenters 업데이트
      if (!centerAdmin.centerAdminInfo) {
        centerAdmin.centerAdminInfo = {};
      }
      if (!centerAdmin.centerAdminInfo.managedCenters) {
        centerAdmin.centerAdminInfo.managedCenters = [];
      }
      if (!centerAdmin.centerAdminInfo.managedCenters.includes(center._id)) {
        centerAdmin.centerAdminInfo.managedCenters.push(center._id);
        await centerAdmin.save();
        console.log('✅ 센터 관리자에 센터 추가 완료\n');
      } else {
        console.log('ℹ️  센터 관리자가 이미 센터를 관리 중입니다.\n');
      }
    }

    console.log('─────────────────────────────────────────────────');
    console.log('🔐 로그인 정보:');
    console.log('─────────────────────────────────────────────────');
    console.log('센터 관리자:');
    console.log('  이메일: centeradmin@jjswimlab.com');
    console.log('  비밀번호: centeradmin123!');
    console.log('\n강사:');
    console.log('  이메일: instructor1@jjswimlab.com');
    console.log('  이메일: instructor2@jjswimlab.com');
    console.log('  이메일: instructor3@jjswimlab.com');
    console.log('  비밀번호: instructor123!');
    console.log('─────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  }
};

// 실행
const run = async () => {
  await connectDB();
  await assignInstructorsToCenter();
  await mongoose.connection.close();
  console.log('✅ MongoDB 연결 종료');
  process.exit(0);
};

run();

