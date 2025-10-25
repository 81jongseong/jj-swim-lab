const mongoose = require('mongoose');
require('dotenv').config();

async function updateCurrentUser() {
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

    // 현재 로그인한 사용자들 중에서 센터 관리자가 아닌 사용자를 센터 관리자로 변경
    const users = await mongoose.connection.db.collection('users').find({ userType: { $ne: 'centerAdmin' } }).toArray();
    
    if (users.length > 0) {
      // 첫 번째 사용자를 센터 관리자로 변경
      const userToUpdate = users[0];
      console.log('👤 변경할 사용자:', userToUpdate.name, userToUpdate.email);
      
      const result = await mongoose.connection.db.collection('users').updateOne(
        { _id: userToUpdate._id },
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
              systemSettings: false,
              aiConfigManagement: false
            }
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ 사용자를 센터 관리자로 변경 완료!');
        console.log(`   - 이름: ${userToUpdate.name}`);
        console.log(`   - 이메일: ${userToUpdate.email}`);
        console.log(`   - 센터: ${center.name}`);
      } else {
        console.log('❌ 사용자 변경 실패');
      }
    } else {
      console.log('ℹ️ 변경할 사용자가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

updateCurrentUser();




