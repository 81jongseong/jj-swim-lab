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
