/**
 * 📍 회원 주소 데이터 추가 스크립트
 * 
 * 목적: 주소 정보가 없는 회원들에게 테스트 주소 데이터 추가
 * - 각 센터 근처의 랜덤 주소지 생성
 * - 좌표 정보도 함께 생성
 * 
 * 사용법:
 *   node server/scripts/add-address-to-members.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');
const Center = mongoose.model('Center', new mongoose.Schema({}, { strict: false }));

// 센터별 기본 좌표 및 주소 템플릿
const CENTER_LOCATIONS = {
  '강남센터': {
    baseLat: 37.4979,
    baseLng: 127.0276,
    addresses: [
      '서울특별시 강남구 테헤란로 123',
      '서울특별시 강남구 역삼로 456',
      '서울특별시 강남구 강남대로 789',
      '서울특별시 강남구 논현로 321',
      '서울특별시 강남구 봉은사로 654',
      '서울특별시 강남구 선릉로 987',
      '서울특별시 강남구 테헤란로1길 111',
      '서울특별시 강남구 테헤란로2길 222',
      '서울특별시 강남구 역삼로1길 333',
      '서울특별시 강남구 역삼로2길 444',
      '서울특별시 강남구 강남대로102길 555',
      '서울특별시 강남구 논현로1길 666',
      '서울특별시 강남구 봉은사로1길 777',
      '서울특별시 강남구 역삼동 888',
      '서울특별시 강남구 논현동 999',
      '서울특별시 강남구 삼성동 101',
      '서울특별시 강남구 대치동 202',
      '서울특별시 강남구 도곡동 303',
      '서울특별시 강남구 신사동 404'
    ]
  },
  '홍대센터': {
    baseLat: 37.5572,
    baseLng: 126.9228,
    addresses: [
      '서울특별시 마포구 홍익로 123',
      '서울특별시 마포구 동교동 456',
      '서울특별시 마포구 서교동 789',
      '서울특별시 마포구 합정동 321',
      '서울특별시 마포구 상수동 654',
      '서울특별시 마포구 홍익로1길 111',
      '서울특별시 마포구 동교로 222',
      '서울특별시 마포구 서교로 333',
      '서울특별시 마포구 합정로 444'
    ]
  },
  '송파센터': {
    baseLat: 37.5145,
    baseLng: 127.1058,
    addresses: [
      '서울특별시 송파구 올림픽로 123',
      '서울특별시 송파구 잠실동 456',
      '서울특별시 송파구 잠실로 789',
      '서울특별시 송파구 석촌동 321',
      '서울특별시 송파구 문정동 654',
      '서울특별시 송파구 올림픽로1길 111',
      '서울특별시 송파구 잠실로1길 222',
      '서울특별시 송파구 석촌로 333'
    ]
  },
  '마포센터': {
    baseLat: 37.5572,
    baseLng: 126.9228,
    addresses: [
      '서울특별시 마포구 홍익로 200',
      '서울특별시 마포구 동교동 300',
      '서울특별시 마포구 서교동 400',
      '서울특별시 마포구 합정동 500',
      '서울특별시 마포구 상수동 600'
    ]
  }
};

// 랜덤 좌표 생성 (센터 좌표 기준 반경 3km 내)
function generateRandomCoordinates(baseLat, baseLng, radiusKm = 3) {
  // 각도와 거리를 랜덤으로 선택
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusKm; // 0~3km
  
  // 위도/경도로 변환 (대략적 계산)
  const latOffset = (distance / 111) * Math.cos(angle);
  const lngOffset = (distance / (111 * Math.cos(baseLat * Math.PI / 180))) * Math.sin(angle);
  
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset
  };
}

async function addAddressToMembers() {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('📡 MongoDB 연결 중...', mongoUri.replace(/\/\/.*@/, '//***@'));
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 센터 목록 조회
    const centers = await Center.find({}).select('_id name').lean();
    const centerMap = new Map(centers.map(c => [c._id.toString(), c.name]));
    console.log(`🏢 전체 센터: ${centers.length}개\n`);

    // 주소 정보가 없는 회원 조회
    const membersWithoutAddress = await User.find({
      userType: 'student',
      $or: [
        { address: { $exists: false } },
        { address: null },
        { address: '' },
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null },
        { 'location.coordinates': [] }
      ]
    }).select('_id name email centerId address location').lean();

    console.log(`👥 주소 정보가 없는 회원: ${membersWithoutAddress.length}명\n`);

    if (membersWithoutAddress.length === 0) {
      console.log('✅ 모든 회원이 주소 정보를 보유하고 있습니다.');
      await mongoose.disconnect();
      return;
    }

    // 센터별로 그룹화
    const membersByCenter = {};
    membersWithoutAddress.forEach(member => {
      const centerId = member.centerId?.toString() || 'none';
      if (!membersByCenter[centerId]) {
        membersByCenter[centerId] = [];
      }
      membersByCenter[centerId].push(member);
    });

    let totalUpdated = 0;

    // 센터별로 주소 추가
    for (const [centerId, members] of Object.entries(membersByCenter)) {
      const centerName = centerMap.get(centerId) || '기타';
      const centerLocation = CENTER_LOCATIONS[centerName];
      
      if (!centerLocation) {
        console.log(`⚠️ 센터 "${centerName}"의 위치 정보가 없습니다. 기본 좌표 사용.`);
        // 기본 좌표 사용 (서울 강남역)
        const defaultLocation = {
          baseLat: 37.4979,
          baseLng: 127.0276,
          addresses: ['서울특별시 강남구 테헤란로 123']
        };
        
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          const address = defaultLocation.addresses[i % defaultLocation.addresses.length];
          const coords = generateRandomCoordinates(defaultLocation.baseLat, defaultLocation.baseLng);
          
          await User.updateOne(
            { _id: member._id },
            {
              $set: {
                address: address,
                location: {
                  type: 'Point',
                  coordinates: [coords.lng, coords.lat]
                }
              }
            }
          );
        }
        totalUpdated += members.length;
        console.log(`✅ ${centerName} (${centerId}): ${members.length}명 주소 추가 완료 (기본 좌표)`);
        continue;
      }

      console.log(`\n📍 ${centerName} (${centerId}): ${members.length}명 처리 중...`);
      
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const address = centerLocation.addresses[i % centerLocation.addresses.length];
        const coords = generateRandomCoordinates(centerLocation.baseLat, centerLocation.baseLng);
        
        await User.updateOne(
          { _id: member._id },
          {
            $set: {
              address: address,
              location: {
                type: 'Point',
                coordinates: [coords.lng, coords.lat]
              }
            }
          }
        );
      }
      
      totalUpdated += members.length;
      console.log(`✅ ${centerName}: ${members.length}명 주소 추가 완료`);
    }

    console.log(`\n✅ 총 ${totalUpdated}명의 회원에게 주소 정보를 추가했습니다.`);

    // 검증: 주소가 추가되었는지 확인
    const membersWithAddress = await User.find({
      userType: 'student',
      address: { $exists: true, $ne: null, $ne: '' },
      'location.coordinates': { $exists: true, $ne: null, $ne: [] }
    }).countDocuments();

    console.log(`\n📊 검증 결과:`);
    console.log(`  - 주소 정보 보유 회원: ${membersWithAddress}명`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 스크립트 실행
addAddressToMembers();



