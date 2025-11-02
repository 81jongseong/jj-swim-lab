/**
 * 📍 회원 주소지 현황 확인 스크립트
 * 
 * 목적: 회원 데이터에 주소지나 좌표가 있는지 확인
 * 
 * 사용법:
 *   node server/scripts/check-user-address.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');

async function checkUserAddress() {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('📡 MongoDB 연결 중...', mongoUri.replace(/\/\/.*@/, '//***@'));
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 전체 회원 수
    const totalUsers = await User.countDocuments({});
    console.log(`📊 전체 회원 수: ${totalUsers}명\n`);

    // student/instructor만 확인
    const targetUsers = await User.find({
      userType: { $in: ['student', 'instructor'] }
    }).select('name email address location centerId userType').lean();

    console.log(`👥 student/instructor 회원 수: ${targetUsers.length}명\n`);

    // 주소지/좌표 보유 현황
    const usersWithAddress = targetUsers.filter(u => u.address && u.address.trim() !== '');
    const usersWithCoords = targetUsers.filter(u => 
      u.location?.coordinates && 
      Array.isArray(u.location.coordinates) && 
      u.location.coordinates.length === 2 &&
      u.location.coordinates[0] !== 0 &&
      u.location.coordinates[1] !== 0
    );
    const usersWithoutLocation = targetUsers.filter(u => 
      (!u.address || u.address.trim() === '') && 
      (!u.location?.coordinates || u.location.coordinates.length !== 2)
    );

    console.log(`📊 위치 정보 현황:`);
    console.log(`  ✅ 주소지 보유: ${usersWithAddress.length}명 (${((usersWithAddress.length / targetUsers.length) * 100).toFixed(1)}%)`);
    console.log(`  ✅ 좌표 보유: ${usersWithCoords.length}명 (${((usersWithCoords.length / targetUsers.length) * 100).toFixed(1)}%)`);
    console.log(`  ❌ 위치 정보 없음: ${usersWithoutLocation.length}명 (${((usersWithoutLocation.length / targetUsers.length) * 100).toFixed(1)}%)\n`);

    // 샘플 데이터 출력
    if (usersWithAddress.length > 0) {
      console.log(`📋 주소지 보유 회원 샘플 (최대 5명):`);
      usersWithAddress.slice(0, 5).forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.name || user.email}`);
        console.log(`     주소: ${user.address}`);
        if (user.location?.coordinates) {
          console.log(`     좌표: [${user.location.coordinates[0]}, ${user.location.coordinates[1]}]`);
        }
      });
      console.log('');
    }

    if (usersWithCoords.length > 0) {
      console.log(`📍 좌표 보유 회원 샘플 (최대 5명):`);
      usersWithCoords.slice(0, 5).forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.name || user.email}`);
        console.log(`     좌표: [${user.location.coordinates[0]}, ${user.location.coordinates[1]}]`);
        if (user.address) {
          console.log(`     주소: ${user.address}`);
        }
      });
      console.log('');
    }

    if (usersWithoutLocation.length > 0) {
      console.log(`⚠️ 위치 정보 없는 회원 샘플 (최대 5명):`);
      usersWithoutLocation.slice(0, 5).forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.name || user.email}`);
        console.log(`     주소지: ${user.address || '없음'}`);
        console.log(`     좌표: ${user.location?.coordinates ? JSON.stringify(user.location.coordinates) : '없음'}`);
        console.log(`     센터: ${user.centerId || '없음'}`);
      });
      console.log('');
    }

    // 센터별 통계
    const centerStats = {};
    targetUsers.forEach(user => {
      const centerId = user.centerId?.toString() || 'none';
      if (!centerStats[centerId]) {
        centerStats[centerId] = { total: 0, withAddress: 0, withCoords: 0, withoutLocation: 0 };
      }
      centerStats[centerId].total++;
      if (user.address && user.address.trim() !== '') {
        centerStats[centerId].withAddress++;
      }
      if (user.location?.coordinates && Array.isArray(user.location.coordinates) && user.location.coordinates.length === 2) {
        centerStats[centerId].withCoords++;
      }
      if ((!user.address || user.address.trim() === '') && (!user.location?.coordinates || user.location.coordinates.length !== 2)) {
        centerStats[centerId].withoutLocation++;
      }
    });

    console.log(`🏢 센터별 통계:`);
    Object.entries(centerStats).forEach(([centerId, stats]) => {
      console.log(`  센터 ${centerId.substring(0, 8)}:`);
      console.log(`    총 ${stats.total}명 | 주소지 ${stats.withAddress}명 | 좌표 ${stats.withCoords}명 | 위치정보 없음 ${stats.withoutLocation}명`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 스크립트 실행
checkUserAddress();

