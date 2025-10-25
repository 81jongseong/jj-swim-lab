require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

// Course 모델 정의 (간단한 버전)
const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

async function checkMonday9amLanes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    // 월요일 9시 강습과정 조회
    const courses = await Course.find({
      'schedule.day': 'monday',
      'schedule.startTime': '09:00'
    });

    console.log(`📅 월요일 9시 강습과정: ${courses.length}개\n`);

    courses.forEach((course, index) => {
      console.log(`\n강습과정 ${index + 1}: ${course.name}`);
      console.log(`  - 레인 정보:`);
      console.log(`    lanes:`, course.lanes);
      console.log(`    laneInfo:`, course.laneInfo);
      
      if (course.laneInfo?.assignedLanes) {
        console.log(`    assignedLanes:`, course.laneInfo.assignedLanes);
        console.log(`    maxLanes:`, course.laneInfo.maxLanes);
        console.log(`    minLanes:`, course.laneInfo.minLanes);
        console.log(`    레인 배열 정렬 여부:`, JSON.stringify(course.laneInfo.assignedLanes) === JSON.stringify([...course.laneInfo.assignedLanes].sort((a, b) => a - b)));
      }
    });

    await mongoose.disconnect();
    console.log('\n✅ 조회 완료');
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

checkMonday9amLanes();
