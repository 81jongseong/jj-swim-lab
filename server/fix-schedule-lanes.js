const mongoose = require('mongoose');
require('dotenv').config();

const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

async function fixScheduleLanes() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
    console.log('🔗 MongoDB URI:', mongoUri.substring(0, 50) + '...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    const courses = await Course.find({ isActive: true });
    
    console.log('📋 활성 강습과정 업데이트 시작...\n');
    
    for (const course of courses) {
      let updated = false;
      
      // 스케줄별 레인 정보 업데이트
      if (course.schedule && course.schedule.length > 0) {
        const updatedSchedule = course.schedule.map((sched) => {
          // laneInfo에서 레인 정보 가져오기
          const assignedLanes = course.laneInfo?.assignedLanes || course.lanes || [];
          const originalAssignedLanes = course.laneInfo?.originalAssignedLanes || assignedLanes;
          
          // 스케줄별 레인 정보가 없거나 비어있으면 업데이트
          if (!sched.lanes || Object.keys(sched.lanes).length === 0) {
            updated = true;
            return {
              ...sched,
              lanes: {
                assignedLanes: assignedLanes,
                originalAssignedLanes: originalAssignedLanes,
                isAdjusted: course.laneInfo?.laneNotes?.includes('조정됨') || false
              }
            };
          }
          
          return sched;
        });
        
        if (updated) {
          course.schedule = updatedSchedule;
          await course.save();
          
          // 저장 후 다시 조회하여 확인
          const savedCourse = await Course.findById(course._id).lean();
          const savedSchedule = savedCourse.schedule?.find(s => s.day === updatedSchedule[0]?.day && s.startTime === updatedSchedule[0]?.startTime);
          console.log(`✅ ${course.name} - 스케줄별 레인 정보 업데이트 완료`);
          console.log(`   저장된 레인 정보:`, JSON.stringify(savedSchedule?.lanes, null, 2));
        }
      }
    }
    
    console.log('\n✅ 모든 강습과정 업데이트 완료\n');
    
    // 월요일 9시 레인 정보 확인 (업데이트 후 다시 조회)
    console.log('🔍 월요일 9시 레인 정보 확인:\n');
    const allCourses = await Course.find({ isActive: true }).lean();
    const monday9amCourses = allCourses.filter(course => {
      return course.schedule?.some(s => s.day === 'monday' && s.startTime === '09:00');
    });
    
    if (monday9amCourses.length === 0) {
      console.log('월요일 9시 강습과정이 없습니다.');
    } else {
      monday9amCourses.forEach(course => {
        console.log(`강습: ${course.name}`);
        const mondaySched = course.schedule?.find(s => s.day === 'monday' && s.startTime === '09:00');
        if (mondaySched) {
          console.log('  전체 스케줄 항목:', JSON.stringify(mondaySched, null, 2));
          console.log('  레인 정보:', JSON.stringify(mondaySched.lanes, null, 2));
          console.log('  레인 정보 타입:', typeof mondaySched.lanes);
          console.log('  레인 정보 존재 여부:', !!mondaySched.lanes);
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

fixScheduleLanes();
