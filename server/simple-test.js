const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 5002;

app.use(express.json());

// MongoDB 연결
const MONGODB_URI = 'mongodb+srv://jongseongj:qkxm0810@jj-swim-cluster.fomz6.mongodb.net/jj-swim-db?retryWrites=true&w=majority';

console.log('🔗 MongoDB 연결 시도 중...');
console.log('URI:', MONGODB_URI.substring(0, 50) + '...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공!');
  })
  .catch((error) => {
    console.error('❌ MongoDB 연결 실패:', error.message);
  });

// 기본 라우트
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusText = {
    0: '연결 끊김',
    1: '연결됨',
    2: '연결 중',
    3: '연결 끊는 중'
  };
  
  res.json({ 
    message: 'JJ Swim Lab API 서버가 실행 중입니다.',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: dbStatus,
      statusText: statusText[dbStatus] || '알 수 없음',
      connected: dbStatus === 1
    }
  });
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusText = {
    0: '연결 끊김',
    1: '연결됨',
    2: '연결 중',
    3: '연결 끊는 중'
  };
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'JJ Swim Lab API 서버가 실행 중입니다.',
    mongodb: {
      status: dbStatus,
      statusText: statusText[dbStatus] || '알 수 없음',
      connected: dbStatus === 1
    }
  });
});

// 테스트용 회원가입 API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address, userType } = req.body;
    
    // 간단한 검증
    if (!name || !email || !password) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    // MongoDB 연결 상태 확인
    const dbStatus = mongoose.connection.readyState;
    if (dbStatus !== 1) {
      return res.status(500).json({ 
        error: '데이터베이스 연결이 되지 않았습니다.',
        dbStatus,
        dbStatusText: {
          0: '연결 끊김',
          1: '연결됨',
          2: '연결 중',
          3: '연결 끊는 중'
        }[dbStatus] || '알 수 없음'
      });
    }
    
    res.json({ 
      message: '회원가입 요청이 성공적으로 처리되었습니다.',
      user: { name, email, userType },
      mongodb: '연결됨'
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Test Server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 MongoDB URI: ${MONGODB_URI.substring(0, 50)}...`);
}); 