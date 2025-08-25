const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function checkCurrentUser() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('🔗 MongoDB 연결 중...');
    await client.connect();
    console.log('✅ MongoDB 연결 성공!');

    const db = client.db();
    const usersCollection = db.collection('users');
    const centersCollection = db.collection('centers');

    console.log('🔍 센터 관리자 계정 상태 확인 중...');

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

    // centers 컬렉션 확인
    const centers = await centersCollection.find({}).toArray();
    console.log('\n📋 centers 컬렉션:', centers.map(c => ({ id: c._id, name: c.name })));

    // centerId가 ObjectId인지 확인
    if (centerAdmin.centerId && centerAdmin.centerId.constructor.name === 'ObjectId') {
      console.log('\n✅ centerId가 ObjectId 타입입니다!');
      
      // 해당 센터가 실제로 존재하는지 확인
      const center = await centersCollection.findOne({ _id: centerAdmin.centerId });
      if (center) {
        console.log('✅ centerId가 유효한 센터를 가리킵니다:', center.name);
      } else {
        console.log('❌ centerId가 유효하지 않은 센터를 가리킵니다!');
      }
    } else {
      console.log('\n❌ centerId가 ObjectId 타입이 아닙니다!');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

checkCurrentUser();
