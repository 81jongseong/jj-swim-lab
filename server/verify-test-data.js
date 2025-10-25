const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function verifyTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      studentInfo: {
        level: String,
        emergencyContact: {
          name: String,
          phone: String,
          relationship: String
        },
        medicalInfo: {
          hasConditions: Boolean,
          conditions: [String],
          medications: [String],
          allergies: [String]
        }
      },
      instructorInfo: {
        specialties: [String],
        certifications: [String],
        experience: Number,
        bio: String,
        hourlyRate: Number
      },
      isActive: Boolean
    });

    const User = mongoose.model('User', userSchema);

    // 1. 생성된 회원들 확인
    console.log('\n👥 생성된 회원들:');
    const members = await User.find({ userType: 'student' }).sort({ createdAt: -1 }).limit(10);
    members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} (${member.email})`);
      console.log(`   - 레벨: ${member.studentInfo?.level || '미설정'}`);
      console.log(`   - 비상연락처: ${member.studentInfo?.emergencyContact?.name} (${member.studentInfo?.emergencyContact?.phone})`);
      console.log(`   - 의료정보: ${member.studentInfo?.medicalInfo?.hasConditions ? '있음' : '없음'}`);
      if (member.studentInfo?.medicalInfo?.hasConditions) {
        console.log(`     * 질환: ${member.studentInfo.medicalInfo.conditions.join(', ')}`);
        console.log(`     * 알레르기: ${member.studentInfo.medicalInfo.allergies.join(', ')}`);
      }
      console.log('');
    });

    // 2. 생성된 강사들 확인
    console.log('\n👨‍🏫 생성된 강사들:');
    const instructors = await User.find({ userType: 'instructor' }).sort({ createdAt: -1 }).limit(10);
    instructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.name} (${instructor.email})`);
      console.log(`   - 전문분야: ${instructor.instructorInfo?.specialties?.join(', ') || '미설정'}`);
      console.log(`   - 자격증: ${instructor.instructorInfo?.certifications?.join(', ') || '미설정'}`);
      console.log(`   - 경력: ${instructor.instructorInfo?.experience || 0}년`);
      console.log(`   - 시간당 수강료: ${instructor.instructorInfo?.hourlyRate?.toLocaleString() || 0}원`);
      console.log(`   - 소개: ${instructor.instructorInfo?.bio || '미설정'}`);
      console.log('');
    });

    // 3. 센터 관리자 확인
    console.log('\n🏢 센터 관리자:');
    const centerAdmin = await User.findOne({ 
      email: 'center-admin@jjswimlab.com',
      userType: 'center-admin'
    });
    if (centerAdmin) {
      console.log(`- 이름: ${centerAdmin.name}`);
      console.log(`- 이메일: ${centerAdmin.email}`);
      console.log(`- 관리 센터 수: ${centerAdmin.centerAdminInfo?.managedCenters?.length || 0}`);
    }

    console.log('\n📊 총계:');
    console.log(`- 회원: ${members.length}명`);
    console.log(`- 강사: ${instructors.length}명`);
    console.log(`- 센터 관리자: ${centerAdmin ? '1명' : '0명'}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

verifyTestData();

