/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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