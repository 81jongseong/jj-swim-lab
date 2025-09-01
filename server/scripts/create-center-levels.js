const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CenterLevel 모델 import
const { CenterLevel } = require('../dist/models/CenterLevel');

// 기본 센터 레벨 데이터
const defaultCenterLevels = [
  {
    centerId: 'center001',
    levels: [
      { name: '기초', order: 1, description: '수영을 처음 시작하는 단계', color: '#10B981' },
      { name: '초급', order: 2, description: '기본 동작을 익히는 단계', color: '#3B82F6' },
      { name: '중급', order: 3, description: '자유형과 배영을 배우는 단계', color: '#F59E0B' },
      { name: '상급', order: 4, description: '평영과 접영을 배우는 단계', color: '#EF4444' },
      { name: '마스터', order: 5, description: '고급 기술과 경영을 배우는 단계', color: '#8B5CF6' }
    ],
    isActive: true
  },
  {
    centerId: 'center002',
    levels: [
      { name: '입문', order: 1, description: '수영 기초 단계', color: '#10B981' },
      { name: '초급', order: 2, description: '기본 수영법 학습', color: '#3B82F6' },
      { name: '중급', order: 3, description: '다양한 수영법 학습', color: '#F59E0B' },
      { name: '고급', order: 4, description: '전문 수영 기술', color: '#EF4444' }
    ],
    isActive: true
  }
];

async function createCenterLevels() {
  try {
    console.log('🔍 센터별 레벨 데이터 생성 시작...');
    
    // 기존 데이터 삭제
    await CenterLevel.deleteMany({});
    console.log('✅ 기존 센터 레벨 데이터 삭제 완료');
    
    // 새 데이터 생성
    const createdLevels = await CenterLevel.insertMany(defaultCenterLevels);
    console.log(`✅ ${createdLevels.length}개의 센터 레벨 데이터 생성 완료`);
    
    // 생성된 데이터 확인
    for (const level of createdLevels) {
      console.log(`📋 센터: ${level.centerId}, 레벨 수: ${level.levels.length}`);
      level.levels.forEach(l => {
        console.log(`   - ${l.name} (${l.order}순서, ${l.color})`);
      });
    }
    
    console.log('🎉 센터별 레벨 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 센터별 레벨 데이터 생성 실패:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

createCenterLevels();
