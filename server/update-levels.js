/**
 * @file 강습법 레벨 한국어 변환 스크립트
 * @description 데이터베이스의 영어 레벨을 한국어로 변경
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const mongoose = require('mongoose');

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jjswimlab:jjswimlab123@cluster0.8qjqj.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

// TeachingMethod 스키마 정의
const TeachingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  steps: [{ type: String }],
  tips: [{ type: String }],
  checklist: [{ type: String }],
  videoUrl: { type: String },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  instructorComments: { type: String },
  levelChangeHistory: [{
    fromLevel: { type: String, required: true },
    toLevel: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TeachingMethod = mongoose.model('TeachingMethod', TeachingMethodSchema);

async function updateLevels() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 레벨 매핑 정의
    const levelMapping = {
      'beginner': '초급',
      'intermediate': '중급', 
      'advanced': '상급',
      'expert': '상급',
      '고급': '상급',
      '전문가': '상급'
    };

    console.log('🔍 레벨 매핑:', levelMapping);

    // 각 매핑에 대해 업데이트 실행
    for (const [oldLevel, newLevel] of Object.entries(levelMapping)) {
      const result = await TeachingMethod.updateMany(
        { level: oldLevel },
        { $set: { level: newLevel } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ "${oldLevel}" → "${newLevel}": ${result.modifiedCount}개 업데이트`);
      } else {
        console.log(`ℹ️ "${oldLevel}": 변경할 데이터 없음`);
      }
    }

    // 최종 결과 확인
    const levelStats = await TeachingMethod.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 최종 레벨 통계:');
    levelStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}개`);
    });

    console.log('\n🎉 레벨 변환 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
    process.exit(0);
  }
}

// 스크립트 실행
updateLevels();
