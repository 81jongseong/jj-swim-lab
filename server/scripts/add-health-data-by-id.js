/**
 * 🏥 특정 회원 ID로 건강정보 추가 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');

// 건강정보 테스트 데이터 샘플
const healthData = {
  age: 25,
  emergencyContact: '010-1234-5678 (어머니)',
  medicalConditions: '없음',
  height: 170,
  weight: 65,
  bmi: 22.5
};

async function addHealthDataById() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    // 특정 ID로 회원 조회
    const memberId = '68fbf65aa173fd3f9b813f47';
    const member = await User.findById(memberId);
    
    if (!member) {
      console.log(`❌ ID ${memberId} 회원을 찾을 수 없습니다.`);
      return;
    }
    
    console.log(`\n🏥 ${member.name} 회원 건강정보 추가 중...`);
    
    // studentInfo가 없으면 초기화
    if (!member.studentInfo) {
      member.studentInfo = {};
    }
    
    // 건강정보 업데이트
    member.studentInfo.age = healthData.age;
    member.studentInfo.emergencyContact = healthData.emergencyContact;
    member.studentInfo.medicalConditions = healthData.medicalConditions;
    
    // healthProfile 업데이트
    if (!member.studentInfo.healthProfile) {
      member.studentInfo.healthProfile = {};
    }
    member.studentInfo.healthProfile.height = healthData.height;
    member.studentInfo.healthProfile.weight = healthData.weight;
    member.studentInfo.healthProfile.bmi = healthData.bmi;
    member.studentInfo.healthProfile.lastHealthCheck = new Date();
    
    // markModified로 Mixed 타입 필드 변경 알림
    member.markModified('studentInfo');
    member.markModified('studentInfo.healthProfile');
    
    try {
      await member.save();
    } catch (saveError) {
      // save 실패 시 updateOne으로 직접 업데이트 시도
      console.log('⚠️ save 실패, updateOne으로 재시도...');
      await User.updateOne(
        { _id: memberId },
        {
          $set: {
            'studentInfo.age': healthData.age,
            'studentInfo.emergencyContact': healthData.emergencyContact,
            'studentInfo.medicalConditions': healthData.medicalConditions,
            'studentInfo.healthProfile.height': healthData.height,
            'studentInfo.healthProfile.weight': healthData.weight,
            'studentInfo.healthProfile.bmi': healthData.bmi,
            'studentInfo.healthProfile.lastHealthCheck': new Date()
          }
        }
      );
      console.log('✅ updateOne으로 업데이트 완료');
    }
    console.log(`✅ ${member.name} 회원 건강정보 추가 완료!`);
    console.log(`   나이: ${healthData.age}세`);
    console.log(`   신장: ${healthData.height}cm`);
    console.log(`   체중: ${healthData.weight}kg`);
    console.log(`   BMI: ${healthData.bmi}`);
    
  } catch (error) {
    console.error('❌ 건강정보 추가 실패:', error.message);
    console.error(error);
  } finally {
    // MongoDB 연결 해제
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
addHealthDataById();

