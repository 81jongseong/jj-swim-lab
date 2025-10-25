/**
 * 개인레슨 관련 테스트 데이터 생성 스크립트
 * 
 * 이 스크립트는 개인레슨 시스템 테스트를 위한 샘플 데이터를 생성합니다.
 * - 개인강습 활성화된 강사 생성
 * - 개인레슨 신청 회원 생성
 * - 개인레슨 예약 데이터 생성
 * - 대기 목록 데이터 생성
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
    goals: [String]
  }
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
  rejectionReason: String
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

// 모델 생성 (다른 컬렉션명 사용)
const TestUser = mongoose.model('TestUser', userSchema, 'test_users');
const TestPersonalLesson = mongoose.model('TestPersonalLesson', personalLessonSchema, 'test_personal_lessons');
const TestCenter = mongoose.model('TestCenter', centerSchema, 'test_centers');

// 샘플 데이터 생성 함수
async function createPersonalLessonTestData() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswimlab:jjswimlab2024@jjswimlab.8xqkq.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

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

    // 개인강습 활성화된 강사들 생성
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
                { type: '1:2', maxStudents: 2, pricePerSession: 50000 }
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

    // 개인레슨 신청 회원들 생성
    const members = [];
    const memberData = [
      {
        name: '홍길동',
        email: 'member1@test.com',
        phone: '010-4444-4444',
        level: 'beginner'
      },
      {
        name: '김철수',
        email: 'member2@test.com',
        phone: '010-5555-5555',
        level: 'intermediate'
      },
      {
        name: '이영희',
        email: 'member3@test.com',
        phone: '010-6666-6666',
        level: 'advanced'
      },
      {
        name: '박민수',
        email: 'member4@test.com',
        phone: '010-7777-7777',
        level: 'beginner'
      }
    ];

    for (const data of memberData) {
      let member = await TestUser.findOne({ email: data.email });
      if (!member) {
        member = new TestUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          userType: 'student',
          centerId: center._id,
          studentInfo: {
            level: data.level,
            swimmingStyle: '자유형',
            goals: ['기술 향상', '체력 증진']
          }
        });
        await member.save();
        console.log(`✅ 회원 생성: ${data.name}`);
      }
      members.push(member);
    }

    // 개인레슨 예약 데이터 생성
    const personalLessons = [];
    const lessonData = [
      {
        memberId: members[0]._id,
        memberName: members[0].name,
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 내일
        time: '07:00',
        duration: 60,
        lessonType: '1:1',
        status: 'pending',
        price: 80000
      },
      {
        memberId: members[1]._id,
        memberName: members[1].name,
        instructorId: instructors[1]._id,
        instructorName: instructors[1].name,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
        time: '15:00',
        duration: 60,
        lessonType: '1:1',
        status: 'approved',
        price: 80000
      },
      {
        memberId: members[2]._id,
        memberName: members[2].name,
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        time: '19:00',
        duration: 60,
        lessonType: '1:2',
        status: 'pending',
        price: 50000
      },
      {
        memberId: members[3]._id,
        memberName: members[3].name,
        instructorId: instructors[1]._id,
        instructorName: instructors[1].name,
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4일 후
        time: '16:00',
        duration: 60,
        lessonType: '1:1',
        status: 'rejected',
        price: 80000,
        rejectionReason: '시간 충돌'
      }
    ];

    for (const data of lessonData) {
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
        console.log(`✅ 개인레슨 예약 생성: ${data.memberName} - ${data.instructorName}`);
      }
      personalLessons.push(lesson);
    }

    // 대기 목록 데이터 생성
    const waitlistData = [
      {
        memberId: members[0]._id,
        memberName: members[0].name,
        instructorId: instructors[0]._id,
        instructorName: instructors[0].name,
        preferredDates: [
          new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        ],
        preferredTimes: ['07:00', '08:00'],
        lessonType: '1:1',
        status: 'waiting',
        price: 80000,
        notes: '빠른 시작 희망'
      },
      {
        memberId: members[1]._id,
        memberName: members[1].name,
        instructorId: instructors[1]._id,
        instructorName: instructors[1].name,
        preferredDates: [
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
        ],
        preferredTimes: ['15:00', '16:00'],
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
          duration: 60
        });
        await waitlist.save();
        console.log(`✅ 대기 목록 생성: ${data.memberName} - ${data.instructorName}`);
      }
    }

    console.log('\n🎉 개인레슨 테스트 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 강사: ${instructors.length}명 (개인강습 활성화: ${instructors.filter(i => i.instructorInfo?.personalLessonSettings?.isPersonalLessonEnabled).length}명)`);
    console.log(`   - 회원: ${members.length}명`);
    console.log(`   - 개인레슨 예약: ${personalLessons.length}개`);
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
  createPersonalLessonTestData();
}

module.exports = { createPersonalLessonTestData };
