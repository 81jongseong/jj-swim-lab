// MongoDB Atlas에 강습 과정 생성 (3단계 - 회원과 강사 생성 후)
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
    
    // 2. 회원 목록 가져오기
    const students = await User.find({ userType: 'student', centerId: centerId });
    console.log(`👥 회원 ${students.length}명 찾음:`, students.map(s => s.name));
    
    // 3. 강습 과정 생성
    const courses = [
      {
        name: '초급 자유형 기초반',
        description: '자유형 기초를 배우는 초급자 대상 반입니다. 자유형의 기본 자세와 호흡법을 익히고, 안전한 수영을 배웁니다.',
        level: 'beginner',
        duration: 60,
        maxStudents: 8,
        currentStudents: 0,
        price: 80000,
        instructor: instructors[0]._id, // 김수영 강사
        instructorName: instructors[0].name,
        centerId: centerId,
        classInfo: {
          className: '초급 자유형 기초반 A',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          maxCapacity: 8,
          currentEnrollment: 0
        },
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        schedule: [{
          day: 'monday',
          startTime: '19:00',
          endTime: '20:00'
        }, {
          day: 'wednesday',
          startTime: '19:00',
          endTime: '20:00'
        }, {
          day: 'friday',
          startTime: '19:00',
          endTime: '20:00'
        }],
        lanes: [1, 2],
        poolType: 'mainPool',
        enrolledStudents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '중급 배영 완성반',
        description: '배영을 완성하는 중급자 대상 반입니다. 배영의 정확한 자세와 스트로크를 익히고, 지속적인 수영 능력을 기릅니다.',
        level: 'intermediate',
        duration: 60,
        maxStudents: 6,
        currentStudents: 0,
        price: 90000,
        instructor: instructors[1]._id, // 박수영 강사
        instructorName: instructors[1].name,
        centerId: centerId,
        classInfo: {
          className: '중급 배영 완성반 A',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          maxCapacity: 6,
          currentEnrollment: 0
        },
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        schedule: [{
          day: 'tuesday',
          startTime: '20:00',
          endTime: '21:00'
        }, {
          day: 'thursday',
          startTime: '20:00',
          endTime: '21:00'
        }],
        lanes: [3, 4],
        poolType: 'mainPool',
        enrolledStudents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '고급 접영 마스터반',
        description: '접영을 마스터하는 고급자 대상 반입니다. 접영의 고급 기술과 스피드를 익히고, 경쟁 수영을 준비합니다.',
        level: 'advanced',
        duration: 60,
        maxStudents: 4,
        currentStudents: 0,
        price: 100000,
        instructor: instructors[2]._id, // 이수영 강사
        instructorName: instructors[2].name,
        centerId: centerId,
        classInfo: {
          className: '고급 접영 마스터반 A',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          maxCapacity: 4,
          currentEnrollment: 0
        },
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        schedule: [{
          day: 'monday',
          startTime: '21:00',
          endTime: '22:00'
        }, {
          day: 'wednesday',
          startTime: '21:00',
          endTime: '22:00'
        }, {
          day: 'friday',
          startTime: '21:00',
          endTime: '22:00'
        }],
        lanes: [5, 6],
        poolType: 'mainPool',
        enrolledStudents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 기존 강습 과정 삭제
    await Course.deleteMany({ centerId: centerId });
    console.log('🗑️ 기존 강습 과정 데이터 삭제 완료');
    
    // 새 강습 과정 생성
    const createdCourses = await Course.insertMany(courses);
    console.log('✅ 강습 과정 3개 생성 완료:', createdCourses.map(c => c.name));
    
    // 4. 회원들을 강습 과정에 배정
    if (students.length > 0 && createdCourses.length > 0) {
      // 각 강습 과정에 회원 배정
      for (let i = 0; i < createdCourses.length; i++) {
        const course = createdCourses[i];
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
    
    // 5. 결과 확인
    console.log('\n📊 생성 결과 확인:');
    
    const finalCourses = await Course.find({ centerId: centerId });
    console.log('\n📚 강습 과정 목록:');
    finalCourses.forEach(course => {
      console.log(`- ${course.name}: 강사 ${course.instructorName}, 회원 ${course.currentStudents}명, 가격 ${course.price.toLocaleString()}원`);
    });
    
    console.log('\n🎉 강습 과정 생성 및 배정 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



