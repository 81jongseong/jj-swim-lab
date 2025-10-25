// MongoDB Atlas에 회원 정보 생성 (1단계)
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB Atlas 연결 시도...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas 연결 성공');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // center@swim.com 계정 정보 확인
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    const centerId = centerAdmin?.centerId;
    
    if (!centerId) {
      console.log('❌ 센터 ID를 찾을 수 없습니다.');
      mongoose.disconnect();
      return;
    }
    
    console.log('🔍 센터 ID:', centerId);
    
    // 1. 회원 정보 생성
    const members = [
      {
        name: '김철수',
        email: 'kim.student@example.com',
        phone: '010-1111-2222',
        userType: 'student',
        centerId: centerId,
        studentInfo: {
          level: 'beginner',
          emergencyContact: '010-1111-2223',
          medicalInfo: '없음',
          swimmingExperience: '초보자',
          preferredTimes: ['저녁'],
          goals: ['자유형 배우기']
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '이영희',
        email: 'lee.student@example.com',
        phone: '010-2222-3333',
        userType: 'student',
        centerId: centerId,
        studentInfo: {
          level: 'beginner',
          emergencyContact: '010-2222-3334',
          medicalInfo: '없음',
          swimmingExperience: '초보자',
          preferredTimes: ['저녁'],
          goals: ['자유형 배우기']
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '박민수',
        email: 'park.student@example.com',
        phone: '010-3333-4444',
        userType: 'student',
        centerId: centerId,
        studentInfo: {
          level: 'intermediate',
          emergencyContact: '010-3333-4445',
          medicalInfo: '무릎 부상 이력',
          swimmingExperience: '1년',
          preferredTimes: ['저녁'],
          goals: ['배영 완성하기']
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '최지영',
        email: 'choi.student@example.com',
        phone: '010-4444-5555',
        userType: 'student',
        centerId: centerId,
        studentInfo: {
          level: 'intermediate',
          emergencyContact: '010-4444-5556',
          medicalInfo: '없음',
          swimmingExperience: '1년',
          preferredTimes: ['저녁'],
          goals: ['배영 완성하기']
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '정현우',
        email: 'jung.student@example.com',
        phone: '010-5555-6666',
        userType: 'student',
        centerId: centerId,
        studentInfo: {
          level: 'advanced',
          emergencyContact: '010-5555-6667',
          medicalInfo: '없음',
          swimmingExperience: '3년',
          preferredTimes: ['저녁'],
          goals: ['접영 마스터하기']
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '한소영',
        email: 'han.student@example.com',
        phone: '010-6666-7777',
        userType: 'student',
        centerId: centerId,
        studentInfo: {
          level: 'advanced',
          emergencyContact: '010-6666-7778',
          medicalInfo: '없음',
          swimmingExperience: '3년',
          preferredTimes: ['저녁'],
          goals: ['접영 마스터하기']
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      }
    ];
    
    // 기존 회원 삭제
    await User.deleteMany({ userType: 'student', centerId: centerId });
    console.log('🗑️ 기존 회원 데이터 삭제 완료');
    
    // 새 회원 생성
    const createdMembers = await User.insertMany(members);
    console.log('✅ 회원 6명 생성 완료:', createdMembers.map(m => m.name));
    
    // 결과 확인
    console.log('\n📊 생성된 회원 목록:');
    createdMembers.forEach(member => {
      console.log(`- ${member.name}: ${member.email}, 레벨 ${member.studentInfo?.level}, 목표 ${member.studentInfo?.goals?.join(', ')}`);
    });
    
    console.log('\n🎉 회원 생성 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



