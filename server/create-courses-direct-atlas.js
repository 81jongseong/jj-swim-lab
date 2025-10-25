// MongoDB Atlas에 직접 강습 과정 생성
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB Atlas 직접 연결 시도...');

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
    
    // 기존 강습 과정 삭제
    await Course.deleteMany({ centerId: centerId });
    console.log('🗑️ 기존 강습 과정 데이터 삭제 완료');
    
    // 강습 과정 생성
    const courses = [
      {
        name: '초급 자유형 기초반',
        description: '자유형 기초를 배우는 초급자 대상 반',
        level: 'beginner',
        duration: 60,
        maxStudents: 8,
        currentStudents: 0,
        price: 80000,
        instructor: centerId, // 임시로 centerId 사용
        centerId: centerId,
        classInfo: {
          className: '초급 자유형 기초반',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
        description: '배영을 완성하는 중급자 대상 반',
        level: 'intermediate',
        duration: 60,
        maxStudents: 6,
        currentStudents: 0,
        price: 90000,
        instructor: centerId,
        centerId: centerId,
        classInfo: {
          className: '중급 배영 완성반',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
        description: '접영을 마스터하는 고급자 대상 반',
        level: 'advanced',
        duration: 60,
        maxStudents: 4,
        currentStudents: 0,
        price: 100000,
        instructor: centerId,
        centerId: centerId,
        classInfo: {
          className: '고급 접영 마스터반',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
    
    // 새 강습 과정 생성
    const createdCourses = await Course.insertMany(courses);
    console.log('✅ 강습 과정 3개 생성 완료:', createdCourses.map(c => c.name));
    
    // 결과 확인
    console.log('\n📊 생성 결과 확인:');
    
    const finalCourses = await Course.find({ centerId: centerId });
    console.log('\n📚 강습 과정 목록:');
    finalCourses.forEach(course => {
      console.log(`- ${course.name}: 레벨 ${course.level}, 가격 ${course.price.toLocaleString()}원, 최대 ${course.maxStudents}명`);
    });
    
    console.log('\n🎉 강습 과정 생성 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



