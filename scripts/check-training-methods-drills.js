/**
 * 🏊 SwimLab - 훈련법/드릴 개수 확인
 */

const mongoose = require('mongoose');
require('dotenv').config();

const trainingMethodSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  category: String
}, { timestamps: true });

const drillSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  category: String
}, { timestamps: true });

const SwimTrainingMethod = mongoose.model('SwimTrainingMethod', trainingMethodSchema);
const SwimDrill = mongoose.model('SwimDrill', drillSchema);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공!\n');

    // 훈련법 조회
    const methods = await SwimTrainingMethod.find({}).sort({ order: 1 });
    console.log(`📊 훈련법: ${methods.length}개`);
    if (methods.length > 0) {
      console.log('\n📋 훈련법 목록:');
      methods.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} (${m.category}) - ${m.description}`);
      });
    }

    // 드릴 조회
    const drills = await SwimDrill.find({}).sort({ order: 1 });
    console.log(`\n🎯 드릴: ${drills.length}개`);
    if (drills.length > 0) {
      console.log('\n📋 드릴 목록:');
      drills.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.name} (${d.category}) - ${d.description}`);
      });
    }

    console.log(`\n📊 총합: ${methods.length + drills.length}개`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

main();

