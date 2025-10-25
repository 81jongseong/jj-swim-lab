/**
 * 종합 테스트 데이터 생성 스크립트
 * 
 * 이 스크립트는 단체반과 개인레슨 시스템 테스트를 위한 종합 샘플 데이터를 생성합니다.
 * - 단체반 강사와 회원 생성 및 배정
 * - 개인레슨 강사와 회원 생성 및 배정
 * - 다양한 상태의 개인레슨 신청 (신청, 대기, 승인, 거절)
 * - 실제 센터 운영에 필요한 모든 데이터
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 스키마 정의
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  userType: String,
  centerId: mongoose.Schema.Types.ObjectId,
  instructorInfo: {
    instructorType: String,
    specialties: [String],
    personalLessonSettings: {
      isPersonalLessonEnabled: Boolean,
      lessonTypes: [{
        type: { type: String },
        maxStudents: { type: Number },
        pricePerSession: { type: Number },
        monthlyPrice: { type: Number }
      }],
      availability: {
        timeSlots: [{
          dayOfWeek: { type: Number },
          startTime: { type: String },
          endTime: { type: String },
          isActive: { type: Boolean }
        }]
      }
    }
  },
  studentInfo: {
    level: String,
    swimmingStyle: String,
    goals: [String],
    assignedCourses: [mongoose.Schema.Types.ObjectId]
  }
});

const courseSchema = new mongoose.Schema({
  name: String,
  level: String,
  instructorId: mongoose.Schema.Types.ObjectId,
  instructorName: String,
  centerId: mongoose.Schema.Types.ObjectId,
  maxStudents: Number,
  currentStudents: Number,
  price: Number,
  duration: Number,
  schedule: [{
    dayOfWeek: Number,
    startTime: String,
    endTime: String
  }],
  status: String,
  isPersonalLesson: Boolean
});

const personalLessonSchema = new mongoose.Schema({
  memberId: mongoose.Schema.Types.ObjectId,
  memberName: String,
  instructorId: mongoose.Schema.Types.ObjectId,
  instructorName: String,
  centerId: mongoose.Schema.Types.ObjectId,
  date: Date,
  time: String,
  duration: Number,
  lessonType: String,
  status: String,
  price: Number,
  notes: String,
  rejectionReason: String,
  packageInfo: {
    totalSessions: Number,
    completedSessions: Number,
    remainingSessions: Number,
    startDate: Date,
    endDate: Date,
    pricePerSession: Number
  }
});

const centerSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  email: String,
  operatingHours: {
    weekdays: { open: String, close: String },
    weekends: { open: String, close: String }
  },
  facilities: {
    mainPool: { lanes: Number, depth: String },
    kidsPool: { lanes: Number, depth: String },
    auxiliaryPool: { lanes: Number, depth: String }
  }
});

// 모델 생성 (실제 컬렉션 사용)
const TestUser = mongoose.model('TestUser', userSchema, 'users');
const TestCourse = mongoose.model('TestCourse', courseSchema, 'courses');
const TestPersonalLesson = mongoose.model('TestPersonalLesson', personalLessonSchema, 'personallessons');
const TestCenter = mongoose.model('TestCenter', centerSchema, 'centers');

// 종합 테스트 데이터 생성 함수
async function createComprehensiveTestData() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswimlab:jjswimlab2024@jjswimlab.8xqkq.mongodb.net/jjswimlab?retryWrites=true&w=majority');
         console.log('✅ MongoDB 연결 성공');

         // 기존 데이터 삭제 (테스트용)
         await TestUser.deleteMany({});
         await TestCourse.deleteMany({});
         await TestPersonalLesson.deleteMany({});
         await TestCenter.deleteMany({});
         console.log('🗑️ 기존 데이터 삭제 완료');

         // 센터 조회 또는 생성
    let center = await TestCenter.findOne();
    if (!center) {
      center = new TestCenter({
        name: 'JJ Swim Lab 테스트 센터',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'test@jjswimlab.com',
        operatingHours: {
          weekdays: { open: '06:00', close: '22:00' },
          weekends: { open: '07:00', close: '21:00' }
        },
        facilities: {
          mainPool: { lanes: 8, depth: '1.2-2.0m' },
          kidsPool: { lanes: 4, depth: '0.8-1.0m' },
          auxiliaryPool: { lanes: 2, depth: '1.0m' }
        }
      });
      await center.save();
      console.log('✅ 테스트 센터 생성 완료');
    }

    // 강사들 생성
    const instructors = [];
    const instructorData = [
      {
        name: '김수영',
        email: 'instructor1@test.com',
        phone: '010-1111-1111',
        instructorType: 'instructor',
        personalLessonEnabled: true,
        specialties: ['자유형', '배영', '개인레슨'],
        availability: [
          { dayOfWeek: 1, startTime: '06:00', endTime: '10:00', isActive: true },
          { dayOfWeek: 1, startTime: '18:00', endTime: '22:00', isActive: true },
          { dayOfWeek: 3, startTime: '06:00', endTime: '10:00', isActive: true },
          { dayOfWeek: 5, startTime: '06:00', endTime: '10:00', isActive: true }
        ]
      },
      {
        name: '박수영',
        email: 'instructor2@test.com',
        phone: '010-2222-2222',
        instructorType: 'instructor',
        personalLessonEnabled: true,
        specialties: ['평영', '접영', '개인레슨'],
        availability: [
          { dayOfWeek: 2, startTime: '14:00', endTime: '18:00', isActive: true },
          { dayOfWeek: 4, startTime: '14:00', endTime: '18:00', isActive: true },
          { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isActive: true }
        ]
      },
      {
        name: '이수영',
        email: 'instructor3@test.com',
        phone: '010-3333-3333',
        instructorType: 'instructor',
        personalLessonEnabled: false, // 개인강습 비활성화
        specialties: ['자유형', '배영'],
        availability: []
      },
      {
        name: '최수영',
        email: 'instructor4@test.com',
        phone: '010-4444-4444',
        instructorType: 'instructor',
        personalLessonEnabled: true,
        specialties: ['자유형', '평영', '개인레슨'],
        availability: [
          { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isActive: true },
          { dayOfWeek: 6, startTime: '14:00', endTime: '18:00', isActive: true }
        ]
      }
    ];

    for (const data of instructorData) {
      let instructor = await TestUser.findOne({ email: data.email });
      if (!instructor) {
        instructor = new TestUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          userType: 'instructor',
          centerId: center._id,
          instructorInfo: {
            instructorType: data.instructorType,
            specialties: data.specialties,
            personalLessonSettings: {
              isPersonalLessonEnabled: data.personalLessonEnabled,
              lessonTypes: data.personalLessonEnabled ? [
                { type: '1:1', maxStudents: 1, pricePerSession: 80000 },
                { type: '1:2', maxStudents: 2, pricePerSession: 50000 },
                { type: '1:3', maxStudents: 3, pricePerSession: 35000 }
              ] : [],
              availability: {
                timeSlots: data.availability
              }
            }
          }
        });
        await instructor.save();
        console.log(`✅ 강사 생성: ${data.name}`);
      }
      instructors.push(instructor);
    }

    // 단체반 수업 생성
    const courses = [];
    const courseData = [
      {
        name: '초급 자유형 클래스',
        level: 'beginner',
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        maxStudents: 15,
        price: 150000,
        duration: 60,
        schedule: [
          { dayOfWeek: 1, startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 3, startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 5, startTime: '19:00', endTime: '20:00' }
        ]
      },
      {
        name: '중급 배영 클래스',
        level: 'intermediate',
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        maxStudents: 12,
        price: 180000,
        duration: 60,
        schedule: [
          { dayOfWeek: 2, startTime: '20:00', endTime: '21:00' },
          { dayOfWeek: 4, startTime: '20:00', endTime: '21:00' }
        ]
      },
      {
        name: '고급 평영 클래스',
        level: 'advanced',
        instructorId: instructors[1]._id,
        instructorName: instructors[1].name,
        maxStudents: 10,
        price: 200000,
        duration: 60,
        schedule: [
          { dayOfWeek: 1, startTime: '20:00', endTime: '21:00' },
          { dayOfWeek: 3, startTime: '20:00', endTime: '21:00' },
          { dayOfWeek: 5, startTime: '20:00', endTime: '21:00' }
        ]
      },
      {
        name: '접영 마스터 클래스',
        level: 'expert',
        instructorId: instructors[1]._id,
        instructorName: instructors[1].name,
        maxStudents: 8,
        price: 250000,
        duration: 90,
        schedule: [
          { dayOfWeek: 2, startTime: '19:00', endTime: '20:30' },
          { dayOfWeek: 4, startTime: '19:00', endTime: '20:30' }
        ]
      }
    ];

    for (const data of courseData) {
      let course = await TestCourse.findOne({ 
        name: data.name,
        instructorId: data.instructorId 
      });
      if (!course) {
        course = new TestCourse({
          ...data,
          centerId: center._id,
          currentStudents: 0,
          status: 'active',
          isPersonalLesson: false
        });
        await course.save();
        console.log(`✅ 단체반 수업 생성: ${data.name}`);
      }
      courses.push(course);
    }

    // 단체반 회원들 생성 및 배정
    const groupStudents = [];
    const groupStudentData = [
      { name: '김철수', email: 'student1@test.com', phone: '010-1001-1001', level: 'beginner', course: courses[0] },
      { name: '이영희', email: 'student2@test.com', phone: '010-1002-1002', level: 'beginner', course: courses[0] },
      { name: '박민수', email: 'student3@test.com', phone: '010-1003-1003', level: 'beginner', course: courses[0] },
      { name: '최지영', email: 'student4@test.com', phone: '010-1004-1004', level: 'intermediate', course: courses[1] },
      { name: '정수현', email: 'student5@test.com', phone: '010-1005-1005', level: 'intermediate', course: courses[1] },
      { name: '한동훈', email: 'student6@test.com', phone: '010-1006-1006', level: 'advanced', course: courses[2] },
      { name: '윤서연', email: 'student7@test.com', phone: '010-1007-1007', level: 'advanced', course: courses[2] },
      { name: '임태호', email: 'student8@test.com', phone: '010-1008-1008', level: 'expert', course: courses[3] }
    ];

    for (const data of groupStudentData) {
      let student = await TestUser.findOne({ email: data.email });
      if (!student) {
        student = new TestUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          userType: 'student',
          centerId: center._id,
          studentInfo: {
            level: data.level,
            swimmingStyle: '자유형',
            goals: ['기술 향상', '체력 증진'],
            assignedCourses: [data.course._id]
          }
        });
        await student.save();
        
        // 단체반 수업에 회원 배정
        data.course.currentStudents += 1;
        await data.course.save();
        
        console.log(`✅ 단체반 회원 생성 및 배정: ${data.name} -> ${data.course.name}`);
      }
      groupStudents.push(student);
    }

    // 개인레슨 회원들 생성
    const personalStudents = [];
    const personalStudentData = [
      { name: '강민지', email: 'personal1@test.com', phone: '010-2001-2001', level: 'beginner' },
      { name: '송예준', email: 'personal2@test.com', phone: '010-2002-2002', level: 'intermediate' },
      { name: '노하늘', email: 'personal3@test.com', phone: '010-2003-2003', level: 'advanced' },
      { name: '조현우', email: 'personal4@test.com', phone: '010-2004-2004', level: 'beginner' },
      { name: '배수진', email: 'personal5@test.com', phone: '010-2005-2005', level: 'intermediate' },
      { name: '오준석', email: 'personal6@test.com', phone: '010-2006-2006', level: 'advanced' },
      { name: '서미래', email: 'personal7@test.com', phone: '010-2007-2007', level: 'beginner' },
      { name: '황동현', email: 'personal8@test.com', phone: '010-2008-2008', level: 'intermediate' }
    ];

    for (const data of personalStudentData) {
      let student = await TestUser.findOne({ email: data.email });
      if (!student) {
        student = new TestUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          userType: 'student',
          centerId: center._id,
          studentInfo: {
            level: data.level,
            swimmingStyle: '자유형',
            goals: ['개인 맞춤 수업', '기술 향상']
          }
        });
        await student.save();
        console.log(`✅ 개인레슨 회원 생성: ${data.name}`);
      }
      personalStudents.push(student);
    }

    // 개인레슨 예약 데이터 생성 (다양한 상태)
    const personalLessons = [];
    const personalLessonData = [
      // 승인된 개인레슨
      {
        memberId: personalStudents[0]._id,
        memberName: personalStudents[0].name,
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 내일
        time: '07:00',
        duration: 60,
        lessonType: '1:1',
        status: 'approved',
        price: 80000,
        packageInfo: {
          totalSessions: 8,
          completedSessions: 2,
          remainingSessions: 6,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          pricePerSession: 80000
        }
      },
      {
        memberId: personalStudents[1]._id,
        memberName: personalStudents[1].name,
        instructorId: instructors[1]._id,
        instructorName: instructors[1].name,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
        time: '15:00',
        duration: 60,
        lessonType: '1:2',
        status: 'approved',
        price: 50000,
        packageInfo: {
          totalSessions: 12,
          completedSessions: 5,
          remainingSessions: 7,
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          pricePerSession: 50000
        }
      },
      // 대기 중인 개인레슨
      {
        memberId: personalStudents[2]._id,
        memberName: personalStudents[2].name,
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        time: '19:00',
        duration: 60,
        lessonType: '1:1',
        status: 'pending',
        price: 80000,
        packageInfo: {
          totalSessions: 10,
          completedSessions: 0,
          remainingSessions: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          pricePerSession: 80000
        }
      },
      {
        memberId: personalStudents[3]._id,
        memberName: personalStudents[3].name,
        instructorId: instructors[3]._id,
        instructorName: instructors[3].name,
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4일 후
        time: '11:00',
        duration: 60,
        lessonType: '1:1',
        status: 'pending',
        price: 80000,
        packageInfo: {
          totalSessions: 6,
          completedSessions: 0,
          remainingSessions: 6,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          pricePerSession: 80000
        }
      },
      // 거절된 개인레슨
      {
        memberId: personalStudents[4]._id,
        memberName: personalStudents[4].name,
        instructorId: instructors[1]._id,
        instructorName: instructors[1].name,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
        time: '16:00',
        duration: 60,
        lessonType: '1:1',
        status: 'rejected',
        price: 80000,
        rejectionReason: '시간 충돌',
        packageInfo: {
          totalSessions: 8,
          completedSessions: 0,
          remainingSessions: 8,
          startDate: new Date(),
          endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
          pricePerSession: 80000
        }
      },
      // 완료된 개인레슨
      {
        memberId: personalStudents[5]._id,
        memberName: personalStudents[5].name,
        instructorId: instructors[3]._id,
        instructorName: instructors[3].name,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 어제
        time: '12:00',
        duration: 60,
        lessonType: '1:1',
        status: 'completed',
        price: 80000,
        packageInfo: {
          totalSessions: 10,
          completedSessions: 8,
          remainingSessions: 2,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          pricePerSession: 80000
        }
      }
    ];

    for (const data of personalLessonData) {
      let lesson = await TestPersonalLesson.findOne({
        memberId: data.memberId,
        instructorId: data.instructorId,
        date: data.date,
        time: data.time
      });

      if (!lesson) {
        lesson = new TestPersonalLesson({
          ...data,
          centerId: center._id
        });
        await lesson.save();
        console.log(`✅ 개인레슨 예약 생성: ${data.memberName} - ${data.instructorName} (${data.status})`);
      }
      personalLessons.push(lesson);
    }

    // 대기 목록 데이터 생성
    const waitlistData = [
      {
        memberId: personalStudents[6]._id,
        memberName: personalStudents[6].name,
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        preferredDates: [
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
        ],
        preferredTimes: ['07:00', '08:00'],
        lessonType: '1:1',
        status: 'waiting',
        price: 80000,
        notes: '빠른 시작 희망'
      },
      {
        memberId: personalStudents[7]._id,
        memberName: personalStudents[7].name,
        instructorId: instructors[3]._id,
        instructorName: instructors[3].name,
        preferredDates: [
          new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        ],
        preferredTimes: ['11:00', '12:00'],
        lessonType: '1:2',
        status: 'waiting',
        price: 50000,
        notes: '친구와 함께 수강 희망'
      }
    ];

    for (const data of waitlistData) {
      let waitlist = await TestPersonalLesson.findOne({
        memberId: data.memberId,
        instructorId: data.instructorId,
        status: 'waiting'
      });

      if (!waitlist) {
        waitlist = new TestPersonalLesson({
          ...data,
          centerId: center._id,
          date: data.preferredDates[0],
          time: data.preferredTimes[0],
          duration: 60,
          packageInfo: {
            totalSessions: data.lessonType === '1:1' ? 8 : 12,
            completedSessions: 0,
            remainingSessions: data.lessonType === '1:1' ? 8 : 12,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            pricePerSession: data.price
          }
        });
        await waitlist.save();
        console.log(`✅ 대기 목록 생성: ${data.memberName} - ${data.instructorName}`);
      }
    }

    console.log('\n🎉 종합 테스트 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 강사: ${instructors.length}명 (개인강습 활성화: ${instructors.filter(i => i.instructorInfo?.personalLessonSettings?.isPersonalLessonEnabled).length}명)`);
    console.log(`   - 단체반 수업: ${courses.length}개`);
    console.log(`   - 단체반 회원: ${groupStudents.length}명 (모두 배정 완료)`);
    console.log(`   - 개인레슨 회원: ${personalStudents.length}명`);
    console.log(`   - 개인레슨 예약: ${personalLessons.length}개 (승인: ${personalLessons.filter(l => l.status === 'approved').length}, 대기: ${personalLessons.filter(l => l.status === 'pending').length}, 거절: ${personalLessons.filter(l => l.status === 'rejected').length})`);
    console.log(`   - 대기 목록: ${waitlistData.length}개`);

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  createComprehensiveTestData();
}

module.exports = { createComprehensiveTestData };
