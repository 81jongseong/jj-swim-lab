import { Request, Response, NextFunction } from 'express';
export declare const measurePerformance: (operation: string) => (target: object, propertyName: string, descriptor: PropertyDescriptor) => void;
export declare const measureDatabaseQuery: (collection: string) => (target: object, propertyName: string, descriptor: PropertyDescriptor) => void;
export declare const getMemoryUsage: () => {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
};
export declare const getCpuUsage: () => {
    user: number;
    system: number;
};
export declare const responseTimeMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const batchProcess: <T, R>(items: T[], processor: (item: T) => Promise<R>, batchSize?: number) => Promise<R[]>;
export declare const memoize: <T extends (...args: unknown[]) => unknown>(fn: T, ttl?: number) => T;
interface QueryInfo {
    collection: string;
    query: Record<string, unknown>;
    frequency: number;
}
interface IndexSuggestion {
    collection: string;
    fields: string[];
    frequency: number;
    priority: 'high' | 'medium' | 'low';
    reason: string;
}
export declare const suggestIndexes: (queries: QueryInfo[]) => IndexSuggestion[];
export declare const optimizeConnectionPool: (poolSize?: number) => {
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    waitQueueTimeoutMS: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    heartbeatFrequencyMS: number;
};
export declare const optimizeQuery: (query: Record<string, unknown>) => {
    [x: string]: unknown;
};
export {};
//# sourceMappingURL=performance.d.ts.map