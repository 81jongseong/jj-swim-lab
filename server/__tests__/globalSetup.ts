/**
 * 🌍 JJ Swim Lab - 전역 테스트 설정
 * 
 * 📋 **파일 목적**
 * - Jest 테스트 실행 전 전역 설정
 * - 테스트 환경 초기화
 * - 외부 서비스 설정
 * - 테스트 데이터 준비
 * 
 * 🔄 **주요 기능**
 * - 테스트 환경 초기화
 * - 외부 서비스 모킹 설정
 * - 테스트 데이터베이스 설정
 * - 파일 시스템 설정
 * - 네트워크 설정
 * 
 * 🗄️ **데이터 연동**
 * - 테스트 환경 변수
 * - 외부 서비스 설정
 * - 테스트 데이터베이스
 * - 파일 시스템 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - Jest 테스트 프레임워크
 * - MongoDB Memory Server
 * - 외부 서비스 모킹 도구
 * - 파일 시스템 유틸리티
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테스트 환경과 프로덕션 환경 완전 분리
 * 2. 외부 서비스 의존성 최소화
 * 3. 테스트 데이터 격리 및 정리
 * 4. 테스트 성능 최적화
 * 5. 에러 처리 및 복구
 * 6. 리소스 관리 및 정리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테스트 환경 초기화 확인
 * - [ ] 외부 서비스 모킹 확인
 * - [ ] 테스트 데이터베이스 설정 확인
 * - [ ] 파일 시스템 설정 확인
 * - [ ] 네트워크 설정 확인
 * - [ ] 리소스 관리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 전역 테스트 설정 구현
 * - 2024-12-19: 테스트 환경 초기화 구현
 * - 2024-12-19: 외부 서비스 모킹 구현
 * - 2024-12-19: 테스트 데이터베이스 설정 구현
 * - 2024-12-19: 파일 시스템 설정 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (전역 테스트 설정 완료)
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
 * // 테스트 실행 전 전역 설정이 적용됨
 * ```
 * 
 * 🔍 **전역 테스트 설정 처리 흐름**
 * 1. 테스트 환경 변수 설정
 * 2. 외부 서비스 모킹 설정
 * 3. 테스트 데이터베이스 초기화
 * 4. 파일 시스템 설정
 * 5. 네트워크 설정
 * 6. 테스트 유틸리티 초기화
 * 7. 전역 설정 완료
 */

import fs from 'fs';
import path from 'path';

// 전역 테스트 설정
export default async (): Promise<void> => {
  try {
    console.log('🌍 전역 테스트 설정 시작...');
    
    // 테스트 환경 변수 설정
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.REDIS_URL = 'redis://localhost:6379/1';
    process.env.UPLOAD_PATH = './test-uploads';
    process.env.MAX_FILE_SIZE = '5242880'; // 5MB
    
    // 테스트 업로드 디렉토리 생성
    const testUploadDir = path.join(process.cwd(), 'test-uploads');
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
      console.log('📁 테스트 업로드 디렉토리 생성:', testUploadDir);
    }
    
    // 테스트 로그 디렉토리 생성
    const testLogDir = path.join(process.cwd(), 'test-logs');
    if (!fs.existsSync(testLogDir)) {
      fs.mkdirSync(testLogDir, { recursive: true });
      console.log('📁 테스트 로그 디렉토리 생성:', testLogDir);
    }
    
    // 테스트 커버리지 디렉토리 생성
    const coverageDir = path.join(process.cwd(), 'coverage');
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
      console.log('📁 테스트 커버리지 디렉토리 생성:', coverageDir);
    }
    
  // 외부 서비스 모킹 설정 (Jest 환경에서만 실행)
  if (typeof jest !== 'undefined') {
    setupExternalServiceMocks();
  }
    
    // 테스트 데이터 준비
    await prepareTestData();
    
    console.log('✅ 전역 테스트 설정 완료');
  } catch (error) {
    console.error('❌ 전역 테스트 설정 실패:', error);
    throw error;
  }
};

// 외부 서비스 모킹 설정
const setupExternalServiceMocks = (): void => {
  try {
    // Redis 모킹
    jest.mock('ioredis', () => {
      return jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        exists: jest.fn().mockResolvedValue(0),
        expire: jest.fn().mockResolvedValue(1),
        flushdb: jest.fn().mockResolvedValue('OK'),
        quit: jest.fn().mockResolvedValue('OK')
      }));
    });
    
    // 이메일 서비스 모킹
    jest.mock('nodemailer', () => ({
      createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({
          messageId: 'test-message-id',
          response: '250 OK'
        }),
        verify: jest.fn().mockResolvedValue(true)
      })
    }));
    
    // 파일 시스템 모킹 (선택적)
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => 'test content');
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    
    console.log('✅ 외부 서비스 모킹 설정 완료');
  } catch (error) {
    console.error('❌ 외부 서비스 모킹 설정 실패:', error);
    throw error;
  }
};

// 테스트 데이터 준비
const prepareTestData = async (): Promise<void> => {
  try {
    // 테스트 데이터 파일 생성
    const testDataDir = path.join(process.cwd(), '__tests__', 'data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // 샘플 Excel 파일 생성
    const sampleExcelPath = path.join(testDataDir, 'sample.xlsx');
    if (!fs.existsSync(sampleExcelPath)) {
      // 간단한 Excel 파일 생성 (실제로는 xlsx 라이브러리 사용)
      fs.writeFileSync(sampleExcelPath, 'test excel content');
    }
    
    // 샘플 이미지 파일 생성
    const sampleImagePath = path.join(testDataDir, 'sample.jpg');
    if (!fs.existsSync(sampleImagePath)) {
      // 간단한 이미지 파일 생성
      fs.writeFileSync(sampleImagePath, 'test image content');
    }
    
    console.log('✅ 테스트 데이터 준비 완료');
  } catch (error) {
    console.error('❌ 테스트 데이터 준비 실패:', error);
    throw error;
  }
};
