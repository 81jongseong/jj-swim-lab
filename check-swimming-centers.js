/**
 * SwimmingCenter 데이터 확인 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const SwimmingCenterSchema = new mongoose.Schema({
  name: String,
  address: String,
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number]
  },
  phone: String,
  email: String,
  isActive: Boolean
}, { strict: false });

const SwimmingCenter = mongoose.model('SwimmingCenter', SwimmingCenterSchema, 'swimmingcenters');

async function checkCenters() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    const centers = await SwimmingCenter.find({}).lean();
    
    console.log('📊 SwimmingCenter 컬렉션 데이터:');
    console.log('총 센터 수:', centers.length);
    console.log('\n');

    centers.forEach((center, index) => {
      console.log(`\n${index + 1}. 센터 정보:`);
      console.log('  - ID:', center._id);
      console.log('  - 이름:', center.name);
      console.log('  - 주소:', center.address);
      console.log('  - 위치:', center.location);
      console.log('  - 전화:', center.phone);
      console.log('  - 이메일:', center.email);
      console.log('  - 활성:', center.isActive);
      console.log('  - 생성일:', center.createdAt);
    });

    if (centers.length === 0) {
      console.log('\n⚠️ SwimmingCenter 데이터가 없습니다!');
      console.log('💡 센터 등록 승인을 다시 해보세요.');
    }

    console.log('\n\n🔍 CenterInfo 컬렉션도 확인:');
    const CenterInfo = mongoose.model('CenterInfo', new mongoose.Schema({}, { strict: false }), 'centerinfos');
    const centerInfos = await CenterInfo.find({}).lean();
    console.log('CenterInfo 수:', centerInfos.length);
    
    centerInfos.forEach((info, index) => {
      console.log(`\n${index + 1}. CenterInfo:`);
      console.log('  - ID:', info._id);
      console.log('  - 이름:', info.name);
      console.log('  - 주소:', info.address);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB 연결 종료');
  }
}

checkCenters();








