/**
 * 강사 시드 데이터 생성 스크립트
 * 
 * 실행 방법:
 * node server/scripts/seed-instructors.js
 * 
 * 또는:
 * run-instructor-seed.bat
 */

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 연결 성공!');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// User 모델 정의 (간단 버전)
const userSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  password: String,
  phone: String,
  userType: String,
  level: String,
  isActive: Boolean,
  createdAt: Date,
  instructorInfo: {
    experience: String,
    certifications: [String],
    specialties: [String],
    instructorLevel: String,
    assignedCenters: [mongoose.Schema.Types.ObjectId],
    maxStudents: Number,
    currentStudents: Number,
    workSchedule: {
      daysOfWeek: [Number],
      timeSlots: [String]
    },
    salaryInfo: {
      type: { 
        type: String,
        enum: ['monthly', 'hourly', 'per-class']
      },
      amount: Number,
      currency: String,
      incentive: Number
    },
    memo: String,
    hiredAt: Date,
    contractType: String,
    employmentHistory: [{
      centerName: String,
      startDate: Date,
      endDate: Date,
      position: String,
      rating: Number,
      totalClasses: Number,
      totalStudents: Number,
      leaveReason: String,
      memo: String
    }]
  }
});

const User = mongoose.model('User', userSchema);

// 강사 시드 데이터
const instructorSeedData = [
  {
    userId: 'instructor_kim_001',
    name: '김강사',
    email: 'instructor1@jjswimlab.com',
    password: 'instructor123!',
    phone: '010-1234-5678',
    userType: 'instructor',
    level: 'senior',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    instructorInfo: {
      experience: '5년',
      certifications: ['수영지도자 1급', 'CPR 자격증'],
      specialties: ['초급자', '중급자', '성인반', '개인지도'],
      instructorLevel: 'senior',
      assignedCenters: [],
      maxStudents: 50,
      currentStudents: 45,
      workSchedule: {
        daysOfWeek: [1, 2, 3, 4, 5], // 월~금
        timeSlots: ['09:00-13:00', '14:00-18:00']
      },
      salaryInfo: {
        type: 'monthly',
        amount: 3500000,
        currency: 'KRW',
        incentive: 10
      },
      memo: '성실하고 학생들에게 인기가 많은 강사입니다.',
      hiredAt: new Date('2023-01-15'),
      contractType: 'full-time',
      employmentHistory: [
        {
          centerName: '서울수영센터',
          startDate: new Date('2020-03-01'),
          endDate: new Date('2022-12-31'),
          position: '수석강사',
          rating: 4.7,
          totalClasses: 350,
          totalStudents: 120,
          leaveReason: '더 나은 조건의 센터로 이직',
          memo: '우수 강사상 3회 수상'
        }
      ]
    }
  },
  {
    userId: 'instructor_lee_002',
    name: '이코치',
    email: 'instructor2@jjswimlab.com',
    password: 'instructor123!',
    phone: '010-2345-6789',
    userType: 'instructor',
    level: 'master',
    isActive: true,
    createdAt: new Date('2022-06-10'),
    instructorInfo: {
      experience: '8년',
      certifications: ['수영지도자 1급', '수상안전요원', 'CPR 자격증'],
      specialties: ['중급자', '상급자', '선수반', '그룹지도'],
      instructorLevel: 'master',
      assignedCenters: [],
      maxStudents: 60,
      currentStudents: 67,
      workSchedule: {
        daysOfWeek: [1, 3, 5], // 월수금
        timeSlots: ['10:00-14:00', '15:00-19:00']
      },
      salaryInfo: {
        type: 'monthly',
        amount: 4200000,
        currency: 'KRW',
        incentive: 15
      },
      memo: '선수반 지도 전문, 대회 입상자 다수 배출',
      hiredAt: new Date('2022-06-10'),
      contractType: 'full-time',
      employmentHistory: [
        {
          centerName: '강남스포츠센터',
          startDate: new Date('2017-01-01'),
          endDate: new Date('2020-05-31'),
          position: '선수반 코치',
          rating: 4.8,
          totalClasses: 520,
          totalStudents: 180,
          leaveReason: '센터 폐업',
          memo: '전국대회 금메달리스트 5명 배출'
        },
        {
          centerName: '올림픽수영장',
          startDate: new Date('2020-06-01'),
          endDate: new Date('2022-05-31'),
          position: '수석 코치',
          rating: 4.9,
          totalClasses: 400,
          totalStudents: 150,
          leaveReason: '근무 조건 협의',
          memo: '청소년부 국가대표 후보 2명 배출'
        }
      ]
    }
  },
  {
    userId: 'instructor_park_003',
    name: '박트레이너',
    email: 'instructor3@jjswimlab.com',
    password: 'instructor123!',
    phone: '010-3456-7890',
    userType: 'instructor',
    level: 'junior',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    instructorInfo: {
      experience: '3년',
      certifications: ['수영지도자 2급', 'CPR 자격증'],
      specialties: ['초급자', '아동반', '생존수영'],
      instructorLevel: 'junior',
      assignedCenters: [],
      maxStudents: 30,
      currentStudents: 12,
      workSchedule: {
        daysOfWeek: [0, 6], // 주말
        timeSlots: ['10:00-18:00']
      },
      salaryInfo: {
        type: 'hourly',
        amount: 35000,
        currency: 'KRW',
        incentive: 5
      },
      memo: '신입 강사, 교육 열정이 높음',
      hiredAt: new Date('2024-01-01'),
      contractType: 'part-time',
      employmentHistory: []
    }
  }
];

// 시드 데이터 삽입
const seedInstructors = async () => {
  try {
    console.log('🌱 강사 시드 데이터 생성 시작...\n');

    // 기존 테스트 강사 삭제
    const deleteResult = await User.deleteMany({
      email: { 
        $in: [
          'instructor1@jjswimlab.com',
          'instructor2@jjswimlab.com',
          'instructor3@jjswimlab.com'
        ]
      }
    });
    console.log(`🗑️  기존 테스트 강사 ${deleteResult.deletedCount}명 삭제`);

    // 비밀번호 해시화
    for (let instructor of instructorSeedData) {
      const salt = await bcrypt.genSalt(10);
      instructor.password = await bcrypt.hash(instructor.password, salt);
    }

    // 강사 삽입
    const insertedInstructors = await User.insertMany(instructorSeedData);
    
    console.log('\n✅ 강사 시드 데이터 생성 완료!\n');
    console.log('📊 생성된 강사:');
    console.log('─────────────────────────────────────────────────');
    
    insertedInstructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.name} (${instructor.email})`);
      console.log(`   - 등급: ${instructor.instructorInfo.instructorLevel}`);
      console.log(`   - 경력: ${instructor.instructorInfo.experience}`);
      console.log(`   - 담당 학생: ${instructor.instructorInfo.currentStudents}명`);
      console.log(`   - 급여: ${instructor.instructorInfo.salaryInfo.amount.toLocaleString()}원 (${instructor.instructorInfo.salaryInfo.type})`);
      console.log(`   - 고용형태: ${instructor.instructorInfo.contractType}`);
      console.log(`   - 이력: ${instructor.instructorInfo.employmentHistory.length}개 센터`);
      console.log('');
    });

    console.log('─────────────────────────────────────────────────');
    console.log('\n🔐 로그인 정보:');
    console.log('─────────────────────────────────────────────────');
    console.log('이메일: instructor1@jjswimlab.com');
    console.log('이메일: instructor2@jjswimlab.com');
    console.log('이메일: instructor3@jjswimlab.com');
    console.log('비밀번호: instructor123!');
    console.log('─────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 실행
const run = async () => {
  await connectDB();
  await seedInstructors();
  await mongoose.connection.close();
  console.log('✅ MongoDB 연결 종료');
  process.exit(0);
};

run();

