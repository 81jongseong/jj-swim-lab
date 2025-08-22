import mongoose, { Schema, Document } from 'mongoose';

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
  data: any; // 리포트 데이터
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
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    time: string; // HH:MM format
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

const reportTemplateSchema = new Schema<IReportTemplate>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  reportType: { 
    type: String, 
    enum: ['user-statistics', 'revenue-analysis', 'course-performance', 'quiz-results', 'membership-analysis'], 
    required: true 
  },
  parameters: [{
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['date-range', 'user-type', 'center-id', 'category', 'period'], 
      required: true 
    },
    required: { type: Boolean, default: false },
    defaultValue: { type: Schema.Types.Mixed }
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const generatedReportSchema = new Schema<IGeneratedReport>({
  templateId: { type: Schema.Types.ObjectId, ref: 'ReportTemplate', required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parameters: { type: Schema.Types.Mixed, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  format: { 
    type: String, 
    enum: ['pdf', 'excel', 'json'], 
    required: true 
  },
  filePath: { type: String },
  status: { 
    type: String, 
    enum: ['generating', 'completed', 'failed'], 
    required: true 
  },
  errorMessage: { type: String },
  completedAt: { type: Date }
}, {
  timestamps: true
});

const reportScheduleSchema = new Schema<IReportSchedule>({
  templateId: { type: Schema.Types.ObjectId, ref: 'ReportTemplate', required: true },
  name: { type: String, required: true },
  schedule: {
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'quarterly'], 
      required: true 
    },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    dayOfMonth: { type: Number, min: 1, max: 31 },
    time: { type: String, required: true }, // HH:MM format
    timezone: { type: String, required: true }
  },
  recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  parameters: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  lastRun: { type: Date },
  nextRun: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// 인덱스 추가
reportTemplateSchema.index({ reportType: 1, isActive: 1 });
reportTemplateSchema.index({ createdBy: 1 });
generatedReportSchema.index({ templateId: 1, createdAt: -1 });
generatedReportSchema.index({ generatedBy: 1, status: 1 });
reportScheduleSchema.index({ isActive: 1, nextRun: 1 });
reportScheduleSchema.index({ createdBy: 1 });

export const ReportTemplate = mongoose.model<IReportTemplate>('ReportTemplate', reportTemplateSchema);
export const GeneratedReport = mongoose.model<IGeneratedReport>('GeneratedReport', generatedReportSchema);
export const ReportSchedule = mongoose.model<IReportSchedule>('ReportSchedule', reportScheduleSchema); 