const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixLanesDirect() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ MongoDB 연결 성공\n');
    
    const db = client.db('jj-swim-lab');
    const coursesCollection = db.collection('courses');
    
    // 모든 활성 강습과정 조회
    const courses = await coursesCollection.find({ isActive: true }).toArray();
    
    console.log('📋 활성 강습과정 업데이트 시작...\n');
    
    for (const course of courses) {
      let updated = false;
      const updatedSchedule = course.schedule?.map((sched) => {
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
              originalAssignedLanes: assignedLanes, // assignedLanes와 동일하게 설정
              isAdjusted: false
            }
          };
        }
        
        // originalAssignedLanes가 비어있으면 업데이트
        if (!sched.lanes.originalAssignedLanes || sched.lanes.originalAssignedLanes.length === 0) {
          updated = true;
          return {
            ...sched,
            lanes: {
              ...sched.lanes,
              originalAssignedLanes: sched.lanes.assignedLanes || assignedLanes
            }
          };
        }
        
        return sched;
      });
      
      if (updated) {
        await coursesCollection.updateOne(
          { _id: course._id },
          { $set: { schedule: updatedSchedule } }
        );
        console.log(`✅ ${course.name} - 스케줄별 레인 정보 업데이트 완료`);
        
        // 저장 후 다시 조회하여 확인
        const savedCourse = await coursesCollection.findOne({ _id: course._id });
        const savedSchedule = savedCourse?.schedule?.find(s => s.day === updatedSchedule[0]?.day && s.startTime === updatedSchedule[0]?.startTime);
        console.log(`   저장된 레인 정보:`, JSON.stringify(savedSchedule?.lanes, null, 2));
      }
    }
    
    console.log('\n✅ 모든 강습과정 업데이트 완료\n');
    
    // 월요일 9시 레인 정보 확인
    console.log('🔍 월요일 9시 레인 정보 확인:\n');
    const allCourses = await coursesCollection.find({ isActive: true }).toArray();
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
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await client.close();
  }
}

fixLanesDirect();
