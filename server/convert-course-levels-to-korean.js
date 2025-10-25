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
      description: String,
      level: String,
      instructorId: mongoose.Schema.Types.ObjectId,
      centerId: mongoose.Schema.Types.ObjectId,
      maxStudents: Number,
      enrolledStudents: [mongoose.Schema.Types.Mixed],
      status: String,
      price: Number,
      duration: Number,
      schedule: mongoose.Schema.Types.Mixed,
      createdAt: Date,
      updatedAt: Date
    });

    const Course = mongoose.model('Course', courseSchema);

    // 모든 강습 과정의 레벨 확인
    const courses = await Course.find({}).select('name level');
    console.log('\n📚 강습 과정 레벨 현황:');
    
    const levelCounts = {};
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} - 레벨: ${course.level}`);
      levelCounts[course.level] = (levelCounts[course.level] || 0) + 1;
    });

    console.log('\n📊 레벨별 개수:');
    Object.entries(levelCounts).forEach(([level, count]) => {
      console.log(`- ${level}: ${count}개`);
    });

    // 영어 레벨을 한국어로 변환
    console.log('\n🔄 영어 레벨을 한국어로 변환 중...');
    
    const levelMapping = {
      'beginner': '초급',
      'intermediate': '중급', 
      'advanced': '고급'
    };

    let updatedCount = 0;
    for (const [englishLevel, koreanLevel] of Object.entries(levelMapping)) {
      const result = await Course.updateMany(
        { level: englishLevel },
        { $set: { level: koreanLevel } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${englishLevel} → ${koreanLevel}: ${result.modifiedCount}개 업데이트`);
        updatedCount += result.modifiedCount;
      }
    }

    console.log(`\n📊 총 ${updatedCount}개 강습 과정의 레벨이 한국어로 변환되었습니다.`);

    // 변환 후 레벨 현황 재확인
    const updatedCourses = await Course.find({}).select('name level');
    console.log('\n📚 변환 후 강습 과정 레벨 현황:');
    
    const updatedLevelCounts = {};
    updatedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} - 레벨: ${course.level}`);
      updatedLevelCounts[course.level] = (updatedLevelCounts[course.level] || 0) + 1;
    });

    console.log('\n📊 변환 후 레벨별 개수:');
    Object.entries(updatedLevelCounts).forEach(([level, count]) => {
      console.log(`- ${level}: ${count}개`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

checkCourseLevels();

