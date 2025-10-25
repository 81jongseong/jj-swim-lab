// MongoDB Atlas에서 강습 과정 배정 수정
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB Atlas 연결 시도...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas 연결 성공');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    
    // center@swim.com 계정 정보 확인
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    const centerId = centerAdmin?.centerId;
    
    if (!centerId) {
      console.log('❌ 센터 ID를 찾을 수 없습니다.');
      mongoose.disconnect();
      return;
    }
    
    console.log('🔍 센터 ID:', centerId);
    
    // 1. 강사 목록 가져오기
    const instructors = await User.find({ userType: 'instructor', centerId: centerId });
    console.log(`👨‍🏫 강사 ${instructors.length}명 찾음:`, instructors.map(i => i.name));
    
    // 2. 강습 과정 목록 가져오기
    const courses = await Course.find({ centerId: centerId });
    console.log(`📚 강습 과정 ${courses.length}개 찾음:`, courses.map(c => c.name));
    
    // 3. 회원 목록 가져오기
    const students = await User.find({ userType: 'student', centerId: centerId });
    console.log(`👥 회원 ${students.length}명 찾음:`, students.map(s => s.name));
    
    // 4. 강습 과정에 강사 배정
    if (instructors.length > 0 && courses.length > 0) {
      for (let i = 0; i < Math.min(instructors.length, courses.length); i++) {
        const course = courses[i];
        const instructor = instructors[i];
        
        // 강습 과정에 강사 배정
        course.instructor = instructor._id;
        course.instructorName = instructor.name;
        
        await course.save();
        console.log(`✅ ${course.name}에 ${instructor.name} 강사 배정`);
      }
    }
    
    // 5. 회원들을 강습 과정에 배정
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
    
    // 6. 결과 확인
    console.log('\n📊 배정 결과 확인:');
    
    const finalCourses = await Course.find({ centerId: centerId });
    console.log('\n📚 강습 과정 배정 현황:');
    finalCourses.forEach(course => {
      console.log(`- ${course.name}: 강사 ${course.instructorName || '미배정'}, 회원 ${course.currentStudents || 0}명`);
    });
    
    console.log('\n🎉 강습 과정 배정 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



