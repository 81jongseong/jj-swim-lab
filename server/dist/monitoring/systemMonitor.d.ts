import { Request, Response } from 'express';
interface SystemMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    memory: {
        total: number;
        free: number;
        used: number;
        usage: number;
    };
    uptime: number;
    nodeVersion: string;
    platform: string;
}
interface ApiMetrics {
    timestamp: Date;
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    ip: string;
    userAgent?: string;
    userId?: string;
}
interface UserActivity {
    timestamp: Date;
    userId: string;
    action: string;
    details: any;
    ip: string;
}
declare class SystemMonitor {
    private static instance;
    private metrics;
    private apiMetrics;
    private userActivities;
    private maxMetricsHistory;
    private constructor();
    static getInstance(): SystemMonitor;
    private collectSystemMetrics;
    private getCpuUsage;
    recordApiRequest(req: Request, res: Response, duration: number): void;
    recordUserActivity(userId: string, action: string, details: any, ip: string): void;
    getCurrentStatus(): SystemMetrics | null;
    getRecentApiMetrics(limit?: number): ApiMetrics[];
    getRecentUserActivities(limit?: number): UserActivity[];
    getSystemMetricsHistory(limit?: number): SystemMetrics[];
    getPerformanceStats(): any;
    getSystemSummary(): any;
}
export default SystemMonitor;
//# sourceMappingURL=systemMonitor.d.ts.map