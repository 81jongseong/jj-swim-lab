/**
 * 센터 등록 데이터 확인 스크립트
 */

const mongoose = require('mongoose');

async function checkCenterData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const SwimmingCenter = mongoose.model('SwimmingCenter', new mongoose.Schema({}, { strict: false }));
    const CenterRegistration = mongoose.model('CenterRegistration', new mongoose.Schema({}, { strict: false }), 'centerregistrations');

    // 1. center@swim.com 계정 확인
    console.log('📋 1. 센터 관리자 계정 확인');
    console.log('=' .repeat(60));
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    if (centerAdmin) {
      console.log('이메일:', centerAdmin.email);
      console.log('이름:', centerAdmin.name);
      console.log('centerId:', centerAdmin.centerId);
      console.log('managedCenters:', centerAdmin.centerAdminInfo?.managedCenters);
    } else {
      console.log('❌ center@swim.com 계정을 찾을 수 없습니다.');
    }

    // 2. 연결된 SwimmingCenter 확인
    if (centerAdmin?.centerId) {
      console.log('\n📋 2. 연결된 SwimmingCenter 정보');
      console.log('='.repeat(60));
      const center = await SwimmingCenter.findById(centerAdmin.centerId);
      if (center) {
        console.log('센터 이름:', center.name);
        console.log('주소:', center.address);
        console.log('전화번호:', center.phone);
        console.log('이메일:', center.email);
        console.log('\n시설 정보:', JSON.stringify(center.facilities, null, 2));
        console.log('\n운영시간:', JSON.stringify(center.operatingHours, null, 2));
      } else {
        console.log('❌ SwimmingCenter를 찾을 수 없습니다.');
      }
    }

    // 3. 센터 등록 신청 데이터 확인
    console.log('\n📋 3. 센터 등록 신청 데이터');
    console.log('='.repeat(60));
    const registrations = await CenterRegistration.find({ 
      representativeEmail: 'center@swim.com' 
    }).sort({ createdAt: -1 }).limit(1);
    
    if (registrations.length > 0) {
      const registration = registrations[0];
      console.log('센터 이름:', registration.centerName);
      console.log('사업자번호:', registration.businessNumber);
      console.log('대표자:', registration.representativeName);
      console.log('전화번호:', registration.representativePhone);
      console.log('상태:', registration.status);
      console.log('\n센터 정보:');
      console.log('- 설명:', registration.centerInfo?.description);
      console.log('- 수영장:', JSON.stringify(registration.centerInfo?.pools, null, 2));
      console.log('- 시설:', JSON.stringify(registration.centerInfo?.facilities, null, 2));
      console.log('- 운영시간:', JSON.stringify(registration.centerInfo?.operatingHours, null, 2));
      console.log('- 주차:', registration.centerInfo?.parkingAvailable, '/', registration.centerInfo?.parkingSpaces, '대');
    } else {
      console.log('❌ 센터 등록 신청을 찾을 수 없습니다.');
    }

    // 4. 모든 SwimmingCenter 목록
    console.log('\n📋 4. 전체 SwimmingCenter 목록');
    console.log('='.repeat(60));
    const allCenters = await SwimmingCenter.find({});
    allCenters.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (ID: ${c._id})`);
      console.log(`   - 주소: ${c.address}`);
      console.log(`   - 이메일: ${c.email}`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
  }
}

checkCenterData();







