// MongoDB Atlas에서 배정 결과 확인
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
    
    // 1. 강사 목록 확인
    const instructors = await User.find({ userType: 'instructor', centerId: centerId });
    console.log(`\n👨‍🏫 강사 목록 (${instructors.length}명):`);
    instructors.forEach(instructor => {
      console.log(`- ${instructor.name}: ${instructor.instructorInfo?.experience}년 경력, ${instructor.instructorInfo?.specialties?.join(', ')}`);
    });
    
    // 2. 강습 과정 목록 확인
    const courses = await Course.find({ centerId: centerId });
    console.log(`\n📚 강습 과정 목록 (${courses.length}개):`);
    courses.forEach(course => {
      console.log(`- ${course.name}: 레벨 ${course.level}, 강사 ${course.instructorName || '미배정'}, 회원 ${course.currentStudents || 0}명`);
    });
    
    // 3. 회원 목록 확인
    const students = await User.find({ userType: 'student', centerId: centerId });
    console.log(`\n👥 회원 목록 (${students.length}명):`);
    students.forEach(student => {
      console.log(`- ${student.name}: ${student.email}`);
    });
    
    // 4. 개인레슨 목록 확인
    const personalLessons = await PersonalLesson.find({ centerId: centerId });
    console.log(`\n👤 개인레슨 목록 (${personalLessons.length}개):`);
    personalLessons.forEach(lesson => {
      console.log(`- ${lesson.studentName} → ${lesson.instructorName}: ${lesson.remainingSessions}회 남음`);
    });
    
    // 5. 강사별 배정 현황 확인
    console.log(`\n📊 강사별 배정 현황:`);
    for (const instructor of instructors) {
      const instructorCourses = courses.filter(course => course.instructorName === instructor.name);
      const instructorPersonalLessons = personalLessons.filter(lesson => lesson.instructorName === instructor.name);
      
      console.log(`\n👨‍🏫 ${instructor.name}:`);
      console.log(`  - 담당 강습 과정: ${instructorCourses.length}개`);
      instructorCourses.forEach(course => {
        console.log(`    * ${course.name}: 회원 ${course.currentStudents}명`);
      });
      console.log(`  - 개인레슨: ${instructorPersonalLessons.length}개`);
      instructorPersonalLessons.forEach(lesson => {
        console.log(`    * ${lesson.studentName}: ${lesson.remainingSessions}회 남음`);
      });
    }
    
    console.log('\n🎉 배정 현황 확인 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



