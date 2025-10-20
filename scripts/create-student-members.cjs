/**
 * 학생 회원 샘플 데이터 생성 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function createStudentMembers() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 스키마 정의 (간단 버전)
    const swimmingCenterSchema = new mongoose.Schema({}, { strict: false });
    const SwimmingCenter = mongoose.models.SwimmingCenter || mongoose.model('SwimmingCenter', swimmingCenterSchema);
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // center@swim.com 관리자가 관리하는 센터 찾기
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    
    if (!centerAdmin || !centerAdmin.centerAdminInfo?.managedCenters || centerAdmin.centerAdminInfo.managedCenters.length === 0) {
      console.log('❌ center@swim.com 관리자를 찾을 수 없거나 관리하는 센터가 없습니다.');
      return;
    }
    
    const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
    console.log('🏢 센터 관리자:', centerAdmin.email);
    console.log('🏢 관리 센터 ID:', centerId);
    
    const center = await SwimmingCenter.findById(centerId);
    console.log('🏢 센터:', center?.name, '(ID:', center?._id, ')');

    // 강사 찾기 (담당 강사로 배정)
    const instructors = await User.find({
      centerId: centerId,
      userType: 'instructor'
    });
    
    console.log(`👨‍🏫 강사 ${instructors.length}명 찾음`);

    // 학생 데이터
    const studentData = [
      { name: '김수영', email: 'kim.swim@example.com', phone: '010-1111-2222', level: '초급' },
      { name: '이영희', email: 'lee.young@example.com', phone: '010-2222-3333', level: '중급' },
      { name: '박철수', email: 'park.chul@example.com', phone: '010-3333-4444', level: '초급' },
      { name: '정민수', email: 'jung.min@example.com', phone: '010-4444-5555', level: '고급' },
      { name: '최지혜', email: 'choi.ji@example.com', phone: '010-5555-6666', level: '중급' },
      { name: '강동원', email: 'kang.dong@example.com', phone: '010-6666-7777', level: '초급' },
      { name: '윤서아', email: 'yoon.seo@example.com', phone: '010-7777-8888', level: '중급' },
      { name: '임준호', email: 'lim.jun@example.com', phone: '010-8888-9999', level: '초급' },
      { name: '한소희', email: 'han.so@example.com', phone: '010-9999-0000', level: '고급' },
      { name: '송혜교', email: 'song.hye@example.com', phone: '010-0000-1111', level: '중급' }
    ];

    // 기본 비밀번호 해시 (password123의 bcrypt 해시)
    const hashedPassword = '$2b$10$HqKRvFI/EcT7wuwrp5bRqO0Hlo0w7HkkPdmvnX65v7ZQrZ70z7xGm';
    
    const students = [];
    for (let i = 0; i < studentData.length; i++) {
      const data = studentData[i];
      const assignedInstructor = instructors.length > 0 
        ? instructors[i % instructors.length]._id 
        : null;
      
      students.push({
        userId: `student-${Date.now()}-${i}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        userType: 'student',
        centerId: centerId,
        isActive: Math.random() > 0.2, // 80% 활성
        studentInfo: {
          age: Math.floor(Math.random() * 40) + 10,
          currentLevel: data.level,
          swimmingLevel: data.level === '초급' ? 'beginner' : data.level === '중급' ? 'intermediate' : 'advanced',
          instructorId: assignedInstructor,
          centerMemo: '',
          status: Math.random() > 0.2 ? 'active' : 'inactive',
          enrolledCourses: [],
          completedCourses: []
        },
        permissions: {
          canViewCourses: true,
          canBookClasses: true,
          canViewProgress: true
        },
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // 0-90일 전
      });
    }

    // 기존 학생 삭제 (이메일 중복 방지)
    const emails = studentData.map(s => s.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('🗑️ 기존 학생 데이터 삭제 완료');

    // 학생 생성
    const createdStudents = await User.insertMany(students);
    console.log(`✅ 학생 회원 ${createdStudents.length}명 생성 완료`);
    
    // 생성된 학생 통계
    const activeCount = createdStudents.filter(s => s.isActive).length;
    const thisMonth = createdStudents.filter(s => {
      const createdDate = new Date(s.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length;
    
    console.log('\n📊 생성된 학생 통계:');
    console.log(`   - 총 학생: ${createdStudents.length}명`);
    console.log(`   - 활성 학생: ${activeCount}명`);
    console.log(`   - 이번 달 가입: ${thisMonth}명`);
    console.log('\n✅ 이제 scripts/create-lesson-tickets.cjs를 실행하세요!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB 연결 종료');
  }
}

createStudentMembers();

