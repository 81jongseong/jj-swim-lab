/**
 * 🧪 JJ Swim Lab - 테스트 설정 파일
 * 
 * 📋 **파일 목적**
 * - Jest 테스트 실행 전 초기 설정
 * - 테스트 환경 변수 설정
 * - 모킹 및 스텁 설정
 * - 테스트 데이터베이스 설정
 * 
 * 🔄 **주요 기능**
 * - 테스트 환경 변수 설정
 * - 데이터베이스 모킹 설정
 * - 인증 모킹 설정
 * - 파일 시스템 모킹 설정
 * - 외부 API 모킹 설정
 * 
 * 🗄️ **데이터 연동**
 * - 테스트 환경 변수
 * - 모킹된 데이터베이스
 * - 모킹된 인증 시스템
 * - 모킹된 파일 시스템
 * 
 * 🛠️ **필요한 설치 파일**
 * - Jest 테스트 프레임워크
 * - MongoDB Memory Server
 * - Supertest (API 테스트)
 * - 모킹 라이브러리
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테스트 환경과 프로덕션 환경 분리
 * 2. 테스트 데이터 격리 및 정리
 * 3. 모킹의 정확성 및 일관성
 * 4. 테스트 성능 최적화
 * 5. 에러 처리 및 로깅
 * 6. 테스트 의존성 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테스트 환경 변수 설정 확인
 * - [ ] 데이터베이스 모킹 확인
 * - [ ] 인증 모킹 확인
 * - [ ] 파일 시스템 모킹 확인
 * - [ ] 외부 API 모킹 확인
 * - [ ] 테스트 성능 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 테스트 설정 구현
 * - 2024-12-19: 환경 변수 설정 구현
 * - 2024-12-19: 데이터베이스 모킹 구현
 * - 2024-12-19: 인증 모킹 구현
 * - 2024-12-19: 파일 시스템 모킹 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테스트 설정 완료)
 * 
 * 🚀 **다음 단계**
 * - 테스트 자동화 개선
 * - 성능 테스트 추가
 * - 통합 테스트 강화
 * - E2E 테스트 통합
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 테스트에서 사용
 * import { setupTestEnvironment } from './setup';
 * 
 * beforeAll(async () => {
 *   await setupTestEnvironment();
 * });
 * ```
 * 
 * 🔍 **테스트 설정 처리 흐름**
 * 1. 환경 변수 설정 및 검증
 * 2. 데이터베이스 모킹 설정
 * 3. 인증 시스템 모킹 설정
 * 4. 파일 시스템 모킹 설정
 * 5. 외부 API 모킹 설정
 * 6. 테스트 유틸리티 초기화
 * 7. 테스트 실행 준비 완료
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/jj-swim-lab-test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.UPLOAD_PATH = './test-uploads';

// MongoDB Memory Server 인스턴스
let mongoServer: MongoMemoryServer;

// 테스트 환경 설정
export const setupTestEnvironment = async (): Promise<void> => {
  try {
    // MongoDB Memory Server 시작
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'jj-swim-lab-test'
      }
    });
    
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    
  // MongoDB 연결 (이미 연결되어 있지 않은 경우에만)
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
    
    console.log('✅ 테스트 환경 설정 완료');
  } catch (error) {
    console.error('❌ 테스트 환경 설정 실패:', error);
    throw error;
  }
};

// 테스트 환경 정리
export const cleanupTestEnvironment = async (): Promise<void> => {
  try {
    // MongoDB 연결 해제
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // MongoDB Memory Server 중지
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ 테스트 환경 정리 완료');
  } catch (error) {
    console.error('❌ 테스트 환경 정리 실패:', error);
    throw error;
  }
};

// 데이터베이스 정리
export const clearDatabase = async (): Promise<void> => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('✅ 데이터베이스 정리 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 정리 실패:', error);
    throw error;
  }
};

// 모킹된 사용자 데이터
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: '테스트 사용자',
  email: 'test@example.com',
  password: 'hashedPassword',
  userType: 'student',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// 모킹된 센터 데이터
export const mockCenter = {
  _id: '507f1f77bcf86cd799439012',
  name: '테스트 수영장',
  address: '서울시 강남구',
  phone: '02-1234-5678',
  email: 'test@pool.com',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date()
};

// 모킹된 강습 데이터
export const mockCourse = {
  _id: '507f1f77bcf86cd799439013',
  name: '테스트 강습',
  description: '테스트 강습 설명',
  instructor: '507f1f77bcf86cd799439011',
  level: 'beginner',
  maxStudents: 10,
  currentStudents: 0,
  schedule: '월,수,금 10:00-11:00',
  price: 100000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// JWT 토큰 생성 헬퍼
export const generateTestToken = (payload: any = mockUser): string => {
  const jwt = require('jsonwebtoken');
  
  // userId를 id로 매핑하여 인증 미들웨어와 호환되도록 함
  const tokenPayload = {
    ...payload,
    id: payload.userId || payload.id
  };
  
  // exp 속성이 있으면 제거하고 expiresIn 사용
  const { exp, ...payloadWithoutExp } = tokenPayload;
  
  return jwt.sign(payloadWithoutExp, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'jj-swim-lab',
    audience: 'jj-swim-lab-users'
  });
};

// 테스트용 JWT 토큰 생성 함수
export const createTestToken = (userData: any = {}) => {
  const jwt = require('jsonwebtoken');
  
  const defaultUserData = {
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    userType: 'student',
    centerId: null,
    ...userData
  };

  return jwt.sign(defaultUserData, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

// 테스트 사용자 생성 함수 (User 모델 import 문제 해결)
export const createTestUser = async (userData: any = {}) => {
  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  
  // User 모델을 mongoose를 통해 직접 접근
  const User = mongoose.model('User');
  
  const defaultUserData = {
    email: 'test@example.com',
    password: 'password123',
    name: '테스트 사용자',
    userType: 'student',
    ...userData
  };
  
  // 비밀번호 해싱
  if (defaultUserData.password) {
    defaultUserData.password = await bcrypt.hash(defaultUserData.password, 10);
  }
  
  const user = new User(defaultUserData);
  await user.save();
  
  return user;
};

// API 테스트 헬퍼
export const createTestApp = () => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  return app;
};

// 파일 업로드 모킹
export const mockFileUpload = (filename: string, content: string) => {
  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(content),
    size: content.length
  };
};

// 에러 모킹
export const mockError = (message: string, statusCode: number = 500) => {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
};

// 비동기 함수 테스트 헬퍼
export const asyncTest = (fn: () => Promise<any>) => {
  return (done: jest.DoneCallback) => {
    fn().then(() => done()).catch(done);
  };
};

// 타임아웃 설정
jest.setTimeout(30000);

// 전역 모킹 설정
beforeAll(async () => {
  await setupTestEnvironment();
});

afterAll(async () => {
  await cleanupTestEnvironment();
});

beforeEach(async () => {
  await clearDatabase();
});

  // 콘솔 로그 모킹 (테스트 중 로그 출력 방지) - 디버깅을 위해 비활성화
  // global.console = {
  //   ...console,
  //   log: jest.fn(),
  //   debug: jest.fn(),
  //   info: jest.fn(),
  //   warn: jest.fn(),
  //   error: jest.fn()
  // };

export default {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  mockUser,
  mockCenter,
  mockCourse,
  generateTestToken,
  createTestApp,
  mockFileUpload,
  mockError,
  asyncTest
};
