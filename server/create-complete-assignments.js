// 서버의 MongoDB 연결을 사용하여 데이터 생성
const mongoose = require('mongoose');

// 서버의 환경 변수 로드
require('dotenv').config();

// MongoDB 연결 (서버와 동일한 설정 사용)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jjswimlab:jjswimlab123@jj-swim-lab.8vxqk.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB Atlas 연결 시도...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas 연결 성공');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    const PersonalLesson = mongoose.model('PersonalLesson', new mongoose.Schema({}, { strict: false }));
    
    // center@swim.com 계정 정보 확인
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    const centerId = centerAdmin?.centerId;
    
    if (!centerId) {
      console.log('❌ 센터 ID를 찾을 수 없습니다.');
      mongoose.disconnect();
      return;
    }
    
    console.log('🔍 센터 ID:', centerId);
    
    // 1. 강사 생성
    const instructors = [
      {
        name: '김수영',
        email: 'kim.instructor@example.com',
        phone: '010-1111-2222',
        userType: 'instructor',
        centerId: centerId,
        instructorInfo: {
          experience: 5,
          specialties: ['자유형', '배영', '개인레슨'],
          certifications: ['수영지도사 1급', '생존수영지도사'],
          rating: 4.8
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '박수영',
        email: 'park.instructor@example.com',
        phone: '010-3333-4444',
        userType: 'instructor',
        centerId: centerId,
        instructorInfo: {
          experience: 3,
          specialties: ['평영', '접영', '단체반'],
          certifications: ['수영지도사 2급'],
          rating: 4.6
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '이수영',
        email: 'lee.instructor@example.com',
        phone: '010-5555-6666',
        userType: 'instructor',
        centerId: centerId,
        instructorInfo: {
          experience: 7,
          specialties: ['자유형', '배영', '접영', '개인레슨'],
          certifications: ['수영지도사 1급', '생존수영지도사', '수상안전지도사'],
          rating: 4.9
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      }
    ];
    
    // 기존 강사 삭제
    await User.deleteMany({ userType: 'instructor', centerId: centerId });
    console.log('🗑️ 기존 강사 데이터 삭제 완료');
    
    // 새 강사 생성
    const createdInstructors = await User.insertMany(instructors);
    console.log('✅ 강사 3명 생성 완료:', createdInstructors.map(i => i.name));
    
    // 2. 강습 과정 생성
    const courses = [
      {
        name: '초급 자유형 기초반',
        description: '자유형 기초를 배우는 초급자 대상 반',
        level: 'beginner',
        maxStudents: 8,
        currentStudents: 0,
        price: 80000,
        instructorId: createdInstructors[0]._id,
        instructorName: createdInstructors[0].name,
        centerId: centerId,
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        enrolledStudents: [],
        schedule: {
          days: ['월', '수', '금'],
          time: '19:00-20:00'
        },
        lanes: [1, 2],
        poolType: 'mainPool'
      },
      {
        name: '중급 배영 완성반',
        description: '배영을 완성하는 중급자 대상 반',
        level: 'intermediate',
        maxStudents: 6,
        currentStudents: 0,
        price: 90000,
        instructorId: createdInstructors[1]._id,
        instructorName: createdInstructors[1].name,
        centerId: centerId,
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        enrolledStudents: [],
        schedule: {
          days: ['화', '목'],
          time: '20:00-21:00'
        },
        lanes: [3, 4],
        poolType: 'mainPool'
      },
      {
        name: '고급 접영 마스터반',
        description: '접영을 마스터하는 고급자 대상 반',
        level: 'advanced',
        maxStudents: 4,
        currentStudents: 0,
        price: 100000,
        instructorId: createdInstructors[2]._id,
        instructorName: createdInstructors[2].name,
        centerId: centerId,
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        enrolledStudents: [],
        schedule: {
          days: ['월', '수', '금'],
          time: '21:00-22:00'
        },
        lanes: [5, 6],
        poolType: 'mainPool'
      }
    ];
    
    // 기존 강습 과정 삭제
    await Course.deleteMany({ centerId: centerId });
    console.log('🗑️ 기존 강습 과정 데이터 삭제 완료');
    
    // 새 강습 과정 생성
    const createdCourses = await Course.insertMany(courses);
    console.log('✅ 강습 과정 3개 생성 완료:', createdCourses.map(c => c.name));
    
    // 3. 회원들을 강습 과정에 배정
    const students = await User.find({ userType: 'student', centerId: centerId });
    console.log(`👥 회원 ${students.length}명 찾음:`, students.map(s => s.name));
    
    if (students.length > 0 && createdCourses.length > 0) {
      // 각 강습 과정에 회원 배정
      for (let i = 0; i < createdCourses.length; i++) {
        const course = createdCourses[i];
        const courseStudents = students.slice(i * 2, (i + 1) * 2); // 각 과정에 2명씩 배정
        
        if (courseStudents.length > 0) {
          course.enrolledStudents = courseStudents.map(student => student._id);
          course.currentStudents = courseStudents.length;
          
          await course.save();
          console.log(`✅ ${course.name}에 회원 ${courseStudents.length}명 배정:`, courseStudents.map(s => s.name));
        }
      }
    }
    
    // 4. 개인레슨 생성
    await PersonalLesson.deleteMany({ centerId: centerId });
    console.log('🗑️ 기존 개인레슨 데이터 삭제 완료');
    
    const personalLessons = [];
    for (let i = 0; i < Math.min(createdInstructors.length, students.length); i++) {
      const instructor = createdInstructors[i];
      const student = students[i];
      
      const personalLesson = new PersonalLesson({
        instructorId: instructor._id,
        studentId: student._id,
        centerId: centerId,
        instructorName: instructor.name,
        studentName: student.name,
        lessonType: '1:1',
        totalSessions: 10,
        completedSessions: 0,
        remainingSessions: 10,
        price: 50000,
        status: 'active',
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      personalLessons.push(personalLesson);
    }
    
    if (personalLessons.length > 0) {
      await PersonalLesson.insertMany(personalLessons);
      console.log(`✅ 개인레슨 ${personalLessons.length}개 생성 완료`);
    }
    
    // 5. 결과 확인
    console.log('\n📊 배정 결과 확인:');
    
    const finalCourses = await Course.find({ centerId: centerId }).populate('instructorId', 'name');
    console.log('\n📚 강습 과정 배정 현황:');
    finalCourses.forEach(course => {
      console.log(`- ${course.name}: 강사 ${course.instructorName}, 회원 ${course.currentStudents}명`);
    });
    
    const finalPersonalLessons = await PersonalLesson.find({ centerId: centerId });
    console.log(`\n👤 개인레슨: ${finalPersonalLessons.length}개`);
    finalPersonalLessons.forEach(lesson => {
      console.log(`- ${lesson.studentName} → ${lesson.instructorName}: ${lesson.remainingSessions}회 남음`);
    });
    
    console.log('\n🎉 모든 배정 작업 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



