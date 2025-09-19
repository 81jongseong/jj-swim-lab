/**
 * 강사 평가 기준 및 가이드라인 관리 모델
 * - 평가 항목별 기준과 가중치 설정
 * - 센터별 맞춤형 평가 기준 지원
 * - 평가 등급 산정 로직
 * - 평가 가이드라인 및 설명
 * 
 * 연동 데이터:
 * - Center: 센터별 맞춤 기준
 * - User: 강사 및 평가자 정보
 * - Evaluation: 실제 평가 데이터
 */

import mongoose, { Document, Schema } from 'mongoose';

// 평가 항목 인터페이스
export interface IEvaluationCriterion {
  name: string;
  description: string;
  weight: number; // 가중치 (%)
  maxScore: number; // 최대 점수
  guidelines: {
    excellent: string; // 우수 기준 (90-100점)
    good: string; // 양호 기준 (70-89점)
    average: string; // 보통 기준 (50-69점)
    poor: string; // 미흡 기준 (0-49점)
  };
}

// 평가 등급 기준 인터페이스
export interface IGradeThreshold {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  minScore: number;
  maxScore: number;
  description: string;
  color: string; // UI 표시용 색상
  benefits?: string[]; // 등급별 혜택
}

// 강사 평가 기준 메인 인터페이스
export interface IInstructorEvaluationCriteria extends Document {
  // 기본 정보
  centerId?: mongoose.Types.ObjectId; // null이면 전체 센터 공통 기준
  title: string; // 평가 기준 제목
  description: string; // 평가 기준 설명
  version: string; // 버전 관리
  isActive: boolean; // 활성화 상태
  
  // 평가 항목들
  criteria: {
    studentFeedback: IEvaluationCriterion; // 학생 만족도
    teachingSkill: IEvaluationCriterion; // 지도 능력
    communication: IEvaluationCriterion; // 소통 능력
    punctuality: IEvaluationCriterion; // 시간 준수
    improvement: IEvaluationCriterion; // 개선 의지
    safety: IEvaluationCriterion; // 안전 관리
    professionalism: IEvaluationCriterion; // 전문성
  };
  
  // 등급 기준
  gradeThresholds: IGradeThreshold[];
  
  // 평가 주기 설정
  evaluationCycle: {
    frequency: 'monthly' | 'quarterly' | 'biannual' | 'annual'; // 평가 주기
    duration: number; // 평가 기간 (일)
    reminderDays: number; // 알림 일수
  };
  
  // 평가자 설정
  evaluators: {
    students: boolean; // 학생 평가 포함 여부
    peers: boolean; // 동료 강사 평가 포함 여부
    management: boolean; // 관리자 평가 포함 여부
    selfEvaluation: boolean; // 자기 평가 포함 여부
  };
  
  // 가이드라인
  guidelines: {
    general: string; // 일반 가이드라인
    forEvaluators: string; // 평가자용 가이드라인
    forInstructors: string; // 강사용 가이드라인
    scoringRules: string[]; // 점수 산정 규칙
  };
  
  // 메타데이터
  createdBy: mongoose.Types.ObjectId; // 생성자
  updatedBy: mongoose.Types.ObjectId; // 수정자
  effectiveDate: Date; // 적용 시작일
  expiryDate?: Date; // 만료일 (선택적)
  
  createdAt: Date;
  updatedAt: Date;
}

// 평가 기준 스키마
const InstructorEvaluationCriteriaSchema = new Schema<IInstructorEvaluationCriteria>({
  // 기본 정보
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    default: null // null이면 전체 센터 공통
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
  
  // 평가 항목들
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
      weight: { type: Number, default: 0, min: 0, max: 100 }, // 기본적으로 비활성화
      maxScore: { type: Number, default: 100 },
      guidelines: {
        excellent: { type: String, default: '뛰어난 전문성, 모범적인 업무 태도' },
        good: { type: String, default: '충분한 전문성, 성실한 업무 태도' },
        average: { type: String, default: '기본적인 전문성, 보통 업무 태도' },
        poor: { type: String, default: '전문성 부족, 업무 태도 개선 필요' }
      }
    }
  },
  
  // 등급 기준
  gradeThresholds: [{
    grade: { type: String, enum: ['S', 'A', 'B', 'C', 'D'], required: true },
    minScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    description: { type: String, required: true },
    color: { type: String, required: true },
    benefits: [{ type: String }]
  }],
  
  // 평가 주기 설정
  evaluationCycle: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'biannual', 'annual'],
      default: 'quarterly'
    },
    duration: { type: Number, default: 14 }, // 14일
    reminderDays: { type: Number, default: 3 } // 3일 전 알림
  },
  
  // 평가자 설정
  evaluators: {
    students: { type: Boolean, default: true },
    peers: { type: Boolean, default: false },
    management: { type: Boolean, default: true },
    selfEvaluation: { type: Boolean, default: true }
  },
  
  // 가이드라인
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

// 기본 등급 기준 설정
InstructorEvaluationCriteriaSchema.pre('save', function(next) {
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

// 인덱스 설정
InstructorEvaluationCriteriaSchema.index({ centerId: 1, isActive: 1 });
InstructorEvaluationCriteriaSchema.index({ version: 1, effectiveDate: -1 });
InstructorEvaluationCriteriaSchema.index({ createdBy: 1, createdAt: -1 });

// 모델 생성
export const InstructorEvaluationCriteria = mongoose.model<IInstructorEvaluationCriteria>(
  'InstructorEvaluationCriteria', 
  InstructorEvaluationCriteriaSchema
);

export default InstructorEvaluationCriteria;
