/**
 * 강사 조회 디버깅 스크립트
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('OK MongoDB connected\n');
  } catch (error) {
    console.error('ERROR MongoDB connection:', error);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const debugQuery = async () => {
  try {
    // 1. 센터 관리자 찾기
    const centerAdmin = await User.findOne({ email: 'centeradmin@jjswimlab.com' });
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    
    console.log('=================================================');
    console.log('1. Center Admin Info');
    console.log('=================================================');
    console.log('Name:', centerAdmin?.name);
    console.log('Center ID:', centerId?.toString());
    console.log('Center ID Type:', typeof centerId);
    console.log('');

    // 2. 모든 강사 조회 (조건 없이)
    const allInstructors = await User.find({ userType: 'instructor' })
      .select('name email isActive instructorInfo.assignedCenters');
    
    console.log('=================================================');
    console.log('2. All Instructors (no filter):', allInstructors.length);
    console.log('=================================================');
    allInstructors.forEach((inst, idx) => {
      console.log(`${idx + 1}. ${inst.name}`);
      console.log('   Email:', inst.email);
      console.log('   isActive:', inst.isActive);
      console.log('   assignedCenters:', inst.instructorInfo?.assignedCenters);
      console.log('   assignedCenters[0] toString:', inst.instructorInfo?.assignedCenters?.[0]?.toString());
      console.log('   Match?', inst.instructorInfo?.assignedCenters?.[0]?.toString() === centerId?.toString());
      console.log('');
    });

    // 3. API와 동일한 조건으로 조회
    const query = {
      userType: 'instructor',
      'instructorInfo.assignedCenters': centerId,
      isActive: true
    };

    console.log('=================================================');
    console.log('3. Query with same conditions as API');
    console.log('=================================================');
    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('');

    const filteredInstructors = await User.find(query)
      .select('name email isActive instructorInfo.assignedCenters');

    console.log('Results:', filteredInstructors.length);
    filteredInstructors.forEach((inst, idx) => {
      console.log(`${idx + 1}. ${inst.name} (${inst.email})`);
    });
    console.log('');

    // 4. isActive 조건 제거하고 조회
    const queryWithoutActive = {
      userType: 'instructor',
      'instructorInfo.assignedCenters': centerId
    };

    console.log('=================================================');
    console.log('4. Query WITHOUT isActive filter');
    console.log('=================================================');
    
    const instructorsWithoutActive = await User.find(queryWithoutActive)
      .select('name email isActive instructorInfo.assignedCenters');

    console.log('Results:', instructorsWithoutActive.length);
    instructorsWithoutActive.forEach((inst, idx) => {
      console.log(`${idx + 1}. ${inst.name} (${inst.email}) - isActive: ${inst.isActive}`);
    });
    console.log('');

  } catch (error) {
    console.error('ERROR:', error);
  }
};

const run = async () => {
  await connectDB();
  await debugQuery();
  await mongoose.connection.close();
  console.log('OK MongoDB closed');
  process.exit(0);
};

run();

