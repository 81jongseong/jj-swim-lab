declare class PerformanceService {
    private static instance;
    private currentLogLevel;
    private maxLogSize;
    private cacheEnabled;
    private compressionEnabled;
    private lastConfigCheck;
    private constructor();
    static getInstance(): PerformanceService;
    loadAndApplySettings(): Promise<void>;
    private applyLogLevel;
    getSettings(): {
        logLevel: string;
        maxLogSize: number;
        cacheEnabled: boolean;
        compressionEnabled: boolean;
    };
    collectPerformanceMetrics(): Promise<any>;
    stopService(): void;
}
export declare const performanceService: PerformanceService;
export {};
//# sourceMappingURL=performanceService.d.ts.map