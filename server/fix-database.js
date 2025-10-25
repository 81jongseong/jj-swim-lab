const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // users 컬렉션의 인덱스 확인
    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('📋 users 컬렉션 인덱스:', indexes);

    // userId 인덱스가 있으면 삭제
    const userIdIndex = indexes.find(index => index.key && index.key.userId);
    if (userIdIndex) {
      console.log('🗑️ userId 인덱스 삭제 중...');
      await mongoose.connection.db.collection('users').dropIndex('userId_1');
      console.log('✅ userId 인덱스 삭제 완료');
    }

    // 모든 데이터 삭제
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('courses').deleteMany({});
    await mongoose.connection.db.collection('personallessons').deleteMany({});
    await mongoose.connection.db.collection('centers').deleteMany({});
    console.log('🗑️ 모든 데이터 삭제 완료');

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

fixDatabase();




