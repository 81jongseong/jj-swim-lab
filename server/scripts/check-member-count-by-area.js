/**
 * 📍 특정 구역의 회원 수 확인 스크립트
 * 
 * 목적: 특정 좌표 근처에 실제로 몇 명의 회원이 있는지 확인
 * 
 * 사용법:
 *   node server/scripts/check-member-count-by-area.js [lat] [lng] [radiusKm]
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');

async function checkMemberCountByArea(lat, lng, radiusKm = 0.1) {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('📡 MongoDB 연결 중...', mongoUri.replace(/\/\/.*@/, '//***@'));
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 좌표 설정 (기본값: 강남역)
    const targetLat = lat || 37.4979;
    const targetLng = lng || 127.0276;
    const radius = radiusKm || 0.1; // 기본 100m 반경

    console.log(`📍 확인 대상 구역:`);
    console.log(`   중심 좌표: [${targetLng}, ${targetLat}]`);
    console.log(`   반경: ${radius}km (${radius * 1000}m)\n`);

    // 테스트 회원 조회
    const allMembers = await User.find({
      userType: 'student',
      email: { $regex: /^test-member-/ },
      location: { $exists: true, $ne: null }
    }).select('name email address location centerId').lean();

    console.log(`👥 전체 테스트 회원: ${allMembers.length}명\n`);

    // 반경 내 회원 필터링
    const membersInArea = allMembers.filter(m => {
      if (!m.location?.coordinates || m.location.coordinates.length !== 2) return false;
      
      const [memberLng, memberLat] = m.location.coordinates;
      
      // 간단한 거리 계산 (하버사인 공식 근사)
      const dLat = (memberLat - targetLat) * 111; // 1도 ≈ 111km
      const dLng = (memberLng - targetLng) * 111 * Math.cos(targetLat * Math.PI / 180);
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);
      
      return distance <= radius;
    });

    console.log(`✅ 반경 ${radius}km 내 회원: ${membersInArea.length}명\n`);

    // 구역별 집계 (약 38m 반경 = 건물 단위, 줌 레벨 18)
    const areaRadiusMeters = 38; // 건물 단위 ≈38m
    const areaRadiusKm = areaRadiusMeters / 1000;
    
    const membersInBuildingArea = allMembers.filter(m => {
      if (!m.location?.coordinates || m.location.coordinates.length !== 2) return false;
      const [memberLng, memberLat] = m.location.coordinates;
      const dLat = (memberLat - targetLat) * 111;
      const dLng = (memberLng - targetLng) * 111 * Math.cos(targetLat * Math.PI / 180);
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);
      return distance <= areaRadiusKm;
    });

    console.log(`🏢 건물 단위 구역 (약 ${areaRadiusMeters}m 반경) 내 회원: ${membersInBuildingArea.length}명\n`);
    
    if (membersInBuildingArea.length > 0) {
      console.log(`📋 건물 단위 구역 내 회원 상세:`);
      membersInBuildingArea.forEach((member, idx) => {
        const [memberLng, memberLat] = member.location.coordinates;
        const dLat = (memberLat - targetLat) * 111;
        const dLng = (memberLng - targetLng) * 111 * Math.cos(targetLat * Math.PI / 180);
        const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 1000;
        console.log(`   ${idx + 1}. ${member.name} (${member.email})`);
        console.log(`      주소: ${member.address || '없음'}`);
        console.log(`      좌표: [${memberLng.toFixed(6)}, ${memberLat.toFixed(6)}]`);
        console.log(`      거리: ${distance.toFixed(1)}m`);
      });
    }

    // 반경 내 회원 상세 정보
    if (membersInArea.length > 0) {
      console.log(`\n📋 반경 내 회원 상세 정보:`);
      membersInArea.slice(0, 10).forEach((member, idx) => {
        const [memberLng, memberLat] = member.location.coordinates;
        const dLat = (memberLat - targetLat) * 111;
        const dLng = (memberLng - targetLng) * 111 * Math.cos(targetLat * Math.PI / 180);
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);
        
        console.log(`   ${idx + 1}. ${member.name} (${member.email})`);
        console.log(`      주소: ${member.address || '없음'}`);
        console.log(`      좌표: [${memberLng.toFixed(6)}, ${memberLat.toFixed(6)}]`);
        console.log(`      거리: ${(distance * 1000).toFixed(1)}m`);
      });
      
      if (membersInArea.length > 10) {
        console.log(`   ... 외 ${membersInArea.length - 10}명`);
      }
    } else {
      console.log(`\n⚠️ 반경 ${radius}km 내 회원이 없습니다.`);
      console.log(`   반경을 늘려서 확인해보세요.`);
    }

    // 거리별 분포
    const distanceRanges = {
      '0-100m': 0,
      '100-200m': 0,
      '200-500m': 0,
      '500m-1km': 0,
      '1km 이상': 0
    };

    allMembers.forEach(m => {
      if (!m.location?.coordinates || m.location.coordinates.length !== 2) return;
      const [memberLng, memberLat] = m.location.coordinates;
      const dLat = (memberLat - targetLat) * 111;
      const dLng = (memberLng - targetLng) * 111 * Math.cos(targetLat * Math.PI / 180);
      const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 1000; // 미터 단위
      
      if (distance < 100) distanceRanges['0-100m']++;
      else if (distance < 200) distanceRanges['100-200m']++;
      else if (distance < 500) distanceRanges['200-500m']++;
      else if (distance < 1000) distanceRanges['500m-1km']++;
      else distanceRanges['1km 이상']++;
    });

    console.log(`\n📊 중심점 기준 거리별 분포:`);
    Object.entries(distanceRanges).forEach(([range, count]) => {
      console.log(`   ${range}: ${count}명`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 명령줄 인자 파싱
const args = process.argv.slice(2);
const lat = args[0] ? parseFloat(args[0]) : null;
const lng = args[1] ? parseFloat(args[1]) : null;
const radius = args[2] ? parseFloat(args[2]) : null;

// 스크립트 실행
checkMemberCountByArea(lat, lng, radius);

