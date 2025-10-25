/**
 * 🏊‍♂️ JJ Swim Lab - 올바른 데이터 흐름 샘플 데이터 생성
 * 
 * 데이터 흐름:
 * 1. 센터 생성
 * 2. 강사 생성
 * 3. 학생 회원 생성
 * 4. 강습 과정 생성 (반 생성)
 * 5. 학생을 과정에 배정
 * 6. 개인레슨 생성 및 배정
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createSampleDataFlow() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결됨');

    // 모델 스키마 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      userType: String,
      centerId: mongoose.Schema.Types.ObjectId,
      password: String,
      status: String,
      instructorInfo: {
        specialties: [String],
        experience: Number,
        certification: [String],
        hourlyRate: Number,
        isPersonalLessonEnabled: Boolean,
        personalLessonSettings: {
          lessonTypes: [String],
          maxStudents: Number,
          availability: mongoose.Schema.Types.Mixed
        }
      }
    }, { timestamps: true });

    const courseSchema = new mongoose.Schema({
      name: String,
      description: String,
      level: String,
      duration: Number,
      maxStudents: Number,
      currentStudents: Number,
      instructorId: mongoose.Schema.Types.ObjectId,
      instructorName: String,
      centerId: mongoose.Schema.Types.ObjectId,
      price: Number,
      schedule: [{
        dayOfWeek: String,
        startTime: String,
        endTime: String
      }],
      status: String,
      poolType: String,
      lanes: [Number],
      courseType: String,
      isPersonalLesson: Boolean,
      enrolledStudents: [{
        student: mongoose.Schema.Types.ObjectId,
        enrollmentDate: Date,
        status: String
      }],
      startDate: Date,
      endDate: Date
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);
    const Course = mongoose.model('Course', courseSchema);

    const centerId = new mongoose.Types.ObjectId('68f10983ccca24669078e1b4');

    console.log('\n🗑️ 기존 데이터 삭제 중...');
    
    // 기존 데이터 삭제
    await User.deleteMany({ centerId: centerId });
    await Course.deleteMany({ centerId: centerId });
    await mongoose.connection.db.collection('personallessons').deleteMany({ centerId: centerId });
    
    console.log('✅ 기존 데이터 삭제 완료');

    console.log('\n👥 1단계: 강사 생성');
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('password123', 10);
    
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

    const createdInstructors = await User.insertMany(instructors);
    console.log(`✅ 강사 ${createdInstructors.length}명 생성 완료`);

    console.log('\n👨‍🎓 2단계: 학생 회원 생성');
    
    // 학생 회원 생성
    const students = [
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

    const createdStudents = await User.insertMany(students);
    console.log(`✅ 학생 회원 ${createdStudents.length}명 생성 완료`);

    console.log('\n📚 3단계: 강습 과정 생성 (반 생성)');
    
    // 강습 과정 생성
    const courses = [
      {
        name: '초급 자유형 클래스',
        description: '자유형 기초를 배우는 초급반',
        level: 'beginner',
        duration: 60,
        maxStudents: 8,
        currentStudents: 0,
        instructorId: createdInstructors[0]._id, // 김수영
        instructorName: '김수영',
        centerId: centerId,
        price: 80000,
        schedule: [
          { dayOfWeek: '월,수,금', startTime: '10:00', endTime: '11:00' }
        ],
        status: 'active',
        poolType: 'mainPool',
        lanes: [1, 2],
        courseType: 'group',
        isPersonalLesson: false,
        enrolledStudents: [], // 빈 배열로 시작
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
        instructorId: createdInstructors[1]._id, // 박수영
        instructorName: '박수영',
        centerId: centerId,
        price: 90000,
        schedule: [
          { dayOfWeek: '화,목', startTime: '14:00', endTime: '15:00' }
        ],
        status: 'active',
        poolType: 'mainPool',
        lanes: [3, 4],
        courseType: 'group',
        isPersonalLesson: false,
        enrolledStudents: [], // 빈 배열로 시작
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
        instructorId: createdInstructors[2]._id, // 이수영
        instructorName: '이수영',
        centerId: centerId,
        price: 120000,
        schedule: [
          { dayOfWeek: '월,수,금', startTime: '19:00', endTime: '20:30' }
        ],
        status: 'active',
        poolType: 'mainPool',
        lanes: [5, 6],
        courseType: 'group',
        isPersonalLesson: false,
        enrolledStudents: [], // 빈 배열로 시작
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ 강습 과정 ${createdCourses.length}개 생성 완료`);

    console.log('\n👥 4단계: 학생을 과정에 배정');
    
    // 학생을 과정에 배정
    const course1 = createdCourses[0]; // 초급 자유형 클래스
    const course2 = createdCourses[1]; // 중급 배영 클래스
    const course3 = createdCourses[2]; // 고급 혼영 클래스

    // 초급 자유형 클래스에 학생 3명 배정
    course1.enrolledStudents = [
      {
        student: createdStudents[0]._id, // 김철수
        enrollmentDate: new Date(),
        status: 'active'
      },
      {
        student: createdStudents[1]._id, // 이영희
        enrollmentDate: new Date(),
        status: 'active'
      },
      {
        student: createdStudents[2]._id, // 박민수
        enrollmentDate: new Date(),
        status: 'active'
      }
    ];
    course1.currentStudents = course1.enrolledStudents.length;
    await course1.save();

    // 중급 배영 클래스에 학생 2명 배정
    course2.enrolledStudents = [
      {
        student: createdStudents[3]._id, // 최지영
        enrollmentDate: new Date(),
        status: 'active'
      },
      {
        student: createdStudents[4]._id, // 정현우
        enrollmentDate: new Date(),
        status: 'active'
      }
    ];
    course2.currentStudents = course2.enrolledStudents.length;
    await course2.save();

    // 고급 혼영 클래스에 학생 1명 배정
    course3.enrolledStudents = [
      {
        student: createdStudents[5]._id, // 한소영
        enrollmentDate: new Date(),
        status: 'active'
      }
    ];
    course3.currentStudents = course3.enrolledStudents.length;
    await course3.save();

    console.log('✅ 학생 배정 완료');
    console.log(`   - 초급 자유형 클래스: ${course1.currentStudents}명 (김철수, 이영희, 박민수)`);
    console.log(`   - 중급 배영 클래스: ${course2.currentStudents}명 (최지영, 정현우)`);
    console.log(`   - 고급 혼영 클래스: ${course3.currentStudents}명 (한소영)`);

    console.log('\n👤 5단계: 개인레슨 생성 및 배정');
    
    // 개인레슨 생성
    const personalLessons = [
      {
        instructorId: createdInstructors[0]._id, // 김수영
        studentId: createdStudents[0]._id, // 김철수
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
        instructorId: createdInstructors[1]._id, // 박수영
        studentId: createdStudents[1]._id, // 이영희
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

    console.log('\n📊 6단계: 센터 관리자 계정 생성');
    
    // 센터 관리자 계정 생성
    const centerAdmin = {
      _id: new mongoose.Types.ObjectId('68ef52011b4f8cb0795fd1c6'), // 클라이언트에서 사용하는 ID
      name: '정종성',
      email: 'center@swim.com',
      phone: '010-0000-0000',
      userType: 'centerAdmin',
      centerId: centerId,
      password: 'password123',
      status: 'active'
    };

    await User.create(centerAdmin);
    console.log('✅ 센터 관리자 계정 생성 완료');

    console.log('\n🎉 샘플 데이터 생성 완료!');
    console.log('\n📋 생성된 데이터 요약:');
    console.log(`   - 센터 관리자: 1명 (정종성)`);
    console.log(`   - 강사: ${createdInstructors.length}명 (김수영, 박수영, 이수영)`);
    console.log(`   - 학생 회원: ${createdStudents.length}명`);
    console.log(`   - 강습 과정: ${createdCourses.length}개 (초급, 중급, 고급)`);
    console.log(`   - 개인레슨: ${personalLessons.length}개`);
    console.log('\n🔄 데이터 흐름:');
    console.log('   1. 센터 관리자가 강습 과정 생성');
    console.log('   2. 회원 관리에서 학생들을 과정에 배정');
    console.log('   3. 강사 관리에서 배정된 학생들 확인 가능');
    console.log('   4. 회원 관리에서 각 회원의 배정된 과정 확인 가능');

  } catch (error) {
    console.error('샘플 데이터 생성 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 해제');
  }
}

createSampleDataFlow();
