/**
 * ❌ JJ Swim Lab - 테스트용 Express 앱
 * 
 * 📋 **파일 목적**
 * - Jest 테스트를 위한 Express 앱 설정
 * - 테스트 환경에 최적화된 미들웨어 구성
 * - 실제 서버와 동일한 라우트 구조 제공
 * 
 * 🔄 **주요 기능**
 * - Express 앱 생성 및 설정
 * - 테스트용 미들웨어 등록
 * - API 라우트 등록
 * - 에러 처리 미들웨어 등록
 * 
 * 🗄️ **데이터 연동**
 * - Express 앱 인스턴스
 * - API 라우트 모듈들
 * - 미들웨어 설정
 * - 에러 처리 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js
 * - API 라우트 파일들
 * - 미들웨어 파일들
 * - 에러 처리 유틸리티
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테스트 환경에 맞는 설정 사용
 * 2. 실제 서버와 동일한 라우트 구조 유지
 * 3. 테스트 데이터 격리
 * 4. 메모리 누수 방지
 * 5. 테스트 성능 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 라우트 등록 확인
 * - [ ] 미들웨어 설정 확인
 * - [ ] 에러 처리 확인
 * - [ ] 테스트 데이터 격리 확인
 * - [ ] 메모리 누수 방지 확인
 * - [ ] 테스트 성능 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 테스트용 Express 앱 구현
 * - 2024-12-19: API 라우트 등록 구현
 * - 2024-12-19: 에러 처리 미들웨어 등록 구현
 * - 2024-12-19: 테스트 환경 최적화 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테스트용 Express 앱 완료)
 * 
 * 🚀 **다음 단계**
 * - 테스트 성능 최적화
 * - 테스트 데이터 관리 개선
 * - 테스트 커버리지 향상
 * - 테스트 자동화 개선
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { createTestApp } from './testApp';
 * import request from 'supertest';
 * 
 * const app = createTestApp();
 * const response = await request(app)
 *   .get('/api/users')
 *   .expect(200);
 * ```
 * 
 * 🔍 **테스트 앱 설정 흐름**
 * 1. Express 앱 생성
 * 2. 기본 미들웨어 등록
 * 3. API 라우트 등록
 * 4. 에러 처리 미들웨어 등록
 * 5. 테스트 환경 설정 적용
 * 6. 앱 인스턴스 반환
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from '../src/utils/errorHandler';

// API 라우트 임포트 (존재하는 라우트만)
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import centerRoutes from '../src/routes/centers';
import uploadRoutes from '../src/routes/uploads';
import courseRoutes from '../src/routes/courses';
import bookingRoutes from '../src/routes/bookings';
import paymentRoutes from '../src/routes/payments';
import noticeRoutes from '../src/routes/notices';
import communityRoutes from '../src/routes/community';
import shopRoutes from '../src/routes/shop';
import lessonPlanRoutes from '../src/routes/lesson-plans';
import exerciseRoutes from '../src/routes/exercise';
import reportRoutes from '../src/routes/report';

/**
 * 테스트용 Express 앱 생성
 * @returns {express.Application} Express 앱 인스턴스
 */
export const createTestApp = (): express.Application => {
  const app = express();

  // 기본 미들웨어 설정
  app.use(helmet({
    contentSecurityPolicy: false, // 테스트 환경에서는 CSP 비활성화
    crossOriginEmbedderPolicy: false
  }));
  
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // 테스트 환경에서는 로깅 최소화
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }
  
  // 테스트 환경에서는 rate limiting 비활성화
  if (process.env.NODE_ENV !== 'test') {
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // 최대 100 요청
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    }));
  }

  // API 라우트 등록 (존재하는 라우트만)
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/centers', centerRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/notices', noticeRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/shop', shopRoutes);
  app.use('/api/lesson-plans', lessonPlanRoutes);
  app.use('/api/exercises', exerciseRoutes);
  app.use('/api/reports', reportRoutes);



  // 에러 처리 미들웨어
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createTestApp;
