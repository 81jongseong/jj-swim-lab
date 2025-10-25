const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function convertCourseLevelsToKorean() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const courseSchema = new mongoose.Schema({
      name: String,
      description: String,
      level: String,
      duration: Number,
      price: Number,
      maxStudents: Number,
      instructor: mongoose.Schema.Types.ObjectId,
      instructorId: mongoose.Schema.Types.ObjectId,
      instructorName: String,
      centerId: mongoose.Schema.Types.ObjectId,
      classInfo: mongoose.Schema.Types.Mixed,
      schedule: mongoose.Schema.Types.Mixed,
      enrolledStudents: mongoose.Schema.Types.Mixed,
      isActive: Boolean,
      startDate: Date,
      endDate: Date,
      tags: [String]
    });

    const Course = mongoose.model('Course', courseSchema);

    console.log('\n🔄 강습 과정 레벨을 한국어로 변환');
    console.log('='.repeat(50));

    // 레벨 매핑 정의
    const levelMapping = {
      'level1': '초급',
      'level2': '중급', 
      'level3': '고급',
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급',
      'all': '전체'
    };

    // 센터 관리자가 관리하는 센터의 강습 과정들 확인
    const centerId = '68fb75b111747a8229d6cf5d';
    const courses = await Course.find({ centerId: centerId });

    console.log(`📚 강습 과정 ${courses.length}개:`);

    let totalUpdated = 0;

    for (const course of courses) {
      console.log(`\n📝 ${course.name} (${course.level}):`);
      
      const currentLevel = course.level;
      const targetLevel = levelMapping[currentLevel] || currentLevel;
      
      if (currentLevel !== targetLevel) {
        console.log(`   🔄 레벨 변환: ${currentLevel} → ${targetLevel}`);
        await Course.findByIdAndUpdate(course._id, { level: targetLevel });
        console.log(`   ✅ 레벨 업데이트 완료`);
        totalUpdated++;
      } else {
        console.log(`   ⏭️ 레벨 변환 불필요`);
      }
    }

    console.log(`\n✅ 레벨 변환 완료! 총 ${totalUpdated}개 강습 과정의 레벨이 업데이트되었습니다.`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB 연결 종료');
  }
}

convertCourseLevelsToKorean();

