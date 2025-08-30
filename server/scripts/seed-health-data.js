/**
 * 🏥 JJ Swim Lab - 건강정보 시드 데이터 생성 스크립트
 * 
 * 📋 **목적**
 * - 건강정보 관련 테이블에 임의의 테스트 데이터 생성
 * - 강사용 건강정보 페이지들이 실제 데이터로 작동하도록 함
 * 
 * 🔄 **생성 데이터**
 * - 사용자 건강 프로필
 * - 건강 지표 변화 이력
 * - 운동 기록
 * - AI 추천사항
 * 
 * 🛠️ **실행 방법**
 * node scripts/seed-health-data.js
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// 환경 변수 로드
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 스키마 정의
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  userType: String,
  centerId: String,
  instructorId: String,
  createdAt: Date,
  updatedAt: Date
});

const healthProfileSchema = new mongoose.Schema({
  userId: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  bmi: Number,
  bloodType: String,
  healthStatus: String,
  exerciseCompliance: Number,
  lastHealthCheck: Date,
  nextHealthCheck: Date,
  healthGoals: [String],
  medicalHistory: [String],
  allergies: [String],
  currentMedications: [String],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  isPublic: {
    height: Boolean,
    weight: Boolean,
    bmi: Boolean,
    bloodType: Boolean,
    healthStatus: Boolean,
    exerciseCompliance: Boolean
  },
  createdAt: Date,
  updatedAt: Date
});

const healthMetricsSchema = new mongoose.Schema({
  userId: String,
  date: Date,
  bloodPressure: String,
  heartRate: Number,
  bodyFat: Number,
  muscleMass: Number,
  flexibility: Number,
  strength: Number,
  endurance: Number,
  createdAt: Date
});

const exerciseRecordSchema = new mongoose.Schema({
  userId: String,
  date: Date,
  type: String,
  duration: Number,
  intensity: String,
  notes: String,
  createdAt: Date
});

const aiRecommendationSchema = new mongoose.Schema({
  userId: String,
  exercisePlan: String,
  intensity: String,
  frequency: String,
  duration: String,
  precautions: [String],
  expectedOutcomes: [String],
  riskFactors: [String],
  priority: String,
  lastUpdated: Date,
  createdAt: Date
});

// 모델 생성
const User = mongoose.model('User', userSchema);
const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);
const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);
const ExerciseRecord = mongoose.model('ExerciseRecord', exerciseRecordSchema);
const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);

// 임의 데이터 생성 함수들
const generateRandomHealthData = () => {
  const height = faker.number.int({ min: 150, max: 190 });
  const weight = faker.number.int({ min: 45, max: 100 });
  const bmi = Math.round((weight / Math.pow(height / 100, 2)) * 100) / 100;
  
  const healthStatuses = ['excellent', 'good', 'fair', 'poor'];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const exerciseTypes = ['자유형', '배영', '평영', '접영', '혼영', '계영'];
  const intensityLevels = ['낮음', '보통', '높음'];
  
  return {
    height,
    weight,
    bmi,
    healthStatus: faker.helpers.arrayElement(healthStatuses),
    bloodType: faker.helpers.arrayElement(bloodTypes),
    exerciseCompliance: faker.number.int({ min: 60, max: 100 }),
    exerciseType: faker.helpers.arrayElement(exerciseTypes),
    intensity: faker.helpers.arrayElement(intensityLevels)
  };
};

const generateHealthProfile = (userId, userType) => {
  const healthData = generateRandomHealthData();
  const age = faker.number.int({ min: 18, max: 65 });
  const gender = faker.helpers.arrayElement(['남성', '여성']);
  
  return {
    userId,
    age,
    gender,
    height: healthData.height,
    weight: healthData.weight,
    bmi: healthData.bmi,
    bloodType: healthData.bloodType,
    healthStatus: healthData.healthStatus,
    exerciseCompliance: healthData.exerciseCompliance,
    lastHealthCheck: faker.date.recent({ days: 30 }),
    nextHealthCheck: faker.date.soon({ days: 30 }),
    healthGoals: faker.helpers.arrayElements([
      '체중 감량', '근력 향상', '지구력 향상', '유연성 향상', '건강 유지'
    ], { min: 2, max: 4 }),
    medicalHistory: faker.helpers.arrayElements([
      '없음', '고혈압', '당뇨', '천식', '관절염'
    ], { min: 0, max: 2 }),
    allergies: faker.helpers.arrayElements([
      '없음', '꽃가루', '먼지', '음식 알레르기', '약물 알레르기'
    ], { min: 0, max: 2 }),
    currentMedications: faker.helpers.arrayElements([
      '없음', '혈압약', '당뇨약', '비타민', '칼슘제'
    ], { min: 0, max: 2 }),
    emergencyContact: {
      name: faker.person.fullName(),
      relationship: faker.helpers.arrayElement(['부모', '배우자', '자녀', '형제']),
      phone: faker.phone.number('010-####-####')
    },
    isPublic: {
      height: faker.datatype.boolean(),
      weight: faker.datatype.boolean(),
      bmi: faker.datatype.boolean(),
      bloodType: faker.datatype.boolean(),
      healthStatus: faker.datatype.boolean(),
      exerciseCompliance: faker.datatype.boolean()
    },
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date()
  };
};

const generateHealthMetrics = (userId, count = 12) => {
  const metrics = [];
  for (let i = 0; i < count; i++) {
    const date = faker.date.past({ years: 1 });
    metrics.push({
      userId,
      date,
      bloodPressure: `${faker.number.int({ min: 100, max: 140 })}/${faker.number.int({ min: 60, max: 90 })}`,
      heartRate: faker.number.int({ min: 60, max: 100 }),
      bodyFat: faker.number.float({ min: 10, max: 30, precision: 0.1 }),
      muscleMass: faker.number.float({ min: 30, max: 60, precision: 0.1 }),
      flexibility: faker.number.int({ min: 20, max: 80 }),
      strength: faker.number.int({ min: 30, max: 90 }),
      endurance: faker.number.int({ min: 40, max: 100 }),
      createdAt: date
    });
  }
  return metrics;
};

const generateExerciseRecords = (userId, count = 20) => {
  const records = [];
  const exerciseTypes = ['자유형', '배영', '평영', '접영', '혼영', '계영', '개인혼영'];
  
  for (let i = 0; i < count; i++) {
    const date = faker.date.past({ years: 1 });
    records.push({
      userId,
      date,
      type: faker.helpers.arrayElement(exerciseTypes),
      duration: faker.number.int({ min: 30, max: 120 }),
      intensity: faker.helpers.arrayElement(['낮음', '보통', '높음']),
      notes: faker.helpers.arrayElement([
        '기본기 연습', '기술 향상', '체력 단련', '경기 연습', '회복 운동'
      ]),
      createdAt: date
    });
  }
  return records;
};

const generateAIRecommendations = (userId) => {
  const exercisePlans = [
    '기초 자유형 기술 연습',
    '지구력 향상 훈련',
    '고급 기술 습득',
    '경기 대비 훈련',
    '회복 및 유연성 운동'
  ];
  
  const precautions = [
    '충분한 준비운동',
    '적절한 휴식',
    '물 섭취',
    '체온 조절',
    '부상 예방'
  ];
  
  const expectedOutcomes = [
    '기술 향상',
    '체력 증진',
    '지구력 향상',
    '유연성 개선',
    '건강 상태 개선'
  ];
  
  const riskFactors = [
    '과도한 운동',
    '부적절한 자세',
    '충분하지 않은 휴식',
    '체온 조절 부족'
  ];
  
  return {
    userId,
    exercisePlan: faker.helpers.arrayElement(exercisePlans),
    intensity: faker.helpers.arrayElement(['낮음', '보통', '높음']),
    frequency: faker.helpers.arrayElement(['주 2회', '주 3회', '주 4회', '주 5회']),
    duration: faker.helpers.arrayElement(['30분', '45분', '60분', '90분']),
    precautions: faker.helpers.arrayElements(precautions, { min: 2, max: 4 }),
    expectedOutcomes: faker.helpers.arrayElements(expectedOutcomes, { min: 2, max: 4 }),
    riskFactors: faker.helpers.arrayElements(riskFactors, { min: 0, max: 2 }),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
    lastUpdated: new Date(),
    createdAt: faker.date.past({ years: 1 })
  };
};

// 메인 시드 함수
const seedHealthData = async () => {
  try {
    console.log('🏥 건강정보 시드 데이터 생성을 시작합니다...');
    
    // 기존 데이터 삭제
    await HealthProfile.deleteMany({});
    await HealthMetrics.deleteMany({});
    await ExerciseRecord.deleteMany({});
    await AIRecommendation.deleteMany({});
    
    console.log('✅ 기존 건강정보 데이터 삭제 완료');
    
    // 사용자 목록 조회 (학생과 강사)
    const users = await User.find({ userType: { $in: ['student', 'instructor'] } });
    
    if (users.length === 0) {
      console.log('⚠️ 사용자 데이터가 없습니다. 먼저 사용자 시드 데이터를 생성해주세요.');
      return;
    }
    
    console.log(`📊 ${users.length}명의 사용자에 대한 건강정보를 생성합니다...`);
    
    // 각 사용자별 건강정보 생성
    for (const user of users) {
      // 건강 프로필 생성
      const healthProfile = generateHealthProfile(user._id.toString(), user.userType);
      await HealthProfile.create(healthProfile);
      
      // 건강 지표 생성 (월별 데이터)
      const healthMetrics = generateHealthMetrics(user._id.toString(), 12);
      await HealthMetrics.insertMany(healthMetrics);
      
      // 운동 기록 생성
      const exerciseRecords = generateExerciseRecords(user._id.toString(), 20);
      await ExerciseRecord.insertMany(exerciseRecords);
      
      // AI 추천사항 생성
      const aiRecommendation = generateAIRecommendations(user._id.toString());
      await AIRecommendation.create(aiRecommendation);
      
      console.log(`✅ ${user.name} (${user.userType}) 건강정보 생성 완료`);
    }
    
    // 통계 출력
    const totalProfiles = await HealthProfile.countDocuments();
    const totalMetrics = await HealthMetrics.countDocuments();
    const totalExercises = await ExerciseRecord.countDocuments();
    const totalRecommendations = await AIRecommendation.countDocuments();
    
    console.log('\n📊 생성된 데이터 통계:');
    console.log(`- 건강 프로필: ${totalProfiles}개`);
    console.log(`- 건강 지표: ${totalMetrics}개`);
    console.log(`- 운동 기록: ${totalExercises}개`);
    console.log(`- AI 추천사항: ${totalRecommendations}개`);
    
    console.log('\n🎉 건강정보 시드 데이터 생성이 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 데이터베이스 연결을 종료합니다.');
  }
};

// 스크립트 실행
if (require.main === module) {
  seedHealthData();
}

module.exports = { seedHealthData };
