const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Checklist = require('../src/models/Checklist');
const ChecklistTemplate = require('../src/models/ChecklistTemplate');
const TeachingMethod = require('../src/models/TeachingMethod');
const CenterLevel = require('../src/models/CenterLevel');
const Booking = require('../src/models/Booking');
const Payment = require('../src/models/Payment');

// 완벽한 샘플 데이터
const sampleUsers = [
  // === 학생들 ===
  {
    name: '김수영',
    email: 'kim.swim@example.com',
    phone: '010-1234-5678',
    userType: 'student',
    currentLevel: '초급',
    progress: 65,
    lastLesson: '2025-01-20',
    nextLesson: '2025-01-22',
    attendance: 8,
    totalLessons: 12,
    centerId: 'center001',
    instructorId: 'instructor001',
    courseId: 'course001',
    courseName: '초급 자유형',
    enrollmentDate: '2024-11-01',
    targetLevel: '중급',
    notes: '수영에 대한 열정이 높고 학습 의지가 강함'
  },
  {
    name: '이영희',
    email: 'lee.young@example.com',
    phone: '010-2345-6789',
    userType: 'student',
    currentLevel: '중급',
    progress: 78,
    lastLesson: '2025-01-19',
    nextLesson: '2025-01-23',
    attendance: 15,
    totalLessons: 20,
    centerId: 'center001',
    instructorId: 'instructor001',
    courseId: 'course002',
    courseName: '중급 접영',
    enrollmentDate: '2024-09-15',
    targetLevel: '고급',
    notes: '접영에 특별한 재능을 보임'
  },
  {
    name: '박철수',
    email: 'park.chul@example.com',
    phone: '010-3456-7890',
    userType: 'student',
    currentLevel: '고급',
    progress: 92,
    lastLesson: '2025-01-18',
    nextLesson: '2025-01-24',
    attendance: 25,
    totalLessons: 30,
    centerId: 'center001',
    instructorId: 'instructor002',
    courseId: 'course003',
    courseName: '고급 평영',
    enrollmentDate: '2024-07-01',
    targetLevel: '전문가',
    notes: '올림픽 선수 지망생, 매우 뛰어난 실력'
  },
  {
    name: '최민수',
    email: 'choi.min@example.com',
    phone: '010-4567-8901',
    userType: 'student',
    currentLevel: '초급',
    progress: 45,
    lastLesson: '2025-01-17',
    nextLesson: '2025-01-21',
    attendance: 6,
    totalLessons: 10,
    centerId: 'center001',
    instructorId: 'instructor001',
    courseId: 'course001',
    courseName: '초급 자유형',
    enrollmentDate: '2024-12-01',
    targetLevel: '중급',
    notes: '처음 수영을 배우는 초보자, 천천히 진행 필요'
  },
  {
    name: '정수진',
    email: 'jung.sujin@example.com',
    phone: '010-5678-9012',
    userType: 'student',
    currentLevel: '중급',
    progress: 82,
    lastLesson: '2025-01-16',
    nextLesson: '2025-01-25',
    attendance: 18,
    totalLessons: 22,
    centerId: 'center001',
    instructorId: 'instructor002',
    courseId: 'course002',
    courseName: '중급 접영',
    enrollmentDate: '2024-10-01',
    targetLevel: '고급',
    notes: '여성 학생, 접영에 뛰어난 유연성 보임'
  },
  {
    name: '한지민',
    email: 'han.jimin@example.com',
    phone: '010-6789-0123',
    userType: 'student',
    currentLevel: '고급',
    progress: 88,
    lastLesson: '2025-01-15',
    nextLesson: '2025-01-26',
    attendance: 28,
    totalLessons: 32,
    centerId: 'center001',
    instructorId: 'instructor002',
    courseId: 'course003',
    courseName: '고급 평영',
    enrollmentDate: '2024-08-01',
    targetLevel: '전문가',
    notes: '평영에 특화된 학생, 경기 출전 준비 중'
  },

  // === 강사들 ===
  {
    name: '강사김',
    email: 'instructor.kim@example.com',
    phone: '010-1111-2222',
    userType: 'instructor',
    centerId: 'center001',
    specializations: ['자유형', '접영', '초급'],
    experience: 8,
    certification: '국가수영지도사 2급',
    bio: '8년간 수영을 가르쳐온 경험 많은 강사',
    hourlyRate: 50000,
    availableDays: ['월', '화', '수', '목', '금'],
    maxStudents: 15
  },
  {
    name: '강사이',
    email: 'instructor.lee@example.com',
    phone: '010-2222-3333',
    userType: 'instructor',
    centerId: 'center001',
    specializations: ['평영', '고급', '경기지도'],
    experience: 12,
    certification: '국가수영지도사 1급',
    bio: '전국대회 우승 경험이 있는 전문 강사',
    hourlyRate: 70000,
    availableDays: ['월', '화', '수', '목', '금', '토'],
    maxStudents: 20
  },

  // === 센터 관리자 ===
  {
    name: '센터관리자',
    email: 'admin@center.com',
    phone: '010-9999-8888',
    userType: 'centerAdmin',
    centerId: 'center001',
    centerName: 'JJ 수영 아카데미',
    permissions: ['user_management', 'course_management', 'financial_reports'],
    joinDate: '2020-01-01'
  },

  // === 총 관리자 ===
  {
    name: '총관리자',
    email: 'superadmin@swimlab.com',
    phone: '010-0000-0000',
    userType: 'superAdmin',
    centerId: 'all',
    permissions: ['all'],
    joinDate: '2019-01-01'
  }
];

const sampleCourses = [
  {
    name: '초급 자유형',
    description: '자유형 기초를 체계적으로 배우는 과정',
    level: '초급',
    duration: 12,
    price: 180000,
    centerId: 'center001',
    instructorId: 'instructor001',
    maxStudents: 8,
    schedule: '월,수,금 오후 2시-3시',
    prerequisites: '수영 경험 없음',
    objectives: ['기본 자유형 동작 숙지', '25m 완주', '안전한 수영법 습득'],
    materials: ['수영모자', '수경', '수영복'],
    category: '자유형',
    tags: ['초급', '기초', '자유형']
  },
  {
    name: '중급 접영',
    description: '접영의 정확한 동작과 호흡법을 배우는 과정',
    level: '중급',
    duration: 16,
    price: 240000,
    centerId: 'center001',
    instructorId: 'instructor002',
    maxStudents: 6,
    schedule: '화,목,토 오후 3시-4시',
    prerequisites: '자유형 25m 완주 가능',
    objectives: ['접영 기본 동작 숙지', '50m 완주', '호흡법 완벽 습득'],
    materials: ['수영모자', '수경', '수영복', '핀'],
    category: '접영',
    tags: ['중급', '접영', '호흡법']
  },
  {
    name: '고급 평영',
    description: '평영의 고급 기술과 경기 기술을 배우는 과정',
    level: '고급',
    duration: 20,
    price: 300000,
    centerId: 'center001',
    instructorId: 'instructor002',
    maxStudents: 4,
    schedule: '월,수,금 오후 4시-5시',
    prerequisites: '접영 50m 완주 가능',
    objectives: ['평영 고급 기술 습득', '100m 완주', '경기 기술 연마'],
    materials: ['수영모자', '수경', '수영복', '핀', '훈련용 도구'],
    category: '평영',
    tags: ['고급', '평영', '경기기술']
  }
];

const sampleTeachingMethods = [
  {
    name: '자유형 기본 동작',
    description: '자유형의 기본 자세와 동작을 체계적으로 연습',
    level: '초급',
    category: '자유형',
    difficulty: '초급',
    steps: [
      '발차기 연습 (벽 잡고)',
      '팔 돌리기 연습 (서서)',
      '호흡법 연습 (벽 잡고)',
      '전체 동작 연결 (벽 잡고)',
      '자유형 10m 연습',
      '자유형 25m 완주'
    ],
    tips: [
      '천천히 정확한 자세로 연습하세요',
      '호흡할 때는 고개를 너무 높이 들지 마세요',
      '팔을 돌릴 때는 어깨를 사용하세요',
      '다리는 위아래로 움직여야 합니다'
    ],
    centerId: 'center001',
    estimatedTime: 30,
    equipment: ['수영모자', '수경', '핀'],
    videoUrl: 'https://example.com/freestyle-basic.mp4'
  },
  {
    name: '접영 기본 동작',
    description: '접영의 기본 자세와 동작을 체계적으로 연습',
    level: '중급',
    category: '접영',
    difficulty: '중급',
    steps: [
      '접영 다리 동작 연습 (벽 잡고)',
      '접영 팔 동작 연습 (서서)',
      '호흡 타이밍 연습 (벽 잡고)',
      '전체 동작 연결 (벽 잡고)',
      '접영 25m 연습',
      '접영 50m 완주'
    ],
    tips: [
      '다리를 동시에 움직여야 합니다',
      '팔을 번갈아가며 움직이세요',
      '팔을 들 때 호흡하세요',
      '몸을 좌우로 흔들지 마세요'
    ],
    centerId: 'center001',
    estimatedTime: 45,
    equipment: ['수영모자', '수경', '핀'],
    videoUrl: 'https://example.com/butterfly-basic.mp4'
  },
  {
    name: '평영 고급 기술',
    description: '평영의 고급 기술과 경기 기술을 연습',
    level: '고급',
    category: '평영',
    difficulty: '고급',
    steps: [
      '평영 고급 다리 동작',
      '평영 고급 팔 동작',
      '호흡 타이밍 최적화',
      '전체 동작 연결 최적화',
      '평영 50m 연습',
      '평영 100m 완주',
      '경기용 스타트 연습',
      '경기용 턴 연습'
    ],
    tips: [
      '다리 동작의 타이밍이 중요합니다',
      '팔 동작과 다리 동작을 정확히 맞추세요',
      '호흡은 팔을 모을 때 하세요',
      '경기에서는 스타트와 턴이 승패를 좌우합니다'
    ],
    centerId: 'center001',
    estimatedTime: 60,
    equipment: ['수영모자', '수경', '핀', '훈련용 도구'],
    videoUrl: 'https://example.com/breaststroke-advanced.mp4'
  }
];

const sampleChecklistTemplates = [
  {
    name: '초급 자유형 체크리스트',
    level: '초급',
    category: '자유형',
    description: '초급 자유형 학습 과정을 체계적으로 관리하는 체크리스트',
    items: [
      {
        stepName: '자유형 기본 동작 연습',
        stepOrder: 1,
        category: '기본동작',
        difficulty: '초급',
        tips: '천천히 정확한 자세로 연습하세요',
        estimatedTime: 30,
        isRequired: true
      },
      {
        stepName: '호흡법 숙지',
        stepOrder: 2,
        category: '호흡',
        difficulty: '초급',
        tips: '물속에서 코로 내쉬고 입으로 들이마시세요',
        estimatedTime: 20,
        isRequired: true
      },
      {
        stepName: '25m 완주',
        stepOrder: 3,
        category: '거리',
        difficulty: '초급',
        tips: '무리하지 말고 천천히 완주하세요',
        estimatedTime: 45,
        isRequired: true
      },
      {
        stepName: '기술 평가',
        stepOrder: 4,
        category: '평가',
        difficulty: '초급',
        tips: '기본 동작이 완벽해질 때까지 연습하세요',
        estimatedTime: 15,
        isRequired: true
      }
    ],
    centerId: 'center001',
    createdBy: 'instructor001',
    isActive: true,
    version: '1.0',
    lastUpdated: new Date()
  },
  {
    name: '중급 접영 체크리스트',
    level: '중급',
    category: '접영',
    description: '중급 접영 학습 과정을 체계적으로 관리하는 체크리스트',
    items: [
      {
        stepName: '접영 다리 동작',
        stepOrder: 1,
        category: '다리동작',
        difficulty: '중급',
        tips: '다리를 동시에 움직여야 합니다',
        estimatedTime: 25,
        isRequired: true
      },
      {
        stepName: '접영 팔 동작',
        stepOrder: 2,
        category: '팔동작',
        difficulty: '중급',
        tips: '팔을 번갈아가며 움직이세요',
        estimatedTime: 30,
        isRequired: true
      },
      {
        stepName: '호흡 타이밍',
        stepOrder: 3,
        category: '호흡',
        difficulty: '중급',
        tips: '팔을 들 때 호흡하세요',
        estimatedTime: 20,
        isRequired: true
      },
      {
        stepName: '전체 동작 연결',
        stepOrder: 4,
        category: '연결',
        difficulty: '중급',
        tips: '모든 동작을 부드럽게 연결하세요',
        estimatedTime: 40,
        isRequired: true
      },
      {
        stepName: '50m 완주',
        stepOrder: 5,
        category: '거리',
        difficulty: '중급',
        tips: '지구력을 기르며 완주하세요',
        estimatedTime: 60,
        isRequired: true
      }
    ],
    centerId: 'center001',
    createdBy: 'instructor002',
    isActive: true,
    version: '1.0',
    lastUpdated: new Date()
  },
  {
    name: '고급 평영 체크리스트',
    level: '고급',
    category: '평영',
    description: '고급 평영 학습 과정을 체계적으로 관리하는 체크리스트',
    items: [
      {
        stepName: '평영 고급 다리 동작',
        stepOrder: 1,
        category: '다리동작',
        difficulty: '고급',
        tips: '다리 동작의 타이밍이 중요합니다',
        estimatedTime: 30,
        isRequired: true
      },
      {
        stepName: '평영 고급 팔 동작',
        stepOrder: 2,
        category: '팔동작',
        difficulty: '고급',
        tips: '팔 동작과 다리 동작을 정확히 맞추세요',
        estimatedTime: 35,
        isRequired: true
      },
      {
        stepName: '호흡 타이밍 최적화',
        stepOrder: 3,
        category: '호흡',
        difficulty: '고급',
        tips: '호흡은 팔을 모을 때 하세요',
        estimatedTime: 25,
        isRequired: true
      },
      {
        stepName: '전체 동작 연결 최적화',
        stepOrder: 4,
        category: '연결',
        difficulty: '고급',
        tips: '모든 동작을 부드럽게 연결하세요',
        estimatedTime: 45,
        isRequired: true
      },
      {
        stepName: '100m 완주',
        stepOrder: 5,
        category: '거리',
        difficulty: '고급',
        tips: '지구력과 속도를 모두 기르세요',
        estimatedTime: 90,
        isRequired: true
      },
      {
        stepName: '경기용 스타트 연습',
        stepOrder: 6,
        category: '경기기술',
        difficulty: '고급',
        tips: '스타트의 타이밍이 중요합니다',
        estimatedTime: 40,
        isRequired: false
      },
      {
        stepName: '경기용 턴 연습',
        stepOrder: 7,
        category: '경기기술',
        difficulty: '고급',
        tips: '턴의 속도가 중요합니다',
        estimatedTime: 35,
        isRequired: false
      }
    ],
    centerId: 'center001',
    createdBy: 'instructor002',
    isActive: true,
    version: '1.0',
    lastUpdated: new Date()
  }
];

const sampleCenterLevels = [
  {
    centerId: 'center001',
    level: '초급',
    name: '초급',
    description: '수영을 처음 배우는 단계',
    requirements: '수영 경험 없음',
    targetSkills: ['기본 자유형 동작', '25m 완주', '안전한 수영법'],
    estimatedDuration: '3-4개월',
    maxStudents: 12,
    instructorRequirements: '국가수영지도사 자격',
    isActive: true
  },
  {
    centerId: 'center001',
    level: '중급',
    name: '중급',
    description: '기본 수영법을 익힌 후 심화 학습',
    requirements: '자유형 25m 완주 가능',
    targetSkills: ['접영 기본 동작', '50m 완주', '호흡법 완벽 습득'],
    estimatedDuration: '4-6개월',
    maxStudents: 10,
    instructorRequirements: '국가수영지도사 자격 + 3년 이상 경력',
    isActive: true
  },
  {
    centerId: 'center001',
    level: '고급',
    name: '고급',
    description: '고급 기술과 경기 기술 학습',
    requirements: '접영 50m 완주 가능',
    targetSkills: ['평영 고급 기술', '100m 완주', '경기 기술'],
    estimatedDuration: '6-8개월',
    maxStudents: 8,
    instructorRequirements: '국가수영지도사 1급 + 5년 이상 경력',
    isActive: true
  }
];

const sampleBookings = [
  {
    studentId: 'student001',
    instructorId: 'instructor001',
    courseId: 'course001',
    date: '2025-01-22',
    time: '14:00',
    duration: 60,
    status: 'confirmed',
    notes: '초급 자유형 수업',
    centerId: 'center001'
  },
  {
    studentId: 'student002',
    instructorId: 'instructor002',
    courseId: 'course002',
    date: '2025-01-23',
    time: '15:00',
    duration: 60,
    status: 'confirmed',
    notes: '중급 접영 수업',
    centerId: 'center001'
  },
  {
    studentId: 'student003',
    instructorId: 'instructor002',
    courseId: 'course003',
    date: '2025-01-24',
    time: '16:00',
    duration: 60,
    status: 'confirmed',
    notes: '고급 평영 수업',
    centerId: 'center001'
  }
];

const samplePayments = [
  {
    studentId: 'student001',
    courseId: 'course001',
    amount: 180000,
    paymentMethod: 'card',
    status: 'completed',
    paymentDate: '2024-11-01',
    dueDate: '2024-11-01',
    description: '초급 자유형 12회 수업료',
    centerId: 'center001'
  },
  {
    studentId: 'student002',
    courseId: 'course002',
    amount: 240000,
    paymentMethod: 'card',
    status: 'completed',
    paymentDate: '2024-09-15',
    dueDate: '2024-09-15',
    description: '중급 접영 16회 수업료',
    centerId: 'center001'
  },
  {
    studentId: 'student003',
    courseId: 'course003',
    amount: 300000,
    paymentMethod: 'card',
    status: 'completed',
    paymentDate: '2024-07-01',
    dueDate: '2024-07-01',
    description: '고급 평영 20회 수업료',
    centerId: 'center001'
  }
];

async function seedCompleteDatabase() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swim-lab');
    console.log('✅ MongoDB 연결 성공');

    // 기존 샘플 데이터 삭제 (주의: 프로덕션에서는 사용하지 마세요)
    console.log('🗑️ 기존 샘플 데이터 삭제 중...');
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
    await Course.deleteMany({ name: { $in: sampleCourses.map(c => c.name) } });
    await TeachingMethod.deleteMany({ name: { $in: sampleTeachingMethods.map(t => t.name) } });
    await ChecklistTemplate.deleteMany({ name: { $in: sampleChecklistTemplates.map(c => c.name) } });
    await CenterLevel.deleteMany({ centerId: 'center001' });
    await Checklist.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});

    // 사용자 생성
    console.log('👥 사용자 데이터 생성 중...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ ${createdUsers.length}명의 사용자 생성 완료`);

    // 강사와 관리자 ID 매핑
    const instructor1 = createdUsers.find(u => u.email === 'instructor.kim@example.com');
    const instructor2 = createdUsers.find(u => u.email === 'instructor.lee@example.com');
    const centerAdmin = createdUsers.find(u => u.email === 'admin@center.com');
    const superAdmin = createdUsers.find(u => u.email === 'superadmin@swimlab.com');

    // 강의 생성
    console.log('📚 강의 데이터 생성 중...');
    const coursesWithIds = sampleCourses.map(course => ({
      ...course,
      instructorId: course.instructorId === 'instructor001' ? instructor1._id : instructor2._id,
      centerId: centerAdmin.centerId
    }));
    const createdCourses = await Course.insertMany(coursesWithIds);
    console.log(`✅ ${createdCourses.length}개의 강의 생성 완료`);

    // 교수법 생성
    console.log('🏊 교수법 데이터 생성 중...');
    const teachingMethodsWithIds = sampleTeachingMethods.map(method => ({
      ...method,
      centerId: centerAdmin.centerId
    }));
    const createdTeachingMethods = await TeachingMethod.insertMany(teachingMethodsWithIds);
    console.log(`✅ ${createdTeachingMethods.length}개의 교수법 생성 완료`);

    // 센터 레벨 생성
    console.log('🏢 센터 레벨 데이터 생성 중...');
    const centerLevelsWithIds = sampleCenterLevels.map(level => ({
      ...level,
      centerId: centerAdmin.centerId
    }));
    const createdCenterLevels = await CenterLevel.insertMany(centerLevelsWithIds);
    console.log(`✅ ${createdCenterLevels.length}개의 센터 레벨 생성 완료`);

    // 체크리스트 템플릿 생성
    console.log('📋 체크리스트 템플릿 생성 중...');
    const checklistTemplatesWithIds = sampleChecklistTemplates.map(template => ({
      ...template,
      centerId: centerAdmin.centerId,
      createdBy: template.createdBy === 'instructor001' ? instructor1._id : instructor2._id
    }));
    const createdChecklistTemplates = await ChecklistTemplate.insertMany(checklistTemplatesWithIds);
    console.log(`✅ ${createdChecklistTemplates.length}개의 체크리스트 템플릿 생성 완료`);

    // 학생별 체크리스트 생성
    console.log('📝 학생별 체크리스트 생성 중...');
    const students = createdUsers.filter(u => u.userType === 'student');
    const checklists = [];

    for (const student of students) {
      const course = createdCourses.find(c => c.level === student.currentLevel) || createdCourses[0];
      const template = createdChecklistTemplates.find(t => t.level === student.currentLevel) || createdChecklistTemplates[0];
      
      if (template) {
        // 진행률에 따라 체크리스트 항목 완료 상태 설정
        const progressPercentage = student.progress / 100;
        const totalItems = template.items.length;
        const completedItems = Math.floor(totalItems * progressPercentage);
        
        const checklist = {
          studentId: student._id,
          courseId: course._id,
          instructorId: course.instructorId,
          teachingMethodId: createdTeachingMethods.find(t => t.level === student.currentLevel)?._id || createdTeachingMethods[0]._id,
          items: template.items.map((item, index) => ({
            ...item,
            isCompleted: index < completedItems,
            completedAt: index < completedItems ? new Date(Date.now() - (completedItems - index) * 24 * 60 * 60 * 1000) : null,
            instructorNotes: index < completedItems ? `${item.stepName} 완료! 잘하고 있습니다.` : '',
            instructorComment: index < completedItems ? '훌륭합니다!' : '',
            commentDate: index < completedItems ? new Date(Date.now() - (completedItems - index) * 24 * 60 * 60 * 1000) : null
          })),
          overallProgress: student.progress,
          lastUpdated: new Date(),
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
          status: 'active',
          notes: `${student.name}의 ${course.name} 학습 체크리스트`,
          targetCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90일 후
        };
        checklists.push(checklist);
      }
    }

    if (checklists.length > 0) {
      await Checklist.insertMany(checklists);
      console.log(`✅ ${checklists.length}개의 체크리스트 생성 완료`);
    }

    // 예약 데이터 생성
    console.log('📅 예약 데이터 생성 중...');
    const bookingsWithIds = sampleBookings.map(booking => ({
      ...booking,
      studentId: createdUsers.find(u => u.email.includes('student'))?._id,
      instructorId: createdUsers.find(u => u.userType === 'instructor')?._id,
      courseId: createdCourses[0]._id,
      centerId: centerAdmin.centerId
    }));
    const createdBookings = await Booking.insertMany(bookingsWithIds);
    console.log(`✅ ${createdBookings.length}개의 예약 생성 완료`);

    // 결제 데이터 생성
    console.log('💰 결제 데이터 생성 중...');
    const paymentsWithIds = samplePayments.map(payment => ({
      ...payment,
      studentId: createdUsers.find(u => u.email.includes('student'))?._id,
      courseId: createdCourses[0]._id,
      centerId: centerAdmin.centerId
    }));
    const createdPayments = await Payment.insertMany(paymentsWithIds);
    console.log(`✅ ${createdPayments.length}개의 결제 생성 완료`);

    // 학생 정보 업데이트 (강의 ID 연결)
    console.log('🔗 학생-강의 연결 중...');
    for (const student of students) {
      const course = createdCourses.find(c => c.level === student.currentLevel) || createdCourses[0];
      await User.findByIdAndUpdate(student._id, {
        courseId: course._id,
        courseName: course.name
      });
    }
    console.log('✅ 학생-강의 연결 완료');

    console.log('\n🎉 완벽한 샘플 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 사용자: ${createdUsers.length}명 (학생: ${students.length}명, 강사: 2명, 관리자: 2명)`);
    console.log(`   - 강의: ${createdCourses.length}개`);
    console.log(`   - 교수법: ${createdTeachingMethods.length}개`);
    console.log(`   - 센터 레벨: ${createdCenterLevels.length}개`);
    console.log(`   - 체크리스트 템플릿: ${createdChecklistTemplates.length}개`);
    console.log(`   - 체크리스트: ${checklists.length}개`);
    console.log(`   - 예약: ${createdBookings.length}개`);
    console.log(`   - 결제: ${createdPayments.length}개`);

    console.log('\n🔑 테스트 계정 정보:');
    console.log(`   - 강사1: ${instructor1.email} (${instructor1.name})`);
    console.log(`   - 강사2: ${instructor2.email} (${instructor2.name})`);
    console.log(`   - 센터관리자: ${centerAdmin.email} (${centerAdmin.name})`);
    console.log(`   - 총관리자: ${superAdmin.email} (${superAdmin.name})`);
    console.log(`   - 학생들: ${students.map(s => `${s.name}(${s.email})`).join(', ')}`);

  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
if (require.main === module) {
  seedCompleteDatabase();
}

module.exports = { seedCompleteDatabase };


