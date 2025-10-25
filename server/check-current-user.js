const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function checkCurrentUser() {
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

    // 센터 관리자 확인
    const centerAdminUsers = await User.find({ userType: 'center-admin' });
    console.log('📋 센터 관리자 목록:');
    centerAdminUsers.forEach(user => {
      console.log(`- 이메일: ${user.email}`);
      console.log(`- 관리 센터 수: ${user.centerAdminInfo?.managedCenters?.length || 0}`);
      console.log(`- 관리 센터 ID: ${user.centerAdminInfo?.managedCenters || []}`);
      console.log('---');
    });

    // center@swim.com 센터 확인
    const targetCenter = await Center.findOne({ email: 'center@swim.com' });
    if (targetCenter) {
      console.log('📋 center@swim.com 센터:');
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

checkCurrentUser();