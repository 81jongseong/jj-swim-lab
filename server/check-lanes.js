const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

async function checkLanes() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
    console.log('🔗 MongoDB URI:', mongoUri.substring(0, 50) + '...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    const courses = await Course.find({ isActive: true }).lean();
    
    console.log('📋 활성 강습과정 목록:\n');
    
    courses.forEach((course, idx) => {
      console.log(`${idx + 1}. ${course.name}`);
      console.log('   - 레인 정보 (laneInfo):', JSON.stringify(course.laneInfo || {}));
      
      if (course.schedule && course.schedule.length > 0) {
        console.log('   - 스케줄별 레인 정보:');
        course.schedule.forEach((sched, sIdx) => {
          console.log(`     ${sIdx + 1}. 요일: ${sched.day}, 시간: ${sched.startTime}-${sched.endTime}`);
          console.log(`        레인:`, JSON.stringify(sched.lanes || {}));
        });
      }
      console.log('');
    });
    
    // 월요일 9시 레인 정보 추출
    console.log('\n\n🔍 월요일 9시 레인 정보:\n');
    const monday9amCourses = courses.filter(c => {
      return c.schedule?.some(s => s.day === 'monday' && s.startTime === '09:00');
    });
    
    if (monday9amCourses.length === 0) {
      console.log('월요일 9시 강습과정이 없습니다.');
    } else {
      monday9amCourses.forEach(course => {
        console.log(`강습: ${course.name}`);
        const mondaySched = course.schedule.find(s => s.day === 'monday' && s.startTime === '09:00');
        if (mondaySched) {
          console.log('  레인 정보:', JSON.stringify(mondaySched.lanes, null, 2));
        }
        console.log('');
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 오류:', error.message);
    await mongoose.disconnect();
  }
}

checkLanes();
