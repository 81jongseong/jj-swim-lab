const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function checkLoginUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerAdminInfo: {
        managedCenters: [mongoose.Schema.Types.ObjectId],
        permissions: [String],
        role: String
      }
    });

    const centerSchema = new mongoose.Schema({
      name: String,
      email: String
    });

    const User = mongoose.model('User', userSchema);
    const Center = mongoose.model('Center', centerSchema);

    // center@swim.com 사용자 확인
    const centerUser = await User.findOne({ email: 'center@swim.com' });
    if (centerUser) {
      console.log('📋 center@swim.com 사용자:');
      console.log(`- 이름: ${centerUser.name}`);
      console.log(`- 이메일: ${centerUser.email}`);
      console.log(`- 사용자 타입: ${centerUser.userType}`);
      console.log(`- 센터 관리자 정보: ${JSON.stringify(centerUser.centerAdminInfo, null, 2)}`);
    } else {
      console.log('❌ center@swim.com 사용자를 찾을 수 없습니다.');
    }

    // center-admin@jjswimlab.com 사용자 확인
    const centerAdminUser = await User.findOne({ email: 'center-admin@jjswimlab.com' });
    if (centerAdminUser) {
      console.log('\n📋 center-admin@jjswimlab.com 사용자:');
      console.log(`- 이름: ${centerAdminUser.name}`);
      console.log(`- 이메일: ${centerAdminUser.email}`);
      console.log(`- 사용자 타입: ${centerAdminUser.userType}`);
      console.log(`- 센터 관리자 정보: ${JSON.stringify(centerAdminUser.centerAdminInfo, null, 2)}`);
    } else {
      console.log('❌ center-admin@jjswimlab.com 사용자를 찾을 수 없습니다.');
    }

    // center@swim.com 센터 확인
    const targetCenter = await Center.findOne({ email: 'center@swim.com' });
    if (targetCenter) {
      console.log('\n📋 center@swim.com 센터:');
      console.log(`- 이름: ${targetCenter.name}`);
      console.log(`- ID: ${targetCenter._id}`);
    } else {
      console.log('❌ center@swim.com 센터를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkLoginUsers();


