const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority&appName=jjswim-cluster';

async function checkUserCenters() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔗 MongoDB 연결 성공!');
    
    const db = client.db('jjswim');
    const usersCollection = db.collection('users');
    
    // 모든 사용자 조회
    const users = await usersCollection.find({}).toArray();
    
    console.log(`\n📊 총 사용자 수: ${users.length}`);
    
    // 각 사용자별 center 정보 확인
    users.forEach((user, index) => {
      console.log(`\n--- 사용자 ${index + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`userId: ${user.userId}`);
      console.log(`userType: ${user.userType}`);
      
      if (user.instructorInfo) {
        console.log(`강사 assignedCenters:`, user.instructorInfo.assignedCenters);
        console.log(`강사 assignedCenters 타입:`, typeof user.instructorInfo.assignedCenters);
        if (user.instructorInfo.assignedCenters) {
          console.log(`강사 assignedCenters 생성자:`, user.instructorInfo.assignedCenters.constructor?.name);
        }
      }
      
      if (user.studentInfo) {
        console.log(`학생 enrolledCenters:`, user.studentInfo.enrolledCenters);
        console.log(`학생 enrolledCenters 타입:`, typeof user.studentInfo.enrolledCenters);
        if (user.studentInfo.enrolledCenters) {
          console.log(`학생 enrolledCenters 생성자:`, user.studentInfo.enrolledCenters.constructor?.name);
        }
      }
    });
    
    // centers 컬렉션 확인
    const centersCollection = db.collection('centers');
    const centers = await centersCollection.find({}).toArray();
    
    console.log(`\n🏢 centers 컬렉션:`);
    centers.forEach(center => {
      console.log(`- ID: ${center._id}`);
      console.log(`- name: ${center.name}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkUserCenters();
