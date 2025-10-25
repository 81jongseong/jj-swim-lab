const mongoose = require('mongoose');
require('dotenv').config();

async function updateAllUsersToCenterAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 센터 정보 조회
    const center = await mongoose.connection.db.collection('centers').findOne({});
    if (!center) {
      console.log('❌ 센터가 없습니다.');
      return;
    }

    console.log('🏢 센터 정보:', center.name, center._id);

    // 모든 사용자를 센터 관리자로 변경
    const result = await mongoose.connection.db.collection('users').updateMany(
      {},
      {
        $set: {
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
            systemSettings: true,
            aiConfigManagement: true
          }
        }
      }
    );
    
    console.log('✅ 모든 사용자를 센터 관리자로 변경 완료!');
    console.log(`   - 변경된 사용자 수: ${result.modifiedCount}명`);
    console.log(`   - 센터: ${center.name}`);

    // 변경된 사용자 목록 확인
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n👥 변경된 사용자 목록:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.userType} - 센터ID: ${user.centerId || '없음'}`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

updateAllUsersToCenterAdmin();




