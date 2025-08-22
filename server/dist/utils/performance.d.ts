export declare const measurePerformance: (operation: string) => (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;
export declare const measureDatabaseQuery: (collection: string) => (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;
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
export declare const responseTimeMiddleware: (req: any, res: any, next: any) => void;
export declare const batchProcess: <T, R>(items: T[], processor: (item: T) => Promise<R>, batchSize?: number) => Promise<R[]>;
export declare const memoize: <T extends (...args: any[]) => any>(fn: T, ttl?: number) => T;
export declare const suggestIndexes: (queries: Array<{
    collection: string;
    query: any;
    frequency: number;
}>) => any[];
export declare const optimizeConnectionPool: (poolSize?: number) => {
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    waitQueueTimeoutMS: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    heartbeatFrequencyMS: number;
};
export declare const optimizeQuery: (query: any) => any;
//# sourceMappingURL=performance.d.ts.map