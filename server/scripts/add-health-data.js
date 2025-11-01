/**
 * 🏥 JJ Swim Lab - 회원 건강정보 테스트 데이터 추가 스크립트
 * 
 * 📋 **스크립트 목적**
 * - 기존 회원들에게 건강정보 테스트 데이터 추가
 * - age, emergencyContact, medicalConditions 필드 업데이트
 * - 추세 차트를 위한 다양한 데이터 생성
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');

// 건강정보 테스트 데이터 샘플
const healthDataSamples = [
  {
    age: 25,
    emergencyContact: '010-1234-5678 (어머니)',
    medicalConditions: '없음'
  },
  {
    age: 30,
    emergencyContact: '010-2345-6789 (아버지)',
    medicalConditions: '천식'
  },
  {
    age: 28,
    emergencyContact: '010-3456-7890 (배우자)',
    medicalConditions: '없음'
  },
  {
    age: 35,
    emergencyContact: '010-4567-8901 (형)',
    medicalConditions: '없음'
  },
  {
    age: 22,
    emergencyContact: '010-5678-9012 (언니)',
    medicalConditions: '없음'
  },
  {
    age: 32,
    emergencyContact: '010-6789-0123 (남편)',
    medicalConditions: '없음'
  },
  {
    age: 27,
    emergencyContact: '010-7890-1234 (아내)',
    medicalConditions: '없음'
  },
  {
    age: 29,
    emergencyContact: '010-8901-2345 (아버지)',
    medicalConditions: '없음'
  },
  {
    age: 26,
    emergencyContact: '010-9012-3456 (어머니)',
    medicalConditions: '없음'
  },
  {
    age: 31,
    emergencyContact: '010-0123-4567 (아버지)',
    medicalConditions: '없음'
  }
];

async function addHealthData() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    // 모든 학생 회원 조회
    console.log('🔍 학생 회원 조회 중...');
    const students = await User.find({ userType: 'student' }).limit(10);
    console.log(`✅ ${students.length}명의 학생 회원 조회 완료`);
    
    if (students.length === 0) {
      console.log('⚠️ 회원이 없습니다.');
      return;
    }
    
    // 각 회원에게 건강정보 추가
    console.log('🏥 건강정보 추가 중...');
    const updateResults = [];
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const healthData = healthDataSamples[i % healthDataSamples.length];
      
      try {
        // MongoDB에서 최신 데이터 다시 조회
        const freshStudent = await User.findById(student._id);
        if (!freshStudent) {
          console.log(`   ⚠️ ${student.name} 회원을 찾을 수 없습니다.`);
          continue;
        }
        
        // studentInfo가 없으면 초기화
        if (!freshStudent.studentInfo) {
          freshStudent.studentInfo = {};
        }
        
        // 건강정보 업데이트
        freshStudent.studentInfo.age = healthData.age;
        freshStudent.studentInfo.emergencyContact = healthData.emergencyContact;
        freshStudent.studentInfo.medicalConditions = healthData.medicalConditions;
        
        // markModified로 Mixed 타입 필드 변경 알림
        freshStudent.markModified('studentInfo');
        
        await freshStudent.save();
        console.log(`   ✅ ${student.name} 회원 건강정보 추가 완료`);
        updateResults.push({ name: student.name, success: true });
      } catch (error) {
        console.log(`   ❌ ${student.name} 회원 건강정보 추가 실패: ${error.message}`);
        updateResults.push({ name: student.name, success: false, error: error.message });
      }
    }
    
    console.log('\n🎉 모든 회원에게 건강정보 추가 완료!');
    
    // 결과 출력
    console.log('\n📊 업데이트된 건강정보 요약:');
    const updatedStudents = await User.find({ userType: 'student' }).limit(10);
    for (const student of updatedStudents) {
      if (student.studentInfo && student.studentInfo.age) {
        console.log(`   - ${student.name}: 나이 ${student.studentInfo.age}세, 응급연락처 ${student.studentInfo.emergencyContact || '없음'}, 만성질환 ${student.studentInfo.medicalConditions || '없음'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 건강정보 추가 실패:', error.message);
  } finally {
    // MongoDB 연결 해제
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
addHealthData();

