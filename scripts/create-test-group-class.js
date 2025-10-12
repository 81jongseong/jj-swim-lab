/**
 * 테스트 단체반 데이터 생성 스크립트
 */

const mongoose = require('mongoose');
require('dotenv').config();

const GroupClass = require('../server/dist/models/GroupClass').default;
const { User } = require('../server/dist/models/User');

async function createTestGroupClass() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 1. 강사 찾기 (또는 생성)
    let instructor = await User.findOne({ userType: 'instructor' });
    if (!instructor) {
      console.log('⚠️ 강사가 없어서 테스트 강사를 생성합니다...');
      instructor = await User.create({
        name: '김코치',
        email: 'coach@test.com',
        password: 'test1234',
        userType: 'instructor',
        instructorInfo: {
          experience: '5년',
          certifications: ['생활체육지도사 2급'],
          instructorLevel: 'senior'
        }
      });
    }
    console.log(`✅ 강사: ${instructor.name}`);

    // 2. 학생들 찾기 (또는 생성)
    let students = await User.find({ userType: 'student' }).limit(5);
    if (students.length < 3) {
      console.log('⚠️ 학생이 부족하여 테스트 학생을 생성합니다...');
      const testStudents = [];
      for (let i = 1; i <= 5; i++) {
        const student = await User.create({
          name: `학생${i}`,
          email: `student${i}@test.com`,
          password: 'test1234',
          userType: 'student',
          studentInfo: {
            age: 20 + i,
            swimmingLevel: 'intermediate',
            swimmingProfile: {
              css: {
                freestyle: 80 + i * 2,
                backstroke: 90 + i * 2,
                breaststroke: 100 + i * 2,
                butterfly: 85 + i * 2,
                lastUpdated: new Date(),
                updatedByRole: 'self'
              },
              preferredStrokes: ['freestyle', 'backstroke'],
              trainingDays: [1, 3, 5],
              currentGoal: '체력 향상'
            }
          }
        });
        testStudents.push(student);
      }
      students = testStudents;
    }
    console.log(`✅ 학생: ${students.length}명`);

    // 3. 센터 찾기
    const Center = require('../server/dist/models/SwimmingCenter').default;
    let center = await Center.findOne();
    if (!center) {
      center = await Center.create({
        name: '테스트 수영센터',
        address: '서울시 강남구',
        phone: '02-1234-5678'
      });
    }
    console.log(`✅ 센터: ${center.name}`);

    // 4. 테스트 단체반 생성
    const groupClass = await GroupClass.create({
      className: '초급 성인반',
      description: '성인 초급자를 위한 기초 수영 클래스',
      centerId: center._id,
      instructorId: instructor._id,
      students: students.map(s => ({
        userId: s._id,
        enrolledAt: new Date(),
        status: 'active'
      })),
      schedule: {
        dayOfWeek: [1, 3, 5], // 월수금
        startTime: '19:00',
        endTime: '20:00',
        duration: 60
      },
      period: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3개월 후
        totalSessions: 36,
        completedSessions: 0
      },
      capacity: {
        min: 4,
        max: 12,
        current: students.length
      },
      level: 'beginner',
      targetAge: {
        min: 20,
        max: 50
      },
      status: 'active',
      fee: {
        amount: 300000,
        currency: 'KRW',
        billingCycle: 'monthly'
      },
      createdBy: instructor._id
    });

    console.log('\n🎉 테스트 단체반 생성 완료!');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`클래스명: ${groupClass.className}`);
    console.log(`강사: ${instructor.name}`);
    console.log(`학생 수: ${groupClass.students.length}명`);
    console.log(`일정: 월수금 19:00-20:00`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    await mongoose.connection.close();
    console.log('✅ MongoDB 연결 종료');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createTestGroupClass();









