const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');
const { SwimmingCenter } = require('../dist/models/SwimmingCenter');

async function seedComprehensiveUsers() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공!');

    // 기존 데이터 정리
    console.log('🧹 기존 사용자 데이터 정리 중...');
    await User.deleteMany({});
    await SwimmingCenter.deleteMany({});
    console.log('✅ 기존 데이터 정리 완료!');

    // 센터 생성
    console.log('🏢 센터 생성 중...');
    const center = new SwimmingCenter({
      name: 'JJ Swim Lab 강남점',
      address: '서울시 강남구 테헤란로 123',
      location: {
        type: 'Point',
        coordinates: [126.9780, 37.5665] // [longitude, latitude]
      },
      phone: '02-1234-5678',
      email: 'gangnam@jjswimlab.com',
      description: '전문적인 수영 교육을 제공하는 프리미엄 수영장',
      introduction: 'JJ Swim Lab 강남점은 체계적이고 과학적인 수영 교육을 통해 모든 연령대의 수영 실력을 향상시키는 것을 목표로 합니다. 경험丰富的한 강사진과 최신 시설을 갖춘 프리미엄 수영 교육 센터입니다.',
      guide: '1. 수강 신청: 온라인 또는 방문 접수\n2. 레벨 테스트: 첫 수업 시 무료 레벨 테스트 진행\n3. 수업 진행: 개인별 맞춤형 커리큘럼으로 진행\n4. 진도 관리: 정기적인 진도 체크 및 피드백 제공\n5. 안전 관리: 모든 수업에서 안전을 최우선으로 합니다.',
      facilities: {
        lanes: 8,
        poolLength: 25,
        poolDepth: 1.5,
        temperature: 28,
        hasSauna: true,
        hasShower: true,
        hasLocker: true
      },
      operatingHours: {
        monday: { open: '06:00', close: '22:00', isOpen: true },
        tuesday: { open: '06:00', close: '22:00', isOpen: true },
        wednesday: { open: '06:00', close: '22:00', isOpen: true },
        thursday: { open: '06:00', close: '22:00', isOpen: true },
        friday: { open: '06:00', close: '22:00', isOpen: true },
        saturday: { open: '08:00', close: '20:00', isOpen: true },
        sunday: { open: '08:00', close: '20:00', isOpen: true }
      },
      pricing: {
        freeSwim: {
          adult: 15000,
          child: 10000,
          student: 12000
        },
        lesson: {
          perSession: 50000,
          monthly: 200000
        }
      },
      maxCapacity: 100,
      currentCapacity: 0,
      isActive: true
    });

    await center.save();
    console.log('✅ 센터 생성 완료!');

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash('101010', 10);

    // 센터 관리자 생성
    console.log('👨‍💼 센터 관리자 생성 중...');
    const centerAdmin = new User({
      userId: 'center',
      name: '센터 관리자',
      email: 'center@jjswimlab.com',
      password: hashedPassword,
      phone: '010-1234-5678',
      userType: 'centerAdmin',
      centerAdminInfo: {
        managedCenters: [center._id],
        permissions: ['userManagement', 'instructorManagement', 'centerInfoManagement']
      },
      accessPermissions: {
        dashboard: true,
        courses: true,
        bookings: true,
        payments: true,
        notices: true,
        progress: true,
        evaluations: true,
        reports: true,
        userManagement: true,
        systemSettings: true,
        aiConfigManagement: false
      },
      isActive: true
    });

    await centerAdmin.save();
    console.log('✅ 센터 관리자 생성 완료!');

    // 강사들 생성
    console.log('👨‍🏫 강사들 생성 중...');
    const instructors = [
      {
        userId: 'teacher',
        name: '김수영',
        email: 'teacher@jjswimlab.com',
        phone: '010-1111-2222',
        instructorLevel: 'senior',
        specialties: ['자유형', '배영', '평영'],
        experience: 8,
        maxStudents: 25
      },
      {
        userId: 'IN_002',
        name: '이강사',
        email: 'lee@jjswimlab.com',
        phone: '010-2222-3333',
        instructorLevel: 'senior',
        specialties: ['접영', '혼영'],
        experience: 5,
        maxStudents: 20
      },
      {
        userId: 'IN_003',
        name: '박초보',
        email: 'park@jjswimlab.com',
        phone: '010-3333-4444',
        instructorLevel: 'junior',
        specialties: ['기초 수영'],
        experience: 2,
        maxStudents: 15
      },
      {
        userId: 'IN_004',
        name: '최마스터',
        email: 'choi@jjswimlab.com',
        phone: '010-4444-5555',
        instructorLevel: 'master',
        specialties: ['자유형', '배영', '평영', '접영', '혼영'],
        experience: 12,
        maxStudents: 30
      }
    ];

    const createdInstructors = [];
    for (const instructorData of instructors) {
      const instructor = new User({
        ...instructorData,
        password: hashedPassword,
        userType: 'instructor',
        instructorInfo: {
          experience: instructorData.experience + '년',
          certifications: ['수영지도사 2급', '생명구조원'],
          specialties: instructorData.specialties,
          instructorLevel: instructorData.instructorLevel,
          assignedCenters: [center._id],
          maxStudents: instructorData.maxStudents,
          currentStudents: 0
        },
        accessPermissions: {
          dashboard: true,
          courses: true,
          bookings: true,
          payments: false,
          notices: true,
          progress: true,
          evaluations: true,
          reports: true,
          userManagement: false,
          systemSettings: false,
          aiConfigManagement: false
        },
        isActive: true
      });

      await instructor.save();
      createdInstructors.push(instructor);
      console.log(`✅ 강사 ${instructorData.name} 생성 완료!`);
    }

    // 학생들 생성
    console.log('👨‍🎓 학생들 생성 중...');
    const students = [
      {
        userId: 'member',
        name: '김학생',
        email: 'member@jjswimlab.com',
        phone: '010-5555-6666',
        age: 25,
        level: '초급',
        assignedInstructor: createdInstructors[2]._id // 박초보 강사
      },
      {
        userId: 'ST_002',
        name: '이학생',
        email: 'student2@example.com',
        phone: '010-6666-7777',
        age: 30,
        level: '중급',
        assignedInstructor: createdInstructors[1]._id // 이강사
      },
      {
        userId: 'ST_003',
        name: '박학생',
        email: 'student3@example.com',
        phone: '010-7777-8888',
        age: 22,
        level: '고급',
        assignedInstructor: createdInstructors[0]._id // 김수영 강사
      },
      {
        userId: 'ST_004',
        name: '최학생',
        email: 'student4@example.com',
        phone: '010-8888-9999',
        age: 28,
        level: '초급',
        assignedInstructor: createdInstructors[2]._id // 박초보 강사
      },
      {
        userId: 'ST_005',
        name: '정학생',
        email: 'student5@example.com',
        phone: '010-9999-0000',
        age: 35,
        level: '중급',
        assignedInstructor: createdInstructors[1]._id // 이강사
      },
      {
        userId: 'ST_006',
        name: '한학생',
        email: 'student6@example.com',
        phone: '010-0000-1111',
        age: 26,
        level: '고급',
        assignedInstructor: createdInstructors[3]._id // 최마스터 강사
      },
      {
        userId: 'ST_007',
        name: '윤학생',
        email: 'student7@example.com',
        phone: '010-1111-0000',
        age: 24,
        level: '초급',
        assignedInstructor: createdInstructors[2]._id // 박초보 강사
      },
      {
        userId: 'ST_008',
        name: '서학생',
        email: 'student8@example.com',
        phone: '010-2222-1111',
        age: 32,
        level: '중급',
        assignedInstructor: createdInstructors[0]._id // 김수영 강사
      }
    ];

    const createdStudents = [];
    for (const studentData of students) {
      const student = new User({
        ...studentData,
        password: hashedPassword,
        userType: 'student',
        studentInfo: {
          age: studentData.age,
          level: studentData.level,
          assignedInstructor: studentData.assignedInstructor,
          centerId: center._id,
          emergencyContact: '010-0000-0000',
          medicalConditions: '',
          goals: ['수영 실력 향상', '건강 관리']
        },
        accessPermissions: {
          dashboard: true,
          courses: true,
          bookings: true,
          payments: true,
          notices: true,
          progress: true,
          evaluations: false,
          reports: false,
          userManagement: false,
          systemSettings: false,
          aiConfigManagement: false
        },
        isActive: true
      });

      await student.save();
      createdStudents.push(student);
      console.log(`✅ 학생 ${studentData.name} 생성 완료!`);
    }

    // 센터에 사용자들 연결
    console.log('🔗 센터에 사용자들 연결 중...');
    center.admins = [centerAdmin._id];
    center.instructors = createdInstructors.map(i => i._id);
    center.students = createdStudents.map(s => s._id);
    await center.save();

    // 강사별 현재 학생 수 업데이트
    for (const instructor of createdInstructors) {
      const studentCount = createdStudents.filter(s => 
        s.studentInfo && s.studentInfo.assignedInstructor && 
        s.studentInfo.assignedInstructor.toString() === instructor._id.toString()
      ).length;
      
      instructor.instructorInfo.currentStudents = studentCount;
      await instructor.save();
    }

    console.log('✅ 모든 사용자 데이터 생성 완료!');
    console.log('\n📊 생성된 데이터 요약:');
    console.log(`- 센터: 1개 (${center.name})`);
    console.log(`- 센터 관리자: 1명 (${centerAdmin.name})`);
    console.log(`- 강사: ${createdInstructors.length}명`);
    console.log(`- 학생: ${createdStudents.length}명`);
    console.log('\n🔑 로그인 정보:');
    console.log('센터 관리자: center@jjswimlab.com / 101010');
    console.log('강사: teacher@jjswimlab.com / 101010');
    console.log('학생: member@jjswimlab.com / 101010');

  } catch (error) {
    console.error('❌ 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

// 스크립트 실행
if (require.main === module) {
  seedComprehensiveUsers();
}

module.exports = { seedComprehensiveUsers };
