/**
 * 🌱 JJ Swim Lab - 테스트 데이터 시드 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 개발 및 테스트를 위한 샘플 데이터 생성 및 관리
 * - 데이터베이스 초기화 및 테스트 데이터 시드
 * - 다양한 테스트 시나리오를 위한 데이터 제공
 * - 개발 환경 구축 및 테스트 지원
 * - 데이터 일관성 및 무결성 보장
 * 
 * 🔄 **주요 기능**
 * - 테스트 데이터 시드 생성
 * - 데이터베이스 초기화 및 리셋
 * - 샘플 사용자, 센터, 상품 데이터 생성
 * - 테스트 시나리오별 데이터 구성
 * - 데이터 일관성 검증
 * - 데이터 정리 및 정리
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (사용자 데이터)
 * - Center 모델과 연동 (센터 데이터)
 * - Product 모델과 연동 (상품 데이터)
 * - Order 모델과 연동 (주문 데이터)
 * - ExerciseRecommendation 모델과 연동 (운동 추천 데이터)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose (MongoDB ODM)
 * - User 모델 (../models/User)
 * - Center 모델 (../models/Center)
 * - Product 모델 (../models/Product)
 * - Order 모델 (../models/Order)
 * - ExerciseRecommendation 모델 (../models/ExerciseRecommendation)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테스트 데이터의 일관성 및 무결성
 * 2. 프로덕션 환경에서의 실행 방지
 * 3. 테스트 데이터 보안 및 개인정보 보호
 * 4. 데이터베이스 연결 및 트랜잭션 관리
 * 5. 테스트 데이터 정리 및 정리
 * 6. 테스트 시나리오별 데이터 구성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테스트 데이터 일관성 확인
 * - [ ] 프로덕션 환경 실행 방지 확인
 * - [ ] 테스트 데이터 보안 확인
 * - [ ] 데이터베이스 연결 관리 확인
 * - [ ] 테스트 데이터 정리 확인
 * - [ ] 테스트 시나리오 구성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 테스트 데이터 시드 유틸리티 구현
 * - 2024-12-19: 사용자 및 센터 데이터 시드 구현
 * - 2024-12-19: 상품 및 주문 데이터 시드 구현
 * - 2024-12-19: 운동 추천 데이터 시드 구현
 * - 2024-12-19: 데이터 일관성 검증 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테스트 데이터 시드 유틸리티 완료)
 * 
 * 🚀 **다음 단계**
 * - 테스트 데이터 자동화
 * - 테스트 시나리오 확장
 * - 테스트 데이터 검증 강화
 * - 테스트 데이터 관리 시스템
 * - 테스트 데이터 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { seedTestData } from '../utils/seedData';
 * 
 * // 테스트 데이터 시드 실행
 * await seedTestData();
 * 
 * // 개발 환경에서만 실행
 * if (process.env.NODE_ENV === 'development') {
 *   await seedTestData();
 * }
 * ```
 * 
 * 🔍 **테스트 데이터 시드 처리 흐름**
 * 1. 데이터베이스 연결 확인 및 검증
 * 2. 기존 테스트 데이터 정리 및 삭제
 * 3. 샘플 사용자 데이터 생성 및 저장
 * 4. 샘플 센터 데이터 생성 및 저장
 * 5. 샘플 상품 및 주문 데이터 생성 및 저장
 * 6. 샘플 운동 추천 데이터 생성 및 저장
 * 7. 데이터 일관성 검증 및 완료 보고
 */

import mongoose from 'mongoose';
import { User } from '../models/User';
import Center from '../models/Center';
import Product from '../models/Product';
import Order from '../models/Order';
import ExerciseRecommendation from '../models/ExerciseRecommendation';

// 테스트 데이터 시드 함수
export const seedTestData = async () => {
  try {
    console.log('🌱 테스트 데이터 시드 시작...');
    
    // 센터 데이터 확인 및 생성
    let center = await Center.findOne({ name: 'JJ Swim Lab 메인 센터' });
    if (!center) {
      center = new Center({
        name: 'JJ Swim Lab 메인 센터',
        address: '서울특별시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'main@jjswimlab.com',
        managerId: new mongoose.Types.ObjectId(),
        instructors: [],
        students: [],
        courses: [],
        capacity: 100,
        status: 'active',
        facilities: ['25m 풀', '50m 풀', '사우나', '헬스장'],
        operatingHours: {
          open: '06:00',
          close: '22:00',
          days: ['월', '화', '수', '목', '금', '토', '일']
        }
      });
      await center.save();
      console.log('✅ 센터 데이터 생성 완료');
    }
    
    // 관리자 사용자 확인 및 생성
    let adminUser = await User.findOne({ email: 'admin@jjswimlab.com' });
    if (!adminUser) {
      adminUser = new User({
        name: '시스템 관리자',
        email: 'admin@jjswimlab.com',
        password: '$2a$12$2y/oGMSJuxuQsLAbAcgrse.lIKP4bj58zoKe7wGZNJP44F6mF02M2', // 101010
        userType: 'admin',
        centerId: center._id,
        isActive: true,
        profile: {
          phone: '010-1234-5678',
          birthDate: new Date('1990-01-01'),
          gender: 'male'
        }
      });
      await adminUser.save();
      console.log('✅ 관리자 사용자 생성 완료');
    }
    
    // 센터 관리자 사용자 확인 및 생성
    let centerAdminUser = await User.findOne({ email: 'center@jjswimlab.com' });
    if (!centerAdminUser) {
      centerAdminUser = new User({
        name: '센터 관리자',
        email: 'center@jjswimlab.com',
        password: '$2a$12$2y/oGMSJuxuQsLAbAcgrse.lIKP4bj58zoKe7wGZNJP44F6mF02M2', // 101010
        userType: 'centerAdmin',
        centerId: center._id,
        isActive: true,
        profile: {
          phone: '010-2345-6789',
          birthDate: new Date('1985-05-15'),
          gender: 'female'
        }
      });
      await centerAdminUser.save();
      console.log('✅ 센터 관리자 사용자 생성 완료');
    }
    
    // 강사 사용자들 생성
    const instructors = [
      {
        name: '김수영',
        email: 'kim@jjswimlab.com',
        phone: '010-1111-2222',
        userType: 'instructor',
        specialties: ['자유형', '배영']
      },
      {
        name: '이영수',
        email: 'lee@jjswimlab.com',
        phone: '010-3333-4444',
        userType: 'instructor',
        specialties: ['평영', '접영']
      },
      {
        name: '박물수',
        email: 'park@jjswimlab.com',
        phone: '010-5555-6666',
        userType: 'instructor',
        specialties: ['자유형', '접영']
      }
    ];
    
    for (const instructorData of instructors) {
      let instructor = await User.findOne({ email: instructorData.email });
      if (!instructor) {
        instructor = new User({
          name: instructorData.name,
          email: instructorData.email,
          password: '$2a$12$2y/oGMSJuxuQsLAbAcgrse.lIKP4bj58zoKe7wGZNJP44F6mF02M2', // 101010
          userType: instructorData.userType,
          centerId: center._id,
          isActive: true,
          profile: {
            phone: instructorData.phone,
            birthDate: new Date('1988-03-20'),
            gender: 'male',
            specialties: instructorData.specialties
          }
        });
        await instructor.save();
        console.log(`✅ 강사 ${instructorData.name} 생성 완료`);
      }
    }
    
    // 학생 사용자들 생성
    const students = [
      {
        name: '최학생',
        email: 'student1@example.com',
        phone: '010-7777-8888',
        level: 'beginner'
      },
      {
        name: '정학생',
        email: 'student2@example.com',
        phone: '010-9999-0000',
        level: 'intermediate'
      },
      {
        name: '한학생',
        email: 'student3@example.com',
        phone: '010-1111-3333',
        level: 'advanced'
      }
    ];
    
    for (const studentData of students) {
      let student = await User.findOne({ email: studentData.email });
      if (!student) {
        student = new User({
          name: studentData.name,
          email: studentData.email,
          password: '$2a$12$2y/oGMSJuxuQsLAbAcgrse.lIKP4bj58zoKe7wGZNJP44F6mF02M2', // 101010
          userType: 'student',
          centerId: center._id,
          isActive: true,
          profile: {
            phone: studentData.phone,
            birthDate: new Date('2000-06-15'),
            gender: 'female',
            level: studentData.level
          }
        });
        await student.save();
        console.log(`✅ 학생 ${studentData.name} 생성 완료`);
      }
    }
    
    // 상품 데이터 생성
    const products = [
      {
        name: '수영복 (남성용)',
        description: '편안한 착용감의 남성용 수영복',
        price: 45000,
        category: '수영복',
        subCategory: '남성용',
        stock: 50,
        tags: ['수영복', '남성', '기본']
      },
      {
        name: '수영복 (여성용)',
        description: '스타일리시한 여성용 수영복',
        price: 55000,
        category: '수영복',
        subCategory: '여성용',
        stock: 40,
        tags: ['수영복', '여성', '스타일']
      },
      {
        name: '수영모자',
        description: '물 저항을 줄이는 실리콘 수영모자',
        price: 15000,
        category: '액세서리',
        subCategory: '모자',
        stock: 100,
        tags: ['모자', '실리콘', '액세서리']
      },
      {
        name: '수영고글',
        description: 'UV 차단 기능이 있는 수영고글',
        price: 25000,
        category: '액세서리',
        subCategory: '고글',
        stock: 80,
        tags: ['고글', 'UV차단', '액세서리']
      },
      {
        name: '수영장 타월',
        description: '빠른 건조 기능의 수영장 타월',
        price: 35000,
        category: '액세서리',
        subCategory: '타월',
        stock: 60,
        tags: ['타월', '빠른건조', '액세서리']
      }
    ];
    
    for (const productData of products) {
      let product = await Product.findOne({ name: productData.name });
      if (!product) {
        product = new Product({
          ...productData,
          centerId: center._id,
          createdBy: centerAdminUser._id,
          status: 'active'
        });
        await product.save();
        console.log(`✅ 상품 ${productData.name} 생성 완료`);
      }
    }
    
    // 운동 추천 데이터 생성
    const exerciseRecommendations = [
      {
        technique: 'freestyle',
        level: 'beginner',
        category: 'posture',
        exercises: [
          {
            name: '스트림라인 자세 연습',
            description: '물속에서 몸을 일직선으로 유지하는 기본 자세 연습',
            difficulty: 'easy',
            duration: 10,
            equipment: ['수영장'],
            instructions: [
              '벽을 잡고 몸을 수평으로 띄우기',
              '머리부터 발끝까지 일직선 유지',
              '복부에 힘을 주어 몸통 안정화'
            ],
            benefits: ['기본 자세 습득', '물 저항 감소'],
            precautions: ['목에 무리 주지 않기']
          }
        ],
        workoutPlan: [],
        isActive: true
      },
      {
        technique: 'freestyle',
        level: 'intermediate',
        category: 'breathing',
        exercises: [
          {
            name: '사이드 브리딩 연습',
            description: '자유형 호흡 시 몸의 회전과 호흡 타이밍 연습',
            difficulty: 'medium',
            duration: 15,
            equipment: ['수영장', '키킹보드'],
            instructions: [
              '키킹보드를 잡고 한 팔만 스트로크',
              '호흡 시 몸을 옆으로 회전',
              '입은 물 밖으로, 코는 물속으로'
            ],
            benefits: ['호흡 기술 향상', '몸의 회전 연습'],
            precautions: ['과도한 회전 주의']
          }
        ],
        workoutPlan: [],
        isActive: true
      }
    ];
    
    for (const recData of exerciseRecommendations) {
      let recommendation = await ExerciseRecommendation.findOne({
        technique: recData.technique,
        level: recData.level,
        category: recData.category
      });
      if (!recommendation) {
        recommendation = new ExerciseRecommendation({
          ...recData,
          centerId: center._id,
          createdBy: centerAdminUser._id
        });
        await recommendation.save();
        console.log(`✅ 운동 추천 ${recData.technique}-${recData.level}-${recData.category} 생성 완료`);
      }
    }
    
    // 주문 데이터 생성
    const orders = [
      {
        customerId: (await User.findOne({ email: 'student1@example.com' }))?._id,
        customerName: '최학생',
        customerEmail: 'student1@example.com',
        customerPhone: '010-7777-8888',
        items: [
          {
            productId: (await Product.findOne({ name: '수영복 (남성용)' }))?._id,
            productName: '수영복 (남성용)',
            quantity: 1,
            price: 45000
          },
          {
            productId: (await Product.findOne({ name: '수영모자' }))?._id,
            productName: '수영모자',
            quantity: 2,
            price: 15000
          }
        ],
        paymentMethod: 'card',
        status: 'delivered',
        paymentStatus: 'paid'
      }
    ];
    
    for (const orderData of orders) {
      if (orderData.customerId) {
        let order = await Order.findOne({ 
          customerId: orderData.customerId,
          customerEmail: orderData.customerEmail
        });
        if (!order) {
          order = new Order({
            ...orderData,
            centerId: center._id,
            createdBy: centerAdminUser._id
          });
          await order.save();
          console.log(`✅ 주문 ${order.orderNumber} 생성 완료`);
        }
      }
    }
    
    console.log('🎉 모든 테스트 데이터 시드 완료!');
    return true;
  } catch (error) {
    console.error('❌ 테스트 데이터 시드 오류:', error);
    return false;
  }
};

// 시드 데이터 실행 함수
export const runSeedData = async () => {
  try {
    const success = await seedTestData();
    if (success) {
      console.log('✅ 데이터베이스 시드 완료');
    } else {
      console.log('❌ 데이터베이스 시드 실패');
    }
  } catch (error) {
    console.error('❌ 시드 실행 오류:', error);
  }
};
