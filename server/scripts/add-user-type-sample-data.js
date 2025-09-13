/**
 * @file 사용자 유형별 샘플 데이터 추가 스크립트
 * @description 각 사용자 유형별 대시보드와 기능에 필요한 샘플 데이터를 데이터베이스에 추가합니다.
 * @date 2025-09-13
 * @author JJ Swim Lab
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// 모델 정의
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { 
    type: String, 
    enum: ['superAdmin', 'centerAdmin', 'instructor', 'student'], 
    required: true 
  },
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageCourses: { type: Boolean, default: false },
    canManageBookings: { type: Boolean, default: false },
    canManagePayments: { type: Boolean, default: false },
    canManageNotices: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canManageCenters: { type: Boolean, default: false },
    canManageTeachingMethods: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' },
  profileImage: String,
  phone: String,
  address: String,
  emergencyContact: String,
  healthConditions: [String],
  swimmingLevel: String,
  goals: [String],
  preferences: {
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  maxStudents: { type: Number, default: 10 },
  currentStudents: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  totalSessions: { type: Number, default: 20 },
  completedSessions: { type: Number, default: 0 },
  schedule: { type: String },
  location: { type: String, default: '1층 메인풀' }
}, {
  timestamps: true
});

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'pending' },
  location: { type: String, default: '1층 메인풀' }
}, {
  timestamps: true
});

const centerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  capacity: { type: Number, default: 100 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  facilities: [String],
  operatingHours: {
    open: String,
    close: String,
    days: [String]
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Center = mongoose.model('Center', centerSchema);

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
    
    console.log('\n🔧 사용자 유형별 샘플 데이터 추가 시작...');
    
    // 1. 센터 데이터 추가
    console.log('\n🏢 센터 데이터 추가 중...');
    const centerData = {
      name: 'JJ 수영센터 본점',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'main@jjswim.com',
      capacity: 100,
      status: 'active',
      facilities: ['25m 풀', '키즈풀', '사우나', '헬스장'],
      operatingHours: {
        open: '09:00',
        close: '22:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      }
    };
    
    let center = await Center.findOne({ name: centerData.name });
    if (!center) {
      center = await Center.create(centerData);
      console.log(`✅ 센터 추가: ${center.name}`);
    } else {
      console.log(`⏭️ 센터 이미 존재: ${center.name}`);
    }
    
    // 2. 강사 데이터 업데이트 (센터 연결)
    console.log('\n👨‍🏫 강사 데이터 업데이트 중...');
    const instructors = await User.find({ userType: 'instructor' });
    for (const instructor of instructors) {
      instructor.centerId = center._id;
      await instructor.save();
      console.log(`✅ 강사 센터 연결: ${instructor.name}`);
    }
    
    // 3. 강의 데이터 추가
    console.log('\n📚 강의 데이터 추가 중...');
    const courses = [
      {
        name: '자유형 기초반',
        description: '자유형의 기본 자세와 호흡법을 익히는 초급 강의',
        level: 'beginner',
        maxStudents: 10,
        currentStudents: 8,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-03-15'),
        status: 'active',
        totalSessions: 20,
        completedSessions: 8,
        schedule: '월,수,금 10:00-11:00',
        location: '1층 메인풀'
      },
      {
        name: '배영 중급반',
        description: '배영의 롤링과 스트로크 기술을 향상시키는 중급 강의',
        level: 'intermediate',
        maxStudents: 8,
        currentStudents: 6,
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-03-20'),
        status: 'active',
        totalSessions: 16,
        completedSessions: 6,
        schedule: '화,목 14:00-15:00',
        location: '1층 메인풀'
      },
      {
        name: '접영 고급반',
        description: '접영의 고급 기술과 경영 전략을 배우는 고급 강의',
        level: 'advanced',
        maxStudents: 6,
        currentStudents: 4,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-04-01'),
        status: 'active',
        totalSessions: 18,
        completedSessions: 3,
        schedule: '월,금 16:00-17:00',
        location: '1층 메인풀'
      }
    ];
    
    const createdCourses = [];
    for (const courseData of courses) {
      const existingCourse = await Course.findOne({ name: courseData.name });
      if (!existingCourse) {
        // 강사 할당 (첫 번째 강사)
        courseData.instructorId = instructors[0]._id;
        const course = await Course.create(courseData);
        createdCourses.push(course);
        console.log(`✅ 강의 추가: ${course.name}`);
      } else {
        createdCourses.push(existingCourse);
        console.log(`⏭️ 강의 이미 존재: ${existingCourse.name}`);
      }
    }
    
    // 4. 예약 데이터 추가
    console.log('\n📅 예약 데이터 추가 중...');
    const students = await User.find({ userType: 'student' });
    
    const bookings = [
      {
        date: new Date('2025-01-15'),
        time: '10:00 - 11:00',
        status: 'confirmed'
      },
      {
        date: new Date('2025-01-17'),
        time: '14:00 - 15:00',
        status: 'confirmed'
      },
      {
        date: new Date('2025-01-20'),
        time: '10:00 - 11:00',
        status: 'pending'
      }
    ];
    
    for (let i = 0; i < Math.min(3, students.length); i++) {
      for (let j = 0; j < Math.min(bookings.length, createdCourses.length); j++) {
        const bookingData = {
          studentId: students[i]._id,
          courseId: createdCourses[j]._id,
          instructorId: instructors[0]._id,
          date: bookings[j].date,
          time: bookings[j].time,
          status: bookings[j].status,
          location: '1층 메인풀'
        };
        
        const existingBooking = await Booking.findOne({
          studentId: bookingData.studentId,
          courseId: bookingData.courseId,
          date: bookingData.date
        });
        
        if (!existingBooking) {
          await Booking.create(bookingData);
          console.log(`✅ 예약 추가: ${students[i].name} - ${createdCourses[j].name}`);
        } else {
          console.log(`⏭️ 예약 이미 존재: ${students[i].name} - ${createdCourses[j].name}`);
        }
      }
    }
    
    // 5. 사용자 권한 업데이트
    console.log('\n🔐 사용자 권한 업데이트 중...');
    
    // centerAdmin 권한 설정
    const centerAdmin = await User.findOne({ userType: 'centerAdmin' });
    if (centerAdmin) {
      centerAdmin.centerId = center._id;
      await centerAdmin.save();
      console.log(`✅ 센터 관리자 센터 연결: ${centerAdmin.name}`);
    }
    
    // instructor 권한 설정
    for (const instructor of instructors) {
      instructor.permissions = {
        canManageUsers: false,
        canManageCourses: true,
        canManageBookings: true,
        canManagePayments: false,
        canManageNotices: false,
        canViewReports: true,
        canManageCenters: false,
        canManageTeachingMethods: false
      };
      await instructor.save();
      console.log(`✅ 강사 권한 업데이트: ${instructor.name}`);
    }
    
    // student 권한 설정
    for (const student of students) {
      student.permissions = {
        canManageUsers: false,
        canManageCourses: false,
        canManageBookings: true,
        canManagePayments: false,
        canManageNotices: false,
        canViewReports: false,
        canManageCenters: false,
        canManageTeachingMethods: false
      };
      await student.save();
      console.log(`✅ 학생 권한 업데이트: ${student.name}`);
    }
    
    console.log('\n🎉 모든 샘플 데이터 추가 완료!');
    
    // 6. 결과 확인
    console.log('\n📊 데이터베이스 현황:');
    console.log(`   - 센터: ${await Center.countDocuments()}개`);
    console.log(`   - 사용자: ${await User.countDocuments()}명`);
    console.log(`   - 강의: ${await Course.countDocuments()}개`);
    console.log(`   - 예약: ${await Booking.countDocuments()}건`);
    
    console.log('\n👥 사용자 유형별 현황:');
    const userStats = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    userStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}명`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 해제');
  }
}

addSampleData();
