/**
 * 📍 센터별 회원 위치 데이터 생성 스크립트
 * 
 * 목적: 각 센터 근처의 랜덤 주소지로 회원 데이터 생성
 * - 각 센터의 좌표를 기준으로 반경 5km 내 랜덤 주소 생성
 * - 센터별로 회원 수를 분산 배치하여 줌 레벨에 따른 집계 테스트 가능
 * 
 * 사용법:
 *   node server/scripts/seed-members-by-center-location.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');
// Center 모델 import (다른 스크립트 패턴 참고)
const Center = mongoose.model('Center', new mongoose.Schema({}, { strict: false }));

// 센터별 기본 주소지 템플릿 (강남역 부근 상세 주소)
const CENTER_ADDRESS_TEMPLATES = {
  '강남센터': {
    baseLat: 37.4979,  // 강남역 좌표 (위도)
    baseLng: 127.0276, // 강남역 좌표 (경도)
    addresses: [
      // 강남역 직결 도로
      '서울특별시 강남구 테헤란로',
      '서울특별시 강남구 역삼로',
      '서울특별시 강남구 강남대로',
      '서울특별시 강남구 논현로',
      '서울특별시 강남구 봉은사로',
      '서울특별시 강남구 선릉로',
      
      // 강남역 세부 도로 (테헤란로 계열)
      '서울특별시 강남구 테헤란로1길',
      '서울특별시 강남구 테헤란로2길',
      '서울특별시 강남구 테헤란로3길',
      '서울특별시 강남구 테헤란로4길',
      '서울특별시 강남구 테헤란로5길',
      '서울특별시 강남구 테헤란로6길',
      '서울특별시 강남구 테헤란로7길',
      
      // 강남역 세부 도로 (역삼로 계열)
      '서울특별시 강남구 역삼로1길',
      '서울특별시 강남구 역삼로2길',
      '서울특별시 강남구 역삼로3길',
      '서울특별시 강남구 역삼로4길',
      '서울특별시 강남구 역삼로5길',
      
      // 강남역 세부 도로 (강남대로 계열)
      '서울특별시 강남구 강남대로102길',
      '서울특별시 강남구 강남대로104길',
      '서울특별시 강남구 강남대로106길',
      '서울특별시 강남구 강남대로108길',
      '서울특별시 강남구 강남대로110길',
      
      // 강남역 세부 도로 (논현로 계열)
      '서울특별시 강남구 논현로1길',
      '서울특별시 강남구 논현로2길',
      '서울특별시 강남구 논현로3길',
      '서울특별시 강남구 논현로4길',
      
      // 강남역 세부 도로 (봉은사로 계열)
      '서울특별시 강남구 봉은사로1길',
      '서울특별시 강남구 봉은사로2길',
      '서울특별시 강남구 봉은사로3길',
      '서울특별시 강남구 봉은사로4길',
      
      // 강남역 동네
      '서울특별시 강남구 역삼동',
      '서울특별시 강남구 역삼1동',
      '서울특별시 강남구 역삼2동',
      '서울특별시 강남구 논현동',
      '서울특별시 강남구 논현1동',
      '서울특별시 강남구 논현2동',
      '서울특별시 강남구 삼성동',
      '서울특별시 강남구 삼성1동',
      '서울특별시 강남구 삼성2동',
      '서울특별시 강남구 대치동',
      '서울특별시 강남구 대치1동',
      '서울특별시 강남구 대치2동',
      '서울특별시 강남구 대치4동',
      '서울특별시 강남구 도곡동',
      '서울특별시 강남구 도곡1동',
      '서울특별시 강남구 도곡2동',
      '서울특별시 강남구 신사동',
      '서울특별시 강남구 신사동'
    ]
  },
  '홍대센터': {
    baseLat: 37.5572,
    baseLng: 126.9228,
    addresses: [
      '서울특별시 마포구 홍익로',
      '서울특별시 마포구 동교동',
      '서울특별시 마포구 서교동',
      '서울특별시 마포구 합정동',
      '서울특별시 마포구 상수동'
    ]
  },
  '송파센터': {
    baseLat: 37.5145,
    baseLng: 127.1058,
    addresses: [
      '서울특별시 송파구 올림픽로',
      '서울특별시 송파구 잠실동',
      '서울특별시 송파구 문정동',
      '서울특별시 송파구 가락동',
      '서울특별시 송파구 석촌동'
    ]
  },
  '마포센터': {
    baseLat: 37.5572,
    baseLng: 126.9228,
    addresses: [
      '서울특별시 마포구 마포대로',
      '서울특별시 마포구 공덕동',
      '서울특별시 마포구 신공덕동',
      '서울특별시 마포구 아현동',
      '서울특별시 마포구 도화동'
    ]
  }
};

// 센터 좌표 근처 랜덤 좌표 생성 (반경 조정 가능)
// 강남역 부근은 더 집중된 분포 (반경 약 3km)
function getRandomCoordinatesNearCenter(baseLat, baseLng, radiusKm = 3) {
  // 1도 ≈ 111km
  const radiusDeg = radiusKm / 111;
  
  // 균등 분포가 아닌 가우시안 분포로 생성 (중심에 더 집중)
  // 강남역 부근은 더 작은 반경으로 집중 분포
  const angle = Math.random() * 2 * Math.PI;
  const distance = radiusDeg * Math.sqrt(Math.random());
  
  const lat = baseLat + distance * Math.cos(angle);
  const lng = baseLng + distance * Math.sin(angle);
  
  return { lat, lng };
}

// 랜덤 주소 생성 (강남역 부근 세부 주소)
function generateRandomAddress(templates) {
  const baseAddress = templates.addresses[Math.floor(Math.random() * templates.addresses.length)];
  
  // 주소가 이미 "길"로 끝나는지 확인
  const alreadyHasGil = baseAddress.endsWith('길');
  
  if (alreadyHasGil) {
    // 이미 "길"이 있으면 건물 번호만 추가
    const buildingNumber = Math.floor(Math.random() * 99) + 1;
    return `${baseAddress} ${buildingNumber}`;
  } else {
    // "길"이 없으면 길 번호와 건물 번호 추가
    const streetNumber = Math.floor(Math.random() * 999) + 1;
    const buildingNumber = Math.floor(Math.random() * 99) + 1;
    return `${baseAddress} ${streetNumber}길 ${buildingNumber}`;
  }
}

async function seedMembersByCenterLocation() {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('📡 MongoDB 연결 중...', mongoUri.replace(/\/\/.*@/, '//***@'));
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 기존 student 회원 삭제 (테스트 데이터만)
    console.log('🧹 기존 student 회원 데이터 삭제 중...');
    const deletedCount = await User.deleteMany({ 
      userType: 'student',
      email: { $regex: /^test-member-/ } // 테스트 회원만 삭제
    });
    console.log(`✅ ${deletedCount.deletedCount}명의 테스트 회원 삭제 완료\n`);

    // 센터 목록 조회 (이름에 포함된 센터 찾기)
    const allCenters = await Center.find({}).select('_id name location').lean();
    console.log(`\n📋 전체 센터 목록:`);
    allCenters.forEach(c => console.log(`  - ${c.name}`));
    
    // 센터 이름 매칭 (부분 일치 또는 정확한 일치)
    const centerNames = ['강남', '홍대', '송파', '마포'];
    const centers = allCenters.filter(c => {
      const name = c.name.toLowerCase();
      return centerNames.some(keyword => name.includes(keyword.toLowerCase()));
    });

    console.log(`🏢 조회된 센터: ${centers.length}개\n`);

    if (centers.length === 0) {
      console.log('❌ 센터를 찾을 수 없습니다. 먼저 센터를 생성해주세요.');
      await mongoose.disconnect();
      return;
    }

    // 각 센터별로 회원 생성
    let totalCreated = 0;

    for (const center of centers) {
      const centerName = center.name.replace('JJ Swim Lab ', '').replace('점', '').trim();
      console.log(`\n📌 ${centerName} 처리 중...`);

      // 센터 좌표 확인 (센터 이름에서 매칭)
      let centerLat, centerLng;
      let matchedTemplate = null;
      
      // 센터 이름에서 키워드 매칭
      for (const [key, template] of Object.entries(CENTER_ADDRESS_TEMPLATES)) {
        if (centerName.includes(key.replace('센터', ''))) {
          matchedTemplate = template;
          break;
        }
      }
      
      if (center.location?.coordinates && center.location.coordinates.length === 2) {
        // [lng, lat] 형식
        centerLng = center.location.coordinates[0];
        centerLat = center.location.coordinates[1];
        console.log(`  📍 센터 좌표 (DB): [${centerLng}, ${centerLat}]`);
      } else if (matchedTemplate) {
        // 템플릿 좌표 사용
        centerLat = matchedTemplate.baseLat;
        centerLng = matchedTemplate.baseLng;
        console.log(`  📍 템플릿 좌표 사용: [${centerLng}, ${centerLat}]`);
      } else {
        // 기본 서울 좌표 사용
        centerLat = 37.5665;
        centerLng = 126.9780;
        console.log(`  📍 기본 서울 좌표 사용: [${centerLng}, ${centerLat}]`);
      }

      // 센터별 회원 수 결정 (테스트용 - 강남역 부근 집중 분포)
      // 강남센터는 강남역 부근으로 250명 생성 (더 밀도 높게)
      const membersPerCenter = centerName.includes('강남') ? 250 : 200;
      const templates = matchedTemplate || {
        addresses: [`서울특별시 ${centerName} 근처`]
      };

      console.log(`  👥 ${membersPerCenter}명 생성 중...`);

      const users = [];
      for (let i = 0; i < membersPerCenter; i++) {
        // 센터 근처 랜덤 좌표 생성 (강남역 부근은 반경 3km)
        const radius = centerName.includes('강남') ? 3 : 5; // 강남역 부근은 더 집중
        const coords = getRandomCoordinatesNearCenter(centerLat, centerLng, radius);
        const address = generateRandomAddress(templates);

        const user = {
          userId: `test-member-${centerName}-${i + 1}`,
          name: `테스트회원${i + 1}`,
          email: `test-member-${centerName}-${i + 1}@test.com`,
          password: '$2a$10$defaultHashPasswordHere', // bcrypt 해시 (실제로는 해싱 필요)
          phone: `010-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          address: address,
          location: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat] // [경도, 위도]
          },
          userType: 'student',
          level: '초급',
          centerId: center._id,
          studentInfo: {
            age: Math.floor(Math.random() * 40) + 10, // 10-50세
            swimmingLevel: ['초급', '중급', '고급'][Math.floor(Math.random() * 3)],
            status: 'active'
          },
          isActive: true,
          accessPermissions: {
            dashboard: true,
            courses: true,
            bookings: true,
            payments: true,
            notices: true,
            progress: true,
            evaluations: false,
            reports: false,
            userManagement: false,
            systemSettings: false,
            aiConfigManagement: false
          },
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // 최근 1년 내 랜덤 가입일
        };

        users.push(user);
      }

      // 배치 삽입
      await User.insertMany(users);
      totalCreated += users.length;
      console.log(`  ✅ ${users.length}명 생성 완료`);
    }

    console.log(`\n✅ 전체 완료!`);
    console.log(`  총 ${totalCreated}명의 회원 생성됨`);

    // 샘플 데이터 확인
    const sampleUsers = await User.find({
      email: { $regex: /^test-member-/ }
    })
      .select('name email address location centerId')
      .limit(5)
      .lean();

    console.log(`\n📋 샘플 데이터:`);
    sampleUsers.forEach((user, idx) => {
      const center = centers.find(c => c._id.toString() === user.centerId?.toString());
      console.log(`  ${idx + 1}. ${user.name} (${center?.name || '센터없음'})`);
      console.log(`     주소: ${user.address}`);
      if (user.location?.coordinates) {
        console.log(`     좌표: [${user.location.coordinates[0]}, ${user.location.coordinates[1]}]`);
      }
    });

    // 센터별 통계
    console.log(`\n📊 센터별 회원 수:`);
    for (const center of centers) {
      const count = await User.countDocuments({ 
        centerId: center._id,
        email: { $regex: /^test-member-/ }
      });
      console.log(`  ${center.name}: ${count}명`);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 스크립트 실행
seedMembersByCenterLocation();

