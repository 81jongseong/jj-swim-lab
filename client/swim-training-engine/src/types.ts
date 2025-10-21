/**
 * JJ Swim Lab: 건강·질환·기술 기반 수영 프로그램 생성기
 * 데이터 스키마 정의
 */

export type PoolLen = 25 | 50;
export type Sex = 'M' | 'F';
export type Goal = 'fatloss' | 'endurance' | 'performance';
export type Zone = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5';
export type Stroke = 'FR'|'BK'|'BR'|'FL'|'IM'|'freestyle'|'backstroke'|'breaststroke'|'butterfly'|'elementary_backstroke'|'sidestroke';
export type SwimLevel = 'beginner' | 'intermediate' | 'advanced';
export type SafetyLevel = 'safe' | 'caution' | 'avoid' | 'medical';

export type HealthFlags = {
  hypertension?: boolean;
  obesity?: boolean;
  dyslipidemia?: boolean;
  diabetes?: boolean;
  pregnancy?: boolean;
  asthma?: boolean;
  osa?: boolean; // 특수상황 예시
  jointConditions?: string[]; // 28질환 ID 배열 (외부 룰셋에서 참조)
};

// 안전 규칙 타입
export interface SafetyRule {
  condition: string;
  restriction: 'safe' | 'caution' | 'avoid' | 'medical';
  description: string;
  modifications: string[];
}

export type TechniqueChecklist = {
  freestyle?: {
    crossover?: boolean;
    highElbow?: boolean;
    bilateralBreath?: boolean;
    headPos?: 'high'|'low'|'ok';
    turnBreakout?: number; // m
  };
  // 필요한 종목별로 확장 가능
};

export type PaceInputs = {
  cssSecPer100?: number;  // CSS pace (초/100m)
  best100Sec?: number;    // 최고 100m 페이스
  z2SecPer100?: number;   // 20-30분 지속 가능한 페이스
  band?: 'B'|'BB'|'A'|'AA'|'AAA'|'AAAA'; // 연령표 기준 추정 밴드(선택)
};

export type TimeAvailability = {
  pool: PoolLen;
  daysPerWeek: number;       // 주당 횟수
  sessionMinutes: number;    // 1회 운동 시간
};

export type Drill = {
  id: string;
  name: string;
  strokes: Stroke[];
  helps: string[]; // 목표/효과
  pros: string[];
  cons: string[];
  cautions: string[]; // 장단점/주의
  cues: string[];  // 코칭 포인트
  typicalUse: {
    zones: Zone[];
    rep25?: number[];
    rep50?: number[];
    restSec?: number[];
  };
};

export type TrainingMethod = {
  id: string;
  name: string;
  definition: string; // 정의
  whenToUse: string[]; // 언제 쓰는가
  goals: string[];     // 목표
  pros: string[];      // 장점
  cons: string[];      // 단점
  cautions: string[];  // 주의
  examples25: string[]; // 25m 풀 예시
  examples50: string[]; // 50m 풀 예시
  zones: Zone[];       // 주 사용 존
  recommendedDrillIds: string[]; // 전이용 드릴 권장 목록
};

export type SessionSet = {
  label: string; // "Main" / "Tech" 등
  reps: number;
  distance: number; // 예: 8×100 → reps=8, distance=100
  paceNote: string; // "@ CSS+6″ (Z3)" 등
  restSec: number | [number, number]; // 고정 또는 범위
  stroke?: Stroke;
  methodId?: string;
  drillIds?: string[];
  cues?: string[];
};

export type SessionPlan = {
  dayIndex: number;
  day?: string; // 요일 정보
  totalMeters: number;
  totalDistance?: number; // totalMeters alias
  totalDuration?: number; // 총 소요 시간 (분)
  averagePace?: number; // 평균 페이스 (초/100m)
  sets: SessionSet[];
  safetyBadges: string[]; // "고혈압: 하이폭식 비활성" 등
  WU?: SessionSet[]; // 워밍업
  PRE?: SessionSet[]; // 준비
  MAIN?: SessionSet[]; // 메인
  CD?: SessionSet[]; // 쿨다운
  focus?: string[]; // 포커스 항목
  stroke_plan?: any[]; // 영법 계획
  constraints?: string[]; // 제약사항
  intensity_cues?: any; // 강도 신호
  intensity?: number; // 강도
  stop_rules?: any; // 중지 규칙
  notes?: string[]; // 노트
};

export type WeekPlan = {
  summary: {
    totalMeters: number;
    zoneDist: Record<Zone, number>;
    sessions: number;
  };
  sessions: SessionPlan[];
};

// 의료 문헌 인용
export interface MedicalCitation {
  id?: string; // 선택적
  citation: string;
  link: string;
  level: 'SR/MA' | 'RCT' | 'Cohort' | 'Case' | 'Expert' | 'CPG' | 'EXP';
  keyFindings: string;
}

// 의료 증거 타입 (MedicalCitation과 동일)
export type MedicalEvidence = MedicalCitation;

// 영법별 가이드
export interface StrokeGuidance {
  level: SafetyLevel;
  reason: string;
  allowedMovements: string[];
  prohibitedMovements: string[];
  modifications: string[];
  alternatives: Stroke[];
  medicalEvidence: MedicalCitation[];
  detailedExplanation: string;
}

// 관절질환 가이드
export interface JointConditionGuidance {
  conditionId: string;
  conditionName: string;
  category: 'spine' | 'shoulder' | 'knee' | 'hip' | 'ankle' | 'wrist' | 'elbow' | 'muscle' | 'joint' | 'tendon' | 'foot' | 'chest' | 'neck' | 'back';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  swimmingGuidance: {
    freestyle?: StrokeGuidance;
    backstroke?: StrokeGuidance;
    breaststroke?: StrokeGuidance;
    butterfly?: StrokeGuidance;
    elementary_backstroke?: StrokeGuidance;
    sidestroke?: StrokeGuidance;
    [key: string]: StrokeGuidance | undefined;
  };
  exerciseRestrictions: {
    intensityReduction: number;
    durationLimit: number;
    frequencyLimit: number;
    contraindicatedExercises: string[];
    recommendedExercises: string[];
    medicalEvidence?: MedicalCitation[]; // 의료 근거
  };
}

// 건강정보 입력 타입
export interface HealthInput {
  demographics: {
    age: number;
    sex: 'M' | 'F';
  };
  anthropometrics?: {
    height_cm: number;
    weight_kg: number;
  };
  vitals?: {
    rest_hr?: number;
    rest_bp?: { sbp: number; dbp: number };
    on_beta_blocker?: boolean;
    bloodSugar?: number;
    totalCholesterol?: number;
  };
  conditions?: {
    hypertension?: string;
    obesity?: string;
    dyslipidemia?: boolean;
    diabetes?: boolean;
    heartDisease?: boolean;
    respiratoryDisease?: boolean;
  };
  orthopedics?: string[];
  health?: HealthFlags;
  pace?: PaceInputs;
  avail?: TimeAvailability;
  goal?: Goal;
  stroke?: Stroke;
  technique?: any;
  specialConditions?: any;
  swimLevel?: string;
  grade?: string;
  poolDistance?: number;
  symptoms_flags?: string[];
  adherence_last_week?: number;
  goals?: string[];
  swim_profile?: any;
  labs?: any; // 실험실 검사 결과
}

// 사용자 입력 타입 (레거시 호환)
export interface UserInput {
  demographics: {
    age: number;
    sex: 'M' | 'F';
  };
  health: HealthFlags;
  technique?: TechniqueChecklist;
  pace: PaceInputs;
  avail: TimeAvailability;
  goal: Goal;
  stroke: Stroke;
}

// 진행률 데이터 타입
export interface ProgressionData {
  weekNumber: number;
  completedMeters: number;
  completedSessions: number;
  avgPace: number;
  adherence: number;
  completionRate?: number; // 완료율 (0-100)
  averageRPE?: number; // 평균 RPE (1-10)
  notes?: string[];
}

// 프로그램 출력 타입
export interface PlanOutput {
  microcycle_week: number;
  weekly_target_min: number;
  weekly_target_distance: number;
  medical_clearance_required: boolean;
  sessions: Array<{
    day: string;
    sessionType: string;
    intensity: number;
    exercises: Array<{
      stroke: string;
      distance: number;
      sets: number;
      rest: number | [number, number];
    }>;
  }>;
  pacing_guidance: string;
  progression_plan: 'maintain' | 'increase' | 'decrease';
  health_notes: string[];
}