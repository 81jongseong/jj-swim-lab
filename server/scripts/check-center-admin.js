/**
 * 센터 관리자 및 센터 확인 스크립트
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
const centerSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const SwimmingCenter = mongoose.model('SwimmingCenter', centerSchema);

const checkCenterAdmin = async () => {
  try {
    // 센터 관리자 찾기
    const centerAdmin = await User.findOne({ 
      email: 'centeradmin@jjswimlab.com' 
    });

    if (!centerAdmin) {
      console.log('❌ 센터 관리자 없음');
      return;
    }

    console.log('📊 센터 관리자 정보:');
    console.log('─────────────────────────────────────────────────');
    console.log('이름:', centerAdmin.name);
    console.log('이메일:', centerAdmin.email);
    console.log('유형:', centerAdmin.userType);
    console.log('관리 센터 수:', centerAdmin.centerAdminInfo?.managedCenters?.length || 0);
    
    if (centerAdmin.centerAdminInfo?.managedCenters?.[0]) {
      const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
      console.log('첫 번째 센터 ID:', centerId);

      // 센터 정보
      const center = await SwimmingCenter.findById(centerId);
      if (center) {
        console.log('센터 이름:', center.name);
      }

      // 해당 센터에 배정된 강사 찾기
      const assignedInstructors = await User.find({
        userType: 'instructor',
        'instructorInfo.assignedCenters': centerId
      }).select('_id name email instructorInfo.instructorLevel instructorInfo.assignedCenters');

      console.log('\n👨‍🏫 센터에 배정된 강사:', assignedInstructors.length, '명');
      console.log('─────────────────────────────────────────────────');
      assignedInstructors.forEach((inst, idx) => {
        console.log(`${idx + 1}. ${inst.name} (${inst.email})`);
        console.log(`   ID: ${inst._id}`);
        console.log(`   등급: ${inst.instructorInfo?.instructorLevel}`);
        console.log(`   배정 센터:`, inst.instructorInfo?.assignedCenters);
        console.log('');
      });
    }

    console.log('─────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ 오류:', error);
  }
};

const run = async () => {
  await connectDB();
  await checkCenterAdmin();
  await mongoose.connection.close();
  console.log('✅ MongoDB 연결 종료');
  process.exit(0);
};

run();

