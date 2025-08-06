const mongoose = require('mongoose');
require('dotenv').config();

// SwimmingCenter 모델 정의
const swimmingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  phone: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  description: { type: String },
  facilities: {
    lanes: { type: Number, required: true },
    poolLength: { type: Number, required: true },
    poolDepth: { type: Number, required: true },
    temperature: { type: Number, required: true },
    hasSauna: { type: Boolean, default: false },
    hasShower: { type: Boolean, default: true },
    hasLocker: { type: Boolean, default: true }
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
  },
  pricing: {
    freeSwim: {
      adult: { type: Number, required: true },
      child: { type: Number, required: true },
      student: { type: Number, required: true }
    },
    lesson: {
      perSession: { type: Number, required: true },
      monthly: { type: Number, required: true }
    }
  },
  currentCapacity: { type: Number, default: 0 },
  maxCapacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  images: [{ url: String, caption: String }]
});

const SwimmingCenter = mongoose.model('SwimmingCenter', swimmingCenterSchema);

async function addTestCenters() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 삭제
    await SwimmingCenter.deleteMany({});
    console.log('🗑️ 기존 수영장 데이터 삭제 완료');

    // 테스트 수영장 데이터
    const testCenters = [
      {
        name: 'JJ 수영장 강남점',
        address: '서울특별시 강남구 테헤란로 123',
        location: {
          latitude: 37.5665,
          longitude: 127.0018
        },
        phone: '02-1234-5678',
        email: 'gangnam@jjswim.com',
        website: 'https://jjswim.com/gangnam',
        description: '강남 지역 최고의 수영장',
        facilities: {
          lanes: 8,
          poolLength: 25,
          poolDepth: 1.8,
          temperature: 28,
          hasSauna: true,
          hasShower: true,
          hasLocker: true
        },
        operatingHours: {
          monday: { open: '06:00', close: '22:00', isOpen: true },
          tuesday: { open: '06:00', close: '22:00', isOpen: true },
          wednesday: { open: '06:00', close: '22:00', isOpen: true },
          thursday: { open: '06:00', close: '22:00', isOpen: true },
          friday: { open: '06:00', close: '22:00', isOpen: true },
          saturday: { open: '08:00', close: '20:00', isOpen: true },
          sunday: { open: '08:00', close: '20:00', isOpen: true }
        },
        pricing: {
          freeSwim: {
            adult: 15000,
            child: 10000,
            student: 12000
          },
          lesson: {
            perSession: 50000,
            monthly: 200000
          }
        },
        currentCapacity: 45,
        maxCapacity: 100,
        isActive: true,
        images: [
          { url: '/images/center1-1.jpg', caption: '메인 수영장' },
          { url: '/images/center1-2.jpg', caption: '사우나 시설' }
        ]
      },
      {
        name: 'JJ 수영장 홍대점',
        address: '서울특별시 마포구 와우산로 123',
        location: {
          latitude: 37.5575,
          longitude: 126.9250
        },
        phone: '02-2345-6789',
        email: 'hongdae@jjswim.com',
        website: 'https://jjswim.com/hongdae',
        description: '홍대 지역의 프리미엄 수영장',
        facilities: {
          lanes: 6,
          poolLength: 25,
          poolDepth: 1.6,
          temperature: 29,
          hasSauna: false,
          hasShower: true,
          hasLocker: true
        },
        operatingHours: {
          monday: { open: '07:00', close: '21:00', isOpen: true },
          tuesday: { open: '07:00', close: '21:00', isOpen: true },
          wednesday: { open: '07:00', close: '21:00', isOpen: true },
          thursday: { open: '07:00', close: '21:00', isOpen: true },
          friday: { open: '07:00', close: '21:00', isOpen: true },
          saturday: { open: '09:00', close: '18:00', isOpen: true },
          sunday: { open: '09:00', close: '18:00', isOpen: true }
        },
        pricing: {
          freeSwim: {
            adult: 12000,
            child: 8000,
            student: 10000
          },
          lesson: {
            perSession: 45000,
            monthly: 180000
          }
        },
        currentCapacity: 32,
        maxCapacity: 80,
        isActive: true,
        images: [
          { url: '/images/center2-1.jpg', caption: '수영장 전경' },
          { url: '/images/center2-2.jpg', caption: '샤워 시설' }
        ]
      },
      {
        name: 'JJ 수영장 잠실점',
        address: '서울특별시 송파구 올림픽로 123',
        location: {
          latitude: 37.5139,
          longitude: 127.1006
        },
        phone: '02-3456-7890',
        email: 'jamsil@jjswim.com',
        website: 'https://jjswim.com/jamsil',
        description: '잠실 지역 최대 규모의 수영장',
        facilities: {
          lanes: 12,
          poolLength: 50,
          poolDepth: 2.0,
          temperature: 27,
          hasSauna: true,
          hasShower: true,
          hasLocker: true
        },
        operatingHours: {
          monday: { open: '05:00', close: '24:00', isOpen: true },
          tuesday: { open: '05:00', close: '24:00', isOpen: true },
          wednesday: { open: '05:00', close: '24:00', isOpen: true },
          thursday: { open: '05:00', close: '24:00', isOpen: true },
          friday: { open: '05:00', close: '24:00', isOpen: true },
          saturday: { open: '06:00', close: '22:00', isOpen: true },
          sunday: { open: '06:00', close: '22:00', isOpen: true }
        },
        pricing: {
          freeSwim: {
            adult: 18000,
            child: 12000,
            student: 15000
          },
          lesson: {
            perSession: 60000,
            monthly: 250000
          }
        },
        currentCapacity: 78,
        maxCapacity: 150,
        isActive: true,
        images: [
          { url: '/images/center3-1.jpg', caption: '올림픽 규격 수영장' },
          { url: '/images/center3-2.jpg', caption: '사우나 및 휴식 공간' }
        ]
      }
    ];

    // 데이터 삽입
    const result = await SwimmingCenter.insertMany(testCenters);
    console.log(`✅ ${result.length}개의 수영장 데이터 추가 완료`);

    // 추가된 데이터 확인
    const centers = await SwimmingCenter.find({});
    console.log('\n📋 추가된 수영장 목록:');
    centers.forEach(center => {
      console.log(`- ${center.name} (${center.address})`);
    });

    console.log('\n🎉 테스트 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
addTestCenters(); 