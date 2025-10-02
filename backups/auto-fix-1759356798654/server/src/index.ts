/**
 * 🚀 JJ Swim Lab - 메인 서버 진입점
 * 
 * 📋 **서버 목적**
 * - JJ Swim Lab 웹 애플리케이션의 메인 서버 진입점
 * - Express.js 기반 RESTful API 서버 구축
 * - MongoDB 데이터베이스 연결 및 소켓 통신 지원
 * - 인증, 권한 관리, 파일 업로드 등 핵심 기능 제공
 * 
 * 🔄 **주요 기능**
 * - Express.js 웹 서버 설정 및 미들웨어 구성
 * - MongoDB Atlas 데이터베이스 연결
 * - Socket.IO 실시간 통신 지원
 * - JWT 기반 인증 및 권한 관리
 * - CORS 및 보안 미들웨어 적용
 * - 파일 업로드 및 정적 파일 서빙
 * - 환경 변수 관리 및 시드 데이터 실행
 * 
 * 🗄️ **데이터 연동**
 * - MongoDB Atlas (클라우드 데이터베이스)
 * - 모든 모델 파일들과 연동 (User, Center, Course 등)
 * - Socket.IO 클라이언트와 실시간 통신
 * - 파일 시스템 (이미지, 문서 업로드)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js 4.18.2
 * - MongoDB Driver 7.8.7
 * - Socket.IO 4.7.5
 * - JWT 9.0.2
 * - CORS 2.8.5
 * - Multer 1.4.5-lts.1
 * - Dotenv 16.3.1
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 환경 변수 설정 필수 (.env 파일)
 * 2. MongoDB Atlas 연결 정보 보안 관리
 * 3. CORS 설정 시 프로덕션 환경 고려
 * 4. 파일 업로드 크기 제한 설정
 * 5. 에러 처리 및 로깅 시스템 구축
 * 6. 보안 헤더 및 미들웨어 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 새로운 라우트 추가 시 index.ts에 등록
 * - [ ] 환경 변수 추가 시 .env 파일 업데이트
 * - [ ] 보안 미들웨어 설정 검토
 * - [ ] 에러 처리 로직 개선
 * - [ ] 성능 모니터링 추가
 * - [ ] 로그 시스템 구축
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 서버 구조 설정
 * - 2024-12-19: 인증 시스템 및 미들웨어 추가
 * - 2024-12-19: 센터 관리 및 승인 시스템 추가
 * - 2024-12-19: 보안 및 검증 미들웨어 개선
 * - 2024-12-19: 에러 처리 표준화 (표준화된 에러 처리 미들웨어 적용)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (메인 서버 구축 완료)
 * 
 * 🚀 **다음 단계**
 * - API 문서화 (Swagger/OpenAPI)
 * - 로그 시스템 구축 (Winston)
 * - 성능 모니터링 (PM2)
 * - 보안 강화 (Rate Limiting, Helmet)
 * - 테스트 자동화 (Jest, Supertest)
 * 
 * 💡 **사용 예시**
 * ```bash
 * # 개발 서버 시작
 * npm run dev
 * 
 * # 프로덕션 빌드
 * npm run build
 * 
 * # 프로덕션 서버 시작
 * npm start
 * ```
 * 
 * 🔍 **서버 처리 흐름**
 * 1. 환경 변수 로드 및 설정
 * 2. Express 앱 초기화 및 미들웨어 설정
 * 3. MongoDB 데이터베이스 연결
 * 4. 라우트 등록 및 API 엔드포인트 설정
 * 5. Socket.IO 서버 초기화
 * 6. 파일 업로드 및 정적 파일 서빙 설정
 * 7. 에러 처리 및 서버 시작
 * 8. 시드 데이터 실행 (개발 환경)
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// 보안 미들웨어 import
import { securityMiddleware } from './middleware/security';
import { authMiddleware } from './middleware/auth';
import { createValidationMiddleware } from './middleware/validation';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import { cache } from './middleware/cache';
import { apiMonitoring, userActivityTracking, securityEventTracking, errorTracking } from './middleware/monitoring';
import { trackUserActivity, trackSecurityEvents } from './middleware/userActivity';
import { pageTrackingMiddleware, cleanupOldPageVisits } from './middleware/pageTracking';
import { maintenanceModeMiddleware } from './middleware/maintenanceMode';
import { dynamicRateLimitMiddleware } from './middleware/dynamicRateLimit';
import { emailService } from './services/emailService';
import { backupService } from './services/backupService';
import { performanceService } from './services/performanceService';

// Deprecation warning 무시 설정
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('util._extend')) {
    // util._extend 관련 warning은 무시
    return;
  }
  // 다른 중요한 warning은 표시
  if (warning.name !== 'DeprecationWarning') {
    console.warn(warning.name, warning.message);
  }
});

// 환경 변수 로드 (다른 import 전에 실행)
const envPath = path.join(__dirname, '../.env');
console.log('🔍 .env 파일 경로:', envPath);
dotenv.config({ path: envPath });

// 환경 변수 로드 후 connectDB import
import { connectDB } from './db';
import { runSeedData } from './utils/seedData';

// 라우트 임포트
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';
import courseRoutes from './routes/courses';
import bookingRoutes from './routes/bookings';
import centerRoutes from './routes/centers';
import noticeRoutes from './routes/notices';
import paymentRoutes from './routes/payments';
import progressRoutes from './routes/progress';
import quizRoutes from './routes/quiz';
import membershipRoutes from './routes/membership';
import reportRoutes from './routes/report';
import aiConfigRoutes from './routes/ai-config';
import uploadRoutes from './routes/uploads';
import teachingMethodsRoutes from './routes/teaching-methods';
import updateLevelsRoutes from './routes/update-levels';
// import communityRoutes from './routes/community'; // 임시 비활성화
import shopRoutes from './routes/shop';
import systemRoutes from './routes/system';
import centerInfoRoutes from './routes/center-info';
import checklistRoutes from './routes/checklist';
import checklistTemplateRoutes from './routes/checklist-template';
import classChecklistRoutes from './routes/class-checklist';
import classesRoutes from './routes/classes';
import studentProgressRoutes from './routes/student-progress';
import centerLevelRoutes from './routes/center-level';
import studentLevelRoutes from './routes/student-levels';
import instructorRoutes from './routes/instructor';
import instructorManagementRoutes from './routes/instructorManagement';
import instructorEvaluationRoutes from './routes/instructor-evaluation';
import revenueRoutes from './routes/revenue';
import approvalRoutes from './routes/approvals';
// 사용자 유형별 라우트
import centerAdminRoutes from './routes/center-admin';
import studentRoutes from './routes/student';
// AI 라우트들 정상화
import aiRoutes from './routes/ai';
import smartwatchRoutes from './routes/smartwatch';
import videoAnalysisRoutes from './routes/video-analysis';
import aiEvaluationCriteriaRoutes from './routes/ai-evaluation-criteria';
import video3DAnalysisRoutes from './routes/video-3d-analysis';
import videoUploadRoutes from './routes/video-upload';
import aiExerciseRecommendationsRoutes from './routes/ai-exercise-recommendations';
import ordersRoutes from './routes/orders';
import centerRegistrationRoutes from './routes/center-registrations';
import centerManagementRoutes from './routes/center-management';
// 새로운 건강정보 및 센터 소개 라우트
import healthConfigRoutes from './routes/health-config';
import centerIntroductionRoutes from './routes/center-introduction';
import exerciseRoutes from './routes/exercise';
import sampleDataRoutes from './routes/sample-data';
import youtubeVideoRoutes from './routes/youtube-videos';
import learningProgressRoutes from './routes/learning-progress';
import recommendationRoutes from './routes/recommendations';
import lessonPlanRoutes from './routes/lesson-plans';
import lessonPlanTemplateRoutes from './routes/lesson-plan-templates';
import studentGoalRoutes from './routes/student-goals';
import notificationRoutes from './routes/notifications';
import monitoringRoutes from './routes/monitoring';
import backupRoutes from './routes/backup';
import userActivityRoutes from './routes/user-activities';
import performanceRoutes from './routes/performance';
import advancedAIRoutes from './routes/advancedAI';
import instructorHistoryRoutes from './routes/instructorHistory';
import socialCommunityRoutes from './routes/socialCommunity';
import aiTrainingPlanRoutes from './routes/aiTrainingPlan';
import aiInjuryPredictionRoutes from './routes/aiInjuryPrediction';
import aiPerformancePredictionRoutes from './routes/aiPerformancePrediction';
import medicalExercisePrescriptionRoutes from './routes/medicalExercisePrescription';
import healthExerciseAIRoutes from './routes/health-exercise-ai';
import exercisePrescriptionRoutes from './routes/exercise-prescription';
import healthInputRoutes from './routes/health-input';
import swimEngineRoutes from './routes/swim-engine';

// Models (for database connection) - Checklist를 가장 먼저 등록
console.log('📦 모델 import 시작...');

// 최소한의 필수 모델만 import (무한 로딩 해결용)
import './models/TrainingPlan';
import './models/InjuryPrediction';
import './models/PerformancePrediction';
import './models/HealthAssessment';
import './models/User';
import './models/Checklist';
import './models/Center';
import './models/InstructorHistory';
import './models/Community';

console.log('📦 기본 모델 import 완료!');

// AI 모델들 정상화
import './models/AIAnalysis';
import './models/AIEvaluationCriteria';
import './models/SmartWatchData';
import './models/VideoAnalysisCriteria';
import './models/VideoProcessingJob';
import './models/ExerciseRecommendation';
import './models/Order';
import './models/Product';
import './models/CenterRegistration';
import './models/YouTubeVideo';
import './models/LearningProgress';
import './models/Recommendation';
import './models/LessonPlan';
import './models/StudentGoal';
import './models/Notification';
import './models/UserActivity';
// 새로운 건강정보 모델
import './models/HealthConfig';
import './models/AdminReport';
import './models/SystemConfig';
import './models/LoginLog';
import './models/PageVisit';

console.log('📦 모든 모델 import 완료!');

console.log('🚀 index.ts 모듈 로딩 시작...');

// 모델 등록 확인 (모든 모델 import 후)
setTimeout(() => {
  console.log('🔍 모델 등록 상태 확인:');
  console.log('   - AIConfig 모델:', mongoose.models.AIConfig ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Approval 모델:', mongoose.models.Approval ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Booking 모델:', mongoose.models.Booking ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - CenterInfo 모델:', mongoose.models.CenterInfo ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - CenterLevel 모델:', mongoose.models.CenterLevel ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - ChecklistTemplate 모델:', mongoose.models.ChecklistTemplate ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Class 모델:', mongoose.models.Class ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - ClassChecklist 모델:', mongoose.models.ClassChecklist ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - CommunityComment 모델:', mongoose.models.CommunityComment ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - CommunityPost 모델:', mongoose.models.CommunityPost ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - CommunityReport 모델:', mongoose.models.CommunityReport ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Course 모델:', mongoose.models.Course ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - CourseAction 모델:', mongoose.models.CourseAction ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Evaluation 모델:', mongoose.models.Evaluation ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - ExerciseData 모델:', mongoose.models.ExerciseData ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - ExercisePrescription 모델:', mongoose.models.ExercisePrescription ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - HealthData 모델:', mongoose.models.HealthData ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - InstructorEvaluationCriteria 모델:', mongoose.models.InstructorEvaluationCriteria ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - InstructorEvaluationResult 모델:', mongoose.models.InstructorEvaluationResult ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - LessonPlanTemplate 모델:', mongoose.models.LessonPlanTemplate ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Membership 모델:', mongoose.models.Membership ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Notice 모델:', mongoose.models.Notice ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Payment 모델:', mongoose.models.Payment ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Progress 모델:', mongoose.models.Progress ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Quiz 모델:', mongoose.models.Quiz ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - QuizAttempt 모델:', mongoose.models.QuizAttempt ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Report 모델:', mongoose.models.Report ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Review 모델:', mongoose.models.Review ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - ShopOrder 모델:', mongoose.models.ShopOrder ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - ShopProduct 모델:', mongoose.models.ShopProduct ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - SkillTemplate 모델:', mongoose.models.SkillTemplate ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - StudentHealth 모델:', mongoose.models.StudentHealth ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - StudentProgress 모델:', mongoose.models.StudentProgress ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - SwimmingCenter 모델:', mongoose.models.SwimmingCenter ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - TeachingMethod 모델:', mongoose.models.TeachingMethod ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Video 모델:', mongoose.models.Video ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Checklist 모델:', mongoose.models.Checklist ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - User 모델:', mongoose.models.User ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - TeachingMethod 모델:', mongoose.models.TeachingMethod ? '✅ 등록됨' : '❌ 미등록');
  console.log('   - Course 모델:', mongoose.models.Course ? '✅ 등록됨' : '❌ 미등록');
  
  // Checklist 모델이 등록되지 않았다면 강제 등록
  if (!mongoose.models.Checklist) {
    console.log('⚠️ Checklist 모델이 등록되지 않음 - 강제 등록 시도...');
    try {
      const { ChecklistSchema } = require('./models/Checklist');
      mongoose.model('Checklist', ChecklistSchema);
      console.log('✅ Checklist 모델 강제 등록 성공!');
    } catch (error) {
      console.error('❌ Checklist 모델 강제 등록 실패:', error);
    }
  } else {
    console.log('✅ Checklist 모델이 이미 등록되어 있습니다.');
  }
}, 100);

// 환경 변수 디버깅
console.log('🔍 환경 변수 확인:');
console.log('   - MONGODB_URI:', process.env.MONGODB_URI ? '✅ 설정됨' : '❌ 설정되지 않음');
console.log('   - MONGODB_URI 값:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : '없음');
console.log('   - PORT:', process.env.PORT || '기본값 5000');
console.log('   - NODE_ENV:', process.env.NODE_ENV || '기본값 development');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"]
  }
});

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log('🔌 클라이언트 연결됨:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 클라이언트 연결 해제:', socket.id);
  });
  
  // 실시간 알림 예시
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`🔌 클라이언트 ${socket.id}가 ${room}에 참여`);
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB 연결은 db.ts 모듈에서 처리

// 보안 미들웨어 적용
app.use(securityMiddleware);

// 점검 모드 체크 (가장 먼저 적용) - 임시 비활성화
// app.use(maintenanceModeMiddleware);

// 동적 API 요청 제한 - 임시 비활성화  
// app.use(dynamicRateLimitMiddleware);

// 압축 미들웨어 (성능 최적화)
app.use(compression({
  level: 6, // 압축 레벨 (1-9, 6이 균형점)
  threshold: 1024, // 1KB 이상 파일만 압축
  filter: (req, res) => {
    // 이미 압축된 파일은 제외
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 기본 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 모니터링 미들웨어 적용
app.use(apiMonitoring);
app.use(userActivityTracking);
app.use(securityEventTracking);

// 사용자 활동 추적 미들웨어 적용
app.use(trackUserActivity);
app.use(pageTrackingMiddleware);
app.use(trackSecurityEvents);

// 정적 파일 (캐싱 헤더 적용)
app.use('/uploads', express.static('uploads', {
  maxAge: '1y', // 1년 캐시
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // 이미지 파일에 대한 추가 캐싱 설정
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // CSS, JS 파일에 대한 캐싱 설정
    if (path.match(/\.(css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// 기본 라우트 (캐싱 적용)
app.get('/', cache({ ttl: 300 }), (req, res) => {
  res.json({ message: 'JJ Swim Lab API 서버가 실행 중입니다!' });
});

// 헬스 체크 엔드포인트 (캐싱 적용)
app.get('/api/health', cache({ ttl: 60 }), (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    message: 'JJ Swim Lab API 서버가 정상적으로 실행 중입니다!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      readyState: mongoose.connection.readyState
    }
  });
});

// API 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai-config', aiConfigRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/teaching-methods', teachingMethodsRoutes);
app.use('/api/update-levels', updateLevelsRoutes);
// app.use('/api/community', communityRoutes); // 임시 비활성화
app.use('/api/shop', shopRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/center-info', centerInfoRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/checklist-template', checklistTemplateRoutes);
app.use('/api/class-checklist', classChecklistRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/student-progress', studentProgressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/center-levels', centerLevelRoutes);
app.use('/api/student-levels', studentLevelRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/instructor-management', instructorManagementRoutes);
app.use('/api/instructor-evaluation', instructorEvaluationRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/approvals', approvalRoutes);
// 사용자 유형별 API 라우트
app.use('/api/center-admin', centerAdminRoutes);
app.use('/api/student', studentRoutes);
// AI 라우트들 정상화
app.use('/api/ai', aiRoutes);
app.use('/api/smartwatch', smartwatchRoutes);
app.use('/api/video-analysis', videoAnalysisRoutes);
app.use('/api/ai/evaluation-criteria', aiEvaluationCriteriaRoutes);
app.use('/api/video-3d-analysis', video3DAnalysisRoutes);
app.use('/api/video-upload', videoUploadRoutes);
app.use('/api/ai/exercise-recommendations', aiExerciseRecommendationsRoutes);
app.use('/api/shop/orders', ordersRoutes);
app.use('/api/center-registrations', centerRegistrationRoutes);
app.use('/api/center-management', centerManagementRoutes);
// 새로운 건강정보 및 센터 소개 API 라우트
app.use('/api/health-config', healthConfigRoutes);
app.use('/api/center-introduction', centerIntroductionRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/sample-data', sampleDataRoutes);
app.use('/api/youtube-videos', youtubeVideoRoutes);
app.use('/api/learning-progress', learningProgressRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/lesson-plan-templates', lessonPlanTemplateRoutes);
app.use('/api/student-goals', studentGoalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/user-activities', userActivityRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/advanced-ai', advancedAIRoutes);
app.use('/api/instructor-history', instructorHistoryRoutes);
app.use('/api/social-community', socialCommunityRoutes);
app.use('/api/ai-training-plan', aiTrainingPlanRoutes);
app.use('/api/ai-injury-prediction', aiInjuryPredictionRoutes);
app.use('/api/ai-performance-prediction', aiPerformancePredictionRoutes);
app.use('/api/medical-exercise-prescription', medicalExercisePrescriptionRoutes);
app.use('/api/health-exercise-ai', healthExerciseAIRoutes);
app.use('/api/exercise-prescription', exercisePrescriptionRoutes);
app.use('/api/health', healthInputRoutes);
app.use('/api/swim-engine', swimEngineRoutes);

// 404 에러 처리 (라우트 등록 후)
app.use(notFoundHandler);

// 에러 처리 미들웨어 (마지막에 위치)
app.use(errorTracking);
app.use(errorHandler);

// 서버 시작 (테스트 환경이 아닐 때만)
if (process.env.NODE_ENV !== 'test') {
  console.log('🚀 서버 시작 준비 중...');
  console.log(`📡 포트: ${PORT}`);

  server.listen(PORT, async () => {
  console.log(`🌐 HTTP 서버 시작... 포트: ${PORT}`);
  console.log(`🔌 WebSocket 서버 시작... 포트: ${PORT}`);
  
  try {
    console.log('🔗 MongoDB 연결 시도 중...');
    await connectDB();
    
    // 오래된 로그 정리 (서버 시작 시)
    console.log('🗑️ 오래된 로그 정리 중...');
    await cleanupOldPageVisits();
    
    // 시스템 서비스 초기화 - 백업 서비스만 활성화
    console.log('🔧 백업 서비스만 초기화 중...');
    await backupService.startBackupService();
    // await performanceService.loadAndApplySettings();
    
    // 시스템 시작 알림 - 임시 비활성화
    // await emailService.sendSystemAlert(
    //   'JJ Swim Lab 서버가 성공적으로 시작되었습니다.',
    //   {
    //     port: PORT,
    //     environment: process.env.NODE_ENV || 'development',
    //     timestamp: new Date().toISOString(),
    //     uptime: process.uptime()
    //   }
    // );
    
    console.log('🎉 기본 서버 시작 완료!');
    
    // 데이터베이스 연결 성공 후 시드 데이터 실행 (일시 비활성화)
    // console.log('🌱 테스트 데이터 시드 시작...');
    // await runSeedData();
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    console.log('⚠️ 서버는 계속 실행되지만 데이터베이스 연결에 실패했습니다.');
  }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버 종료 중...');
  mongoose.connection.close().then(() => {
    console.log('🔌 MongoDB 연결 종료');
    process.exit(0);
  }).catch(() => {
    console.log('🔌 MongoDB 연결 종료 실패, 강제 종료');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 서버 종료 중...');
  mongoose.connection.close().then(() => {
    console.log('🔌 MongoDB 연결 종료');
    process.exit(0);
  }).catch(() => {
    console.log('🔌 MongoDB 연결 실패, 강제 종료');
    process.exit(0);
  });
});

// Windows에서 Ctrl+C 강제 종료
process.on('SIGBREAK', () => {
  console.log('\n🛑 Windows 강제 종료...');
  process.exit(0);
});

// 추가 시그널 처리
process.on('exit', () => {
  console.log('✅ 서버가 종료되었습니다.');
});

// 테스트를 위한 app 객체 export
import './models/AIConfig';
import './models/Approval';
import './models/Booking';
import './models/CenterInfo';
import './models/CenterLevel';
import './models/ChecklistTemplate';
import './models/Class';
import './models/ClassChecklist';
import './models/CommunityComment';
import './models/CommunityPost';
import './models/CommunityReport';
import './models/Course';
import './models/CourseAction';
import './models/Evaluation';
import './models/ExerciseData';
import './models/ExercisePrescription';
import './models/HealthData';
import './models/InstructorEvaluationCriteria';
import './models/InstructorEvaluationResult';
import './models/LessonPlanTemplate';
import './models/Membership';
import './models/Notice';
import './models/Payment';
import './models/Progress';
import './models/Quiz';
import './models/QuizAttempt';
import './models/Report';
import './models/Review';
import './models/ShopOrder';
import './models/ShopProduct';
import './models/SkillTemplate';
import './models/StudentHealth';
import './models/StudentProgress';
import './models/SwimmingCenter';
import './models/TeachingMethod';
import './models/Video';
export { app };
