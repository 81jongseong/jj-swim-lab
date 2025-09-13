/**
 * 🧹 JJ Swim Lab - 전역 테스트 정리
 * 
 * 📋 **파일 목적**
 * - Jest 테스트 실행 후 전역 정리
 * - 테스트 환경 정리
 * - 외부 서비스 정리
 * - 리소스 해제
 * 
 * 🔄 **주요 기능**
 * - 테스트 환경 정리
 * - 외부 서비스 정리
 * - 테스트 데이터 정리
 * - 파일 시스템 정리
 * - 네트워크 연결 정리
 * 
 * 🗄️ **데이터 연동**
 * - 테스트 환경 변수
 * - 외부 서비스 연결
 * - 테스트 데이터베이스
 * - 파일 시스템 리소스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Jest 테스트 프레임워크
 * - MongoDB Memory Server
 * - 파일 시스템 유틸리티
 * - 네트워크 유틸리티
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 모든 리소스 완전 정리
 * 2. 메모리 누수 방지
 * 3. 파일 시스템 정리
 * 4. 네트워크 연결 정리
 * 5. 에러 처리 및 로깅
 * 6. 정리 순서 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테스트 환경 정리 확인
 * - [ ] 외부 서비스 정리 확인
 * - [ ] 테스트 데이터 정리 확인
 * - [ ] 파일 시스템 정리 확인
 * - [ ] 네트워크 연결 정리 확인
 * - [ ] 리소스 해제 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 전역 테스트 정리 구현
 * - 2024-12-19: 테스트 환경 정리 구현
 * - 2024-12-19: 외부 서비스 정리 구현
 * - 2024-12-19: 테스트 데이터 정리 구현
 * - 2024-12-19: 파일 시스템 정리 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (전역 테스트 정리 완료)
 * 
 * 🚀 **다음 단계**
 * - 테스트 자동화 개선
 * - 성능 테스트 추가
 * - 통합 테스트 강화
 * - E2E 테스트 통합
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // Jest가 자동으로 실행
 * // 테스트 실행 후 전역 정리가 적용됨
 * ```
 * 
 * 🔍 **전역 테스트 정리 처리 흐름**
 * 1. 테스트 환경 변수 정리
 * 2. 외부 서비스 연결 해제
 * 3. 테스트 데이터베이스 정리
 * 4. 파일 시스템 정리
 * 5. 네트워크 연결 정리
 * 6. 리소스 해제
 * 7. 전역 정리 완료
 */

import fs from 'fs';
import path from 'path';

// 전역 테스트 정리
export default async (): Promise<void> => {
  try {
    console.log('🧹 전역 테스트 정리 시작...');
    
    // 테스트 환경 변수 정리
    cleanupEnvironmentVariables();
    
    // 외부 서비스 정리
    await cleanupExternalServices();
    
    // 테스트 데이터 정리
    await cleanupTestData();
    
    // 파일 시스템 정리
    await cleanupFileSystem();
    
    // 네트워크 연결 정리
    await cleanupNetworkConnections();
    
    console.log('✅ 전역 테스트 정리 완료');
  } catch (error) {
    console.error('❌ 전역 테스트 정리 실패:', error);
    // 정리 실패해도 프로세스 종료는 계속 진행
  }
};

// 환경 변수 정리
const cleanupEnvironmentVariables = (): void => {
  try {
    // 테스트 환경 변수 제거
    delete process.env.NODE_ENV;
    delete process.env.JWT_SECRET;
    delete process.env.MONGODB_URI;
    delete process.env.REDIS_URL;
    delete process.env.UPLOAD_PATH;
    delete process.env.MAX_FILE_SIZE;
    
    console.log('✅ 환경 변수 정리 완료');
  } catch (error) {
    console.error('❌ 환경 변수 정리 실패:', error);
  }
};

// 외부 서비스 정리
const cleanupExternalServices = async (): Promise<void> => {
  try {
    // Redis 연결 정리
    if (global.redisClient) {
      await global.redisClient.quit();
      delete global.redisClient;
    }
    
    // MongoDB 연결 정리
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    console.log('✅ 외부 서비스 정리 완료');
  } catch (error) {
    console.error('❌ 외부 서비스 정리 실패:', error);
  }
};

// 테스트 데이터 정리
const cleanupTestData = async (): Promise<void> => {
  try {
    // 테스트 데이터 디렉토리 정리
    const testDataDir = path.join(process.cwd(), '__tests__', 'data');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    
    // 테스트 업로드 디렉토리 정리
    const testUploadDir = path.join(process.cwd(), 'test-uploads');
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
    
    // 테스트 로그 디렉토리 정리
    const testLogDir = path.join(process.cwd(), 'test-logs');
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
    
    console.log('✅ 테스트 데이터 정리 완료');
  } catch (error) {
    console.error('❌ 테스트 데이터 정리 실패:', error);
  }
};

// 파일 시스템 정리
const cleanupFileSystem = async (): Promise<void> => {
  try {
    // 임시 파일 정리
    const tempFiles = [
      'temp-*.json',
      'temp-*.xlsx',
      'temp-*.jpg',
      'temp-*.png'
    ];
    
    for (const pattern of tempFiles) {
      const files = fs.readdirSync(process.cwd()).filter(file => 
        file.match(pattern.replace('*', '.*'))
      );
      
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(process.cwd(), file));
        } catch (error) {
          // 파일 삭제 실패는 무시
        }
      }
    }
    
    console.log('✅ 파일 시스템 정리 완료');
  } catch (error) {
    console.error('❌ 파일 시스템 정리 실패:', error);
  }
};

// 네트워크 연결 정리
const cleanupNetworkConnections = async (): Promise<void> => {
  try {
    // HTTP 서버 정리
    if (global.testServer) {
      await new Promise((resolve) => {
        global.testServer.close(resolve);
      });
      delete global.testServer;
    }
    
    // WebSocket 연결 정리
    if (global.testSocket) {
      global.testSocket.disconnect();
      delete global.testSocket;
    }
    
    console.log('✅ 네트워크 연결 정리 완료');
  } catch (error) {
    console.error('❌ 네트워크 연결 정리 실패:', error);
  }
};

// 글로벌 타입 정의
declare global {
  var redisClient: any;
  var testServer: any;
  var testSocket: any;
}

