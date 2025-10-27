const { MongoClient } = require('mongodb');
require('dotenv').config();

async function manualLaneAdjustment() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ MongoDB 연결 성공\n');
    
    const db = client.db('jj-swim-lab');
    const coursesCollection = db.collection('courses');
    
    // 초급 자유형 가져오기
    const course = await coursesCollection.findOne({ name: '초급 자유형', isActive: true });
    
    if (!course) {
      console.log('❌ 초급 자유형을 찾을 수 없습니다.');
      return;
    }
    
    console.log('📋 초급 자유형 현재 상태:');
    console.log(JSON.stringify(course.schedule?.find(s => s.day === 'monday' && s.startTime === '09:00'), null, 2));
    
    // 월요일 9시 스케줄 업데이트
    const updatedSchedule = course.schedule.map((sched) => {
      if (sched.day === 'monday' && sched.startTime === '09:00') {
        return {
          ...sched,
          lanes: {
            assignedLanes: [2, 3, 4],
            originalAssignedLanes: [1, 2, 3],
            isAdjusted: true
          }
        };
      }
      return sched;
    });
    
    await coursesCollection.updateOne(
      { _id: course._id },
      { $set: { schedule: updatedSchedule } }
    );
    
    console.log('✅ 초급 자유형 레인 조정 완료 (2,3,4로 변경)');
    
    // 업데이트된 데이터 확인
    const updatedCourse = await coursesCollection.findOne({ _id: course._id });
    const mondaySchedule = updatedCourse.schedule.find(s => s.day === 'monday' && s.startTime === '09:00');
    
    console.log('\n📋 업데이트 후 상태:');
    console.log(JSON.stringify(mondaySchedule, null, 2));
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await client.close();
  }
}

manualLaneAdjustment();


