const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function convertMemberLevelsToKorean() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      studentInfo: {
        level: String,
        currentLevel: String,
        emergencyContact: { name: String, phone: String },
        medicalConditions: [{ condition: String, allergy: String }],
      }
    });

    const User = mongoose.model('User', userSchema);

    // 학생 회원들의 레벨 확인
    const students = await User.find({ userType: 'student' }).select('name email studentInfo');
    console.log('\n👥 학생 회원 레벨 현황:');
    
    const levelCounts = {};
    students.forEach((student, index) => {
      const level = student.studentInfo?.level || '미설정';
      console.log(`${index + 1}. ${student.name} (${student.email}) - 레벨: ${level}`);
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    console.log('\n📊 레벨별 개수:');
    Object.entries(levelCounts).forEach(([level, count]) => {
      console.log(`- ${level}: ${count}명`);
    });

    // 영어 레벨을 한국어로 변환
    console.log('\n🔄 영어 레벨을 한국어로 변환 중...');
    
    const levelMapping = {
      'beginner': '초급',
      'intermediate': '중급', 
      'advanced': '고급'
    };

    let updatedCount = 0;
    for (const [englishLevel, koreanLevel] of Object.entries(levelMapping)) {
      const result = await User.updateMany(
        { 
          userType: 'student',
          'studentInfo.level': englishLevel 
        },
        { $set: { 'studentInfo.level': koreanLevel } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${englishLevel} → ${koreanLevel}: ${result.modifiedCount}명 업데이트`);
        updatedCount += result.modifiedCount;
      }
    }

    console.log(`\n📊 총 ${updatedCount}명의 학생 레벨이 한국어로 변환되었습니다.`);

    // 변환 후 레벨 현황 재확인
    const updatedStudents = await User.find({ userType: 'student' }).select('name email studentInfo');
    console.log('\n👥 변환 후 학생 회원 레벨 현황:');
    
    const updatedLevelCounts = {};
    updatedStudents.forEach((student, index) => {
      const level = student.studentInfo?.level || '미설정';
      console.log(`${index + 1}. ${student.name} (${student.email}) - 레벨: ${level}`);
      updatedLevelCounts[level] = (updatedLevelCounts[level] || 0) + 1;
    });

    console.log('\n📊 변환 후 레벨별 개수:');
    Object.entries(updatedLevelCounts).forEach(([level, count]) => {
      console.log(`- ${level}: ${count}명`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

convertMemberLevelsToKorean();

