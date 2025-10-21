/**
 * 강사 isActive 상태 수정 스크립트
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 연결 성공!\n');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const fixInstructorActive = async () => {
  try {
    // 모든 강사 찾기
    const instructors = await User.find({ userType: 'instructor' });

    console.log('📊 강사 현황:');
    console.log('─────────────────────────────────────────────────');
    
    for (const instructor of instructors) {
      console.log(`${instructor.name} (${instructor.email})`);
      console.log(`  isActive: ${instructor.isActive}`);
      
      if (!instructor.isActive) {
        instructor.isActive = true;
        await instructor.save();
        console.log('  ✅ isActive를 true로 수정');
      }
      console.log('');
    }

    console.log('─────────────────────────────────────────────────');
    console.log('✅ 모든 강사 isActive 확인/수정 완료\n');

  } catch (error) {
    console.error('❌ 오류:', error);
  }
};

const run = async () => {
  await connectDB();
  await fixInstructorActive();
  await mongoose.connection.close();
  console.log('✅ MongoDB 연결 종료');
  process.exit(0);
};

run();

