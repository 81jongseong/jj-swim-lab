const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./dist/models/User').default;

async function setCenterId() {
  try {
    console.log('🔍 센터 관리자 계정 찾는 중...');
    
    // 센터 관리자 계정 찾기
    const centerAdmin = await User.findOne({ userType: 'centerAdmin' });
    
    if (!centerAdmin) {
      console.log('❌ 센터 관리자 계정을 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ 센터 관리자 계정 발견:', {
      id: centerAdmin._id,
      name: centerAdmin.name,
      email: centerAdmin.email,
      currentCenterId: centerAdmin.centerId
    });
    
    // centerId 설정 (기본값: jjswim-main)
    const centerId = 'jjswim-main';
    
    // User 모델에 centerId 필드가 있는지 확인
    if (centerAdmin.schema.paths.centerId) {
      // centerId 필드가 있으면 업데이트
      await User.updateOne(
        { _id: centerAdmin._id },
        { $set: { centerId: centerId } }
      );
      console.log('✅ centerId 필드 업데이트 완료:', centerId);
    } else {
      // centerId 필드가 없으면 새로 추가
      await User.updateOne(
        { _id: centerAdmin._id },
        { $set: { centerId: centerId } }
      );
      console.log('✅ centerId 필드 추가 완료:', centerId);
    }
    
    // 업데이트된 계정 확인
    const updatedAdmin = await User.findById(centerAdmin._id);
    console.log('✅ 업데이트 완료:', {
      id: updatedAdmin._id,
      name: updatedAdmin.name,
      centerId: updatedAdmin.centerId
    });
    
    console.log('🎉 센터 계정 centerId 설정 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

setCenterId();
