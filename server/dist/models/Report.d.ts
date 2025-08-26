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
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import mongoose, { Document } from 'mongoose';
export interface IReportTemplate extends Document {
    name: string;
    description: string;
    reportType: 'user-statistics' | 'revenue-analysis' | 'course-performance' | 'quiz-results' | 'membership-analysis';
    parameters: {
        name: string;
        type: 'date-range' | 'user-type' | 'center-id' | 'category' | 'period';
        required: boolean;
        defaultValue?: any;
    }[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IGeneratedReport extends Document {
    templateId: mongoose.Types.ObjectId;
    generatedBy: mongoose.Types.ObjectId;
    parameters: Record<string, any>;
    data: any;
    format: 'pdf' | 'excel' | 'json';
    filePath?: string;
    status: 'generating' | 'completed' | 'failed';
    errorMessage?: string;
    createdAt: Date;
    completedAt?: Date;
}
export interface IReportSchedule extends Document {
    templateId: mongoose.Types.ObjectId;
    name: string;
    schedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
        dayOfWeek?: number;
        dayOfMonth?: number;
        time: string;
        timezone: string;
    };
    recipients: mongoose.Types.ObjectId[];
    parameters: Record<string, any>;
    isActive: boolean;
    lastRun?: Date;
    nextRun?: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ReportTemplate: mongoose.Model<IReportTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IReportTemplate, {}, {}> & IReportTemplate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const GeneratedReport: mongoose.Model<IGeneratedReport, {}, {}, {}, mongoose.Document<unknown, {}, IGeneratedReport, {}, {}> & IGeneratedReport & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const ReportSchedule: mongoose.Model<IReportSchedule, {}, {}, {}, mongoose.Document<unknown, {}, IReportSchedule, {}, {}> & IReportSchedule & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Report.d.ts.map