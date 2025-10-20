/**
 * 센터 관리자와 센터 연결 수정 스크립트
 * - center@swim.com 계정의 managedCenters 배열 채우기
 */

const mongoose = require('mongoose');

async function fixCenterAdminLink() {
  try {
    // MongoDB Atlas 연결
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB Atlas 연결 성공\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const SwimmingCenter = mongoose.model('SwimmingCenter', new mongoose.Schema({}, { strict: false }));

    // 1. center@swim.com 계정 찾기
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    
    if (!centerAdmin) {
      console.error('❌ center@swim.com 계정을 찾을 수 없습니다.');
      process.exit(1);
    }

    console.log('👤 센터 관리자 계정:');
    console.log('   - 이메일:', centerAdmin.email);
    console.log('   - ID:', centerAdmin._id);
    console.log('   - centerId:', centerAdmin.centerId);
    console.log('   - managedCenters:', centerAdmin.centerAdminInfo?.managedCenters || []);

    // 2. 이 계정이 관리하는 센터 찾기
    let centerToLink = null;

    // 2-1. centerId 필드로 찾기
    if (centerAdmin.centerId) {
      centerToLink = await SwimmingCenter.findById(centerAdmin.centerId);
      if (centerToLink) {
        console.log('\n✅ centerId로 센터 찾음:', centerToLink.name);
      }
    }

    // 2-2. centerId가 없거나 센터를 못 찾으면, 이메일로 찾기
    if (!centerToLink) {
      centerToLink = await SwimmingCenter.findOne({ email: centerAdmin.email });
      if (centerToLink) {
        console.log('\n✅ 이메일로 센터 찾음:', centerToLink.name);
      }
    }

    // 2-3. 그래도 없으면 대표 전화번호로 찾기
    if (!centerToLink) {
      centerToLink = await SwimmingCenter.findOne({ 
        'contactInfo.representativePhone': centerAdmin.phone 
      });
      if (centerToLink) {
        console.log('\n✅ 전화번호로 센터 찾음:', centerToLink.name);
      }
    }

    // 3. 센터를 찾았으면 연결
    if (centerToLink) {
      console.log('\n🔗 센터 정보:');
      console.log('   - 이름:', centerToLink.name);
      console.log('   - ID:', centerToLink._id);
      console.log('   - 주소:', centerToLink.address);

      // centerAdminInfo가 없으면 생성
      if (!centerAdmin.centerAdminInfo) {
        centerAdmin.centerAdminInfo = {
          managedCenters: [],
          role: 'owner',
          permissions: ['all']
        };
      }

      // managedCenters 배열이 없으면 생성
      if (!centerAdmin.centerAdminInfo.managedCenters) {
        centerAdmin.centerAdminInfo.managedCenters = [];
      }

      // centerId 설정
      centerAdmin.centerId = centerToLink._id;

      // managedCenters에 추가 (중복 체크)
      const alreadyManaged = centerAdmin.centerAdminInfo.managedCenters.some(
        id => id.toString() === centerToLink._id.toString()
      );

      if (!alreadyManaged) {
        centerAdmin.centerAdminInfo.managedCenters.push(centerToLink._id);
        console.log('\n✅ managedCenters에 센터 추가');
      } else {
        console.log('\n⚠️ 이미 managedCenters에 포함되어 있음');
      }

      // 저장
      await centerAdmin.save();
      console.log('\n✅ 센터 관리자 정보 업데이트 완료!');

      // 최종 확인
      const updated = await User.findById(centerAdmin._id);
      console.log('\n📊 최종 상태:');
      console.log('   - centerId:', updated.centerId);
      console.log('   - managedCenters:', updated.centerAdminInfo?.managedCenters || []);

    } else {
      console.log('\n❌ 연결할 센터를 찾을 수 없습니다.');
      console.log('\n💡 해결 방법:');
      console.log('   1. 센터 가입 승인을 다시 진행하거나');
      console.log('   2. SwimmingCenter 컬렉션에 센터 정보를 직접 생성하세요.');
      
      // 모든 센터 목록 표시
      const allCenters = await SwimmingCenter.find({});
      console.log('\n📋 현재 등록된 센터 목록:');
      allCenters.forEach((center, idx) => {
        console.log(`   ${idx + 1}. ${center.name} (ID: ${center._id})`);
      });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
  }
}

fixCenterAdminLink();

