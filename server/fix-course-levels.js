const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function fixCourseLevels() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const courseSchema = new mongoose.Schema({
      name: String,
      level: String,
      centerId: mongoose.Schema.Types.ObjectId
    });

    const Course = mongoose.model('Course', courseSchema);

    console.log('\n🔧 강습 과정 레벨 수정');
    console.log('='.repeat(60));

    // level1을 초급으로 변환
    const result = await Course.updateMany(
      { level: 'level1' },
      { $set: { level: '초급' } }
    );

    console.log(`✅ ${result.modifiedCount}개 과정의 레벨을 level1 → 초급으로 변환했습니다.`);

    // 변환된 과정들 확인
    const updatedCourses = await Course.find({ level: '초급' }).select('name level');
    console.log('\n📝 변환된 과정들:');
    updatedCourses.forEach(course => {
      console.log(`   - ${course.name}: ${course.level}`);
    });

  } catch (error) {
    console.error('❌ 강습 과정 레벨 수정 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

fixCourseLevels();
