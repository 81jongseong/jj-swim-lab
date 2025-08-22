import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { logInfo, logError, logDatabase } from './utils/logger';
import { optimizeConnectionPool } from './utils/performance';
import path from 'path';

console.log('🔍 db.ts 모듈 로딩 시작...');

try {
  // .env 파일 로드 (서버 루트 디렉토리 기준)
  console.log('🔍 dotenv.config() 호출 중...');
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  console.log('🔍 dotenv.config() 완료');
  
  // 환경 변수 로드 확인
  console.log('🔍 환경 변수 로드 확인:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ 설정됨' : '❌ 설정되지 않음');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ 설정됨' : '❌ 설정되지 않음');
  console.log('NODE_ENV:', process.env.NODE_ENV || '❌ 설정되지 않음');
  
  console.log('🔍 db.ts 모듈 로딩 완료');
} catch (error) {
  console.error('❌ db.ts 모듈 로딩 중 에러:', error);
  console.error('❌ 에러 스택:', error instanceof Error ? error.stack : '스택 없음');
}


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-db';

// 데이터베이스 연결 최적화 설정
const connectionOptions = {
  bufferCommands: true,
  autoIndex: false, // 자동 인덱스 생성 비활성화
  serverSelectionTimeoutMS: 3000, // 5초 → 3초로 단축
  socketTimeoutMS: 15000, // 30초 → 15초로 단축
  maxPoolSize: 10, // 5 → 10으로 증가
  minPoolSize: 2, // 1 → 2로 증가
  retryWrites: true,
  w: 'majority' as const,
  // 추가 성능 최적화
  maxIdleTimeMS: 30000, // 연결 유지 시간
  connectTimeoutMS: 10000, // 연결 타임아웃
  heartbeatFrequencyMS: 10000, // 하트비트 주기
  // 개발 환경 최적화
  ...(process.env.NODE_ENV === 'development' && {
    // bufferMaxEntries: 0, // MongoDB 6.x에서 지원하지 않음
  })
};

// 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  logInfo('✅ MongoDB 연결 성공');
  logDatabase('connection', 'database', 0, { status: 'connected' });
});

mongoose.connection.on('error', (error) => {
  logError('❌ MongoDB 연결 오류', error);
  logDatabase('error', 'database', 0, { error: error.message });
});

mongoose.connection.on('disconnected', () => {
  logInfo('⚠️ MongoDB 연결 해제');
  logDatabase('disconnection', 'database', 0, { status: 'disconnected' });
});

mongoose.connection.on('reconnected', () => {
  logInfo('🔄 MongoDB 재연결 성공');
  logDatabase('reconnection', 'database', 0, { status: 'reconnected' });
});

// 쿼리 성능 모니터링 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
    logDatabase('query', collectionName, 0, {
      method: methodName,
      args: methodArgs
    });
  });
}

export const connectDB = async () => {
  try {
    logInfo('🔗 MongoDB 연결 시도 중...');
    console.log('🔗 MongoDB 연결 시도 중...');
    console.log('🔗 URI:', MONGODB_URI.substring(0, 50) + '...');
    console.log('🔗 연결 옵션:', JSON.stringify(connectionOptions, null, 2));
    const startTime = Date.now();
    
    console.log('🔗 mongoose.connect 호출 중...');
    
    // 연결 타임아웃 설정 (10초)
    const connectionPromise = mongoose.connect(MONGODB_URI, connectionOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('MongoDB 연결 타임아웃 (10초)')), 10000);
    });
    
    console.log('🔗 Promise.race 대기 중...');
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('🔗 mongoose.connect 완료!');
    
    const connectionTime = Date.now() - startTime;
    logInfo(`✅ MongoDB 연결 완료 (${connectionTime}ms)`);
    console.log(`✅ MongoDB 연결 완료 (${connectionTime}ms)`);
    console.log(`✅ 연결 상태: ${mongoose.connection.readyState}`);
    logDatabase('connection', 'database', connectionTime, { 
      status: 'success',
      connectionTime 
    });
    
    return true;
  } catch (error) {
    logError('❌ MongoDB 연결 실패:', error);
    console.log('❌ MongoDB 연결 실패:', error);
    console.log('❌ 에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
    console.log('❌ 에러 메시지:', error instanceof Error ? error.message : String(error));
    console.log('❌ 에러 스택:', error instanceof Error ? error.stack : '스택 없음');
    
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log('❌ MongoDB 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
    } else if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.log('❌ MongoDB 호스트를 찾을 수 없습니다. URI를 확인하세요.');
    } else if (error instanceof Error && error.message.includes('authentication')) {
      console.log('❌ MongoDB 인증 실패. 사용자명과 비밀번호를 확인하세요.');
    }
    
    logDatabase('error', 'database', 0, { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
};

// 데이터베이스 연결 상태 확인
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// 데이터베이스 연결 종료
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logInfo('✅ MongoDB 연결 종료');
    console.log('✅ MongoDB 연결 종료');
    return true;
  } catch (error) {
    logError('❌ MongoDB 연결 종료 실패:', error);
    console.log('❌ MongoDB 연결 종료 실패:', error);
    return false;
  }
};



// 데이터베이스 통계 정보
export const getDBStats = async () => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database not connected');
    }
    
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataFileVersion: stats.dataFileVersion,
      extents: stats.extents,
      fileSize: stats.fileSize,
      nsSizeMB: stats.nsSizeMB,
      ok: stats.ok
    };
  } catch (error) {
    logError('❌ 데이터베이스 통계 조회 실패:', error);
    return null;
  }
};

// 데이터베이스 상태 확인
export const checkDatabaseHealth = async () => {
  try {
    const stats = await getDBStats();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      type: 'mongodb',
      collections: stats?.collections || 0,
      objects: stats?.objects || 0
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// 인덱스 최적화 제안
export const suggestIndexes = async () => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database not connected');
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const suggestions = [];
    
    for (const collection of collections) {
      try {
        const dbCollection = mongoose.connection.db.collection(collection.name);
        const count = await dbCollection.countDocuments();
        if (count > 1000) {
          suggestions.push({
            collection: collection.name,
            documentCount: count,
            size: 'N/A', // stats() 메서드가 없으므로 N/A로 표시
            recommendation: '인덱스 추가 고려'
          });
        }
      } catch (error) {
        // 개별 컬렉션 통계 조회 실패 시 건너뛰기
        continue;
      }
    }
    
    return suggestions;
  } catch (error) {
    logError('인덱스 제안 조회 실패:', error);
    return [];
  }
};
