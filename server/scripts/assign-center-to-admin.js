/**
 * 센터 관리자에게 관리하는 센터 할당 스크립트
 * 
 * 목적: center@swim.com 계정에 관리하는 센터 할당
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const centerSchema = new mongoose.Schema({}, { strict: false });
const SwimmingCenter = mongoose.model('SwimmingCenter', centerSchema);

async function assignCenterToAdmin() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 완료!');

    // 1. 모든 센터 관리자 계정 찾기
    const centerAdmins = await User.find({ userType: 'centerAdmin' });
    if (centerAdmins.length === 0) {
      console.error('❌ 센터 관리자 계정을 찾을 수 없습니다!');
      process.exit(1);
    }

    console.log(`📋 찾은 센터 관리자: ${centerAdmins.length}명`);
    centerAdmins.forEach(admin => {
      console.log(`  - ${admin.userId} (managedCenter: ${admin.centerAdminInfo?.managedCenter || '미할당'})`);
    });

    // 첫 번째 센터 관리자 사용
    const centerAdmin = centerAdmins[0];
    console.log(`\n👤 선택된 센터 관리자: ${centerAdmin.userId}`);

    console.log('👤 센터 관리자 정보:', {
      userId: centerAdmin.userId,
      userType: centerAdmin.userType,
      currentManagedCenter: centerAdmin.centerAdminInfo?.managedCenter
    });

    // 2. 첫 번째 센터 찾기
    const center = await SwimmingCenter.findOne();
    if (!center) {
      console.error('❌ 센터를 찾을 수 없습니다!');
      console.log('💡 먼저 센터를 생성해주세요.');
      process.exit(1);
    }

    console.log('🏢 찾은 센터:', {
      _id: center._id,
      name: center.name,
      region: center.region
    });

    // 3. centerAdmin에 managedCenters 할당 (배열로!)
    if (!centerAdmin.centerAdminInfo) {
      centerAdmin.centerAdminInfo = {};
    }

    // managedCenters는 배열 (여러 센터 관리 가능)
    if (!centerAdmin.centerAdminInfo.managedCenters) {
      centerAdmin.centerAdminInfo.managedCenters = [];
    }

    // 이미 할당되어 있는지 확인
    const alreadyAssigned = centerAdmin.centerAdminInfo.managedCenters.some(
      (c) => c.toString() === center._id.toString()
    );

    if (!alreadyAssigned) {
      centerAdmin.centerAdminInfo.managedCenters.push(center._id);
    }

    await centerAdmin.save();

    console.log('✅ 센터 할당 완료!');
    console.log('👤 업데이트된 센터 관리자:', {
      userId: centerAdmin.userId,
      managedCenters: centerAdmin.centerAdminInfo.managedCenters
    });

    // 4. 검증
    const updated = await User.findById(centerAdmin._id);
    if (updated) {
      console.log('🔍 검증:', {
        userId: updated.userId,
        managedCenters: updated.centerAdminInfo?.managedCenters,
        할당됨: updated.centerAdminInfo?.managedCenters?.length > 0
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 에러 발생:', error);
    process.exit(1);
  }
}

assignCenterToAdmin();

