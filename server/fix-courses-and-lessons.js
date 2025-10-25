const mongoose = require('mongoose');
require('dotenv').config();

async function fixCoursesAndLessons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    const currentCenterId = '68f10983ccca24669078e1b4';
    
    // 강사들 조회
    const instructors = await mongoose.connection.db.collection('users').find({ userType: 'instructor' }).toArray();
    console.log('👨‍🏫 강사들:', instructors.map(i => ({ name: i.name, id: i._id })));

    // 1. courses 컬렉션 수정
    console.log('\n📚 courses 컬렉션 수정 중...');
    
    // 기존 courses 삭제
    await mongoose.connection.db.collection('courses').deleteMany({});
    console.log('🗑️ 기존 courses 삭제 완료');

    // 새로운 courses 생성
    const newCourses = [
      {
        name: '초급 자유형 클래스',
        courseType: 'group',
        isPersonalLesson: false,
        level: 'level1',
        instructorId: instructors[0]._id, // 김수영
        instructorName: instructors[0].name,
        centerId: new mongoose.Types.ObjectId(currentCenterId),
        maxStudents: 10,
        currentStudents: 3,
        description: '자유형 기초를 배우는 수업입니다.',
        price: 150000,
        duration: 60,
        schedule: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', poolType: 'mainPool', lanes: [1, 2] },
          { dayOfWeek: 3, startTime: '10:00', endTime: '11:00', poolType: 'mainPool', lanes: [1, 2] },
        ],
        status: 'active',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      },
      {
        name: '중급 배영 클래스',
        courseType: 'group',
        isPersonalLesson: false,
        level: 'level2',
        instructorId: instructors[1]._id, // 박수영
        instructorName: instructors[1].name,
        centerId: new mongoose.Types.ObjectId(currentCenterId),
        maxStudents: 8,
        currentStudents: 2,
        description: '배영 자세를 교정하고 속도를 향상시킵니다.',
        price: 180000,
        duration: 60,
        schedule: [
          { dayOfWeek: 2, startTime: '11:00', endTime: '12:00', poolType: 'mainPool', lanes: [3, 4] },
          { dayOfWeek: 4, startTime: '11:00', endTime: '12:00', poolType: 'mainPool', lanes: [3, 4] },
        ],
        status: 'active',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      },
      {
        name: '고급 평영 클래스',
        courseType: 'group',
        isPersonalLesson: false,
        level: 'level3',
        instructorId: instructors[2]._id, // 이수영
        instructorName: instructors[2].name,
        centerId: new mongoose.Types.ObjectId(currentCenterId),
        maxStudents: 7,
        currentStudents: 1,
        description: '평영 기술을 마스터하고 지구력을 기릅니다.',
        price: 200000,
        duration: 60,
        schedule: [
          { dayOfWeek: 1, startTime: '14:00', endTime: '15:00', poolType: 'mainPool', lanes: [5, 6] },
          { dayOfWeek: 3, startTime: '14:00', endTime: '15:00', poolType: 'mainPool', lanes: [5, 6] },
        ],
        status: 'active',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      },
    ];

    await mongoose.connection.db.collection('courses').insertMany(newCourses);
    console.log(`✅ ${newCourses.length}개의 courses 생성 완료`);

    // 2. personallessons 컬렉션 수정
    console.log('\n👤 personallessons 컬렉션 수정 중...');
    
    // 기존 personallessons 삭제
    await mongoose.connection.db.collection('personallessons').deleteMany({});
    console.log('🗑️ 기존 personallessons 삭제 완료');

    // 새로운 personallessons 생성
    const newPersonalLessons = [
      {
        centerId: new mongoose.Types.ObjectId(currentCenterId),
        studentId: new mongoose.Types.ObjectId('68f9b7180526f5b88d53dd28'), // 김철수
        instructorId: instructors[0]._id, // 김수영
        lessonType: '1:1',
        schedule: {
          date: new Date(new Date().setDate(new Date().getDate() + 1)),
          startTime: '09:00',
          endTime: '10:00'
        },
        status: 'approved',
        price: 80000,
        notes: '자유형 집중 레슨',
      },
      {
        centerId: new mongoose.Types.ObjectId(currentCenterId),
        studentId: new mongoose.Types.ObjectId('68f9b7180526f5b88d53dd29'), // 이영희
        instructorId: instructors[1]._id, // 박수영
        lessonType: '1:1',
        schedule: {
          date: new Date(new Date().setDate(new Date().getDate() + 2)),
          startTime: '16:00',
          endTime: '17:00'
        },
        status: 'approved',
        price: 70000,
        notes: '평영 자세 교정',
      },
      {
        centerId: new mongoose.Types.ObjectId(currentCenterId),
        studentId: new mongoose.Types.ObjectId('68f9b7180526f5b88d53dd28'), // 김철수
        instructorId: instructors[2]._id, // 이수영
        lessonType: '1:1',
        schedule: {
          date: new Date(new Date().setDate(new Date().getDate() + 3)),
          startTime: '18:00',
          endTime: '19:00'
        },
        status: 'pending',
        price: 75000,
        notes: '접영 기초',
      },
    ];

    await mongoose.connection.db.collection('personallessons').insertMany(newPersonalLessons);
    console.log(`✅ ${newPersonalLessons.length}개의 personallessons 생성 완료`);

    console.log('\n🎉 모든 데이터 수정 완료!');

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

fixCoursesAndLessons();




