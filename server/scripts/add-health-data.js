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
    medicalConditions: '없음',
    height: 170,
    weight: 65,
    bmi: 22.5,
    bloodPressure: { systolic: 120, diastolic: 80 },
    cholesterol: { total: 180, ldl: 100, hdl: 60, triglycerides: 120 },
    bloodSugar: { fasting: 95, postprandial: 130, hba1c: 5.2 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: false }
  },
  {
    age: 30,
    emergencyContact: '010-2345-6789 (아버지)',
    medicalConditions: '천식',
    height: 175,
    weight: 80,
    bmi: 26.1,
    bloodPressure: { systolic: 130, diastolic: 85 },
    cholesterol: { total: 200, ldl: 130, hdl: 50, triglycerides: 150 },
    bloodSugar: { fasting: 100, postprandial: 140, hba1c: 5.5 },
    swimmingRelatedConditions: { asthma: true, hypertension: false, diabetes: false }
  },
  {
    age: 28,
    emergencyContact: '010-3456-7890 (배우자)',
    medicalConditions: '없음',
    height: 165,
    weight: 55,
    bmi: 20.2,
    bloodPressure: { systolic: 115, diastolic: 75 },
    cholesterol: { total: 170, ldl: 90, hdl: 65, triglycerides: 100 },
    bloodSugar: { fasting: 90, postprandial: 120, hba1c: 5.0 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: false }
  },
  {
    age: 35,
    emergencyContact: '010-4567-8901 (형)',
    medicalConditions: '없음',
    height: 180,
    weight: 75,
    bmi: 23.1,
    bloodPressure: { systolic: 125, diastolic: 82 },
    cholesterol: { total: 190, ldl: 115, hdl: 55, triglycerides: 130 },
    bloodSugar: { fasting: 98, postprandial: 135, hba1c: 5.3 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: false }
  },
  {
    age: 22,
    emergencyContact: '010-5678-9012 (언니)',
    medicalConditions: '없음',
    height: 160,
    weight: 50,
    bmi: 19.5,
    bloodPressure: { systolic: 110, diastolic: 70 },
    cholesterol: { total: 160, ldl: 85, hdl: 70, triglycerides: 90 },
    bloodSugar: { fasting: 88, postprandial: 115, hba1c: 4.9 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: false }
  },
  {
    age: 32,
    emergencyContact: '010-6789-0123 (남편)',
    medicalConditions: '없음',
    height: 178,
    weight: 82,
    bmi: 25.9,
    bloodPressure: { systolic: 135, diastolic: 90 },
    cholesterol: { total: 220, ldl: 150, hdl: 45, triglycerides: 180 },
    bloodSugar: { fasting: 105, postprandial: 150, hba1c: 5.8 },
    swimmingRelatedConditions: { asthma: false, hypertension: true, diabetes: false }
  },
  {
    age: 27,
    emergencyContact: '010-7890-1234 (아내)',
    medicalConditions: '없음',
    height: 163,
    weight: 58,
    bmi: 21.8,
    bloodPressure: { systolic: 118, diastolic: 78 },
    cholesterol: { total: 175, ldl: 95, hdl: 62, triglycerides: 110 },
    bloodSugar: { fasting: 92, postprandial: 125, hba1c: 5.1 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: false }
  },
  {
    age: 29,
    emergencyContact: '010-8901-2345 (아버지)',
    medicalConditions: '없음',
    height: 172,
    weight: 70,
    bmi: 23.7,
    bloodPressure: { systolic: 122, diastolic: 80 },
    cholesterol: { total: 185, ldl: 105, hdl: 58, triglycerides: 125 },
    bloodSugar: { fasting: 96, postprandial: 132, hba1c: 5.2 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: false }
  },
  {
    age: 26,
    emergencyContact: '010-9012-3456 (어머니)',
    medicalConditions: '없음',
    height: 168,
    weight: 62,
    bmi: 22.0,
    bloodPressure: { systolic: 119, diastolic: 77 },
    cholesterol: { total: 178, ldl: 98, hdl: 61, triglycerides: 115 },
    bloodSugar: { fasting: 94, postprandial: 128, hba1c: 5.1 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: false }
  },
  {
    age: 31,
    emergencyContact: '010-0123-4567 (아버지)',
    medicalConditions: '없음',
    height: 176,
    weight: 78,
    bmi: 25.2,
    bloodPressure: { systolic: 128, diastolic: 88 },
    cholesterol: { total: 210, ldl: 140, hdl: 48, triglycerides: 160 },
    bloodSugar: { fasting: 102, postprandial: 145, hba1c: 5.6 },
    swimmingRelatedConditions: { asthma: false, hypertension: false, diabetes: true }
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
        
        // healthProfile 업데이트
        if (!freshStudent.studentInfo.healthProfile) {
          freshStudent.studentInfo.healthProfile = {};
        }
        freshStudent.studentInfo.healthProfile.height = healthData.height;
        freshStudent.studentInfo.healthProfile.weight = healthData.weight;
        freshStudent.studentInfo.healthProfile.bmi = healthData.bmi;
        freshStudent.studentInfo.healthProfile.lastHealthCheck = new Date();
        
        // 혈압 데이터 추가
        if (healthData.bloodPressure) {
          freshStudent.studentInfo.healthProfile.bloodPressure = {
            systolic: healthData.bloodPressure.systolic,
            diastolic: healthData.bloodPressure.diastolic,
            measuredAt: new Date()
          };
        }
        
        // 콜레스테롤 데이터 추가
        if (healthData.cholesterol) {
          freshStudent.studentInfo.healthProfile.cholesterol = {
            total: healthData.cholesterol.total,
            ldl: healthData.cholesterol.ldl,
            hdl: healthData.cholesterol.hdl,
            triglycerides: healthData.cholesterol.triglycerides,
            measuredAt: new Date()
          };
        }
        
        // 혈당 데이터 추가
        if (healthData.bloodSugar) {
          freshStudent.studentInfo.healthProfile.bloodSugar = {
            fasting: healthData.bloodSugar.fasting,
            postprandial: healthData.bloodSugar.postprandial,
            hba1c: healthData.bloodSugar.hba1c,
            measuredAt: new Date()
          };
        }
        
        // 수영 관련 건강질환 추가
        if (healthData.swimmingRelatedConditions) {
          freshStudent.studentInfo.healthProfile.swimmingRelatedConditions = {
            cardiovascular: healthData.swimmingRelatedConditions.cardiovascular || false,
            respiratory: healthData.swimmingRelatedConditions.respiratory || false,
            musculoskeletal: healthData.swimmingRelatedConditions.musculoskeletal || false,
            diabetes: healthData.swimmingRelatedConditions.diabetes || false,
            hypertension: healthData.swimmingRelatedConditions.hypertension || false,
            asthma: healthData.swimmingRelatedConditions.asthma || false,
            other: healthData.swimmingRelatedConditions.other || []
          };
        }
        
        // markModified로 Mixed 타입 필드 변경 알림
        freshStudent.markModified('studentInfo');
        freshStudent.markModified('studentInfo.healthProfile');
        if (freshStudent.studentInfo.healthProfile.bloodPressure) {
          freshStudent.markModified('studentInfo.healthProfile.bloodPressure');
        }
        if (freshStudent.studentInfo.healthProfile.cholesterol) {
          freshStudent.markModified('studentInfo.healthProfile.cholesterol');
        }
        if (freshStudent.studentInfo.healthProfile.bloodSugar) {
          freshStudent.markModified('studentInfo.healthProfile.bloodSugar');
        }
        if (freshStudent.studentInfo.healthProfile.swimmingRelatedConditions) {
          freshStudent.markModified('studentInfo.healthProfile.swimmingRelatedConditions');
        }
        
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
        const hp = student.studentInfo.healthProfile || {};
        console.log(`   - ${student.name}: 나이 ${student.studentInfo.age}세, 신장 ${hp.height || '-'}cm, 체중 ${hp.weight || '-'}kg, BMI ${hp.bmi || '-'}`);
        console.log(`     응급연락처: ${student.studentInfo.emergencyContact || '없음'}, 만성질환: ${student.studentInfo.medicalConditions || '없음'}`);
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

