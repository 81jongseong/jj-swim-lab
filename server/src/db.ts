/**
 * 🗄️ JJ Swim Lab - 데이터베이스 연결 관리
 * 
 * 📋 **파일 목적**
 * - MongoDB Atlas 클라우드 데이터베이스 연결 관리
 * - 데이터베이스 연결 풀 최적화 및 성능 튜닝
 * - 연결 상태 모니터링 및 에러 처리
 * - 데이터베이스 통계 및 헬스 체크 기능
 * 
 * 🔄 **주요 기능**
 * - MongoDB Atlas 연결 설정 및 관리
 * - 연결 풀 최적화 (최대/최소 연결 수 조정)
 * - 연결 상태 모니터링 (연결/해제/재연결)
 * - 쿼리 성능 모니터링 (개발 환경)
 * - 데이터베이스 통계 조회
 * - 헬스 체크 및 상태 확인
 * - 인덱스 최적화 제안
 * 
 * 🗄️ **데이터 연동**
 * - MongoDB Atlas 클라우드 데이터베이스
 * - 모든 Mongoose 모델들과 연동
 * - 로깅 시스템 (logger.ts)
 * - 성능 모니터링 (performance.ts)
 * - 환경 변수 (.env)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7
 * - MongoDB Driver 6.3.0
 * - Logger 유틸리티 (./utils/logger)
 * - Performance 유틸리티 (./utils/performance)
 * - Dotenv 16.3.1
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. MongoDB Atlas 연결 정보 보안 관리
 * 2. 연결 풀 크기 적절히 설정 (메모리 고려)
 * 3. 타임아웃 설정으로 무한 대기 방지
 * 4. 연결 상태 모니터링 및 로깅
 * 5. 개발/프로덕션 환경별 설정 차별화
 * 6. 에러 처리 및 복구 로직 구현
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 연결 옵션 최적화 확인
 * - [ ] 타임아웃 설정 검토
 * - [ ] 연결 풀 크기 조정
 * - [ ] 에러 처리 로직 개선
 * - [ ] 로깅 시스템 연동 확인
 * - [ ] 성능 모니터링 추가
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 데이터베이스 연결 구현
 * - 2024-12-19: 연결 풀 최적화 및 성능 튜닝
 * - 2024-12-19: 연결 상태 모니터링 추가
 * - 2024-12-19: 통계 및 헬스 체크 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (데이터베이스 연결 관리 완료)
 * 
 * 🚀 **다음 단계**
 * - 데이터베이스 백업 자동화
 * - 연결 풀 모니터링 대시보드
 * - 쿼리 성능 분석 도구
 * - 데이터베이스 마이그레이션 도구
 * - 실시간 성능 메트릭 수집
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 데이터베이스 연결
 * await connectDB();
 * 
 * // 연결 상태 확인
 * const isConnected = isConnected();
 * 
 * // 데이터베이스 통계
 * const stats = await getDBStats();
 * 
 * // 헬스 체크
 * const health = await checkDatabaseHealth();
 * ```
 * 
 * 🔍 **데이터베이스 처리 흐름**
 * 1. 환경 변수에서 MongoDB URI 로드
 * 2. 연결 옵션 설정 (풀 크기, 타임아웃 등)
 * 3. Mongoose를 통한 MongoDB 연결
 * 4. 연결 이벤트 리스너 등록
 * 5. 연결 상태 모니터링 시작
 * 6. 쿼리 성능 모니터링 (개발 환경)
 * 7. 통계 및 헬스 체크 기능 제공
 */

import mongoose from 'mongoose';
import { logInfo, logError, logDatabase } from './utils/logger';
import { optimizeConnectionPool } from './utils/performance';


// MongoDB Atlas URI 강제 설정 (Atlas만 사용)
// 로컬 MongoDB 사용 완전 차단
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

// 로컬 MongoDB 연결 시도 차단
if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost')) {
  throw new Error('❌ 로컬 MongoDB 사용 금지! Atlas만 사용 가능합니다.');
}

// 환경 변수 디버깅
console.log('🔍 db.ts에서 환경 변수 확인:');
console.log('   - MONGODB_URI:', process.env.MONGODB_URI ? '✅ 설정됨' : '❌ 설정되지 않음');
console.log('   - MONGODB_URI 값:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : '없음');
console.log('   - 사용할 URI:', MONGODB_URI.substring(0, 50) + '...');

// 데이터베이스 연결 최적화 설정 (성능 향상)
const connectionOptions = {
  bufferCommands: true,
  autoIndex: false, // 자동 인덱스 생성 비활성화 (성능 향상)
  serverSelectionTimeoutMS: 2000, // 3초 → 2초로 단축 (빠른 응답)
  socketTimeoutMS: 10000, // 15초 → 10초로 단축 (빠른 타임아웃)
  maxPoolSize: 15, // 10 → 15로 증가 (동시 연결 증가)
  minPoolSize: 3, // 2 → 3으로 증가 (최소 연결 보장)
  retryWrites: true,
  w: 'majority' as const,
  // 성능 최적화 설정
  maxIdleTimeMS: 20000, // 30초 → 20초로 단축 (메모리 절약)
  connectTimeoutMS: 8000, // 10초 → 8초로 단축 (빠른 연결)
  heartbeatFrequencyMS: 8000, // 10초 → 8초로 단축 (빠른 감지)
  // 추가 성능 최적화
  compressors: ['zlib'] as ('zlib' | 'none' | 'snappy' | 'zstd')[], // 압축 활성화 (네트워크 트래픽 감소)
  zlibCompressionLevel: 6 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, // 압축 레벨 (1-9, 6이 균형점)
  // 개발 환경 최적화
  ...(process.env.NODE_ENV === 'development' && {
    // 개발 환경에서는 더 빠른 응답을 위해 타임아웃 단축
    serverSelectionTimeoutMS: 1000,
    socketTimeoutMS: 5000,
  })
};

// 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  logInfo('✅ MongoDB 연결 성공');
  logDatabase('Database connected', { status: 'connected' });
});

mongoose.connection.on('error', (error) => {
  logError('❌ MongoDB 연결 오류', error);
  logDatabase('Database error', { error: error.message });
});

mongoose.connection.on('disconnected', () => {
  logInfo('⚠️ MongoDB 연결 해제');
  logDatabase('Database disconnected', { status: 'disconnected' });
});

mongoose.connection.on('reconnected', () => {
  logInfo('🔄 MongoDB 재연결 성공');
  logDatabase('Database reconnected', { status: 'reconnected' });
});

// 쿼리 성능 모니터링 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
    logDatabase(`Query: ${collectionName}.${methodName}`, {
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
        logDatabase('Database connection successful', { 
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
    
        logDatabase('Database connection failed', {
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
