/**
 * 🔍 특정 ID로 건강정보 데이터 확인 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');

async function checkHealthDataById() {
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
    
    console.log('\n📊 회원 건강정보:');
    console.log('   이름:', member.name);
    console.log('   ID:', member._id);
    console.log('   studentInfo 존재:', !!member.studentInfo);
    
    if (member.studentInfo) {
      console.log('   age:', member.studentInfo.age);
      console.log('   emergencyContact:', member.studentInfo.emergencyContact);
      console.log('   medicalConditions:', member.studentInfo.medicalConditions);
      console.log('   healthProfile 존재:', !!member.studentInfo.healthProfile);
      
      if (member.studentInfo.healthProfile) {
        console.log('   healthProfile.height:', member.studentInfo.healthProfile.height);
        console.log('   healthProfile.weight:', member.studentInfo.healthProfile.weight);
        console.log('   healthProfile.bmi:', member.studentInfo.healthProfile.bmi);
      } else {
        console.log('   ⚠️ healthProfile이 없습니다!');
        console.log('   이 회원에게 건강정보를 추가해야 합니다.');
      }
    } else {
      console.log('   ⚠️ studentInfo가 없습니다!');
    }
    
    console.log('\n📋 전체 studentInfo 객체:');
    console.log(JSON.stringify(member.studentInfo, null, 2));
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    // MongoDB 연결 해제
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
checkHealthDataById();

