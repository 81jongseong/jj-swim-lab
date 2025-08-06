import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './db';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import coursesRouter from './routes/courses';
import bookingsRouter from './routes/bookings';
import paymentsRouter from './routes/payments';
import noticesRouter from './routes/notices';
import centersRouter from './routes/centers';
import progressRouter from './routes/progress';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: true, // 모든 origin 허용 (개발 환경)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 설정
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/centers', centersRouter);
app.use('/api/progress', progressRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'JJ Swim Lab API 서버가 실행 중입니다.' });
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connecting...'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // MongoDB 연결 시도 (비동기)
  connectDB().then((success) => {
    if (success) {
      console.log('✅ MongoDB 연결 완료');
    } else {
      console.log('⚠️ MongoDB 연결 실패 (서버는 계속 실행)');
    }
  });
});
