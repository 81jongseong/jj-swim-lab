const mongoose = require('mongoose');
require('dotenv').config();

async function clearAndCreateData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 삭제
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('courses').deleteMany({});
    await mongoose.connection.db.collection('personallessons').deleteMany({});
    await mongoose.connection.db.collection('centers').deleteMany({});
    console.log('🗑️ 기존 데이터 삭제 완료');

    // 간단한 테스트 데이터 생성
    const center = await mongoose.connection.db.collection('centers').insertOne({
      name: 'JJ Swim Lab 테스트 센터',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'test@jjswimlab.com',
      operatingHours: {
        weekdays: { open: '06:00', close: '22:00' },
        weekends: { open: '08:00', close: '20:00' }
      },
      facilities: {
        mainPool: { lanes: 6, depth: '1.2m' },
        kidsPool: { lanes: 2, depth: '0.8m' },
        auxiliaryPool: { lanes: 3, depth: '1.0m' }
      }
    });

    // 강사 데이터 생성
    const instructors = await mongoose.connection.db.collection('users').insertMany([
      {
        name: '김수영',
        email: 'kim.sooyoung@example.com',
        userType: 'instructor',
        centerId: center.insertedId,
        instructorInfo: {
          instructorType: 'instructor',
          experience: '5년',
          specialties: ['자유형', '배영', '개인레슨'],
          personalLessonSettings: {
            isPersonalLessonEnabled: true,
            lessonTypes: [
              { type: '1:1', maxStudents: 1, pricePerSession: 80000 },
              { type: '1:2', maxStudents: 2, pricePerSession: 50000 },
            ],
            availability: {
              timeSlots: [
                { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', isActive: true },
                { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', isActive: true },
                { dayOfWeek: 3, startTime: '14:00', endTime: '15:00', isActive: true },
                { dayOfWeek: 5, startTime: '18:00', endTime: '19:00', isActive: true },
              ],
              maxDailyLessons: 3,
              bufferTime: 15,
            },
          },
        },
        isActive: true,
      },
      {
        name: '박수영',
        email: 'park.sooyoung@example.com',
        userType: 'instructor',
        centerId: center.insertedId,
        instructorInfo: {
          instructorType: 'instructor',
          experience: '3년',
          specialties: ['평영', '접영', '개인레슨'],
          personalLessonSettings: {
            isPersonalLessonEnabled: true,
            lessonTypes: [
              { type: '1:1', maxStudents: 1, pricePerSession: 70000 },
              { type: '1:2', maxStudents: 2, pricePerSession: 45000 },
            ],
            availability: {
              timeSlots: [
                { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', isActive: true },
                { dayOfWeek: 4, startTime: '16:00', endTime: '17:00', isActive: true },
              ],
              maxDailyLessons: 2,
              bufferTime: 10,
            },
          },
        },
        isActive: true,
      }
    ]);

    const instructorIds = Object.values(instructors.insertedIds);

    // 수업 데이터 생성
    const courses = await mongoose.connection.db.collection('courses').insertMany([
      {
        centerId: center.insertedId,
        name: '초급 자유형 클래스',
        courseType: 'group',
        isPersonalLesson: false,
        level: 'level1',
        instructorId: instructorIds[0],
        instructorName: '김수영',
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
        centerId: center.insertedId,
        name: '중급 배영 클래스',
        courseType: 'group',
        isPersonalLesson: false,
        level: 'level2',
        instructorId: instructorIds[1],
        instructorName: '박수영',
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
      }
    ]);

    // 학생 데이터 생성
    const students = await mongoose.connection.db.collection('users').insertMany([
      {
        name: '김철수',
        email: 'student1@example.com',
        userType: 'student',
        centerId: center.insertedId,
        studentInfo: {
          level: 'level1',
          swimmingStyle: '자유형',
          goals: ['체력 증진'],
        },
        isActive: true,
      },
      {
        name: '이영희',
        email: 'student2@example.com',
        userType: 'student',
        centerId: center.insertedId,
        studentInfo: {
          level: 'level1',
          swimmingStyle: '자유형',
          goals: ['체력 증진'],
        },
        isActive: true,
      }
    ]);

    const studentIds = Object.values(students.insertedIds);

    // 개인레슨 데이터 생성
    await mongoose.connection.db.collection('personallessons').insertMany([
      {
        centerId: center.insertedId,
        student: studentIds[0],
        instructorId: instructorIds[0],
        lessonType: '1:1',
        schedule: { date: new Date(new Date().setDate(new Date().getDate() + 1)), startTime: '09:00', endTime: '10:00' },
        status: 'approved',
        price: 80000,
        notes: '자유형 집중 레슨',
      },
      {
        centerId: center.insertedId,
        student: studentIds[1],
        instructorId: instructorIds[1],
        lessonType: '1:2',
        schedule: { date: new Date(new Date().setDate(new Date().getDate() + 2)), startTime: '16:00', endTime: '17:00' },
        status: 'approved',
        price: 45000,
        notes: '평영 자세 교정',
      }
    ]);

    console.log('🎉 테스트 데이터 생성 완료!');
    console.log(`   - 센터: 1개`);
    console.log(`   - 강사: 2명`);
    console.log(`   - 수업: 2개`);
    console.log(`   - 학생: 2명`);
    console.log(`   - 개인레슨: 2개`);

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

clearAndCreateData();




