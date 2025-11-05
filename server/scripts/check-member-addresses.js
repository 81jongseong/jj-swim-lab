/**
 * 📍 회원 주소 확인 스크립트
 * 
 * 목적: DB에 저장된 회원들의 센터별 주소 정보 확인
 * 
 * 사용법:
 *   node server/scripts/check-member-addresses.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');
const Center = mongoose.model('Center', new mongoose.Schema({}, { strict: false }));

async function checkMemberAddresses() {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('📡 MongoDB 연결 중...', mongoUri.replace(/\/\/.*@/, '//***@'));
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 센터 목록 조회
    const centers = await Center.find({}).select('_id name').lean();
    console.log(`🏢 전체 센터: ${centers.length}개\n`);

    // 테스트 회원 조회 (센터별)
    const testMembers = await User.find({
      userType: 'student',
      email: { $regex: /^test-member-/ }
    }).select('name email address location centerId').lean();

    console.log(`👥 테스트 회원 총 ${testMembers.length}명\n`);

    // 센터별 통계
    const centerStats = {};
    testMembers.forEach(member => {
      const centerId = member.centerId?.toString() || 'none';
      if (!centerStats[centerId]) {
        const centerName = centers.find(c => c._id.toString() === centerId)?.name || '센터없음';
        centerStats[centerId] = {
          centerName,
          count: 0,
          withAddress: 0,
          withLocation: 0,
          sampleAddresses: []
        };
      }
      centerStats[centerId].count++;
      if (member.address && member.address.trim() !== '') {
        centerStats[centerId].withAddress++;
        if (centerStats[centerId].sampleAddresses.length < 10) {
          centerStats[centerId].sampleAddresses.push({
            name: member.name,
            email: member.email,
            address: member.address,
            coordinates: member.location?.coordinates || null
          });
        }
      }
      if (member.location?.coordinates && member.location.coordinates.length === 2) {
        centerStats[centerId].withLocation++;
      }
    });

    // 센터별 상세 정보 출력
    console.log('📊 센터별 회원 통계:\n');
    Object.entries(centerStats).forEach(([centerId, stats]) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🏢 센터: ${stats.centerName}`);
      console.log(`   총 회원 수: ${stats.count}명`);
      console.log(`   주소지 보유: ${stats.withAddress}명 (${((stats.withAddress / stats.count) * 100).toFixed(1)}%)`);
      console.log(`   좌표 보유: ${stats.withLocation}명 (${((stats.withLocation / stats.count) * 100).toFixed(1)}%)`);
      
      if (stats.sampleAddresses.length > 0) {
        console.log(`\n📍 주소 샘플 (최대 10개):`);
        stats.sampleAddresses.forEach((sample, idx) => {
          console.log(`   ${idx + 1}. ${sample.name} (${sample.email})`);
          console.log(`      주소: ${sample.address}`);
          if (sample.coordinates) {
            console.log(`      좌표: [${sample.coordinates[0]}, ${sample.coordinates[1]}]`);
          }
        });
      }
      console.log('');
    });

    // 강남역 부근 회원 확인 (좌표 기반)
    const gangnamStationLat = 37.4979;
    const gangnamStationLng = 127.0276;
    const radiusKm = 3; // 3km 반경
    
    const nearGangnamStation = testMembers.filter(m => {
      if (!m.location?.coordinates || m.location.coordinates.length !== 2) return false;
      const [lng, lat] = m.location.coordinates;
      // 간단한 거리 계산 (하버사인 공식 근사)
      const dLat = (lat - gangnamStationLat) * 111; // 1도 ≈ 111km
      const dLng = (lng - gangnamStationLng) * 111 * Math.cos(gangnamStationLat * Math.PI / 180);
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);
      return distance <= radiusKm;
    });

    console.log(`\n🚇 강남역 부근 (3km 반경) 회원: ${nearGangnamStation.length}명`);
    if (nearGangnamStation.length > 0) {
      console.log(`\n📍 강남역 부근 회원 샘플 (최대 10명):`);
      nearGangnamStation.slice(0, 10).forEach((member, idx) => {
        const centerName = centers.find(c => c._id.toString() === member.centerId?.toString())?.name || '센터없음';
        const [lng, lat] = member.location.coordinates;
        const dLat = (lat - gangnamStationLat) * 111;
        const dLng = (lng - gangnamStationLng) * 111 * Math.cos(gangnamStationLat * Math.PI / 180);
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);
        
        console.log(`   ${idx + 1}. ${member.name} (${member.email})`);
        console.log(`      센터: ${centerName}`);
        console.log(`      주소: ${member.address || '없음'}`);
        console.log(`      좌표: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
        console.log(`      강남역까지 거리: ${distance.toFixed(2)}km`);
      });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 스크립트 실행
checkMemberAddresses();




