/**
 * 🔧 JJ Swim Lab - 데이터베이스 정리 및 샘플 데이터 추가 스크립트
 * 
 * 📋 **스크립트 목적**
 * - JJ Swim Lab 시스템의 데이터베이스에 완전한 샘플 데이터 생성
 * - 기존 문제 데이터 정리 및 새로운 테스트 환경 구축
 * - 사용자, 센터, 과정, 결제, 예약 데이터 통합 생성
 * - 개발 및 테스트를 위한 완전한 데이터 환경 제공
 * 
 * 🔄 **생성 데이터**
 * - 센터: JJ 수영센터 (1개)
 * - 사용자: 최고관리자, 센터관리자, 강사, 학생 (4명)
 * - 과정: 자유형 기초반, 배영 중급반, 평영 고급반 (3개)
 * - 결제: 강습료 결제 내역 (2건)
 * - 예약: 수업 예약 내역 (2건)
 * 
 * 🗄️ **데이터 연동**
 * - MongoDB Atlas 데이터베이스
 * - User, Center, Course, Payment, Booking 모델
 * - bcrypt를 통한 비밀번호 해싱
 * - 관계형 데이터 연결 (참조 키)
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 데이터 정리 및 샘플 데이터 생성 스크립트 작성
 * - 2025-01-13: 모델 스키마 검증 및 필수 필드 추가
 * - 2025-01-13: 관계형 데이터 연결 및 참조 키 설정
 * - 2025-01-13: 완전한 테스트 환경 데이터 구축 완료
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-13
 * - 상태: ✅ 완성 (데이터베이스 샘플 데이터 생성 완료)
 * 
 * 🎯 **테스트 계정**
 * - 최고 관리자: admin / 101010
 * - 센터 관리자: center / 101010
 * - 강사: teacher / 101010
 * - 학생: student1 / 101010
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 모델 import
const { User } = require('../dist/models/User');
const { Payment } = require('../dist/models/Payment');
const { Booking } = require('../dist/models/Booking');
const { Course } = require('../dist/models/Course');
const { Center } = require('../dist/models/Center');

async function fixAndSeedData() {
  try {
    console.log('🔗 데이터베이스 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 데이터베이스 연결 성공');

    // 1. 기존 데이터 정리
    console.log('🧹 기존 데이터 정리 중...');
    
    // 모든 기존 데이터 삭제
    await User.deleteMany({});
    await Course.deleteMany({});
    await Payment.deleteMany({});
    await Booking.deleteMany({});
    await Center.deleteMany({});
    console.log('🗑️ 기존 데이터 삭제 완료');

    // 2. 기본 센터 생성
    console.log('🏢 기본 센터 생성 중...');
    const center = await Center.findOneAndUpdate(
      { name: 'JJ 수영센터' },
      {
        name: 'JJ 수영센터',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'info@jjswim.com',
        manager: '김센터',
        facilities: ['25m 풀', '체력단련실', '샤워실'],
        operatingHours: {
          weekdays: '06:00-22:00',
          weekends: '08:00-20:00'
        },
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log(`✅ 센터 생성/업데이트 완료: ${center.name}`);

    // 3. 기본 사용자 생성 (비밀번호: 101010)
    console.log('👥 기본 사용자 생성 중...');
    const hashedPassword = await bcrypt.hash('101010', 12);
    
    const users = await User.insertMany([
      {
        userId: 'admin',
        name: '최고 관리자',
        email: 'admin@jjswim.com',
        password: hashedPassword,
        phone: '010-0000-0001',
        userType: 'superAdmin',
        isActive: true,
        superAdminInfo: {
          systemPermissions: {
            canManageAllUsers: true,
            canManageAllCenters: true,
            canManageSystemSettings: true,
            canViewAllReports: true,
            canManageSkillTemplates: true
          },
          adminLevel: 'superAdmin'
        }
      },
      {
        userId: 'center',
        name: '센터 관리자',
        email: 'center@jjswim.com',
        password: hashedPassword,
        phone: '010-0000-0002',
        userType: 'centerAdmin',
        centerId: center._id,
        isActive: true,
        centerAdminInfo: {
          managedCenters: [center._id],
          adminLevel: 'manager',
          permissions: {
            canManageUsers: true,
            canManageCourses: true,
            canManageBookings: true,
            canManagePayments: true,
            canManageNotices: true,
            canViewReports: true
          }
        }
      },
      {
        userId: 'teacher',
        name: '김강사',
        email: 'teacher@jjswim.com',
        password: hashedPassword,
        phone: '010-0000-0003',
        userType: 'instructor',
        centerId: center._id,
        isActive: true,
        instructorInfo: {
          experience: '5년',
          certifications: ['수영지도사 2급', '생명구조원'],
          specialties: ['자유형', '배영'],
          instructorLevel: 'senior',
          assignedCenters: [center._id],
          maxStudents: 20,
          currentStudents: 0
        }
      },
      {
        userId: 'student1',
        name: '이학생',
        email: 'student1@jjswim.com',
        password: hashedPassword,
        phone: '010-0000-0004',
        userType: 'student',
        centerId: center._id,
        instructorId: null,
        isActive: true,
        studentInfo: {
          level: 'beginner',
          enrollmentDate: new Date(),
          emergencyContact: '이학생 부모 (부모) 010-0000-0005'
        }
      }
    ]);
    console.log(`✅ ${users.length}명의 사용자 생성 완료`);

    // 4. 기본 과정 생성 (강사 정보 포함)
    const instructor = users.find(u => u.userType === 'instructor');
    console.log('📚 기본 과정 생성 중...');
    const courses = await Course.insertMany([
      {
        name: '자유형 기초반',
        description: '자유형 기초 기술을 배우는 과정',
        level: 'beginner',
        duration: 60,
        price: 80000,
        maxStudents: 10,
        instructor: instructor._id,
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          maxCapacity: 10,
          currentEnrollment: 0
        },
        schedule: [
          { day: 'monday', startTime: '19:00', endTime: '20:00' },
          { day: 'wednesday', startTime: '19:00', endTime: '20:00' },
          { day: 'friday', startTime: '19:00', endTime: '20:00' }
        ],
        isActive: true
      },
      {
        name: '배영 중급반',
        description: '배영 중급 기술을 배우는 과정',
        level: 'intermediate',
        duration: 60,
        price: 90000,
        maxStudents: 8,
        instructor: instructor._id,
        classInfo: {
          className: '배영 중급반 A',
          classType: 'regular',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          maxCapacity: 8,
          currentEnrollment: 0
        },
        schedule: [
          { day: 'tuesday', startTime: '19:00', endTime: '20:00' },
          { day: 'thursday', startTime: '19:00', endTime: '20:00' },
          { day: 'saturday', startTime: '10:00', endTime: '11:00' }
        ],
        isActive: true
      },
      {
        name: '평영 고급반',
        description: '평영 고급 기술을 배우는 과정',
        level: 'advanced',
        duration: 75,
        price: 100000,
        maxStudents: 6,
        instructor: instructor._id,
        classInfo: {
          className: '평영 고급반 A',
          classType: 'intensive',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          maxCapacity: 6,
          currentEnrollment: 0
        },
        schedule: [
          { day: 'monday', startTime: '20:00', endTime: '21:15' },
          { day: 'wednesday', startTime: '20:00', endTime: '21:15' },
          { day: 'saturday', startTime: '14:00', endTime: '15:15' }
        ],
        isActive: true
      }
    ]);
    console.log(`✅ ${courses.length}개의 과정 생성 완료`);

    // 5. 학생에게 강사 배정
    const student = users.find(u => u.userType === 'student');
    await User.updateOne(
      { _id: student._id },
      { instructorId: instructor._id }
    );
    console.log('✅ 학생에게 강사 배정 완료');

    // 7. 결제 데이터 생성
    console.log('💰 결제 데이터 생성 중...');
    const payments = await Payment.insertMany([
      {
        user: student._id,
        amount: 80000,
        currency: 'KRW',
        paymentMethod: 'card',
        status: 'completed',
        purpose: 'course',
        relatedCourse: courses[0]._id,
        transactionId: `TXN_${Date.now()}_001`,
        notes: '자유형 기초반 수강료',
        processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1주일 전
      },
      {
        user: student._id,
        amount: 90000,
        currency: 'KRW',
        paymentMethod: 'transfer',
        status: 'completed',
        purpose: 'course',
        relatedCourse: courses[1]._id,
        transactionId: `TXN_${Date.now()}_002`,
        notes: '배영 중급반 수강료',
        processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3일 전
      }
    ]);
    console.log(`✅ ${payments.length}개의 결제 내역 생성 완료`);

    // 8. 예약 데이터 생성
    console.log('📅 예약 데이터 생성 중...');
    const bookings = await Booking.insertMany([
      {
        user: student._id,
        course: courses[0]._id,
        instructor: instructor._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
        startTime: '19:00',
        endTime: '20:00',
        laneNumber: 1,
        purpose: 'lesson',
        status: 'confirmed',
        payment: payments[0]._id,
        notes: '정기 수업 예약'
      },
      {
        user: student._id,
        course: courses[1]._id,
        instructor: instructor._id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
        startTime: '19:00',
        endTime: '20:00',
        laneNumber: 2,
        purpose: 'lesson',
        status: 'pending',
        payment: payments[1]._id,
        notes: '정기 수업 예약'
      }
    ]);
    console.log(`✅ ${bookings.length}개의 예약 내역 생성 완료`);

    // 통계 출력
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    console.log('\n🎉 데이터 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 생성된 데이터 통계:');
    console.log(`🏢 센터: 1개`);
    console.log(`👥 사용자: ${users.length}명`);
    console.log(`📚 과정: ${courses.length}개`);
    console.log(`💰 총 매출액: ${totalRevenue.toLocaleString()}원`);
    console.log(`💳 결제 내역: ${payments.length}건`);
    console.log(`📅 예약 내역: ${bookings.length}건`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 테스트 계정:');
    console.log('• 최고 관리자: admin / 101010');
    console.log('• 센터 관리자: center / 101010');
    console.log('• 강사: teacher / 101010');
    console.log('• 학생: student1 / 101010');

  } catch (error) {
    console.error('❌ 데이터 생성 실패:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

fixAndSeedData();
