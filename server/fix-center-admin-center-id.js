/**
 * 센터 관리자의 센터 ID를 테스트 데이터와 맞춤
 * 연동 데이터: User 모델의 centerAdminInfo.managedCenters
 * 연동 파일: server/src/models/User.ts
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ MongoDB 연결 성공');

  try {
    // User 모델 정의
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // 테스트 데이터의 센터 ID 찾기
    const testCenterId = '68fb75b111747a8229d6cf5d'; // 테스트 데이터의 센터 ID

    // 센터 관리자 찾기
    const centerAdmin = await User.findOne({ userType: 'center-admin' });
    if (centerAdmin) {
      console.log('📋 기존 센터 관리자:', centerAdmin.email);
      console.log('📋 기존 관리 센터:', centerAdmin.centerAdminInfo?.managedCenters);

      // 센터 관리자의 관리 센터를 테스트 데이터의 센터 ID로 업데이트
      await User.updateOne(
        { _id: centerAdmin._id },
        { 
          $set: { 
            'centerAdminInfo.managedCenters': [testCenterId]
          }
        }
      );

      console.log('✅ 센터 관리자의 관리 센터 ID 업데이트 완료!');
      console.log('📋 새로운 관리 센터:', testCenterId);

    } else {
      console.log('❌ 센터 관리자를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    mongoose.connection.close();
  }
});


