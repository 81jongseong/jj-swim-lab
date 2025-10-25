const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function assignMembersToCenter() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      studentInfo: mongoose.Schema.Types.Mixed,
      instructorInfo: mongoose.Schema.Types.Mixed,
      centerAdminInfo: mongoose.Schema.Types.Mixed
    });

    const User = mongoose.model('User', userSchema);

    // 센터 관리자가 관리하는 센터 ID
    const centerId = '68fb75b111747a8229d6cf5d';

    // 1. 새로 생성한 회원들에게 centerId 할당
    const newMembers = [
      'kimcheolsu@test.com',
      'leeyounghee@test.com', 
      'parkminsu@test.com',
      'jeongsujin@test.com',
      'choidonghyun@test.com'
    ];

    console.log('👥 회원들에게 센터 ID 할당 중...');
    for (const email of newMembers) {
      const result = await User.updateOne(
        { email: email, userType: 'student' },
        { $set: { centerId: centerId } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${email} 회원에게 센터 ID 할당 완료`);
      } else {
        console.log(`ℹ️ ${email} 회원은 이미 센터에 할당되어 있거나 존재하지 않음`);
      }
    }

    // 2. 새로 생성한 강사들에게 centerId 할당
    const newInstructors = [
      'kangminho@instructor.com',
      'seojiyoung@instructor.com',
      'yuntaejun@instructor.com'
    ];

    console.log('\n👨‍🏫 강사들에게 센터 ID 할당 중...');
    for (const email of newInstructors) {
      const result = await User.updateOne(
        { email: email, userType: 'instructor' },
        { $set: { centerId: centerId } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${email} 강사에게 센터 ID 할당 완료`);
      } else {
        console.log(`ℹ️ ${email} 강사는 이미 센터에 할당되어 있거나 존재하지 않음`);
      }
    }

    // 3. 할당 결과 확인
    console.log('\n📊 할당 결과 확인:');
    const assignedMembers = await User.find({ 
      userType: 'student', 
      centerId: centerId 
    });
    console.log(`- 센터에 할당된 회원: ${assignedMembers.length}명`);

    const assignedInstructors = await User.find({ 
      userType: 'instructor', 
      centerId: centerId 
    });
    console.log(`- 센터에 할당된 강사: ${assignedInstructors.length}명`);

    console.log('\n👥 할당된 회원 목록:');
    assignedMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} (${member.email})`);
    });

    console.log('\n👨‍🏫 할당된 강사 목록:');
    assignedInstructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.name} (${instructor.email})`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

assignMembersToCenter();

