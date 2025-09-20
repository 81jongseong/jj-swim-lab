export interface EmailNotification {
    type: 'system' | 'error' | 'performance' | 'security';
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    data?: any;
}
declare class EmailService {
    private static instance;
    private isEnabled;
    private recipients;
    private lastConfigCheck;
    private constructor();
    static getInstance(): EmailService;
    private loadEmailConfig;
    sendNotification(notification: EmailNotification): Promise<boolean>;
    sendSystemAlert(message: string, data?: any): Promise<boolean>;
    sendErrorAlert(error: string, data?: any): Promise<boolean>;
    sendPerformanceAlert(message: string, data?: any): Promise<boolean>;
    sendSecurityAlert(message: string, data?: any): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map