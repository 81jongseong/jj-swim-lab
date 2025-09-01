import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// 환경 변수 로드
const envPath = path.join(__dirname, '../.env');
console.log('🔍 .env 파일 경로:', envPath);
dotenv.config({ path: envPath });

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
import communityRoutes from './routes/community';
import shopRoutes from './routes/shop';
import systemRoutes from './routes/system';
import centerInfoRoutes from './routes/center-info';
import checklistRoutes from './routes/checklist';
import checklistTemplateRoutes from './routes/checklist-template';
import classChecklistRoutes from './routes/class-checklist';
import classesRoutes from './routes/classes';
import studentProgressRoutes from './routes/student-progress';
import notificationRoutes from './routes/notifications';
import centerLevelRoutes from './routes/center-level';
import studentLevelRoutes from './routes/student-levels';
import instructorRoutes from './routes/instructor';
import instructorManagementRoutes from './routes/instructorManagement';
import revenueRoutes from './routes/revenue';
import approvalRoutes from './routes/approvals';

// Models (for database connection) - Checklist를 가장 먼저 등록
import './models/Checklist';
import './models/ChecklistTemplate';
import './models/ClassChecklist';
import './models/StudentProgress';
import './models/StudentHealth';
import './models/User';
import './models/CenterLevel';
import './models/Quiz';
import './models/QuizAttempt';
import './models/TeachingMethod';
import './models/Course';
import './models/Booking';
import './models/SwimmingCenter';
import './models/Notice';
import './models/Payment';
import './models/Progress';
import './models/Membership';
import './models/Report';
import './models/CommunityPost';
import './models/CommunityComment';
import './models/CommunityReport';
import './models/ShopProduct';
import './models/ShopOrder';
import './models/AIConfig';
import './models/CenterInfo';
import './models/Notification';
import './models/CenterLevel';
import './models/Center';
import './models/HealthData';
import './models/Approval';

console.log('🚀 index.ts 모듈 로딩 시작...');

// 모델 등록 확인 (모든 모델 import 후)
setTimeout(() => {
  console.log('🔍 모델 등록 상태 확인:');
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

// MongoDB 연결
const connectDB = async () => {
  try {
    // Atlas 연결만 사용 (로컬 연결 제거)
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    }
    
    console.log('🔗 Atlas 연결 시도 중...');
    console.log('🔗 연결 URI:', mongoURI.substring(0, 50) + '...');
    
    // MongoDB 연결 옵션 (Atlas 최적화)
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    console.log('🔗 MongoDB Atlas 연결 시도 중...');
    console.log('🔗 연결 옵션:', JSON.stringify(options, null, 2));
    
    await mongoose.connect(mongoURI, options);
    console.log('🔗 MongoDB Atlas 연결 성공!');
    console.log('✅ 서버가 MongoDB Atlas와 연결되어 정상적으로 실행 중입니다!');
    
    // 연결 상태 모니터링
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas 연결됨');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Atlas 연결 오류:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB Atlas 연결 끊어짐');
    });
    
  } catch (error: any) {
    console.error('❌ MongoDB Atlas 연결 실패:', error);
    console.log('⚠️ MongoDB Atlas 연결 실패했지만 서버는 계속 실행됩니다.');
    console.log('⚠️ 연결 오류 상세:', error.message);
    
    // 연결 실패 시에도 연결 상태 모니터링 설정
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas 연결됨 (재연결)');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Atlas 연결 오류 (재연결 시도 중):', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB Atlas 연결 끊어짐 (재연결 시도 중)');
    });
  }
};

// 미들웨어
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일
app.use('/uploads', express.static('uploads'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'JJ Swim Lab API 서버가 실행 중입니다!' });
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
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
app.use('/api/report', reportRoutes);
app.use('/api/ai-config', aiConfigRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/teaching-methods', teachingMethodsRoutes);
app.use('/api/community', communityRoutes);
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
app.use('/api/revenue', revenueRoutes);
app.use('/api/approvals', approvalRoutes);

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 엔드포인트를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('서버 오류:', error);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.'
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`🌐 HTTP 서버 시작... 포트: ${PORT}`);
  console.log(`🔌 WebSocket 서버 시작... 포트: ${PORT}`);
  connectDB();
});

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
