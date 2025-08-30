const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Checklist = require('../src/models/Checklist');
const ChecklistTemplate = require('../src/models/ChecklistTemplate');
const TeachingMethod = require('../src/models/TeachingMethod');

// 샘플 데이터
const sampleUsers = [
  {
    name: '김수영',
    email: 'kim.swim@example.com',
    phone: '010-1234-5678',
    userType: 'student',
    currentLevel: '초급',
    progress: 60,
    lastLesson: '2025-01-20',
    nextLesson: '2025-01-22',
    attendance: 8,
    totalLessons: 10,
    centerId: 'center001',
    instructorId: 'instructor001'
  },
  {
    name: '이영희',
    email: 'lee.young@example.com',
    phone: '010-2345-6789',
    userType: 'student',
    currentLevel: '중급',
    progress: 80,
    lastLesson: '2025-01-19',
    nextLesson: '2025-01-23',
    attendance: 12,
    totalLessons: 15,
    centerId: 'center001',
    instructorId: 'instructor001'
  },
  {
    name: '박철수',
    email: 'park.chul@example.com',
    phone: '010-3456-7890',
    userType: 'student',
    currentLevel: '고급',
    progress: 90,
    lastLesson: '2025-01-18',
    nextLesson: '2025-01-24',
    attendance: 20,
    totalLessons: 25,
    centerId: 'center001',
    instructorId: 'instructor001'
  },
  {
    name: '최민수',
    email: 'choi.min@example.com',
    phone: '010-4567-8901',
    userType: 'student',
    currentLevel: '초급',
    progress: 40,
    lastLesson: '2025-01-17',
    nextLesson: '2025-01-21',
    attendance: 6,
    totalLessons: 8,
    centerId: 'center001',
    instructorId: 'instructor001'
  },
  {
    name: '강사김',
    email: 'instructor.kim@example.com',
    phone: '010-1111-2222',
    userType: 'instructor',
    centerId: 'center001',
    specializations: ['자유형', '접영'],
    experience: 5
  },
  {
    name: '센터관리자',
    email: 'admin@center.com',
    phone: '010-9999-8888',
    userType: 'centerAdmin',
    centerId: 'center001'
  }
];

const sampleCourses = [
  {
    name: '초급 자유형',
    description: '자유형 기초를 배우는 과정',
    level: '초급',
    duration: 10,
    price: 150000,
    centerId: 'center001',
    instructorId: 'instructor001',
    maxStudents: 8
  },
  {
    name: '중급 접영',
    description: '접영 중급 과정',
    level: '중급',
    duration: 15,
    price: 200000,
    centerId: 'center001',
    instructorId: 'instructor001',
    maxStudents: 6
  },
  {
    name: '고급 평영',
    description: '평영 고급 과정',
    level: '고급',
    duration: 20,
    price: 250000,
    centerId: 'center001',
    instructorId: 'instructor001',
    maxStudents: 4
  }
];

const sampleTeachingMethods = [
  {
    name: '자유형 기본 동작',
    description: '자유형의 기본 자세와 동작 연습',
    level: '초급',
    category: '자유형',
    difficulty: '초급',
    steps: [
      '발차기 연습',
      '팔 돌리기 연습',
      '호흡법 연습',
      '전체 동작 연결'
    ],
    tips: '천천히 정확한 자세로 연습하세요',
    centerId: 'center001'
  },
  {
    name: '접영 기본 동작',
    description: '접영의 기본 자세와 동작 연습',
    level: '중급',
    category: '접영',
    difficulty: '중급',
    steps: [
      '다리 동작 연습',
      '팔 동작 연습',
      '호흡 타이밍',
      '전체 동작 연결'
    ],
    tips: '다리와 팔의 동작을 동시에 연습하세요',
    centerId: 'center001'
  }
];

const sampleChecklistTemplates = [
  {
    name: '초급 자유형 체크리스트',
    level: '초급',
    category: '자유형',
    description: '초급 자유형 학습 과정 체크리스트',
    items: [
      {
        stepName: '자유형 기본 동작 연습',
        stepOrder: 1,
        category: '기본동작',
        difficulty: '초급',
        tips: '천천히 정확한 자세로 연습하세요'
      },
      {
        stepName: '호흡법 숙지',
        stepOrder: 2,
        category: '호흡',
        difficulty: '초급',
        tips: '물속에서 코로 내쉬고 입으로 들이마시세요'
      },
      {
        stepName: '25m 완주',
        stepOrder: 3,
        category: '거리',
        difficulty: '초급',
        tips: '무리하지 말고 천천히 완주하세요'
      },
      {
        stepName: '기술 평가',
        stepOrder: 4,
        category: '평가',
        difficulty: '초급',
        tips: '기본 동작이 완벽해질 때까지 연습하세요'
      }
    ],
    centerId: 'center001',
    createdBy: 'instructor001',
    isActive: true
  },
  {
    name: '중급 접영 체크리스트',
    level: '중급',
    category: '접영',
    description: '중급 접영 학습 과정 체크리스트',
    items: [
      {
        stepName: '접영 다리 동작',
        stepOrder: 1,
        category: '다리동작',
        difficulty: '중급',
        tips: '다리를 동시에 움직여야 합니다'
      },
      {
        stepName: '접영 팔 동작',
        stepOrder: 2,
        category: '팔동작',
        difficulty: '중급',
        tips: '팔을 번갈아가며 움직이세요'
      },
      {
        stepName: '호흡 타이밍',
        stepOrder: 3,
        category: '호흡',
        difficulty: '중급',
        tips: '팔을 들 때 호흡하세요'
      },
      {
        stepName: '전체 동작 연결',
        stepOrder: 4,
        category: '연결',
        difficulty: '중급',
        tips: '모든 동작을 부드럽게 연결하세요'
      }
    ],
    centerId: 'center001',
    createdBy: 'instructor001',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swim-lab');
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 삭제 (주의: 프로덕션에서는 사용하지 마세요)
    console.log('🗑️ 기존 샘플 데이터 삭제 중...');
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
    await Course.deleteMany({ name: { $in: sampleCourses.map(c => c.name) } });
    await TeachingMethod.deleteMany({ name: { $in: sampleTeachingMethods.map(t => t.name) } });
    await ChecklistTemplate.deleteMany({ name: { $in: sampleChecklistTemplates.map(c => c.name) } });

    // 사용자 생성
    console.log('👥 사용자 데이터 생성 중...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ ${createdUsers.length}명의 사용자 생성 완료`);

    // 강사 ID 매핑
    const instructor = createdUsers.find(u => u.userType === 'instructor');
    const centerAdmin = createdUsers.find(u => u.userType === 'centerAdmin');

    // 강의 생성
    console.log('📚 강의 데이터 생성 중...');
    const coursesWithIds = sampleCourses.map(course => ({
      ...course,
      instructorId: instructor._id,
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

    // 체크리스트 템플릿 생성
    console.log('📋 체크리스트 템플릿 생성 중...');
    const checklistTemplatesWithIds = sampleChecklistTemplates.map(template => ({
      ...template,
      centerId: centerAdmin.centerId,
      createdBy: instructor._id
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
        const checklist = {
          studentId: student._id,
          courseId: course._id,
          instructorId: instructor._id,
          teachingMethodId: createdTeachingMethods[0]._id,
          items: template.items.map(item => ({
            ...item,
            isCompleted: Math.random() > 0.5, // 랜덤하게 완료 상태 설정
            completedAt: Math.random() > 0.5 ? new Date() : null
          })),
          overallProgress: student.progress,
          lastUpdated: new Date(),
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
          status: 'active',
          notes: `${student.name}의 ${course.name} 학습 체크리스트`
        };
        checklists.push(checklist);
      }
    }

    if (checklists.length > 0) {
      await Checklist.insertMany(checklists);
      console.log(`✅ ${checklists.length}개의 체크리스트 생성 완료`);
    }

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

    console.log('\n🎉 샘플 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 사용자: ${createdUsers.length}명`);
    console.log(`   - 강의: ${createdCourses.length}개`);
    console.log(`   - 교수법: ${createdTeachingMethods.length}개`);
    console.log(`   - 체크리스트 템플릿: ${createdChecklistTemplates.length}개`);
    console.log(`   - 체크리스트: ${checklists.length}개`);

  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };


