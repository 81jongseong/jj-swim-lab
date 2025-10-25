const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createCurrentUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 현재 로그인한 사용자의 정보
    const tokenUserId = '68ef52011b4f8cb0795fd1c6';
    const currentUserCenterId = '68f10983ccca24669078e1b4';
    
    const password = await bcrypt.hash('password123', 10);

    // 정종성 사용자 생성
    const userData = {
      _id: new mongoose.Types.ObjectId(tokenUserId),
      name: '정종성',
      email: 'center@swim.com',
      password: password,
      userType: 'centerAdmin',
      centerId: new mongoose.Types.ObjectId(currentUserCenterId),
      isActive: true,
      accessPermissions: { 
        dashboard: true, 
        courses: true, 
        bookings: true, 
        payments: true, 
        notices: true, 
        progress: true, 
        evaluations: true, 
        reports: true, 
        userManagement: true, 
        systemSettings: false, 
        aiConfigManagement: false 
      },
    };

    // 기존 사용자 삭제 (같은 ID가 있다면)
    await mongoose.connection.db.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(tokenUserId) });
    console.log('🗑️ 기존 사용자 삭제 완료');

    // 새 사용자 생성
    const result = await mongoose.connection.db.collection('users').insertOne(userData);
    console.log(`✅ 사용자 생성 완료: ${result.insertedId}`);

    // 생성된 사용자 확인
    const createdUser = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(tokenUserId) });
    console.log('✅ 생성된 사용자:', {
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      userType: createdUser.userType,
      centerId: createdUser.centerId
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

createCurrentUser();




