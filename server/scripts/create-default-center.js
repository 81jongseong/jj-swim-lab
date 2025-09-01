const mongoose = require('mongoose');
require('dotenv').config();

// 센터 모델 정의
const centerSchema = new mongoose.Schema({
  centerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  managerId: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Center = mongoose.model('Center', centerSchema);

// 기본 센터 정보
const defaultCenter = {
  centerId: 'center001',
  name: 'JJ Swim Lab 메인 센터',
  address: '서울특별시 강남구 테헤란로 123',
  phone: '02-1234-5678',
  email: 'info@jjswim.com',
  managerId: 'center',
  isActive: true
};

async function createDefaultCenter() {
  try {
    console.log('🔗 데이터베이스 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 데이터베이스 연결 성공');

    console.log('\n📝 기본 센터 생성 시작...');
    
    // 기존 센터 확인
    const existingCenter = await Center.findOne({ centerId: defaultCenter.centerId });

    if (existingCenter) {
      console.log(`⚠️  센터가 이미 존재합니다: ${defaultCenter.name}`);
      
      // 센터 정보 업데이트
      existingCenter.name = defaultCenter.name;
      existingCenter.address = defaultCenter.address;
      existingCenter.phone = defaultCenter.phone;
      existingCenter.email = defaultCenter.email;
      existingCenter.managerId = defaultCenter.managerId;
      existingCenter.isActive = true;
      await existingCenter.save();
      console.log(`✅ 센터 정보 업데이트 완료: ${defaultCenter.name}`);
    } else {
      // 새 센터 생성
      const newCenter = new Center(defaultCenter);
      await newCenter.save();
      console.log(`✅ 새 센터 생성 완료: ${defaultCenter.name}`);
    }

    console.log('\n📊 생성된 센터 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`센터 ID: ${defaultCenter.centerId}`);
    console.log(`센터명: ${defaultCenter.name}`);
    console.log(`주소: ${defaultCenter.address}`);
    console.log(`전화번호: ${defaultCenter.phone}`);
    console.log(`이메일: ${defaultCenter.email}`);
    console.log(`관리자 ID: ${defaultCenter.managerId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 데이터베이스 연결을 종료합니다.');
  }
}

// 스크립트 실행
createDefaultCenter();

