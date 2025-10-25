/**
 * 🏊‍♂️ JJ Swim Lab - 완전한 데이터 플로우 생성
 * 
 * 데이터 흐름:
 * 1. 기존 데이터 정리
 * 2. 센터 관리자 생성
 * 3. 강사 생성
 * 4. 회원 생성
 * 5. 강습 과정 생성 (반 생성)
 * 6. 강사 배정 (강습 과정에 강사 배정)
 * 7. 회원 배정 (강습 과정에 회원 배정)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createCompleteFlow() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결됨');

    const centerId = new mongoose.Types.ObjectId('68f10983ccca24669078e1b4');

    console.log('\n🗑️ 1단계: 기존 데이터 정리');
    
    // 기존 데이터 삭제
    await mongoose.connection.db.collection('users').deleteMany({ centerId: centerId });
    await mongoose.connection.db.collection('courses').deleteMany({ centerId: centerId });
    await mongoose.connection.db.collection('personallessons').deleteMany({ centerId: centerId });
    
    console.log('✅ 기존 데이터 삭제 완료');

    console.log('\n👤 2단계: 센터 관리자 생성');
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // 센터 관리자 생성
    const centerAdmin = {
      _id: new mongoose.Types.ObjectId('68ef52011b4f8cb0795fd1c6'), // 클라이언트에서 사용하는 ID
      name: '정종성',
      email: 'center@swim.com',
      phone: '010-0000-0000',
      userType: 'centerAdmin',
      centerId: centerId,
      password: hashedPassword,
      status: 'active'
    };

    await mongoose.connection.db.collection('users').insertOne(centerAdmin);
    console.log('✅ 센터 관리자 생성 완료 (정종성)');

    console.log('\n👥 3단계: 강사 생성');
    
    // 강사 생성
    const instructors = [
      {
        name: '김수영',
        email: 'kim.instructor@example.com',
        phone: '010-1111-2222',
        userType: 'instructor',
        centerId: centerId,
        password: hashedPassword,
        instructorInfo: {
          specialties: ['자유형', '배영', '개인레슨'],
          experience: 5,
          certification: ['수영지도사 2급', '생존수영지도사'],
          hourlyRate: 50000,
          isPersonalLessonEnabled: true,
          personalLessonSettings: {
            lessonTypes: ['1:1', '1:2', '1:3'],
            maxStudents: 3,
            availability: {
              monday: ['09:00-12:00', '14:00-18:00'],
              tuesday: ['09:00-12:00', '14:00-18:00'],
              wednesday: ['09:00-12:00', '14:00-18:00'],
              thursday: ['09:00-12:00', '14:00-18:00'],
              friday: ['09:00-12:00', '14:00-18:00']
            }
          }
        }
      },
      {
        name: '박수영',
        email: 'park.instructor@example.com',
        phone: '010-3333-4444',
        userType: 'instructor',
        centerId: centerId,
        password: hashedPassword,
        instructorInfo: {
          specialties: ['평영', '접영', '개인레슨'],
          experience: 3,
          certification: ['수영지도사 3급'],
          hourlyRate: 45000,
          isPersonalLessonEnabled: true,
          personalLessonSettings: {
            lessonTypes: ['1:1', '1:2'],
            maxStudents: 2,
            availability: {
              monday: ['10:00-16:00'],
              tuesday: ['10:00-16:00'],
              wednesday: ['10:00-16:00'],
              thursday: ['10:00-16:00'],
              friday: ['10:00-16:00']
            }
          }
        }
      },
      {
        name: '이수영',
        email: 'lee.instructor@example.com',
        phone: '010-5555-6666',
        userType: 'instructor',
        centerId: centerId,
        password: hashedPassword,
        instructorInfo: {
          specialties: ['혼영', '자유형'],
          experience: 7,
          certification: ['수영지도사 1급', '생존수영지도사'],
          hourlyRate: 60000,
          isPersonalLessonEnabled: false,
          personalLessonSettings: {
            lessonTypes: [],
            maxStudents: 0,
            availability: {}
          }
        }
      }
    ];

    const createdInstructors = await mongoose.connection.db.collection('users').insertMany(instructors);
    console.log(`✅ 강사 ${createdInstructors.insertedCount}명 생성 완료`);
    console.log('   - 김수영 (자유형, 배영, 개인레슨 전문)');
    console.log('   - 박수영 (평영, 접영, 개인레슨 전문)');
    console.log('   - 이수영 (혼영, 자유형 전문)');

    console.log('\n👨‍🎓 4단계: 회원 생성');
    
    // 회원 생성
    const members = [
      {
        name: '김철수',
        email: 'kim.student@example.com',
        phone: '010-7777-8888',
        userType: 'student',
        centerId: centerId,
        password: hashedPassword,
        status: 'active'
      },
      {
        name: '이영희',
        email: 'lee.student@example.com',
        phone: '010-9999-0000',
        userType: 'student',
        centerId: centerId,
        password: hashedPassword,
        status: 'active'
      },
      {
        name: '박민수',
        email: 'park.student@example.com',
        phone: '010-1111-3333',
        userType: 'student',
        centerId: centerId,
        password: hashedPassword,
        status: 'active'
      },
      {
        name: '최지영',
        email: 'choi.student@example.com',
        phone: '010-2222-4444',
        userType: 'student',
        centerId: centerId,
        password: hashedPassword,
        status: 'active'
      },
      {
        name: '정현우',
        email: 'jung.student@example.com',
        phone: '010-3333-5555',
        userType: 'student',
        centerId: centerId,
        password: hashedPassword,
        status: 'active'
      },
      {
        name: '한소영',
        email: 'han.student@example.com',
        phone: '010-4444-6666',
        userType: 'student',
        centerId: centerId,
        password: hashedPassword,
        status: 'active'
      }
    ];

    const createdMembers = await mongoose.connection.db.collection('users').insertMany(members);
    console.log(`✅ 회원 ${createdMembers.insertedCount}명 생성 완료`);

    console.log('\n📚 5단계: 강습 과정 생성 (반 생성)');
    
    // 강습 과정 생성 (강사 배정 없이)
    const courses = [
      {
        name: '초급 자유형 클래스',
        description: '자유형 기초를 배우는 초급반',
        level: 'beginner',
        duration: 60,
        maxStudents: 8,
        currentStudents: 0,
        instructorId: null, // 나중에 배정
        instructorName: '', // 나중에 배정
        centerId: centerId,
        price: 80000,
        schedule: [
          { day: 'monday', startTime: '10:00', endTime: '11:00' },
          { day: 'wednesday', startTime: '10:00', endTime: '11:00' },
          { day: 'friday', startTime: '10:00', endTime: '11:00' }
        ],
        status: 'active',
        poolType: 'mainPool',
        lanes: [1, 2],
        courseType: 'group',
        isPersonalLesson: false,
        enrolledStudents: [],
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
      },
      {
        name: '중급 배영 클래스',
        description: '배영 중급 기술을 배우는 반',
        level: 'intermediate',
        duration: 60,
        maxStudents: 6,
        currentStudents: 0,
        instructorId: null, // 나중에 배정
        instructorName: '', // 나중에 배정
        centerId: centerId,
        price: 90000,
        schedule: [
          { day: 'tuesday', startTime: '14:00', endTime: '15:00' },
          { day: 'thursday', startTime: '14:00', endTime: '15:00' }
        ],
        status: 'active',
        poolType: 'mainPool',
        lanes: [3, 4],
        courseType: 'group',
        isPersonalLesson: false,
        enrolledStudents: [],
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
      },
      {
        name: '고급 혼영 클래스',
        description: '혼영 고급 기술을 배우는 반',
        level: 'advanced',
        duration: 90,
        maxStudents: 4,
        currentStudents: 0,
        instructorId: null, // 나중에 배정
        instructorName: '', // 나중에 배정
        centerId: centerId,
        price: 120000,
        schedule: [
          { day: 'monday', startTime: '19:00', endTime: '20:30' },
          { day: 'wednesday', startTime: '19:00', endTime: '20:30' },
          { day: 'friday', startTime: '19:00', endTime: '20:30' }
        ],
        status: 'active',
        poolType: 'mainPool',
        lanes: [5, 6],
        courseType: 'group',
        isPersonalLesson: false,
        enrolledStudents: [],
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
      }
    ];

    const createdCourses = await mongoose.connection.db.collection('courses').insertMany(courses);
    console.log(`✅ 강습 과정 ${createdCourses.insertedCount}개 생성 완료`);
    console.log('   - 초급 자유형 클래스 (월수금 10:00-11:00)');
    console.log('   - 중급 배영 클래스 (화목 14:00-15:00)');
    console.log('   - 고급 혼영 클래스 (월수금 19:00-20:30)');

    console.log('\n👨‍🏫 6단계: 강사 배정');
    
    // 강사 배정
    const instructorIds = Object.values(createdInstructors.insertedIds);
    const courseIds = Object.values(createdCourses.insertedIds);

    // 초급 자유형 클래스 → 김수영 강사 배정
    await mongoose.connection.db.collection('courses').updateOne(
      { _id: courseIds[0] },
      { 
        $set: { 
          instructorId: instructorIds[0],
          instructorName: '김수영'
        }
      }
    );

    // 중급 배영 클래스 → 박수영 강사 배정
    await mongoose.connection.db.collection('courses').updateOne(
      { _id: courseIds[1] },
      { 
        $set: { 
          instructorId: instructorIds[1],
          instructorName: '박수영'
        }
      }
    );

    // 고급 혼영 클래스 → 이수영 강사 배정
    await mongoose.connection.db.collection('courses').updateOne(
      { _id: courseIds[2] },
      { 
        $set: { 
          instructorId: instructorIds[2],
          instructorName: '이수영'
        }
      }
    );

    console.log('✅ 강사 배정 완료');
    console.log('   - 초급 자유형 클래스 → 김수영 강사');
    console.log('   - 중급 배영 클래스 → 박수영 강사');
    console.log('   - 고급 혼영 클래스 → 이수영 강사');

    console.log('\n👥 7단계: 회원 배정');
    
    // 회원 배정
    const memberIds = Object.values(createdMembers.insertedIds);

    // 초급 자유형 클래스에 회원 3명 배정
    await mongoose.connection.db.collection('courses').updateOne(
      { _id: courseIds[0] },
      { 
        $set: { 
          enrolledStudents: [
            {
              student: memberIds[0], // 김철수
              enrollmentDate: new Date(),
              status: 'active'
            },
            {
              student: memberIds[1], // 이영희
              enrollmentDate: new Date(),
              status: 'active'
            },
            {
              student: memberIds[2], // 박민수
              enrollmentDate: new Date(),
              status: 'active'
            }
          ],
          currentStudents: 3
        }
      }
    );

    // 중급 배영 클래스에 회원 2명 배정
    await mongoose.connection.db.collection('courses').updateOne(
      { _id: courseIds[1] },
      { 
        $set: { 
          enrolledStudents: [
            {
              student: memberIds[3], // 최지영
              enrollmentDate: new Date(),
              status: 'active'
            },
            {
              student: memberIds[4], // 정현우
              enrollmentDate: new Date(),
              status: 'active'
            }
          ],
          currentStudents: 2
        }
      }
    );

    // 고급 혼영 클래스에 회원 1명 배정
    await mongoose.connection.db.collection('courses').updateOne(
      { _id: courseIds[2] },
      { 
        $set: { 
          enrolledStudents: [
            {
              student: memberIds[5], // 한소영
              enrollmentDate: new Date(),
              status: 'active'
            }
          ],
          currentStudents: 1
        }
      }
    );

    console.log('✅ 회원 배정 완료');
    console.log('   - 초급 자유형 클래스: 김철수, 이영희, 박민수 (3명)');
    console.log('   - 중급 배영 클래스: 최지영, 정현우 (2명)');
    console.log('   - 고급 혼영 클래스: 한소영 (1명)');

    console.log('\n👤 8단계: 개인레슨 생성 및 배정');
    
    // 개인레슨 생성
    const personalLessons = [
      {
        instructorId: instructorIds[0], // 김수영
        studentId: memberIds[0], // 김철수
        centerId: centerId,
        lessonType: '1:1',
        status: 'active',
        schedule: {
          date: new Date(),
          startTime: '15:00',
          endTime: '16:00'
        },
        pricePerSession: 50000,
        totalSessions: 10,
        completedSessions: 3,
        remainingSessions: 7,
        expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2))
      },
      {
        instructorId: instructorIds[1], // 박수영
        studentId: memberIds[1], // 이영희
        centerId: centerId,
        lessonType: '1:2',
        status: 'active',
        schedule: {
          date: new Date(),
          startTime: '16:00',
          endTime: '17:00'
        },
        pricePerSession: 40000,
        totalSessions: 8,
        completedSessions: 2,
        remainingSessions: 6,
        expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2))
      }
    ];

    await mongoose.connection.db.collection('personallessons').insertMany(personalLessons);
    console.log(`✅ 개인레슨 ${personalLessons.length}개 생성 완료`);
    console.log('   - 김수영 강사 → 김철수 학생 (1:1 개인레슨)');
    console.log('   - 박수영 강사 → 이영희 학생 (1:2 개인레슨)');

    console.log('\n🎉 완전한 데이터 플로우 생성 완료!');
    console.log('\n📋 생성된 데이터 요약:');
    console.log(`   - 센터 관리자: 1명 (정종성)`);
    console.log(`   - 강사: ${createdInstructors.insertedCount}명 (김수영, 박수영, 이수영)`);
    console.log(`   - 회원: ${createdMembers.insertedCount}명`);
    console.log(`   - 강습 과정: ${createdCourses.insertedCount}개 (초급, 중급, 고급)`);
    console.log(`   - 개인레슨: ${personalLessons.length}개`);
    
    console.log('\n🔄 완성된 데이터 흐름:');
    console.log('   1. ✅ 센터 관리자가 강습 과정 생성');
    console.log('   2. ✅ 강사를 생성하고 등록');
    console.log('   3. ✅ 회원을 생성하고 등록');
    console.log('   4. ✅ 생성한 강습 과정에 강사 배정');
    console.log('   5. ✅ 생성한 강습 과정에 회원 배정');
    console.log('\n🎯 이제 모든 페이지에서 정확한 데이터가 표시됩니다!');

  } catch (error) {
    console.error('완전한 데이터 플로우 생성 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 해제');
  }
}

createCompleteFlow();




