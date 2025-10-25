const mongoose = require('mongoose');

// MongoDB 연결 문자열 설정 (Atlas 또는 로컬)
const MONGODB_URI = 'mongodb+srv://jjswimlab:jjswimlab123@jj-swim-lab.8vxqk.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB 연결 시도...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB 연결 성공');
    
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
    
    // 1. 강사들을 레슨에 배정
    const instructors = await User.find({ 
      userType: 'instructor', 
      centerId: centerId 
    });
    
    console.log(`👨‍🏫 강사 ${instructors.length}명 찾음:`, instructors.map(i => i.name));
    
    // 2. 회원들을 찾기 (student 타입)
    const students = await User.find({ 
      userType: 'student', 
      centerId: centerId 
    });
    
    console.log(`👥 회원 ${students.length}명 찾음:`, students.map(s => s.name));
    
    // 3. 기존 강습 과정들 찾기
    const courses = await Course.find({ centerId: centerId });
    console.log(`📚 강습 과정 ${courses.length}개 찾음:`, courses.map(c => c.name));
    
    // 4. 강사들을 강습 과정에 배정
    if (instructors.length > 0 && courses.length > 0) {
      for (let i = 0; i < Math.min(instructors.length, courses.length); i++) {
        const course = courses[i];
        const instructor = instructors[i];
        
        // 강습 과정에 강사 배정
        course.instructorId = instructor._id;
        course.instructorName = instructor.name;
        
        await course.save();
        console.log(`✅ ${course.name}에 ${instructor.name} 강사 배정`);
      }
    }
    
    // 5. 회원들을 강습 과정에 배정 (단체반)
    if (students.length > 0 && courses.length > 0) {
      for (const course of courses) {
        if (!course.isPersonalLesson) { // 단체반만
          // 각 강습 과정에 최대 3명의 회원 배정
          const courseStudents = students.slice(0, Math.min(3, students.length));
          
          course.enrolledStudents = courseStudents.map(student => student._id);
          course.currentStudents = courseStudents.length;
          
          await course.save();
          console.log(`✅ ${course.name}에 회원 ${courseStudents.length}명 배정:`, courseStudents.map(s => s.name));
        }
      }
    }
    
    // 6. 개인레슨 데이터 생성
    if (instructors.length > 0 && students.length > 0) {
      const personalLessons = [];
      
      for (let i = 0; i < Math.min(instructors.length, students.length); i++) {
        const instructor = instructors[i];
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
    }
    
    // 7. 결과 확인
    console.log('\n📊 배정 결과 확인:');
    
    const updatedCourses = await Course.find({ centerId: centerId }).populate('instructorId', 'name');
    console.log('\n📚 강습 과정 배정 현황:');
    updatedCourses.forEach(course => {
      console.log(`- ${course.name}: 강사 ${course.instructorName || '미배정'}, 회원 ${course.currentStudents || 0}명`);
    });
    
    const personalLessons = await PersonalLesson.find({ centerId: centerId });
    console.log(`\n👤 개인레슨: ${personalLessons.length}개`);
    personalLessons.forEach(lesson => {
      console.log(`- ${lesson.studentName} → ${lesson.instructorName}: ${lesson.remainingSessions}회 남음`);
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });