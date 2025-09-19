/**
 * 강사 평가 결과 저장 및 관리 모델
 * - 실제 평가 데이터 저장
 * - 평가자별 점수 및 코멘트 관리
 * - 종합 점수 및 등급 자동 계산
 * - 평가 이력 추적
 * 
 * 연동 데이터:
 * - InstructorEvaluationCriteria: 평가 기준
 * - User: 강사 및 평가자 정보
 * - Center: 센터 정보
 * - Course: 수강 과정 정보
 */

import mongoose, { Document, Schema } from 'mongoose';

// 개별 평가 항목 점수 인터페이스
export interface IEvaluationScore {
  score: number; // 0-100점
  comment?: string; // 평가 코멘트
  evidence?: string[]; // 근거 자료 (선택적)
}

// 평가자별 평가 데이터 인터페이스
export interface IEvaluatorAssessment {
  evaluatorId: mongoose.Types.ObjectId; // 평가자 ID
  evaluatorType: 'student' | 'peer' | 'management' | 'self'; // 평가자 유형
  evaluatedAt: Date; // 평가 완료 시간
  
  // 각 평가 항목별 점수
  scores: {
    studentFeedback: IEvaluationScore;
    teachingSkill: IEvaluationScore;
    communication: IEvaluationScore;
    punctuality: IEvaluationScore;
    improvement: IEvaluationScore;
    safety: IEvaluationScore;
    professionalism?: IEvaluationScore; // 선택적
  };
  
  // 전체적인 코멘트
  overallComment?: string;
  
  // 추천 사항
  recommendations?: string[];
  
  // 강점 및 개선점
  strengths?: string[];
  improvements?: string[];
  
  // 익명 평가 여부
  isAnonymous: boolean;
}

// 강사 평가 결과 메인 인터페이스
export interface IInstructorEvaluationResult extends Document {
  // 기본 정보
  instructorId: mongoose.Types.ObjectId; // 평가 대상 강사
  centerId: mongoose.Types.ObjectId; // 센터
  criteriaId: mongoose.Types.ObjectId; // 사용된 평가 기준
  
  // 평가 기간
  evaluationPeriod: {
    startDate: Date;
    endDate: Date;
    quarter?: string; // 예: '2024-Q1'
    year: number;
  };
  
  // 평가자별 평가 데이터
  assessments: IEvaluatorAssessment[];
  
  // 계산된 결과
  calculatedResults: {
    // 항목별 평균 점수 (가중치 적용 전)
    averageScores: {
      studentFeedback: number;
      teachingSkill: number;
      communication: number;
      punctuality: number;
      improvement: number;
      safety: number;
      professionalism?: number;
    };
    
    // 가중치 적용 점수
    weightedScores: {
      studentFeedback: number;
      teachingSkill: number;
      communication: number;
      punctuality: number;
      improvement: number;
      safety: number;
      professionalism?: number;
    };
    
    // 최종 종합 점수
    totalScore: number; // 0-100점
    
    // 등급
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    
    // 평가자 유형별 평균
    averageByEvaluatorType: {
      student?: number;
      peer?: number;
      management?: number;
      self?: number;
    };
  };
  
  // 통계 정보
  statistics: {
    totalEvaluators: number;
    completionRate: number; // 평가 완료율
    responseRate: {
      students: { responded: number; total: number; rate: number };
      peers: { responded: number; total: number; rate: number };
      management: { responded: number; total: number; rate: number };
    };
  };
  
  // 종합 분석
  analysis: {
    strengths: string[]; // 주요 강점
    improvements: string[]; // 개선 필요 사항
    trends: string[]; // 이전 평가 대비 변화
    recommendations: string[]; // 추천 사항
  };
  
  // 평가 상태
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'archived';
  
  // 검토 정보
  reviewInfo?: {
    reviewedBy: mongoose.Types.ObjectId;
    reviewedAt: Date;
    reviewComments: string;
    approved: boolean;
  };
  
  // 공개 설정
  visibility: {
    toInstructor: boolean; // 강사에게 공개
    toStudents: boolean; // 학생들에게 공개
    toPeers: boolean; // 동료 강사에게 공개
    toManagement: boolean; // 관리진에게 공개
  };
  
  // 메타데이터
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

// 평가 점수 스키마
const EvaluationScoreSchema = new Schema({
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

// 평가자별 평가 스키마
const EvaluatorAssessmentSchema = new Schema({
  evaluatorId: {
    type: mongoose.Schema.Types.ObjectId,
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
  
  // 평가 점수
  scores: {
    studentFeedback: EvaluationScoreSchema,
    teachingSkill: EvaluationScoreSchema,
    communication: EvaluationScoreSchema,
    punctuality: EvaluationScoreSchema,
    improvement: EvaluationScoreSchema,
    safety: EvaluationScoreSchema,
    professionalism: EvaluationScoreSchema // 선택적
  },
  
  overallComment: { type: String, trim: true },
  recommendations: [{ type: String }],
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  isAnonymous: { type: Boolean, default: false }
}, { _id: true });

// 강사 평가 결과 스키마
const InstructorEvaluationResultSchema = new Schema<IInstructorEvaluationResult>({
  // 기본 정보
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  criteriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstructorEvaluationCriteria',
    required: true
  },
  
  // 평가 기간
  evaluationPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    quarter: { type: String },
    year: { type: Number, required: true }
  },
  
  // 평가 데이터
  assessments: [EvaluatorAssessmentSchema],
  
  // 계산된 결과
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
  
  // 통계 정보
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
  
  // 종합 분석
  analysis: {
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    trends: [{ type: String }],
    recommendations: [{ type: String }]
  },
  
  // 평가 상태
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'reviewed', 'archived'],
    default: 'draft'
  },
  
  // 검토 정보
  reviewInfo: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: { type: Date },
    reviewComments: { type: String },
    approved: { type: Boolean, default: false }
  },
  
  // 공개 설정
  visibility: {
    toInstructor: { type: Boolean, default: true },
    toStudents: { type: Boolean, default: false },
    toPeers: { type: Boolean, default: false },
    toManagement: { type: Boolean, default: true }
  },
  
  // 메타데이터
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 점수 계산 메서드
InstructorEvaluationResultSchema.methods.calculateScores = async function() {
  if (this.assessments.length === 0) return;
  
  // 평가 기준 로드
  const criteria = await mongoose.model('InstructorEvaluationCriteria').findById(this.criteriaId);
  if (!criteria) return;
  
  // 각 항목별 평균 점수 계산
  const scoreFields = ['studentFeedback', 'teachingSkill', 'communication', 'punctuality', 'improvement', 'safety', 'professionalism'];
  
  scoreFields.forEach(field => {
    const scores = this.assessments
      .filter(assessment => assessment.scores[field] && assessment.scores[field].score !== undefined)
      .map(assessment => assessment.scores[field].score);
    
    if (scores.length > 0) {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      this.calculatedResults.averageScores[field] = Math.round(average * 100) / 100;
      
      // 가중치 적용
      const weight = criteria.criteria[field]?.weight || 0;
      this.calculatedResults.weightedScores[field] = Math.round(average * weight / 100 * 100) / 100;
    }
  });
  
  // 총점 계산
  this.calculatedResults.totalScore = Object.values(this.calculatedResults.weightedScores)
    .reduce((sum: number, score: any) => sum + (Number(score) || 0), 0);
  
  // 등급 산정
  const grade = criteria.gradeThresholds.find(threshold => 
    this.calculatedResults.totalScore >= threshold.minScore && 
    this.calculatedResults.totalScore <= threshold.maxScore
  );
  this.calculatedResults.grade = grade?.grade || 'D';
  
  // 평가자 유형별 평균 계산
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

// 통계 계산 메서드
InstructorEvaluationResultSchema.methods.calculateStatistics = function() {
  this.statistics.totalEvaluators = this.assessments.length;
  
  // 평가자 유형별 응답률 계산 (실제 구현시 초대된 평가자 수 기반으로 계산)
  const studentAssessments = this.assessments.filter(a => a.evaluatorType === 'student');
  const peerAssessments = this.assessments.filter(a => a.evaluatorType === 'peer');
  const managementAssessments = this.assessments.filter(a => a.evaluatorType === 'management');
  
  this.statistics.responseRate.students.responded = studentAssessments.length;
  this.statistics.responseRate.peers.responded = peerAssessments.length;
  this.statistics.responseRate.management.responded = managementAssessments.length;
};

// 저장 전 자동 계산
InstructorEvaluationResultSchema.pre('save', async function(next) {
  if (this.isModified('assessments')) {
    await (this as any).calculateScores();
    (this as any).calculateStatistics();
  }
  next();
});

// 인덱스 설정
InstructorEvaluationResultSchema.index({ instructorId: 1, 'evaluationPeriod.year': -1, 'evaluationPeriod.quarter': -1 });
InstructorEvaluationResultSchema.index({ centerId: 1, status: 1 });
InstructorEvaluationResultSchema.index({ 'calculatedResults.grade': 1, 'calculatedResults.totalScore': -1 });
InstructorEvaluationResultSchema.index({ createdAt: -1 });

// 모델 생성
export const InstructorEvaluationResult = mongoose.model<IInstructorEvaluationResult>(
  'InstructorEvaluationResult', 
  InstructorEvaluationResultSchema
);

export default InstructorEvaluationResult;
