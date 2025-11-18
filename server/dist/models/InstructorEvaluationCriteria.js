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
exports.InstructorEvaluationCriteria = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const InstructorEvaluationCriteriaSchema = new mongoose_1.Schema({
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Center',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    version: {
        type: String,
        required: true,
        default: '1.0.0'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    criteria: {
        studentFeedback: {
            name: { type: String, default: '학생 만족도' },
            description: { type: String, default: '학생들의 강사에 대한 만족도 및 피드백' },
            weight: { type: Number, default: 25, min: 0, max: 100 },
            maxScore: { type: Number, default: 100 },
            guidelines: {
                excellent: { type: String, default: '학생 만족도 90% 이상, 긍정적 피드백 다수' },
                good: { type: String, default: '학생 만족도 70-89%, 대체로 긍정적 피드백' },
                average: { type: String, default: '학생 만족도 50-69%, 보통 수준의 피드백' },
                poor: { type: String, default: '학생 만족도 50% 미만, 개선 필요한 피드백' }
            }
        },
        teachingSkill: {
            name: { type: String, default: '지도 능력' },
            description: { type: String, default: '수영 기술 전달 능력 및 교수법' },
            weight: { type: Number, default: 30, min: 0, max: 100 },
            maxScore: { type: Number, default: 100 },
            guidelines: {
                excellent: { type: String, default: '탁월한 기술 전달력, 학생 수준별 맞춤 지도' },
                good: { type: String, default: '효과적인 기술 전달, 적절한 교수법 활용' },
                average: { type: String, default: '기본적인 지도 능력, 일반적인 교수법' },
                poor: { type: String, default: '지도 능력 부족, 교수법 개선 필요' }
            }
        },
        communication: {
            name: { type: String, default: '소통 능력' },
            description: { type: String, default: '학생 및 학부모와의 소통 능력' },
            weight: { type: Number, default: 20, min: 0, max: 100 },
            maxScore: { type: Number, default: 100 },
            guidelines: {
                excellent: { type: String, default: '원활한 소통, 적극적인 피드백 제공' },
                good: { type: String, default: '효과적인 소통, 정기적인 피드백' },
                average: { type: String, default: '기본적인 소통, 필요시 피드백' },
                poor: { type: String, default: '소통 부족, 피드백 개선 필요' }
            }
        },
        punctuality: {
            name: { type: String, default: '시간 준수' },
            description: { type: String, default: '수업 시간 및 일정 준수 정도' },
            weight: { type: Number, default: 10, min: 0, max: 100 },
            maxScore: { type: Number, default: 100 },
            guidelines: {
                excellent: { type: String, default: '항상 정시 출근, 수업 시간 엄수' },
                good: { type: String, default: '대부분 정시, 가끔 지각' },
                average: { type: String, default: '보통 수준의 시간 관리' },
                poor: { type: String, default: '자주 지각, 시간 관리 개선 필요' }
            }
        },
        improvement: {
            name: { type: String, default: '개선 의지' },
            description: { type: String, default: '자기계발 및 개선 노력' },
            weight: { type: Number, default: 10, min: 0, max: 100 },
            maxScore: { type: Number, default: 100 },
            guidelines: {
                excellent: { type: String, default: '적극적인 자기계발, 지속적인 개선 노력' },
                good: { type: String, default: '꾸준한 자기계발, 개선 의지 보임' },
                average: { type: String, default: '기본적인 자기계발 노력' },
                poor: { type: String, default: '자기계발 부족, 개선 의지 미흡' }
            }
        },
        safety: {
            name: { type: String, default: '안전 관리' },
            description: { type: String, default: '수업 중 안전 관리 및 사고 예방' },
            weight: { type: Number, default: 5, min: 0, max: 100 },
            maxScore: { type: Number, default: 100 },
            guidelines: {
                excellent: { type: String, default: '완벽한 안전 관리, 사고 예방 탁월' },
                good: { type: String, default: '효과적인 안전 관리, 사고 예방 양호' },
                average: { type: String, default: '기본적인 안전 관리' },
                poor: { type: String, default: '안전 관리 미흡, 개선 필요' }
            }
        },
        professionalism: {
            name: { type: String, default: '전문성' },
            description: { type: String, default: '전문 지식 및 업무 태도' },
            weight: { type: Number, default: 0, min: 0, max: 100 },
            maxScore: { type: Number, default: 100 },
            guidelines: {
                excellent: { type: String, default: '뛰어난 전문성, 모범적인 업무 태도' },
                good: { type: String, default: '충분한 전문성, 성실한 업무 태도' },
                average: { type: String, default: '기본적인 전문성, 보통 업무 태도' },
                poor: { type: String, default: '전문성 부족, 업무 태도 개선 필요' }
            }
        }
    },
    gradeThresholds: [{
            grade: { type: String, enum: ['S', 'A', 'B', 'C', 'D'], required: true },
            minScore: { type: Number, required: true },
            maxScore: { type: Number, required: true },
            description: { type: String, required: true },
            color: { type: String, required: true },
            benefits: [{ type: String }]
        }],
    evaluationCycle: {
        frequency: {
            type: String,
            enum: ['monthly', 'quarterly', 'biannual', 'annual'],
            default: 'quarterly'
        },
        duration: { type: Number, default: 14 },
        reminderDays: { type: Number, default: 3 }
    },
    evaluators: {
        students: { type: Boolean, default: true },
        peers: { type: Boolean, default: false },
        management: { type: Boolean, default: true },
        selfEvaluation: { type: Boolean, default: true }
    },
    guidelines: {
        general: {
            type: String,
            default: '공정하고 객관적인 평가를 위해 제시된 기준을 참고하여 평가해 주세요.'
        },
        forEvaluators: {
            type: String,
            default: '각 항목별 가이드라인을 숙지하고, 관찰된 사실을 바탕으로 평가해 주세요.'
        },
        forInstructors: {
            type: String,
            default: '평가 결과를 통해 자신의 강점과 개선점을 파악하고 지속적인 발전을 도모하세요.'
        },
        scoringRules: [{
                type: String,
                default: '각 항목은 0-100점으로 평가하며, 가중치를 적용하여 최종 점수를 산출합니다.'
            }]
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
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
InstructorEvaluationCriteriaSchema.pre('save', function (next) {
    if (!this.gradeThresholds || this.gradeThresholds.length === 0) {
        this.gradeThresholds = [
            {
                grade: 'S',
                minScore: 95,
                maxScore: 100,
                description: '최우수 강사 - 모든 영역에서 탁월한 성과',
                color: '#8B5CF6',
                benefits: ['성과급 지급', '우수강사 인증서', '교육 기회 우선 제공']
            },
            {
                grade: 'A',
                minScore: 85,
                maxScore: 94,
                description: '우수 강사 - 대부분 영역에서 우수한 성과',
                color: '#10B981',
                benefits: ['성과급 지급', '교육 기회 제공']
            },
            {
                grade: 'B',
                minScore: 70,
                maxScore: 84,
                description: '양호 강사 - 전반적으로 양호한 성과',
                color: '#3B82F6',
                benefits: ['기본 혜택 제공']
            },
            {
                grade: 'C',
                minScore: 50,
                maxScore: 69,
                description: '보통 강사 - 개선이 필요한 영역 있음',
                color: '#F59E0B',
                benefits: ['개선 교육 기회 제공']
            },
            {
                grade: 'D',
                minScore: 0,
                maxScore: 49,
                description: '미흡 강사 - 전반적인 개선 필요',
                color: '#EF4444',
                benefits: ['집중 교육 프로그램 참여']
            }
        ];
    }
    next();
});
InstructorEvaluationCriteriaSchema.index({ centerId: 1, isActive: 1 });
InstructorEvaluationCriteriaSchema.index({ version: 1, effectiveDate: -1 });
InstructorEvaluationCriteriaSchema.index({ createdBy: 1, createdAt: -1 });
exports.InstructorEvaluationCriteria = mongoose_1.default.model('InstructorEvaluationCriteria', InstructorEvaluationCriteriaSchema);
exports.default = exports.InstructorEvaluationCriteria;
//# sourceMappingURL=InstructorEvaluationCriteria.js.map