/**
 * 강사 데이터 확인 스크립트
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

const checkInstructors = async () => {
  try {
    const instructors = await User.find({ userType: 'instructor' })
      .select('_id userId name email instructorInfo')
      .lean();

    console.log('📊 등록된 강사:', instructors.length, '명\n');
    console.log('─────────────────────────────────────────────────');

    instructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.name}`);
      console.log(`   ID: ${instructor._id}`);
      console.log(`   UserID: ${instructor.userId}`);
      console.log(`   Email: ${instructor.email}`);
      console.log(`   등급: ${instructor.instructorInfo?.instructorLevel}`);
      console.log(`   배정 센터: ${instructor.instructorInfo?.assignedCenters?.length || 0}개`);
      console.log('');
    });

    console.log('─────────────────────────────────────────────────\n');
  } catch (error) {
    console.error('❌ 오류:', error);
  }
};

const run = async () => {
  await connectDB();
  await checkInstructors();
  await mongoose.connection.close();
  console.log('✅ MongoDB 연결 종료');
  process.exit(0);
};

run();

