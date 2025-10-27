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

    // 초급 자유형 찾기
    const course = await Course.findOne({ name: '초급 자유형' });
    
    if (!course) {
      console.log('❌ 초급 자유형을 찾을 수 없습니다.');
      return;
    }

    console.log(`📅 초급 자유형 스케줄:\n`);

    course.schedule.forEach((sched, index) => {
      if (sched.day === 'monday' && sched.startTime === '09:00') {
        console.log(`스케줄 ${index + 1}:`);
        console.log(`  - day: ${sched.day}`);
        console.log(`  - startTime: ${sched.startTime}`);
        console.log(`  - endTime: ${sched.endTime}`);
        console.log(`  - lanes:`, JSON.stringify(sched.lanes, null, 2));
        console.log(`  - assignedLanes:`, sched.lanes?.assignedLanes);
        console.log(`  - originalAssignedLanes:`, sched.lanes?.originalAssignedLanes);
        console.log(`  - isAdjusted:`, sched.lanes?.isAdjusted);
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
