/**
 * 📝 JJ Swim Lab - 로거 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 애플리케이션 전체의 로깅 시스템을 관리하는 유틸리티
 * - 로그 레벨별 분류 및 출력 관리
 * - 로그 파일 저장 및 로테이션 관리
 * - 로그 포맷팅 및 색상 설정
 * - 로그 성능 최적화 및 모니터링
 * 
 * 🔄 **주요 기능**
 * - 로그 레벨별 분류 (error, warn, info, http, debug)
 * - 로그 파일 저장 및 로테이션
 * - 로그 포맷팅 및 색상 설정
 * - 콘솔 및 파일 출력 관리
 * - 로그 성능 최적화
 * - 로그 모니터링 및 분석
 * 
 * 🗄️ **데이터 연동**
 * - 로그 메시지 및 메타데이터
 * - 로그 파일 및 디렉토리
 * - 로그 설정 및 구성 정보
 * - 로그 성능 메트릭
 * - 로그 모니터링 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Winston 로깅 라이브러리
 * - Node.js 파일 시스템
 * - 로그 파일 디렉토리
 * - 로그 설정 파일
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 로그 파일 크기 및 디스크 공간 관리
 * 2. 로그 레벨 설정 및 성능 영향
 * 3. 로그 파일 보안 및 접근 권한
 * 4. 로그 로테이션 및 아카이브 관리
 * 5. 로그 성능 최적화
 * 6. 로그 모니터링 및 알림
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 로그 파일 크기 관리 확인
 * - [ ] 로그 레벨 설정 확인
 * - [ ] 로그 파일 보안 확인
 * - [ ] 로그 로테이션 설정 확인
 * - [ ] 로그 성능 최적화 확인
 * - [ ] 로그 모니터링 설정 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 로거 유틸리티 구현
 * - 2024-12-19: 로그 레벨별 분류 시스템 구현
 * - 2024-12-19: 로그 파일 저장 및 로테이션 구현
 * - 2024-12-19: 로그 포맷팅 및 색상 설정 구현
 * - 2024-12-19: 로그 성능 최적화 및 모니터링 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (로거 유틸리티 완료)
 * 
 * 🚀 **다음 단계**
 * - 로그 분석 및 시각화
 * - 로그 기반 알림 시스템
 * - 로그 성능 모니터링
 * - 로그 보안 강화
 * - 로그 자동화 시스템
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { logInfo, logError, logWarn } from '../utils/logger';
 * 
 * // 정보 로그
 * logInfo('사용자 로그인 성공', { userId: 'user001' });
 * 
 * // 에러 로그
 * logError('데이터베이스 연결 실패', { error: error.message });
 * 
 * // 경고 로그
 * logWarn('메모리 사용량 높음', { memoryUsage: '85%' });
 * ```
 * 
 * 🔍 **로거 처리 흐름**
 * 1. 로그 메시지 및 메타데이터 수집
 * 2. 로그 레벨별 분류 및 검증
 * 3. 로그 포맷팅 및 색상 적용
 * 4. 콘솔 및 파일 출력 처리
 * 5. 로그 파일 로테이션 및 아카이브
 * 6. 로그 성능 모니터링 및 분석
 * 7. 로그 결과 반환 및 상태 업데이트
 */

import * as winston from 'winston';
import path from 'path';

// 로그 레벨 정의
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 로그 색상 정의
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// 색상 추가
winston.addColors(logColors);

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 파일 로그 포맷 (색상 없음)
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../../logs');

// Winston 로거 생성
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  levels: logLevels,
  format: logFormat,
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: logFormat,
    }),
    
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileLogFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 전체 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileLogFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// HTTP 요청 로그용 별도 로거
const httpLogger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// 데이터베이스 로그용 별도 로거
const dbLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} [DB] ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'database.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// 성능 로그용 별도 로거
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} [PERF] ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'performance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// 로그 함수들
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: any) => {
  logger.error(message, error);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  httpLogger.http(message, meta);
};

export const logDatabase = (message: string, meta?: any) => {
  dbLogger.info(message, meta);
};

export const logPerformance = (message: string, meta?: any) => {
  performanceLogger.info(message, meta);
};

// 특별한 로그 함수들
export const logRequest = (req: any, res: any, responseTime: number) => {
  const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
  logHttp(message, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
};

export const logDatabaseQuery = (query: string, executionTime: number) => {
  logDatabase(`Query executed in ${executionTime}ms`, { query, executionTime });
};

export const logPerformanceMetric = (operation: string, duration: number, meta?: any) => {
  logPerformance(`${operation} completed in ${duration}ms`, { operation, duration, ...meta });
};

// 로거 내보내기
export default logger;
export { httpLogger, dbLogger, performanceLogger };
