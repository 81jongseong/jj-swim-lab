const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');

// 간단한 샘플 데이터
const sampleUsers = [
  // === 강사들 ===
  {
    name: '김수영',
    email: 'kim.instructor@jjswimlab.com',
    password: '$2a$12$nw3xshyzyYLdukrKDdhx6eC8HQVnqs2BzVXvRciB1Bk6mc6gn.oFW', // 101010
    phone: '010-1234-5678',
    userType: 'instructor',
    instructorInfo: {
      experience: '8년',
      certifications: ['수영지도사 2급', '생명구조원'],
      specialties: ['자유형', '배영', '평영'],
      instructorLevel: 'senior',
      maxStudents: 25,
      currentStudents: 0
    }
  },
  {
    name: '이강사',
    email: 'lee.instructor@jjswimlab.com',
    password: '$2a$12$nw3xshyzyYLdukrKDdhx6eC8HQVnqs2BzVXvRciB1Bk6mc6gn.oFW', // 101010
    phone: '010-2345-6789',
    userType: 'instructor',
    instructorInfo: {
      experience: '5년',
      certifications: ['수영지도사 3급'],
      specialties: ['접영', '혼영'],
      instructorLevel: 'junior',
      maxStudents: 20,
      currentStudents: 0
    }
  },
  {
    name: '박초보',
    email: 'park.instructor@jjswimlab.com',
    password: '$2a$12$nw3xshyzyYLdukrKDdhx6eC8HQVnqs2BzVXvRciB1Bk6mc6gn.oFW', // 101010
    phone: '010-3456-7890',
    userType: 'instructor',
    instructorInfo: {
      experience: '2년',
      certifications: ['수영지도사 3급'],
      specialties: ['기초 수영'],
      instructorLevel: 'junior',
      maxStudents: 15,
      currentStudents: 0
    }
  },
  
  // === 학생들 ===
  {
    name: '김학생',
    email: 'kim.student@jjswimlab.com',
    password: '$2a$12$nw3xshyzyYLdukrKDdhx6eC8HQVnqs2BzVXvRciB1Bk6mc6gn.oFW', // 101010
    phone: '010-1111-1111',
    userType: 'student',
    studentInfo: {
      age: 25,
      emergencyContact: '010-9999-9999',
      medicalConditions: '',
      swimmingLevel: 'beginner',
      currentLevel: '초급'
    }
  },
  {
    name: '이학생',
    email: 'lee.student@jjswimlab.com',
    password: '$2a$12$nw3xshyzyYLdukrKDdhx6eC8HQVnqs2BzVXvRciB1Bk6mc6gn.oFW', // 101010
    phone: '010-2222-2222',
    userType: 'student',
    studentInfo: {
      age: 30,
      emergencyContact: '010-8888-8888',
      medicalConditions: '',
      swimmingLevel: 'intermediate',
      currentLevel: '중급'
    }
  },
  {
    name: '박학생',
    email: 'park.student@jjswimlab.com',
    password: '$2a$12$nw3xshyzyYLdukrKDdhx6eC8HQVnqs2BzVXvRciB1Bk6mc6gn.oFW', // 101010
    phone: '010-3333-3333',
    userType: 'student',
    studentInfo: {
      age: 28,
      emergencyContact: '010-7777-7777',
      medicalConditions: '',
      swimmingLevel: 'advanced',
      currentLevel: '고급'
    }
  }
];

async function seedSimpleUsers() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    // 기존 샘플 데이터 삭제
    console.log('🗑️ 기존 샘플 데이터 삭제 중...');
    await User.deleteMany({
      email: { $in: sampleUsers.map(u => u.email) }
    });
    console.log('✅ 기존 데이터 삭제 완료');
    
    // 새 사용자 데이터 생성
    console.log('👥 사용자 데이터 생성 중...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ ${createdUsers.length}명의 사용자 생성 완료`);
    
    // 생성된 사용자 정보 출력
    createdUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.userType}`);
    });
    
    console.log('\n🎉 시드 데이터 생성 완료!');
    
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error.message);
  } finally {
    // MongoDB 연결 해제
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
seedSimpleUsers();

