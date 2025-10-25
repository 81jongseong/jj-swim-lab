// MongoDB Atlas에 강사 생성 및 회원 배정
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

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
          rating: 4.8,
          assignedCenters: [centerId]
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
          rating: 4.6,
          assignedCenters: [centerId]
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
          rating: 4.9,
          assignedCenters: [centerId]
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
    
    // 2. 강습 과정에 강사 배정
    const courses = await Course.find({ centerId: centerId });
    console.log(`📚 강습 과정 ${courses.length}개 찾음`);
    
    if (createdInstructors.length > 0 && courses.length > 0) {
      for (let i = 0; i < Math.min(createdInstructors.length, courses.length); i++) {
        const course = courses[i];
        const instructor = createdInstructors[i];
        
        // 강습 과정에 강사 배정
        course.instructor = instructor._id;
        course.instructorName = instructor.name;
        
        await course.save();
        console.log(`✅ ${course.name}에 ${instructor.name} 강사 배정`);
      }
    }
    
    // 3. 회원들을 강습 과정에 배정
    const students = await User.find({ userType: 'student', centerId: centerId });
    console.log(`👥 회원 ${students.length}명 찾음:`, students.map(s => s.name));
    
    if (students.length > 0 && courses.length > 0) {
      // 각 강습 과정에 회원 배정
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const courseStudents = students.slice(i * 2, (i + 1) * 2); // 각 과정에 2명씩 배정
        
        if (courseStudents.length > 0) {
          course.enrolledStudents = courseStudents.map(student => student._id);
          course.currentStudents = courseStudents.length;
          course.classInfo.currentEnrollment = courseStudents.length;
          
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
    
    const finalCourses = await Course.find({ centerId: centerId }).populate('instructor', 'name');
    console.log('\n📚 강습 과정 배정 현황:');
    finalCourses.forEach(course => {
      console.log(`- ${course.name}: 강사 ${course.instructorName || '미배정'}, 회원 ${course.currentStudents || 0}명`);
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



