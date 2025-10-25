const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugCurrentUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 모든 사용자 조회
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('\n👥 모든 사용자 목록:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.userType} - 센터ID: ${user.centerId || '없음'}`);
    });

    // JWT 토큰 생성해서 테스트
    const testUsers = users.filter(user => user.userType === 'centerAdmin');
    if (testUsers.length > 0) {
      const testUser = testUsers[0];
      const token = jwt.sign(
        { 
          _id: testUser._id,
          email: testUser.email,
          userType: testUser.userType,
          centerId: testUser.centerId
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      console.log('\n🔑 테스트 토큰 생성:');
      console.log(`  - 사용자: ${testUser.name} (${testUser.email})`);
      console.log(`  - 토큰: ${token.substring(0, 50)}...`);
      console.log(`  - 센터ID: ${testUser.centerId}`);
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

debugCurrentUser();




