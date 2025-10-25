const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function checkCourseLevels() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const courseSchema = new mongoose.Schema({
      name: String,
      level: String,
      centerId: mongoose.Schema.Types.ObjectId,
      enrolledStudents: [{
        student: mongoose.Schema.Types.ObjectId
      }]
    });

    const Course = mongoose.model('Course', courseSchema);

    console.log('\n🔍 강습 과정들의 레벨 정보 확인');
    console.log('='.repeat(60));

    const courses = await Course.find({}).select('name level centerId enrolledStudents');
    console.log(`📚 강습 과정 ${courses.length}개:`);

    for (const course of courses) {
      console.log(`\n📝 ${course.name}:`);
      console.log(`   - 레벨: ${course.level || '레벨 미설정'}`);
      console.log(`   - 센터 ID: ${course.centerId}`);
      console.log(`   - 수강생 수: ${course.enrolledStudents?.length || 0}`);
      
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        console.log(`   - 수강생 ID들:`, course.enrolledStudents.map(s => s.student));
      }
    }

  } catch (error) {
    console.error('❌ 강습 과정 레벨 확인 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkCourseLevels();
