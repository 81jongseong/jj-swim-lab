require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function assignUsersToCenter() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔗 MongoDB 연결 성공!');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const centersCollection = db.collection('centers');
    
    // jjswim-main 센터 찾기
    const center = await centersCollection.findOne({ name: 'jjswim-main' });
    if (!center) {
      console.error('❌ jjswim-main 센터를 찾을 수 없습니다!');
      return;
    }
    
    console.log(`🏢 센터 정보: ${center.name} (ID: ${center._id})`);
    
    // 강사와 학생 찾기
    const instructor = await usersCollection.findOne({ userType: 'instructor' });
    const student = await usersCollection.findOne({ userType: 'student' });
    
    if (!instructor) {
      console.error('❌ 강사를 찾을 수 없습니다!');
      return;
    }
    
    if (!student) {
      console.error('❌ 학생을 찾을 수 없습니다!');
      return;
    }
    
    console.log(`👨‍🏫 강사: ${instructor.userId} (ID: ${instructor._id})`);
    console.log(`👨‍🎓 학생: ${student.userId} (ID: ${student._id})`);
    
    // 강사를 센터에 할당
    const instructorResult = await usersCollection.updateOne(
      { _id: instructor._id },
      { 
        $set: { 
          'instructorInfo.assignedCenters': [center._id] 
        } 
      }
    );
    
    if (instructorResult.modifiedCount > 0) {
      console.log('✅ 강사를 센터에 할당했습니다!');
    } else {
      console.log('⚠️ 강사 할당 실패');
    }
    
    // 학생을 센터에 등록
    const studentResult = await usersCollection.updateOne(
      { _id: student._id },
      { 
        $set: { 
          'studentInfo.enrolledCenters': [center._id] 
        } 
      }
    );
    
    if (studentResult.modifiedCount > 0) {
      console.log('✅ 학생을 센터에 등록했습니다!');
    } else {
      console.log('⚠️ 학생 등록 실패');
    }
    
    // 업데이트된 사용자 정보 확인
    const updatedInstructor = await usersCollection.findOne({ _id: instructor._id });
    const updatedStudent = await usersCollection.findOne({ _id: student._id });
    
    console.log('\n📋 업데이트된 정보:');
    console.log(`강사 assignedCenters:`, updatedInstructor.instructorInfo?.assignedCenters);
    console.log(`학생 enrolledCenters:`, updatedStudent.studentInfo?.enrolledCenters);
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

assignUsersToCenter();
