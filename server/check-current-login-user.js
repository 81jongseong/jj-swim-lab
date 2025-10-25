const mongoose = require('mongoose');
require('dotenv').config();

async function checkCurrentLoginUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 토큰에서 전달되는 사용자 ID
    const tokenUserId = '68ef52011b4f8cb0795fd1c6';
    
    console.log('🔍 토큰에서 전달되는 사용자 ID:', tokenUserId);
    
    // 해당 ID로 사용자 조회
    const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(tokenUserId) });
    
    if (user) {
      console.log('✅ 사용자 발견:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        centerId: user.centerId
      });
    } else {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      
      // 모든 사용자 조회해서 어떤 ID들이 있는지 확인
      const allUsers = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log('\n👥 데이터베이스의 모든 사용자:');
      allUsers.forEach(user => {
        console.log(`  - ID: ${user._id}, 이름: ${user.name}, 이메일: ${user.email}, 타입: ${user.userType}, 센터ID: ${user.centerId}`);
      });
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkCurrentLoginUser();




