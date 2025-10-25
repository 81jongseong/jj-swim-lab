const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function assignCenterAdminToCenter() {
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

    // 1. "center@swim.com" 이메일을 가진 센터 찾기
    const targetCenter = await Center.findOne({ email: 'center@swim.com' });

    if (!targetCenter) {
      console.error('❌ "center@swim.com" 이메일을 가진 센터를 찾을 수 없습니다.');
      return;
    }
    console.log('📋 찾은 센터:', targetCenter.name, '- ID:', targetCenter._id);

    // 2. "center-admin@jjswimlab.com" 이메일을 가진 센터 관리자 찾기
    const centerAdminUser = await User.findOne({ email: 'center-admin@jjswimlab.com', userType: 'center-admin' });

    if (!centerAdminUser) {
      console.error('❌ "center-admin@jjswimlab.com" 이메일을 가진 센터 관리자를 찾을 수 없습니다.');
      return;
    }
    console.log('📋 찾은 센터 관리자:', centerAdminUser.email);

    // 3. 센터 관리자의 managedCenters에 해당 센터 ID 추가 (중복 방지)
    if (!centerAdminUser.centerAdminInfo.managedCenters.includes(targetCenter._id)) {
      centerAdminUser.centerAdminInfo.managedCenters.push(targetCenter._id);
      await centerAdminUser.save();
      console.log('✅ 센터 관리자를 center@swim.com 센터에 연결 완료!');
      console.log('📋 관리 센터 ID:', centerAdminUser.centerAdminInfo.managedCenters);
    } else {
      console.log('ℹ️ 센터 관리자는 이미 해당 센터를 관리하고 있습니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

assignCenterAdminToCenter();