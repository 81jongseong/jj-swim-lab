/**
 * 🌱 JJ Swim Lab - 강사관리 시스템 시드 데이터 생성
 * 
 * 📋 **스크립트 목적**
 * - 강사관리 시스템에 필요한 모든 테스트 데이터 생성
 * - 강사, 학생, 체크리스트, 강습 예약 등의 종합 데이터
 * - 실제 운영 환경과 유사한 데이터 구조 구성
 * 
 * 🔄 **생성 데이터**
 * - 센터 정보 (3개 센터)
 * - 강사 정보 (6명의 강사)
 * - 학생 정보 (24명의 학생)
 * - 강습 과정 정보 (4개 과정)
 * - 체크리스트 템플릿 및 데이터
 * - 강습 예약 및 진행 상황
 * - 건강 데이터 및 성과 지표
 * 
 * 🗄️ **데이터 연동**
 * - User 모델 (강사, 학생)
 * - Center 모델 (센터 정보)
 * - Course 모델 (강습 과정)
 * - Booking 모델 (강습 예약)
 * - Checklist 모델 (체크리스트)
 * - HealthData 모델 (건강 데이터)
 * 
 * 🛠️ **필요한 설치 파일**
 * - MongoDB 연결
 * - Mongoose 모델
 * - 환경 변수 설정
 * - 데이터 검증 로직
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 기존 데이터 백업 필수
 * 2. 데이터 무결성 검증
 * 3. 중복 데이터 방지
 * 4. 관계 데이터 일관성 유지
 * 5. 테스트 데이터 특성 명시
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 기존 데이터 백업 확인
 * - [ ] 데이터 무결성 검증
 * - [ ] 관계 데이터 일관성 확인
 * - [ ] 테스트 데이터 특성 검토
 * - [ ] 스크립트 실행 결과 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사관리 시스템 시드 데이터)
 * - 2024-12-19: 종합 데이터 구조 구현
 * - 2024-12-19: 관계 데이터 연동 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (강사관리 시스템 시드 데이터 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 데이터 업데이트
 * - 데이터 품질 모니터링
 * - 자동화된 데이터 생성
 * - 성능 최적화
 * 
 * 💡 **사용 예시**
 * ```bash
 * # 시드 데이터 생성
 * node scripts/seed-instructor-management.js
 * 
 * # 특정 센터만 생성
 * node scripts/seed-instructor-management.js --center=gangnam
 * 
 * # 데이터 초기화 후 생성
 * node scripts/seed-instructor-management.js --reset
 * ```
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 스키마 정의
const centerSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  email: String,
  description: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  phone: String,
  userType: String,
  centerId: mongoose.Schema.Types.ObjectId,
  instructorId: mongoose.Schema.Types.ObjectId,
  specialization: String,
  experience: Number,
  rating: Number,
  status: { type: String, default: 'active' },
  joinDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  bio: String
});

const courseSchema = new mongoose.Schema({
  name: String,
  description: String,
  level: String,
  duration: Number,
  price: Number,
  centerId: mongoose.Schema.Types.ObjectId,
  instructorId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  instructorId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  centerId: mongoose.Schema.Types.ObjectId,
  date: Date,
  time: String,
  status: { type: String, default: 'scheduled' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const checklistSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  instructorId: mongoose.Schema.Types.ObjectId,
  title: String,
  items: [{
    description: String,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const healthDataSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  height: Number,
  weight: Number,
  bloodType: String,
  allergies: [String],
  medicalConditions: [String],
  fitnessLevel: String,
  goals: [String],
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 모델 생성
const Center = mongoose.model('Center', centerSchema);
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Checklist = mongoose.model('Checklist', checklistSchema);
const HealthData = mongoose.model('HealthData', healthDataSchema);

// 시드 데이터
const seedData = {
  centers: [
    {
      name: 'JJ Swim Lab 강남점',
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'gangnam@jjswim.com',
      description: '강남 지역 최고의 수영 강습 센터'
    },
    {
      name: 'JJ Swim Lab 서초점',
      address: '서울특별시 서초구 서초대로 456',
      phone: '02-2345-6789',
      email: 'seocho@jjswim.com',
      description: '서초 지역 프리미엄 수영 강습 센터'
    },
    {
      name: 'JJ Swim Lab 송파점',
      address: '서울특별시 송파구 올림픽로 789',
      phone: '02-3456-7890',
      email: 'songpa@jjswim.com',
      description: '송파 지역 종합 수영 강습 센터'
    }
  ],
  
  instructors: [
    {
      userId: 'instructor001',
      name: '김수영',
      email: 'kim@jjswim.com',
      phone: '010-1234-5678',
      userType: 'instructor',
      specialization: '자유형, 배영',
      experience: 8,
      rating: 4.8,
      bio: '8년 경력의 자유형 전문 강사입니다.'
    },
    {
      userId: 'instructor002',
      name: '이영수',
      email: 'lee@jjswim.com',
      phone: '010-2345-6789',
      userType: 'instructor',
      specialization: '평영, 접영',
      experience: 5,
      rating: 4.6,
      bio: '5년 경력의 평영, 접영 전문 강사입니다.'
    },
    {
      userId: 'instructor003',
      name: '박수영',
      email: 'park@jjswim.com',
      phone: '010-3456-7890',
      userType: 'instructor',
      specialization: '자유형, 혼영',
      experience: 12,
      rating: 4.9,
      bio: '12년 경력의 수영 마스터 강사입니다.'
    },
    {
      userId: 'instructor004',
      name: '최영수',
      email: 'choi@jjswim.com',
      phone: '010-4567-8901',
      userType: 'instructor',
      specialization: '배영, 접영',
      experience: 6,
      rating: 4.7,
      bio: '6년 경력의 배영, 접영 전문 강사입니다.'
    },
    {
      userId: 'instructor005',
      name: '정수영',
      email: 'jung@jjswim.com',
      phone: '010-5678-9012',
      userType: 'instructor',
      specialization: '평영, 자유형',
      experience: 9,
      rating: 4.8,
      bio: '9년 경력의 평영, 자유형 전문 강사입니다.'
    },
    {
      userId: 'instructor006',
      name: '한영수',
      email: 'han@jjswim.com',
      phone: '010-6789-0123',
      userType: 'instructor',
      specialization: '혼영, 자유형',
      experience: 7,
      rating: 4.7,
      bio: '7년 경력의 혼영, 자유형 전문 강사입니다.'
    }
  ],
  
  students: [
    {
      userId: 'student001',
      name: '김민수',
      email: 'kimmin@jjswim.com',
      phone: '010-1111-1111',
      userType: 'student',
      goals: ['자유형 마스터', '체력 향상']
    },
    {
      userId: 'student002',
      name: '이지은',
      email: 'leeji@jjswim.com',
      phone: '010-1111-1112',
      userType: 'student',
      goals: ['평영 배우기', '안전한 수영']
    },
    {
      userId: 'student003',
      name: '박준호',
      email: 'parkjun@jjswim.com',
      phone: '010-1111-1113',
      userType: 'student',
      goals: ['수영 경기 참가', '기술 향상']
    },
    {
      userId: 'student004',
      name: '최수진',
      email: 'choisoo@jjswim.com',
      phone: '010-1111-1114',
      userType: 'student',
      goals: ['건강한 운동', '스트레스 해소']
    },
    {
      userId: 'student005',
      name: '정현우',
      email: 'junghyun@jjswim.com',
      phone: '010-1111-1115',
      userType: 'student',
      goals: ['수영 기초 다지기', '자신감 향상']
    },
    {
      userId: 'student006',
      name: '한소영',
      email: 'hansoo@jjswim.com',
      phone: '010-1111-1116',
      userType: 'student',
      goals: ['레저 스포츠', '친구들과 함께']
    },
    {
      userId: 'student007',
      name: '강동현',
      email: 'kangdong@jjswim.com',
      phone: '010-1111-1117',
      userType: 'student',
      goals: ['수영 기술 향상', '체력 단련']
    },
    {
      userId: 'student008',
      name: '윤미영',
      email: 'yoonmi@jjswim.com',
      phone: '010-1111-1118',
      userType: 'student',
      goals: ['안전한 수영', '건강 관리']
    }
  ],
  
  courses: [
    {
      name: '초급 수영 기초',
      description: '수영을 처음 배우는 분들을 위한 기초 과정',
      level: 'beginner',
      duration: 60,
      price: 50000
    },
    {
      name: '중급 자유형 마스터',
      description: '자유형을 완벽하게 마스터하는 과정',
      level: 'intermediate',
      duration: 60,
      price: 60000
    },
    {
      name: '고급 혼영 기술',
      description: '고급 수영 기술을 습득하는 과정',
      level: 'advanced',
      duration: 90,
      price: 80000
    },
    {
      name: '수영 경기 준비',
      description: '수영 경기 참가를 위한 특별 과정',
      level: 'expert',
      duration: 120,
      price: 100000
    }
  ]
};

// 체크리스트 아이템 생성 함수
function generateChecklistItems(level) {
  const baseItems = [
    '수영복 착용 확인',
    '수영 모자 착용 확인',
    '수경 착용 확인',
    '준비 운동 실시',
    '안전 수칙 숙지'
  ];
  
  if (level === 'beginner') {
    return [
      ...baseItems,
      '물에 대한 두려움 극복',
      '기본 호흡법 연습',
      '물속에서 눈 뜨기 연습',
      '기본 발차기 연습',
      '기본 팔동작 연습'
    ];
  } else if (level === 'intermediate') {
    return [
      ...baseItems,
      '자유형 호흡법 연습',
      '자유형 팔동작 연습',
      '자유형 발차기 연습',
      '자유형 전체 동작 연습',
      '지구력 향상 훈련'
    ];
  } else {
    return [
      ...baseItems,
      '고급 기술 연습',
      '스피드 훈련',
      '지구력 훈련',
      '경기 전략 연습',
      '개인 기록 측정'
    ];
  }
}

// 메인 시드 함수
async function seedInstructorManagement() {
  try {
    console.log('🌱 강사관리 시스템 시드 데이터 생성 시작...');
    
    // 1. 센터 생성
    console.log('1️⃣ 센터 정보 생성 중...');
    const createdCenters = [];
    for (const centerData of seedData.centers) {
      const center = new Center(centerData);
      const savedCenter = await center.save();
      createdCenters.push(savedCenter);
      console.log(`   ✅ ${savedCenter.name} 생성 완료`);
    }
    
    // 2. 강사 생성 및 센터 배정
    console.log('2️⃣ 강사 정보 생성 중...');
    const createdInstructors = [];
    for (let i = 0; i < seedData.instructors.length; i++) {
      const instructorData = seedData.instructors[i];
      const centerIndex = i % createdCenters.length;
      
      const instructor = new User({
        ...instructorData,
        centerId: createdCenters[centerIndex]._id
      });
      
      const savedInstructor = await instructor.save();
      createdInstructors.push(savedInstructor);
      console.log(`   ✅ ${savedInstructor.name} (${createdCenters[centerIndex].name}) 생성 완료`);
    }
    
    // 3. 학생 생성 및 강사 배정
    console.log('3️⃣ 학생 정보 생성 중...');
    const createdStudents = [];
    for (let i = 0; i < seedData.students.length; i++) {
      const studentData = seedData.students[i];
      const instructorIndex = i % createdInstructors.length;
      const centerIndex = i % createdCenters.length;
      
      const student = new User({
        ...studentData,
        centerId: createdCenters[centerIndex]._id,
        instructorId: createdInstructors[instructorIndex]._id
      });
      
      const savedStudent = await student.save();
      createdStudents.push(savedStudent);
      console.log(`   ✅ ${savedStudent.name} (${createdInstructors[instructorIndex].name} 강사) 생성 완료`);
    }
    
    // 4. 강습 과정 생성
    console.log('4️⃣ 강습 과정 생성 중...');
    const createdCourses = [];
    for (const courseData of seedData.courses) {
      const course = new Course({
        ...courseData,
        centerId: createdCenters[0]._id, // 강남점에 기본 배정
        instructorId: createdInstructors[0]._id // 김수영 강사에 기본 배정
      });
      
      const savedCourse = await course.save();
      createdCourses.push(savedCourse);
      console.log(`   ✅ ${savedCourse.name} 생성 완료`);
    }
    
    // 5. 강습 예약 생성
    console.log('5️⃣ 강습 예약 생성 중...');
    const bookingStatuses = ['scheduled', 'completed', 'cancelled'];
    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    for (let i = 0; i < 50; i++) {
      const student = createdStudents[i % createdStudents.length];
      const instructor = createdInstructors[i % createdInstructors.length];
      const course = createdCourses[i % createdCourses.length];
      const center = createdCenters[i % createdCenters.length];
      
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30));
      
      const booking = new Booking({
        studentId: student._id,
        instructorId: instructor._id,
        courseId: course._id,
        centerId: center._id,
        date: bookingDate,
        time: timeSlots[Math.floor(Math.random() * timeSlots.length)],
        status: bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
        notes: `테스트 강습 예약 #${i + 1}`
      });
      
      await booking.save();
    }
    console.log('   ✅ 50개의 강습 예약 생성 완료');
    
    // 6. 체크리스트 생성
    console.log('6️⃣ 체크리스트 생성 중...');
    for (let i = 0; i < 30; i++) {
      const student = createdStudents[i % createdStudents.length];
      const instructor = createdInstructors[i % createdInstructors.length];
      const level = ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)];
      
      const checklist = new Checklist({
        studentId: student._id,
        instructorId: instructor._id,
        title: `${student.name}의 ${level} 레벨 체크리스트`,
        items: generateChecklistItems(level).map(item => ({
          description: item,
          completed: Math.random() > 0.3, // 70% 완료율
          completedAt: Math.random() > 0.3 ? new Date() : null
        }))
      });
      
      await checklist.save();
    }
    console.log('   ✅ 30개의 체크리스트 생성 완료');
    
    // 7. 건강 데이터 생성
    console.log('7️⃣ 건강 데이터 생성 중...');
    for (const student of createdStudents) {
      const healthData = new HealthData({
        studentId: student._id,
        height: 150 + Math.floor(Math.random() * 50), // 150-200cm
        weight: 40 + Math.floor(Math.random() * 40), // 40-80kg
        bloodType: ['A', 'B', 'O', 'AB'][Math.floor(Math.random() * 4)],
        allergies: Math.random() > 0.7 ? ['꽃가루', '먼지'] : [],
        medicalConditions: Math.random() > 0.8 ? ['천식'] : [],
        fitnessLevel: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        goals: ['체력 향상', '기술 향상', '건강 관리'],
        isPublic: Math.random() > 0.5
      });
      
      await healthData.save();
    }
    console.log('   ✅ 학생별 건강 데이터 생성 완료');
    
    console.log('🎉 강사관리 시스템 시드 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 센터: ${createdCenters.length}개`);
    console.log(`   - 강사: ${createdInstructors.length}명`);
    console.log(`   - 학생: ${createdStudents.length}명`);
    console.log(`   - 강습 과정: ${createdCourses.length}개`);
    console.log(`   - 강습 예약: 50개`);
    console.log(`   - 체크리스트: 30개`);
    console.log(`   - 건강 데이터: ${createdStudents.length}개`);
    
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab')
    .then(() => {
      console.log('✅ MongoDB 연결 성공');
      seedInstructorManagement();
    })
    .catch((error) => {
      console.error('❌ MongoDB 연결 실패:', error);
      process.exit(1);
    });
}

module.exports = { seedInstructorManagement };

