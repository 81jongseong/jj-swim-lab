/**
 * center@siwm.com 계정에 강사 배정
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

const assignToCurrent = async () => {
  try {
    // 1. center@swim.com 센터 관리자 찾기
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    
    if (!centerAdmin) {
      console.log('ERROR: center@siwm.com not found!');
      return;
    }

    console.log('=================================================');
    console.log('1. Center Admin: center@siwm.com');
    console.log('=================================================');
    console.log('Name:', centerAdmin.name);
    console.log('Type:', centerAdmin.userType);
    console.log('Managed Centers:', centerAdmin.centerAdminInfo?.managedCenters?.length || 0);
    
    const centerId = centerAdmin.centerAdminInfo?.managedCenters?.[0];
    
    if (!centerId) {
      console.log('ERROR: No managed center!');
      return;
    }

    console.log('Center ID:', centerId.toString());
    console.log('');

    // 2. 강사 3명 찾기
    const instructors = await User.find({
      email: {
        $in: [
          'instructor1@jjswimlab.com',
          'instructor2@jjswimlab.com',
          'instructor3@jjswimlab.com'
        ]
      }
    });

    console.log('=================================================');
    console.log('2. Instructors to assign:', instructors.length);
    console.log('=================================================');

    // 3. 강사 배정
    for (const instructor of instructors) {
      const result = await User.updateOne(
        { _id: instructor._id },
        { 
          $addToSet: { 
            'instructorInfo.assignedCenters': centerId 
          }
        }
      );
      
      console.log(`${instructor.name} (${instructor.email})`);
      console.log(`  ID: ${instructor._id}`);
      console.log(`  Assigned: ${result.modifiedCount > 0 ? 'NEW' : 'ALREADY'}`);
      console.log('');
    }

    console.log('=================================================');
    console.log('OK Assignment complete!');
    console.log('=================================================');
    console.log('');
    console.log('Login with:');
    console.log('  Email: center@siwm.com');
    console.log('  Then go to: /center-admin/instructors');
    console.log('');

  } catch (error) {
    console.error('ERROR:', error);
  }
};

const run = async () => {
  await connectDB();
  await assignToCurrent();
  await mongoose.connection.close();
  console.log('OK MongoDB closed');
  process.exit(0);
};

run();

