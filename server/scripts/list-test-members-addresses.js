/**
 * 📋 테스트 회원 주소 목록 확인 스크립트
 * 
 * 목적: 강남역 부근에 생성된 테스트 회원들의 주소 목록 확인
 * 
 * 사용법:
 *   node server/scripts/list-test-members-addresses.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');

async function listTestMembersAddresses() {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('📡 MongoDB 연결 중...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 테스트 회원 조회 (강남역 부근)
    const testMembers = await User.find({
      email: { $regex: /^test-member-/ },
      centerId: { $exists: true }
    })
      .select('name email address location centerId')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📊 총 테스트 회원 수: ${testMembers.length}명\n`);

    // 센터별 그룹화
    const membersByCenter = {};
    for (const member of testMembers) {
      const centerId = member.centerId?.toString() || 'none';
      if (!membersByCenter[centerId]) {
        membersByCenter[centerId] = [];
      }
      membersByCenter[centerId].push(member);
    }

    // 센터별 주소 목록 출력
    for (const [centerId, members] of Object.entries(membersByCenter)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏢 센터 ID: ${centerId.substring(0, 24)}`);
      console.log(`👥 회원 수: ${members.length}명`);
      console.log(`${'='.repeat(60)}`);

      // 주소별 그룹화
      const addressesGrouped = {};
      for (const member of members) {
        const address = member.address || '주소 없음';
        if (!addressesGrouped[address]) {
          addressesGrouped[address] = [];
        }
        addressesGrouped[address].push(member);
      }

      // 주소별로 정렬하여 출력
      const sortedAddresses = Object.keys(addressesGrouped).sort();
      console.log(`\n📍 주소 목록 (총 ${sortedAddresses.length}개 유니크 주소):\n`);
      
      sortedAddresses.slice(0, 30).forEach((address, idx) => {
        const count = addressesGrouped[address].length;
        const sampleMember = addressesGrouped[address][0];
        const coords = sampleMember.location?.coordinates;
        console.log(`${(idx + 1).toString().padStart(2)}. ${address}`);
        console.log(`    └─ 회원 수: ${count}명 | 좌표: ${coords ? `[${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]` : '없음'}`);
      });

      if (sortedAddresses.length > 30) {
        console.log(`\n    ... 외 ${sortedAddresses.length - 30}개 주소 더 있음`);
      }
    }

    // 강남역 중심 좌표 근처 회원 통계
    const gangnamStationLat = 37.4980;
    const gangnamStationLng = 127.0279;
    const radiusKm = 3;
    const radiusDeg = radiusKm / 111;

    const nearbyMembers = testMembers.filter(member => {
      if (!member.location?.coordinates || member.location.coordinates.length !== 2) {
        return false;
      }
      const [lng, lat] = member.location.coordinates;
      const distanceLat = Math.abs(lat - gangnamStationLat);
      const distanceLng = Math.abs(lng - gangnamStationLng);
      const distance = Math.sqrt(distanceLat * distanceLat + distanceLng * distanceLng);
      return distance <= radiusDeg;
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 강남역 근처 (반경 ${radiusKm}km) 회원 통계`);
    console.log(`${'='.repeat(60)}`);
    console.log(`  총 회원 수: ${nearbyMembers.length}명 / ${testMembers.length}명`);
    console.log(`  비율: ${((nearbyMembers.length / testMembers.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 스크립트 실행
listTestMembersAddresses();

