"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSchedule = exports.GeneratedReport = exports.ReportTemplate = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reportTemplateSchema = new mongoose_1.Schema({
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
            defaultValue: { type: mongoose_1.Schema.Types.Mixed }
        }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});
const generatedReportSchema = new mongoose_1.Schema({
    templateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ReportTemplate', required: true },
    generatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    parameters: { type: mongoose_1.Schema.Types.Mixed, required: true },
    data: { type: mongoose_1.Schema.Types.Mixed, required: true },
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
const reportScheduleSchema = new mongoose_1.Schema({
    templateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ReportTemplate', required: true },
    name: { type: String, required: true },
    schedule: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly'],
            required: true
        },
        dayOfWeek: { type: Number, min: 0, max: 6 },
        dayOfMonth: { type: Number, min: 1, max: 31 },
        time: { type: String, required: true },
        timezone: { type: String, required: true }
    },
    recipients: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    parameters: { type: mongoose_1.Schema.Types.Mixed, required: true },
    isActive: { type: Boolean, default: true },
    lastRun: { type: Date },
    nextRun: { type: Date },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});
reportTemplateSchema.index({ reportType: 1, isActive: 1 });
reportTemplateSchema.index({ createdBy: 1 });
generatedReportSchema.index({ templateId: 1, createdAt: -1 });
generatedReportSchema.index({ generatedBy: 1, status: 1 });
reportScheduleSchema.index({ isActive: 1, nextRun: 1 });
reportScheduleSchema.index({ createdBy: 1 });
exports.ReportTemplate = mongoose_1.default.model('ReportTemplate', reportTemplateSchema);
exports.GeneratedReport = mongoose_1.default.model('GeneratedReport', generatedReportSchema);
exports.ReportSchedule = mongoose_1.default.model('ReportSchedule', reportScheduleSchema);
//# sourceMappingURL=Report.js.map