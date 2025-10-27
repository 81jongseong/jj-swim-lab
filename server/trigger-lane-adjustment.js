const mongoose = require('mongoose');
require('dotenv').config();

// LaneAllocationService import
const { LaneAllocationService } = require('./dist/services/laneAllocationService');

async function triggerLaneAdjustment() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공\n');

    // 월요일 9시 개인레슨에 대해 레인 조정 실행
    console.log('🔄 월요일 9시 개인레슨 레인 조정 시작...\n');
    
    await LaneAllocationService.adjustLanesForPersonalLesson({
      date: '',
      time: '09:00',
      centerId: '68fb75b111747a8229d6cf5d', // 센터 ID
      dayName: 'monday',
      rentalCount: 1
    });

    console.log('\n✅ 레인 조정 완료');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 오류:', error.message);
    await mongoose.disconnect();
  }
}

triggerLaneAdjustment();
