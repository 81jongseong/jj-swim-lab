const mongoose = require('mongoose');
require('dotenv').config();

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 모든 컬렉션 조회
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 데이터베이스의 모든 컬렉션:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // 각 컬렉션의 문서 수 확인
    console.log('\n📊 각 컬렉션의 문서 수:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count}개`);
    }

    // 강사들의 단체반 수업 확인
    console.log('\n👨‍🏫 강사별 단체반 수업:');
    const instructors = await mongoose.connection.db.collection('users').find({ userType: 'instructor' }).toArray();
    
    for (const instructor of instructors) {
      const courses = await mongoose.connection.db.collection('courses').find({ instructorId: instructor._id }).toArray();
      console.log(`  - ${instructor.name}: ${courses.length}개 수업`);
      
      if (courses.length > 0) {
        courses.forEach(course => {
          console.log(`    * ${course.name} (현재 학생: ${course.currentStudents || 0}명)`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkCollections();




