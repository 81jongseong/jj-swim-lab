/**
 * 🏢 CenterInfo 컬렉션에 직접 샘플 데이터 추가
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// CenterInfo 스키마 정의 (간소화)
const CenterInfoSchema = new mongoose.Schema({
  centerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  businessHours: {
    monday: { type: String, required: true },
    tuesday: { type: String, required: true },
    wednesday: { type: String, required: true },
    thursday: { type: String, required: true },
    friday: { type: String, required: true },
    saturday: { type: String, required: true },
    sunday: { type: String, required: true }
  },
  facilities: [{ type: String }],
  features: [{ type: String }],
  images: {
    mainImage: { type: String },
    gallery: [{ type: String }]
  },
  instructors: [{
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: String, required: true },
    image: { type: String }
  }],
  courses: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: String, required: true }
  }],
  status: { type: String, default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

const CenterInfo = mongoose.model('CenterInfo', CenterInfoSchema);

async function createCenterInfo() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 확인
    const existingCount = await CenterInfo.countDocuments();
    console.log(`📊 기존 센터 정보: ${existingCount}개`);

    if (existingCount > 0) {
      console.log('✅ 이미 센터 정보가 있습니다.');
      const existing = await CenterInfo.find().select('name status');
      existing.forEach((center, index) => {
        console.log(`${index + 1}. ${center.name} (${center.status})`);
      });
      return;
    }

    // 샘플 데이터 생성
    const sampleCenters = [
      {
        centerId: 'center-gangnam-001',
        name: 'JJ 수영센터 강남점',
        shortDescription: '강남 최고의 수영센터',
        description: '최신 시설을 갖춘 프리미엄 수영센터입니다.',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-123-4567',
        email: 'gangnam@jjswim.com',
        website: 'https://gangnam.jjswim.com',
        businessHours: {
          monday: '06:00-22:00',
          tuesday: '06:00-22:00',
          wednesday: '06:00-22:00',
          thursday: '06:00-22:00',
          friday: '06:00-22:00',
          saturday: '08:00-20:00',
          sunday: '08:00-20:00'
        },
        facilities: ['25m 수영장', '샤워실', '락커룸', '주차장', '카페'],
        features: ['최신 시설', '전문 강사진', '개인 맞춤 수업'],
        images: {
          mainImage: '/images/centers/gangnam-main.jpg',
          gallery: ['/images/centers/gangnam-pool.jpg']
        },
        instructors: [
          {
            name: '김강사',
            specialty: '자유형, 배영',
            experience: '수영 지도 10년'
          }
        ],
        courses: [
          {
            name: '초급 자유형',
            description: '수영 초보자를 위한 자유형 기초 과정',
            level: '초급',
            duration: '4주',
            price: '120,000원'
          }
        ],
        status: 'active',
        createdBy: new mongoose.Types.ObjectId('68c58a124eb2ae4d54db20a6') // admin ID
      },
      {
        centerId: 'center-hongdae-002',
        name: 'JJ 수영센터 홍대점',
        shortDescription: '홍대 젊은 수영센터',
        description: '젊고 활기찬 홍대의 수영센터입니다.',
        address: '서울시 마포구 홍익로 456',
        phone: '02-234-5678',
        email: 'hongdae@jjswim.com',
        businessHours: {
          monday: '07:00-23:00',
          tuesday: '07:00-23:00',
          wednesday: '07:00-23:00',
          thursday: '07:00-23:00',
          friday: '07:00-23:00',
          saturday: '09:00-21:00',
          sunday: '09:00-21:00'
        },
        facilities: ['20m 수영장', '샤워실', '락커룸'],
        features: ['트렌디한 시설', '젊은 강사진'],
        images: {
          mainImage: '/images/centers/hongdae-main.jpg',
          gallery: []
        },
        instructors: [
          {
            name: '박강사',
            specialty: '자유형, 접영',
            experience: '수영 지도 6년'
          }
        ],
        courses: [
          {
            name: '그룹 자유형',
            description: '친구들과 함께하는 자유형 수업',
            level: '초급',
            duration: '4주',
            price: '100,000원'
          }
        ],
        status: 'active',
        createdBy: new mongoose.Types.ObjectId('68c58a124eb2ae4d54db20a6') // admin ID
      }
    ];

    console.log('📝 센터 정보 생성 중...');
    await CenterInfo.insertMany(sampleCenters);
    
    console.log('✅ 센터 정보 생성 완료');
    console.log(`📊 생성된 센터: ${sampleCenters.length}개`);
    
    sampleCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name}`);
    });

  } catch (error) {
    console.error('❌ 센터 정보 생성 실패:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
createCenterInfo();
