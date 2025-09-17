interface QueryPerformance {
    operation: string;
    collection: string;
    duration: number;
    documentsExamined: number;
    documentsReturned: number;
    indexUsed: boolean;
    executionStats?: any;
}
declare class PerformanceAnalyzer {
    private static instance;
    private metrics;
    private queryMetrics;
    private maxMetricsHistory;
    private constructor();
    static getInstance(): PerformanceAnalyzer;
    private setupMongoDBProfiling;
    measureFunction<T>(name: string, fn: () => Promise<T>, metadata?: any): Promise<T>;
    measureApiRequest(req: any, res: any): void;
    measureQuery<T>(operation: string, collection: string, queryFn: () => Promise<T>, metadata?: any): Promise<T>;
    private recordMetric;
    getPerformanceStats(): any;
    private generateRecommendations;
    getSlowQueries(threshold?: number): QueryPerformance[];
    trackMemoryUsage(): void;
    generatePerformanceReport(): any;
    clearMetrics(): void;
}
export default PerformanceAnalyzer;
//# sourceMappingURL=performanceAnalyzer.d.ts.map