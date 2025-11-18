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
exports.InstructorEvaluationResult = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EvaluationScoreSchema = new mongoose_1.Schema({
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    comment: {
        type: String,
        trim: true
    },
    evidence: [{
            type: String
        }]
}, { _id: false });
const EvaluatorAssessmentSchema = new mongoose_1.Schema({
    evaluatorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    evaluatorType: {
        type: String,
        enum: ['student', 'peer', 'management', 'self'],
        required: true
    },
    evaluatedAt: {
        type: Date,
        default: Date.now
    },
    scores: {
        studentFeedback: EvaluationScoreSchema,
        teachingSkill: EvaluationScoreSchema,
        communication: EvaluationScoreSchema,
        punctuality: EvaluationScoreSchema,
        improvement: EvaluationScoreSchema,
        safety: EvaluationScoreSchema,
        professionalism: EvaluationScoreSchema
    },
    overallComment: { type: String, trim: true },
    recommendations: [{ type: String }],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    isAnonymous: { type: Boolean, default: false }
}, { _id: true });
const InstructorEvaluationResultSchema = new mongoose_1.Schema({
    instructorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Center',
        required: true
    },
    criteriaId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'InstructorEvaluationCriteria',
        required: true
    },
    evaluationPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        quarter: { type: String },
        year: { type: Number, required: true }
    },
    assessments: [EvaluatorAssessmentSchema],
    calculatedResults: {
        averageScores: {
            studentFeedback: { type: Number, default: 0 },
            teachingSkill: { type: Number, default: 0 },
            communication: { type: Number, default: 0 },
            punctuality: { type: Number, default: 0 },
            improvement: { type: Number, default: 0 },
            safety: { type: Number, default: 0 },
            professionalism: { type: Number, default: 0 }
        },
        weightedScores: {
            studentFeedback: { type: Number, default: 0 },
            teachingSkill: { type: Number, default: 0 },
            communication: { type: Number, default: 0 },
            punctuality: { type: Number, default: 0 },
            improvement: { type: Number, default: 0 },
            safety: { type: Number, default: 0 },
            professionalism: { type: Number, default: 0 }
        },
        totalScore: { type: Number, default: 0 },
        grade: {
            type: String,
            enum: ['S', 'A', 'B', 'C', 'D'],
            default: 'C'
        },
        averageByEvaluatorType: {
            student: { type: Number },
            peer: { type: Number },
            management: { type: Number },
            self: { type: Number }
        }
    },
    statistics: {
        totalEvaluators: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        responseRate: {
            students: {
                responded: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
                rate: { type: Number, default: 0 }
            },
            peers: {
                responded: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
                rate: { type: Number, default: 0 }
            },
            management: {
                responded: { type: Number, default: 0 },
                total: { type: Number, default: 0 },
                rate: { type: Number, default: 0 }
            }
        }
    },
    analysis: {
        strengths: [{ type: String }],
        improvements: [{ type: String }],
        trends: [{ type: String }],
        recommendations: [{ type: String }]
    },
    status: {
        type: String,
        enum: ['draft', 'in_progress', 'completed', 'reviewed', 'archived'],
        default: 'draft'
    },
    reviewInfo: {
        reviewedBy: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: { type: Date },
        reviewComments: { type: String },
        approved: { type: Boolean, default: false }
    },
    visibility: {
        toInstructor: { type: Boolean, default: true },
        toStudents: { type: Boolean, default: false },
        toPeers: { type: Boolean, default: false },
        toManagement: { type: Boolean, default: true }
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
InstructorEvaluationResultSchema.methods.calculateScores = async function () {
    if (this.assessments.length === 0)
        return;
    const criteria = await mongoose_1.default.model('InstructorEvaluationCriteria').findById(this.criteriaId);
    if (!criteria)
        return;
    const scoreFields = ['studentFeedback', 'teachingSkill', 'communication', 'punctuality', 'improvement', 'safety', 'professionalism'];
    scoreFields.forEach(field => {
        const scores = this.assessments
            .filter(assessment => assessment.scores[field] && assessment.scores[field].score !== undefined)
            .map(assessment => assessment.scores[field].score);
        if (scores.length > 0) {
            const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            this.calculatedResults.averageScores[field] = Math.round(average * 100) / 100;
            const weight = criteria.criteria[field]?.weight || 0;
            this.calculatedResults.weightedScores[field] = Math.round(average * weight / 100 * 100) / 100;
        }
    });
    this.calculatedResults.totalScore = Object.values(this.calculatedResults.weightedScores)
        .reduce((sum, score) => sum + (Number(score) || 0), 0);
    const grade = criteria.gradeThresholds.find(threshold => this.calculatedResults.totalScore >= threshold.minScore &&
        this.calculatedResults.totalScore <= threshold.maxScore);
    this.calculatedResults.grade = grade?.grade || 'D';
    const evaluatorTypes = ['student', 'peer', 'management', 'self'];
    evaluatorTypes.forEach(type => {
        const typeAssessments = this.assessments.filter(a => a.evaluatorType === type);
        if (typeAssessments.length > 0) {
            const typeScores = typeAssessments.map(a => {
                return scoreFields.reduce((sum, field) => {
                    const score = a.scores[field]?.score || 0;
                    const weight = criteria.criteria[field]?.weight || 0;
                    return sum + (score * weight / 100);
                }, 0);
            });
            this.calculatedResults.averageByEvaluatorType[type] =
                typeScores.reduce((sum, score) => sum + score, 0) / typeScores.length;
        }
    });
};
InstructorEvaluationResultSchema.methods.calculateStatistics = function () {
    this.statistics.totalEvaluators = this.assessments.length;
    const studentAssessments = this.assessments.filter(a => a.evaluatorType === 'student');
    const peerAssessments = this.assessments.filter(a => a.evaluatorType === 'peer');
    const managementAssessments = this.assessments.filter(a => a.evaluatorType === 'management');
    this.statistics.responseRate.students.responded = studentAssessments.length;
    this.statistics.responseRate.peers.responded = peerAssessments.length;
    this.statistics.responseRate.management.responded = managementAssessments.length;
};
InstructorEvaluationResultSchema.pre('save', async function (next) {
    if (this.isModified('assessments')) {
        await this.calculateScores();
        this.calculateStatistics();
    }
    next();
});
InstructorEvaluationResultSchema.index({ instructorId: 1, 'evaluationPeriod.year': -1, 'evaluationPeriod.quarter': -1 });
InstructorEvaluationResultSchema.index({ centerId: 1, status: 1 });
InstructorEvaluationResultSchema.index({ 'calculatedResults.grade': 1, 'calculatedResults.totalScore': -1 });
InstructorEvaluationResultSchema.index({ createdAt: -1 });
exports.InstructorEvaluationResult = mongoose_1.default.model('InstructorEvaluationResult', InstructorEvaluationResultSchema);
exports.default = exports.InstructorEvaluationResult;
//# sourceMappingURL=InstructorEvaluationResult.js.map