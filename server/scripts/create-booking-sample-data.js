/**
 * 📅 JJ Swim Lab - 예약관리 샘플 데이터 생성 스크립트
 * 
 * 📋 **스크립트 목적**
 * - 개인레슨 및 레인대여 샘플 데이터 생성
 * - 테스트용 예약 데이터 제공
 * - 예약관리 시스템 테스트 지원
 * 
 * 🔄 **주요 기능**
 * - 개인레슨 샘플 데이터 생성
 * - 레인대여 샘플 데이터 생성
 * - 다양한 상태의 예약 데이터 생성
 * - 강사 배정 테스트 데이터 생성
 * 
 * 🗄️ **데이터 연동**
 * - PersonalLesson 모델과 연동
 * - LaneRental 모델과 연동
 * - User 모델과 연동
 * - MongoDB Atlas 데이터베이스
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 기존 데이터와 충돌하지 않도록 주의
 * 2. 실제 센터 ID와 사용자 ID 사용
 * 3. 현실적인 예약 시간 설정
 * 4. 다양한 상태의 데이터 생성
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 샘플 데이터 생성 스크립트 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import (컴파일된 파일 사용)
const PersonalLesson = require('../dist/models/PersonalLesson').PersonalLesson;
const LaneRental = require('../dist/models/LaneRental').LaneRental;
const User = require('../dist/models/User').User;
const SwimmingCenter = require('../dist/models/SwimmingCenter').SwimmingCenter;

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 샘플 데이터 생성
const createSampleData = async () => {
  try {
    console.log('🚀 예약관리 샘플 데이터 생성 시작...');

    // 센터 정보 조회
    const center = await SwimmingCenter.findOne();
    if (!center) {
      console.error('❌ 센터 정보를 찾을 수 없습니다.');
      return;
    }

    // 사용자 정보 조회 (학생, 강사)
    const students = await User.find({ userType: 'student' }).limit(5);
    const instructors = await User.find({ userType: 'instructor' }).limit(3);

    if (students.length === 0 || instructors.length === 0) {
      console.error('❌ 학생 또는 강사 정보를 찾을 수 없습니다.');
      return;
    }

    // 기존 데이터 삭제
    await PersonalLesson.deleteMany({});
    await LaneRental.deleteMany({});
    console.log('🗑️ 기존 예약 데이터 삭제 완료');

    // 개인레슨 샘플 데이터 생성
    const personalLessons = [
      {
        student: students[0]._id,
        instructor: instructors[0]._id,
        centerId: center._id,
        lessonType: 'freestyle',
        level: 'beginner',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일
        startTime: '10:00',
        endTime: '11:00',
        laneNumber: 1,
        poolType: 'mainPool',
        status: 'requested',
        lessonContent: '자유형 기초 레슨',
        specialRequests: '물에 대한 두려움이 있어서 천천히 진행해주세요.',
        payment: {
          amount: 50000,
          status: 'pending',
          paymentMethod: 'card'
        }
      },
      {
        student: students[1]._id,
        instructor: instructors[1]._id,
        centerId: center._id,
        lessonType: 'backstroke',
        level: 'intermediate',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
        startTime: '14:00',
        endTime: '15:00',
        laneNumber: 2,
        poolType: 'mainPool',
        status: 'accepted',
        lessonContent: '배영 중급 레슨',
        specialRequests: '',
        payment: {
          amount: 60000,
          status: 'paid',
          paymentMethod: 'card',
          paidAt: new Date()
        }
      },
      {
        student: students[2]._id,
        instructor: instructors[2]._id,
        centerId: center._id,
        lessonType: 'breaststroke',
        level: 'advanced',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        startTime: '16:00',
        endTime: '17:00',
        laneNumber: 3,
        poolType: 'mainPool',
        status: 'in_progress',
        lessonContent: '평영 고급 레슨',
        specialRequests: '',
        payment: {
          amount: 70000,
          status: 'paid',
          paymentMethod: 'card',
          paidAt: new Date()
        }
      },
      {
        student: students[3]._id,
        instructor: instructors[0]._id,
        centerId: center._id,
        lessonType: 'butterfly',
        level: 'intermediate',
        scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4일 후
        startTime: '18:00',
        endTime: '19:00',
        laneNumber: 4,
        poolType: 'mainPool',
        status: 'completed',
        lessonContent: '접영 중급 레슨',
        specialRequests: '',
        payment: {
          amount: 65000,
          status: 'paid',
          paymentMethod: 'card',
          paidAt: new Date()
        },
        instructorFeedback: '기술이 많이 향상되었습니다.',
        studentFeedback: '만족스러운 레슨이었습니다.',
        rating: 5
      },
      {
        student: students[4]._id,
        instructor: instructors[1]._id,
        centerId: center._id,
        lessonType: 'general',
        level: 'beginner',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
        startTime: '20:00',
        endTime: '21:00',
        laneNumber: 5,
        poolType: 'mainPool',
        status: 'cancelled',
        lessonContent: '전체적인 수영 기초 레슨',
        specialRequests: '',
        payment: {
          amount: 45000,
          status: 'refunded',
          paymentMethod: 'card'
        },
        cancellation: {
          reason: '개인 사정으로 인한 취소',
          cancelledBy: 'student',
          cancelledAt: new Date(),
          refundAmount: 45000
        }
      }
    ];

    // 오늘 예약 데이터 추가
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    personalLessons.push({
      student: students[0]._id,
      instructor: instructors[0]._id,
      centerId: center._id,
      lessonType: 'freestyle',
      level: 'beginner',
      scheduledDate: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 오늘 오후 2시
      startTime: '14:00',
      endTime: '15:00',
      laneNumber: 1,
      poolType: 'mainPool',
      status: 'accepted',
      lessonContent: '자유형 기초 레슨',
      specialRequests: '',
      payment: {
        amount: 50000,
        status: 'paid',
        paymentMethod: 'card',
        paidAt: new Date()
      }
    });

    await PersonalLesson.insertMany(personalLessons);
    console.log('✅ 개인레슨 샘플 데이터 생성 완료');

    // 레인대여 샘플 데이터 생성
    const laneRentals = [
      {
        renter: students[0]._id,
        centerId: center._id,
        rentalDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일
        startTime: '09:00',
        endTime: '10:00',
        laneNumbers: [1, 2],
        poolType: 'mainPool',
        purpose: 'practice',
        status: 'requested',
        rentalContent: '개인 연습',
        specialRequests: '',
        pricing: {
          hourlyRate: 15000,
          totalHours: 1,
          totalAmount: 30000,
          discount: 0,
          finalAmount: 30000
        },
        payment: {
          status: 'pending',
          paymentMethod: 'card'
        }
      },
      {
        renter: students[1]._id,
        centerId: center._id,
        rentalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
        startTime: '11:00',
        endTime: '13:00',
        laneNumbers: [3],
        poolType: 'mainPool',
        purpose: 'training',
        status: 'approved',
        rentalContent: '훈련',
        specialRequests: '',
        pricing: {
          hourlyRate: 15000,
          totalHours: 2,
          totalAmount: 30000,
          discount: 0,
          finalAmount: 30000
        },
        payment: {
          status: 'paid',
          paymentMethod: 'card',
          paidAt: new Date()
        },
        approval: {
          approvedBy: instructors[0]._id,
          approvedAt: new Date(),
          approvalNotes: '승인 완료'
        }
      },
      {
        renter: students[2]._id,
        centerId: center._id,
        rentalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        startTime: '15:00',
        endTime: '17:00',
        laneNumbers: [4, 5],
        poolType: 'mainPool',
        purpose: 'competition',
        status: 'in_progress',
        rentalContent: '대회 준비',
        specialRequests: '',
        pricing: {
          hourlyRate: 15000,
          totalHours: 2,
          totalAmount: 60000,
          discount: 5000,
          finalAmount: 55000
        },
        payment: {
          status: 'paid',
          paymentMethod: 'card',
          paidAt: new Date()
        },
        approval: {
          approvedBy: instructors[1]._id,
          approvedAt: new Date(),
          approvalNotes: '대회 준비용으로 승인'
        }
      },
      {
        renter: students[3]._id,
        centerId: center._id,
        rentalDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4일 후
        startTime: '19:00',
        endTime: '20:00',
        laneNumbers: [6],
        poolType: 'mainPool',
        purpose: 'recreation',
        status: 'completed',
        rentalContent: '레크리에이션',
        specialRequests: '',
        pricing: {
          hourlyRate: 15000,
          totalHours: 1,
          totalAmount: 15000,
          discount: 0,
          finalAmount: 15000
        },
        payment: {
          status: 'paid',
          paymentMethod: 'card',
          paidAt: new Date()
        },
        approval: {
          approvedBy: instructors[2]._id,
          approvedAt: new Date(),
          approvalNotes: '승인 완료'
        }
      },
      {
        renter: students[4]._id,
        centerId: center._id,
        rentalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
        startTime: '21:00',
        endTime: '22:00',
        laneNumbers: [1, 2, 3],
        poolType: 'mainPool',
        purpose: 'other',
        status: 'cancelled',
        rentalContent: '기타',
        specialRequests: '',
        pricing: {
          hourlyRate: 15000,
          totalHours: 1,
          totalAmount: 45000,
          discount: 0,
          finalAmount: 45000
        },
        payment: {
          status: 'refunded',
          paymentMethod: 'card'
        },
        cancellation: {
          reason: '개인 사정으로 인한 취소',
          cancelledBy: 'renter',
          cancelledAt: new Date(),
          refundAmount: 45000
        }
      }
    ];

    // 오늘 레인대여 데이터 추가
    laneRentals.push({
      renter: students[1]._id,
      centerId: center._id,
      rentalDate: new Date(today.getTime() + 3 * 60 * 60 * 1000), // 오늘 오후 3시
      startTime: '15:00',
      endTime: '16:00',
      laneNumbers: [2],
      poolType: 'mainPool',
      purpose: 'practice',
      status: 'approved',
      rentalContent: '개인 연습',
      specialRequests: '',
      pricing: {
        hourlyRate: 15000,
        totalHours: 1,
        totalAmount: 15000,
        discount: 0,
        finalAmount: 15000
      },
      payment: {
        status: 'paid',
        paymentMethod: 'card',
        paidAt: new Date()
      },
      approval: {
        approvedBy: instructors[0]._id,
        approvedAt: new Date(),
        approvalNotes: '승인 완료'
      }
    });

    await LaneRental.insertMany(laneRentals);
    console.log('✅ 레인대여 샘플 데이터 생성 완료');

    console.log('🎉 예약관리 샘플 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 개인레슨: ${personalLessons.length}개`);
    console.log(`   - 레인대여: ${laneRentals.length}개`);

  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
  }
};

// 메인 실행
const main = async () => {
  await connectDB();
  await createSampleData();
  await mongoose.connection.close();
  console.log('✅ 데이터베이스 연결 종료');
};

main().catch(console.error);
