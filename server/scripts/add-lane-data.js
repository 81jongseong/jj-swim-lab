/**
 * 기존 강습 과정에 레인 정보 추가 스크립트
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function addLaneData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

    // 모든 강습 과정 조회
    console.log('🔍 모든 강습 과정 조회 중...');
    const courses = await Course.find({});
    console.log(`📋 총 ${courses.length}개 과정 발견\n`);

    let updatedCount = 0;

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const hasLaneInfo = course.laneInfo || course.lanes;
      
      if (!hasLaneInfo || !course.laneInfo?.assignedLanes || course.laneInfo.assignedLanes.length === 0) {
        console.log(`📝 ${course.name} - 레인 정보 추가 중...`);
        
        // 자동으로 레인 배정 (1부터 순차적으로)
        // 초급: 1-2레인, 중급: 3-4레인, 고급: 5-6레인
        let assignedLanes = [];
        const level = course.level || 'beginner';
        
        if (level.includes('1') || level === 'beginner') {
          assignedLanes = [1, 2];
        } else if (level.includes('2') || level.includes('3') || level === 'intermediate') {
          assignedLanes = [3, 4];
        } else if (level.includes('4') || level.includes('5') || level === 'advanced') {
          assignedLanes = [5, 6];
        } else {
          // 기본값
          assignedLanes = [i + 1]; // 순서대로 배정
        }
        
        course.lanes = assignedLanes;
        course.laneInfo = {
          assignedLanes: assignedLanes,
          maxLanes: assignedLanes.length,
          laneNotes: ''
        };
        
        await course.save();
        
        console.log(`  ✅ ${course.name} → ${assignedLanes.join(', ')}레인`);
        updatedCount++;
      } else {
        console.log(`  ⏭️ ${course.name} - 이미 설정됨 (${course.laneInfo.assignedLanes.join(', ')}레인)`);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 작업 완료!`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📊 총 ${courses.length}개 과정 중 ${updatedCount}개 업데이트됨`);
    
    // 레인별 통계
    console.log(`\n📊 레인별 강습 과정 통계:`);
    for (let lane = 1; lane <= 10; lane++) {
      const count = await Course.countDocuments({
        'laneInfo.assignedLanes': lane
      });
      if (count > 0) {
        console.log(`  🏊 ${lane}레인: ${count}개 과정`);
      }
    }

  } catch (error) {
    console.error('\n💥 오류 발생:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

addLaneData();

