const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkCenterIdType() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('🔗 MongoDB 연결 중...');
    await client.connect();
    console.log('✅ MongoDB 연결 성공!');

    const db = client.db();
    const usersCollection = db.collection('users');

    console.log('🔍 센터 관리자 계정의 centerId 타입 확인 중...');

    // 센터 관리자 계정 찾기
    const centerAdmin = await usersCollection.findOne({ userType: 'centerAdmin' });

    if (!centerAdmin) {
      console.log('❌ 센터 관리자 계정을 찾을 수 없습니다.');
      return;
    }

    console.log('✅ 센터 관리자 계정 발견:', {
      id: centerAdmin._id,
      name: centerAdmin.name,
      email: centerAdmin.email,
      centerId: centerAdmin.centerId,
      centerIdType: typeof centerAdmin.centerId,
      centerIdConstructor: centerAdmin.centerId?.constructor?.name
    });

    // centers 컬렉션에서 jjswim-main 센터 찾기
    const centersCollection = db.collection('centers');
    const center = await centersCollection.findOne({ name: 'jjswim-main' });

    if (center) {
      console.log('✅ jjswim-main 센터 발견:', {
        id: center._id,
        name: center.name,
        idType: typeof center._id,
        idConstructor: center._id?.constructor?.name
      });
    } else {
      console.log('❌ jjswim-main 센터를 찾을 수 없습니다.');
    }

    // 다른 사용자들의 centerId 타입도 확인
    const otherUsers = await usersCollection.find({ 
      userType: { $in: ['instructor', 'student'] },
      $or: [
        { 'instructorInfo.assignedCenters': { $exists: true } },
        { 'studentInfo.enrolledCenters': { $exists: true } }
      ]
    }).limit(3).toArray();

    console.log('\n🔍 다른 사용자들의 centerId 타입 확인:');
    otherUsers.forEach((user, index) => {
      console.log(`사용자 ${index + 1}:`, {
        name: user.name,
        userType: user.userType,
        instructorCenters: user.instructorInfo?.assignedCenters,
        studentCenters: user.studentInfo?.enrolledCenters
      });
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

checkCenterIdType();
