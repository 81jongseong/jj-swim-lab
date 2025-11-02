/**
 * 📍 회원 데이터에 주소지 추가 스크립트
 * 
 * 목적: 회원 분포도 지도 표시를 위해 기존 회원들에게 주소지를 추가
 * 
 * 사용법:
 *   node server/scripts/add-address-to-users.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');

// 서울 지역 주소지 샘플 (다양한 지역)
const SEOUL_ADDRESSES = [
  '서울특별시 강남구 테헤란로 123',
  '서울특별시 강남구 역삼로 456',
  '서울특별시 서초구 서초대로 789',
  '서울특별시 송파구 올림픽로 321',
  '서울특별시 마포구 홍익로 654',
  '서울특별시 종로구 세종대로 987',
  '서울특별시 중구 을지로 147',
  '서울특별시 용산구 이태원로 258',
  '서울특별시 강동구 천호대로 369',
  '서울특별시 강서구 화곡로 741',
  '서울특별시 영등포구 여의대로 852',
  '서울특별시 구로구 디지털로 963',
  '서울특별시 금천구 시흥대로 159',
  '서울특별시 관악구 봉천로 357',
  '서울특별시 동작구 여의대방로 468',
  '서울특별시 양천구 목동로 579',
  '서울특별시 은평구 은평로 680',
  '서울특별시 노원구 상계로 791',
  '서울특별시 도봉구 도봉로 802',
  '서울특별시 강북구 도봉로 913',
];

// 좌표 샘플 (서울 중심부 ± 범위)
function getRandomSeoulCoordinates() {
  // 서울 중심: 37.5665, 126.9780
  const baseLat = 37.5665;
  const baseLng = 126.9780;
  const range = 0.15; // ±0.15도 (약 17km)
  
  return {
    lat: baseLat + (Math.random() - 0.5) * range * 2,
    lng: baseLng + (Math.random() - 0.5) * range * 2
  };
}

async function addAddressToUsers() {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('📡 MongoDB 연결 중...', mongoUri.replace(/\/\/.*@/, '//***@'));
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공');

    // 주소지가 없는 회원 조회 (student, instructor만)
    const usersWithoutAddress = await User.find({
      $or: [
        { address: { $exists: false } },
        { address: '' },
        { address: null }
      ],
      userType: { $in: ['student', 'instructor'] }
    }).select('_id name email address location centerId userType');

    console.log(`\n📍 주소지가 없는 회원: ${usersWithoutAddress.length}명`);

    if (usersWithoutAddress.length === 0) {
      console.log('✅ 모든 회원에게 주소지가 이미 있습니다.');
      await mongoose.disconnect();
      return;
    }

    // 주소지 추가
    let successCount = 0;
    let failCount = 0;

    for (const user of usersWithoutAddress) {
      try {
        // 랜덤 주소 선택
        const randomAddress = SEOUL_ADDRESSES[Math.floor(Math.random() * SEOUL_ADDRESSES.length)];
        
        // 랜덤 좌표 생성
        const coords = getRandomSeoulCoordinates();
        
        // 업데이트
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              address: randomAddress,
              location: {
                type: 'Point',
                coordinates: [coords.lng, coords.lat] // [경도, 위도]
              }
            }
          }
        );

        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  진행 중: ${successCount}/${usersWithoutAddress.length}명 처리 완료`);
        }
      } catch (error) {
        console.error(`❌ 회원 ${user._id} 업데이트 실패:`, error.message);
        failCount++;
      }
    }

    console.log(`\n✅ 완료!`);
    console.log(`  성공: ${successCount}명`);
    console.log(`  실패: ${failCount}명`);

    // 샘플 데이터 확인
    const sampleUsers = await User.find({
      address: { $exists: true, $ne: '' },
      location: { $exists: true }
    })
      .select('name address location')
      .limit(3)
      .lean();

    console.log(`\n📋 샘플 데이터 (주소지 추가된 회원):`);
    sampleUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.name}`);
      console.log(`     주소: ${user.address}`);
      if (user.location?.coordinates) {
        console.log(`     좌표: [${user.location.coordinates[0]}, ${user.location.coordinates[1]}]`);
      }
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 스크립트 실행
addAddressToUsers();

