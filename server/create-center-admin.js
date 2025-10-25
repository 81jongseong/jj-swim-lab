const mongoose = require('mongoose');
require('dotenv').config();

async function createCenterAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 센터 조회
    const center = await mongoose.connection.db.collection('centers').findOne({});
    if (!center) {
      console.log('❌ 센터가 없습니다. 먼저 센터를 생성하세요.');
      return;
    }

    console.log('📋 찾은 센터:', center.name);

    // 센터 관리자 생성
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const centerAdmin = {
      name: '센터 관리자',
      email: 'admin@jjswimlab.com',
      password: hashedPassword,
      userType: 'centerAdmin',
      centerId: center._id,
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
      isActive: true
    };

    // 기존 센터 관리자 삭제 후 생성
    await mongoose.connection.db.collection('users').deleteMany({ userType: 'centerAdmin' });
    
    const result = await mongoose.connection.db.collection('users').insertOne(centerAdmin);
    
    console.log('✅ 센터 관리자 생성 완료!');
    console.log('   - 이메일: admin@jjswimlab.com');
    console.log('   - 비밀번호: admin123');
    console.log('   - 센터: ' + center.name);
    console.log('   - 사용자 ID: ' + result.insertedId);

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

createCenterAdmin();




