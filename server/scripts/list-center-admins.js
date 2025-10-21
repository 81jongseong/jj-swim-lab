/**
 * 모든 센터 관리자 계정 조회
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('OK MongoDB connected\n');
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const listCenterAdmins = async () => {
  try {
    const centerAdmins = await User.find({ userType: 'centerAdmin' })
      .select('name email centerAdminInfo');

    console.log('=================================================');
    console.log('All Center Admin Accounts:', centerAdmins.length);
    console.log('=================================================');
    
    centerAdmins.forEach((admin, idx) => {
      console.log(`${idx + 1}. ${admin.name}`);
      console.log('   Email:', admin.email);
      console.log('   ID:', admin._id.toString());
      console.log('   Managed Centers:', admin.centerAdminInfo?.managedCenters?.length || 0);
      if (admin.centerAdminInfo?.managedCenters?.[0]) {
        console.log('   First Center ID:', admin.centerAdminInfo.managedCenters[0].toString());
      }
      console.log('');
    });

    console.log('=================================================\n');

  } catch (error) {
    console.error('ERROR:', error);
  }
};

const run = async () => {
  await connectDB();
  await listCenterAdmins();
  await mongoose.connection.close();
  console.log('OK MongoDB closed');
  process.exit(0);
};

run();

