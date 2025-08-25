require('dotenv').config();
const { MongoClient } = require('mongodb');

// .env 파일에서 URI 읽기
const uri = process.env.MONGODB_URI;

console.log('🔍 환경변수 MONGODB_URI:', uri ? '✅ 설정됨' : '❌ 설정되지 않음');
if (uri) {
  console.log('🔍 URI 값:', uri.substring(0, 50) + '...');
}

async function checkServerDB() {
  if (!uri) {
    console.error('❌ MONGODB_URI가 설정되지 않았습니다!');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔗 MongoDB 연결 성공!');
    
    // 연결된 데이터베이스 정보 확인
    const db = client.db();
    console.log(`📊 연결된 데이터베이스: ${db.databaseName}`);
    
    // 사용자 컬렉션 확인
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 users 컬렉션 문서 수: ${userCount}`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).limit(3).toArray();
      console.log('\n📋 첫 3명 사용자:');
      users.forEach((user, index) => {
        console.log(`\n--- 사용자 ${index + 1} ---`);
        console.log(`ID: ${user._id}`);
        console.log(`userId: ${user.userId}`);
        console.log(`userType: ${user.userType}`);
        
        if (user.instructorInfo) {
          console.log(`강사 assignedCenters:`, user.instructorInfo.assignedCenters);
        }
        
        if (user.studentInfo) {
          console.log(`학생 enrolledCenters:`, user.studentInfo.enrolledCenters);
        }
      });
    }
    
    // centers 컬렉션 확인
    const centersCollection = db.collection('centers');
    const centerCount = await centersCollection.countDocuments();
    console.log(`\n🏢 centers 컬렉션 문서 수: ${centerCount}`);
    
    if (centerCount > 0) {
      const centers = await centersCollection.find({}).toArray();
      centers.forEach(center => {
        console.log(`- ID: ${center._id}`);
        console.log(`- name: ${center.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkServerDB();
