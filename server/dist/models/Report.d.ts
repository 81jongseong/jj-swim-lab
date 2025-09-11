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
export declare const ReportTemplate: mongoose.Model<IReportTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IReportTemplate> & IReportTemplate & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const GeneratedReport: mongoose.Model<IGeneratedReport, {}, {}, {}, mongoose.Document<unknown, {}, IGeneratedReport> & IGeneratedReport & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const ReportSchedule: mongoose.Model<IReportSchedule, {}, {}, {}, mongoose.Document<unknown, {}, IReportSchedule> & IReportSchedule & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Report.d.ts.map