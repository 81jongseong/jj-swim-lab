const mongoose = require('mongoose');
require('dotenv').config();

async function checkCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // courses 컬렉션의 모든 문서 확인
    const courses = await mongoose.connection.db.collection('courses').find({}).toArray();
    console.log('\n📚 courses 컬렉션의 모든 수업:');
    courses.forEach(course => {
      console.log(`  - ${course.name} (강사ID: ${course.instructorId}, 센터ID: ${course.centerId})`);
    });

    // 강사들 확인
    const instructors = await mongoose.connection.db.collection('users').find({ userType: 'instructor' }).toArray();
    console.log('\n👨‍🏫 강사들:');
    instructors.forEach(instructor => {
      console.log(`  - ${instructor.name} (ID: ${instructor._id})`);
    });

    // personallessons 컬렉션 확인
    const personalLessons = await mongoose.connection.db.collection('personallessons').find({}).toArray();
    console.log('\n👤 개인레슨:');
    personalLessons.forEach(lesson => {
      console.log(`  - 강사ID: ${lesson.instructorId}, 학생ID: ${lesson.studentId}, 상태: ${lesson.status}`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkCourses();




