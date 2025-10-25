const mongoose = require('mongoose');
require('dotenv').config();

async function fixUserCenterId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 현재 로그인한 사용자의 센터 ID
    const currentUserCenterId = '68f10983ccca24669078e1b4';
    
    // 모든 사용자의 센터 ID를 현재 사용자의 센터 ID로 업데이트
    const result = await mongoose.connection.db.collection('users').updateMany(
      {},
      { $set: { centerId: new mongoose.Types.ObjectId(currentUserCenterId) } }
    );
    
    console.log(`✅ ${result.modifiedCount}명의 사용자 센터 ID 업데이트 완료`);
    
    // 업데이트된 사용자들 확인
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n👥 업데이트된 사용자 목록:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.userType} - 센터ID: ${user.centerId}`);
    });

    // 강사들 확인
    const instructors = users.filter(user => user.userType === 'instructor');
    console.log(`\n👨‍🏫 강사 수: ${instructors.length}명`);
    instructors.forEach(instructor => {
      console.log(`  - ${instructor.name} (${instructor.email})`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

fixUserCenterId();




