/// <reference types="node" />
/// <reference types="node" />
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    requestId: string;
}
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
export interface SearchParams {
    query?: string;
    filters?: Record<string, unknown>;
    dateRange?: {
        start: Date;
        end: Date;
    };
}
export type UserRole = 'superAdmin' | 'centerAdmin' | 'instructor' | 'student' | 'guest';
export type Permission = 'read' | 'write' | 'delete' | 'admin';
export interface UserPermissions {
    role: UserRole;
    permissions: Permission[];
    centerId?: string;
    restrictions?: string[];
}
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
export interface CacheOptions {
    ttl?: number;
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
export interface MiddlewareConfig {
    enabled: boolean;
    options?: Record<string, unknown>;
    order?: number;
}
export interface MiddlewareStack {
    [key: string]: MiddlewareConfig;
}
export interface PluginConfig {
    name: string;
    version: string;
    enabled: boolean;
    config: Record<string, unknown>;
    dependencies?: string[];
}
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
export type AsyncFunction<T, R> = (arg: T) => Promise<R>;
export type SyncFunction<T, R> = (arg: T) => R;
export type Predicate<T> = (arg: T) => boolean;
export type Transformer<T, R> = (arg: T) => R;
export declare function isApiResponse<T>(obj: any): obj is ApiResponse<T>;
export declare function isPaginatedResponse<T>(obj: any): obj is PaginatedResponse<T>;
export declare function isUserEvent(obj: any): obj is UserEvent;
export declare function isSystemEvent(obj: any): obj is SystemEvent;
export declare function toApiResponse<T>(data: T, success?: boolean): ApiResponse<T>;
export declare function toPaginatedResponse<T>(data: T[], pagination: PaginationParams, total: number): PaginatedResponse<T>;
export declare function mergeObjects<T extends Record<string, any>>(target: T, source: Partial<T>): T;
export declare function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
export declare function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]>;
export declare function uniqueBy<T, K extends keyof T>(array: T[], key: K): T[];
export declare function sortBy<T, K extends keyof T>(array: T[], key: K, order?: 'asc' | 'desc'): T[];
declare const _default: {
    toApiResponse: typeof toApiResponse;
    toPaginatedResponse: typeof toPaginatedResponse;
    mergeObjects: typeof mergeObjects;
    deepMerge: typeof deepMerge;
    groupBy: typeof groupBy;
    uniqueBy: typeof uniqueBy;
    sortBy: typeof sortBy;
    isApiResponse: typeof isApiResponse;
    isPaginatedResponse: typeof isPaginatedResponse;
    isUserEvent: typeof isUserEvent;
    isSystemEvent: typeof isSystemEvent;
};
export default _default;
//# sourceMappingURL=advancedTypes.d.ts.map