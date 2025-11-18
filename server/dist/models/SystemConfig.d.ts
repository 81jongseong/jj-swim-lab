import mongoose, { Document } from 'mongoose';
export interface ISystemConfig extends Document {
    maintenance: {
        enabled: boolean;
        message: string;
        scheduledAt?: Date;
    };
    security: {
        rateLimitEnabled: boolean;
        maxRequestsPerMinute: number;
        bruteForceProtection: boolean;
        requireTwoFactor: boolean;
    };
    notifications: {
        systemAlerts: boolean;
        errorNotifications: boolean;
        performanceAlerts: boolean;
        emailRecipients: string[];
    };
    backup: {
        autoBackup: boolean;
        backupInterval: number;
        retentionDays: number;
        lastBackup?: Date;
    };
    performance: {
        cacheEnabled: boolean;
        compressionEnabled: boolean;
        logLevel: 'error' | 'warn' | 'info' | 'debug';
        maxLogSize: number;
    };
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SystemConfig: mongoose.Model<ISystemConfig, {}, {}, {}, mongoose.Document<unknown, {}, ISystemConfig> & ISystemConfig & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=SystemConfig.d.ts.map