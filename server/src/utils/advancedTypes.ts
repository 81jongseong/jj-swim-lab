// 고급 TypeScript 패턴과 유틸리티 타입들

// Generic Constraints와 Conditional Types
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 검색 및 필터링 타입
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 사용자 권한 타입
export type UserRole = 'superAdmin' | 'centerAdmin' | 'instructor' | 'student' | 'guest';
export type Permission = 'read' | 'write' | 'delete' | 'admin';

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
  centerId?: string;
  restrictions?: string[];
}

// 이벤트 타입
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface UserEvent extends BaseEvent {
  type: 'user.login' | 'user.logout' | 'user.register' | 'user.update';
  userId: string;
}

export interface SystemEvent extends BaseEvent {
  type: 'system.start' | 'system.stop' | 'system.error' | 'system.warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 데이터베이스 모델 타입
export interface BaseModel {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface SoftDeleteModel extends BaseModel {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
}

// 쿼리 빌더 타입
export interface QueryBuilder<T> {
  where(field: keyof T, operator: string, value: unknown): QueryBuilder<T>;
  and(field: keyof T, operator: string, value: unknown): QueryBuilder<T>;
  or(field: keyof T, operator: string, value: unknown): QueryBuilder<T>;
  sort(field: keyof T, order: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  skip(count: number): QueryBuilder<T>;
  populate(fields: string[]): QueryBuilder<T>;
  build(): any;
}

// 캐시 타입
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
  version?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  version: string;
}

// 로깅 타입
export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

// 성능 모니터링 타입
export interface PerformanceMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    free: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

// 보안 타입
export interface SecurityContext {
  userId?: string;
  role: UserRole;
  permissions: Permission[];
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  tokenExpiry: Date;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

// 파일 업로드 타입
export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  destination: string;
  filename?: (req: any, file: any, cb: any) => void;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

// 웹소켓 타입
export interface SocketEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: Date;
  userId?: string;
  roomId?: string;
}

export interface SocketRoom {
  id: string;
  name: string;
  users: string[];
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// 검증 스키마 타입
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean;
    message?: string;
  };
}

// 미들웨어 타입
export interface MiddlewareConfig {
  enabled: boolean;
  options?: Record<string, unknown>;
  order?: number;
}

export interface MiddlewareStack {
  [key: string]: MiddlewareConfig;
}

// 플러그인 타입
export interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, unknown>;
  dependencies?: string[];
}

// 설정 타입
export interface AppConfig {
  server: {
    port: number;
    host: string;
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
  database: {
    uri: string;
    options: Record<string, unknown>;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
    destination: string;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    metrics: string[];
  };
  plugins: PluginConfig[];
  middleware: MiddlewareStack;
}

// 유틸리티 함수 타입
export type AsyncFunction<T, R> = (arg: T) => Promise<R>;
export type SyncFunction<T, R> = (arg: T) => R;
export type Predicate<T> = (arg: T) => boolean;
export type Transformer<T, R> = (arg: T) => R;

// 고급 타입 가드
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj === 'object' && 'success' in obj && 'timestamp' in obj;
}

export function isPaginatedResponse<T>(obj: any): obj is PaginatedResponse<T> {
  return isApiResponse(obj) && 'pagination' in obj;
}

export function isUserEvent(obj: any): obj is UserEvent {
  return obj && typeof obj === 'object' && 'type' in obj && obj.type.startsWith('user.');
}

export function isSystemEvent(obj: any): obj is SystemEvent {
  return obj && typeof obj === 'object' && 'type' in obj && obj.type.startsWith('system.');
}

// 타입 변환 유틸리티
export function toApiResponse<T>(data: T, success = true): ApiResponse<T> {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : (data as any)?.message || 'Unknown error',
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  };
}

export function toPaginatedResponse<T>(
  data: T[],
  pagination: PaginationParams,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit);
  
  return {
    ...toApiResponse(data),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    }
  };
}

// 요청 ID 생성
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 타입 안전한 객체 병합
export function mergeObjects<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  return { ...target, ...source };
}

// 깊은 객체 병합
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
}

// 타입 안전한 배열 유틸리티
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function uniqueBy<T, K extends keyof T>(
  array: T[],
  key: K
): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

export function sortBy<T, K extends keyof T>(
  array: T[],
  key: K,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export default {
  toApiResponse,
  toPaginatedResponse,
  mergeObjects,
  deepMerge,
  groupBy,
  uniqueBy,
  sortBy,
  isApiResponse,
  isPaginatedResponse,
  isUserEvent,
  isSystemEvent
};
