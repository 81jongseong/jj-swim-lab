/**
 * 센터 샘플 데이터 생성 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 컴파일된 모델 import
const { SwimmingCenter } = require('../dist/models/SwimmingCenter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

// 서울시 센터 데이터
const seoulCenters = [
  { name: '강남센터', district: '강남구' },
  { name: '역삼센터', district: '강남구' },
  { name: '삼성센터', district: '강남구' },
  { name: '서초센터', district: '서초구' },
  { name: '방배센터', district: '서초구' },
  { name: '송파센터', district: '송파구' },
  { name: '잠실센터', district: '송파구' },
  { name: '강동센터', district: '강동구' },
  { name: '광진센터', district: '광진구' },
  { name: '마포센터', district: '마포구' }
];

// 경기도 센터 데이터
const gyeonggiCenters = [
  { name: '수원센터', district: '수원시' },
  { name: '성남센터', district: '성남시' },
  { name: '분당센터', district: '성남시' },
  { name: '용인센터', district: '용인시' },
  { name: '고양센터', district: '고양시' },
  { name: '부천센터', district: '부천시' },
  { name: '안양센터', district: '안양시' },
  { name: '평촌센터', district: '안양시' }
];

// 인천시 센터 데이터
const incheonCenters = [
  { name: '부평센터', district: '부평구' },
  { name: '남동센터', district: '남동구' },
  { name: '연수센터', district: '연수구' }
];

async function createCenterSampleData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 센터 데이터 삭제
    console.log('🗑️  기존 센터 데이터 삭제 중...');
    await SwimmingCenter.deleteMany({});
    console.log('✅ 기존 데이터 삭제 완료');

    const allCenters = [];

    // 서울시 센터 생성
    console.log('🏢 서울시 센터 생성 중...');
    for (let i = 0; i < seoulCenters.length; i++) {
      const center = seoulCenters[i];
      allCenters.push({
        name: center.name,
        address: `서울특별시 ${center.district} 테스트로 ${i + 1}23`,
        location: {
          type: 'Point',
          coordinates: [126.9 + (i * 0.01), 37.5 + (i * 0.01)]
        },
        phone: `02-1234-${5670 + i}`,
        email: `${center.name.toLowerCase().replace('센터', '')}@jjswim.com`,
        website: 'https://jjswim.com',
        description: `${center.name} 설명`,
        facilities: {
          mainPool: {
            lanes: 6,
            poolLength: 25,
            poolDepth: 1.5,
            temperature: 28
          },
          kidsPool: {
            hasKidsPool: true,
            kidsPoolLanes: 2,
            kidsPoolLength: 12,
            kidsPoolDepth: 0.8,
            kidsPoolTemperature: 30
          }
        },
        maxCapacity: 200,
        province: '서울시',
        city: '서울시',
        gu: center.district,
        dong: '테스트동',
        isActive: true
      });
    }

    // 경기도 센터 생성
    console.log('🏢 경기도 센터 생성 중...');
    for (let i = 0; i < gyeonggiCenters.length; i++) {
      const center = gyeonggiCenters[i];
      allCenters.push({
        name: center.name,
        address: `경기도 ${center.district} 테스트로 ${i + 4}56`,
        location: {
          type: 'Point',
          coordinates: [127.0 + (i * 0.01), 37.4 + (i * 0.01)]
        },
        phone: `031-1234-${5678 + i}`,
        email: `${center.name.toLowerCase().replace('센터', '')}@jjswim.com`,
        website: 'https://jjswim.com',
        description: `${center.name} 설명`,
        facilities: {
          mainPool: {
            lanes: 6,
            poolLength: 25,
            poolDepth: 1.5,
            temperature: 28
          },
          kidsPool: {
            hasKidsPool: true,
            kidsPoolLanes: 2,
            kidsPoolLength: 12,
            kidsPoolDepth: 0.8,
            kidsPoolTemperature: 30
          }
        },
        maxCapacity: 180,
        province: '경기도',
        city: center.district,
        gu: center.district,
        dong: '테스트동',
        isActive: true
      });
    }

    // 인천시 센터 생성
    console.log('🏢 인천시 센터 생성 중...');
    for (let i = 0; i < incheonCenters.length; i++) {
      const center = incheonCenters[i];
      allCenters.push({
        name: center.name,
        address: `인천광역시 ${center.district} 테스트로 ${i + 7}89`,
        location: {
          type: 'Point',
          coordinates: [126.7 + (i * 0.01), 37.4 + (i * 0.01)]
        },
        phone: `032-1234-${5678 + i}`,
        email: `${center.name.toLowerCase().replace('센터', '')}@jjswim.com`,
        website: 'https://jjswim.com',
        description: `${center.name} 설명`,
        facilities: {
          mainPool: {
            lanes: 6,
            poolLength: 25,
            poolDepth: 1.5,
            temperature: 28
          },
          kidsPool: {
            hasKidsPool: false,
            kidsPoolLanes: 0,
            kidsPoolLength: 0,
            kidsPoolDepth: 0,
            kidsPoolTemperature: 0
          }
        },
        maxCapacity: 150,
        province: '인천시',
        city: '인천시',
        gu: center.district,
        dong: '테스트동',
        isActive: true
      });
    }

    // DB에 저장
    console.log(`💾 ${allCenters.length}개 센터 저장 중...`);
    const createdCenters = await SwimmingCenter.insertMany(allCenters);
    console.log(`✅ ${createdCenters.length}개 센터 생성 완료!`);

    // 통계 출력
    console.log('\n📊 생성된 센터 통계:');
    console.log(`  - 서울시: ${seoulCenters.length}개`);
    console.log(`  - 경기도: ${gyeonggiCenters.length}개`);
    console.log(`  - 인천시: ${incheonCenters.length}개`);
    console.log(`  - 총합: ${allCenters.length}개`);

    console.log('\n✅ 센터 샘플 데이터 생성 완료!');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

createCenterSampleData();

