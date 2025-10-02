/**
 * 🏊‍♂️ JJ Swim Lab - 수영 트레이닝 규칙 엔진 타입 정의
 * 
 * 📋 목적
 * - 건강검진 데이터와 정형 28개 관절질환 가이드를 기반으로 한 수영 계획 생성
 * - WHO/ACSM 도스 규칙, 고혈압/비만/고지혈증 가드레일 적용
 * - 수중 HR 보정 및 성취율 기반 프로그레션 알고리즘
 * 
 * 🎯 사용 목적
 * - 어드민: 건강관련 기준 설정
 * - 센터: 회원 건강관리
 * - 강사: 학생 건강관리
 * - 회원: 개인 건강정보 관리
 * 
 * 📅 개발 히스토리
 * - 2025-09-23: 초기 타입 정의 및 인터페이스 설계
 * - 2025-09-23: 건강검진 입력 및 수영 계획 출력 타입 완성
 * 
 * 👨‍💻 개발자 정보
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-23
 * - 상태: ✅ 완성 (모든 타입 정의 완료)
 */

// 기본 분류 타입들
export type Sex = 'M' | 'F';
export type SwimLevel = 'beginner' | 'intermediate' | 'advanced';
export type Category = 'spine' | 'shoulder' | 'knee' | 'ankle' | 'wrist' | 'elbow' | 'hip';
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
export type SafetyLevel = 'safe' | 'caution' | 'avoid';

// 건강검진 입력 데이터 인터페이스
export interface HealthInput {
  // 인구통계학적 정보
  demographics: {
    age: number;
    sex: Sex;
  };
  
  // 신체 측정 정보
  anthropometrics: {
    height_cm: number;
    weight_kg: number;
    waist_cm?: number;
    bmi?: number;
  };
  
  // 생체 신호
  vitals: {
    rest_hr?: number;
    rest_bp?: { sbp: number; dbp: number };
    meds?: string[];
    on_beta_blocker?: boolean;
  };
  
  // 검사실 수치
  labs?: {
    tc?: number;      // 총 콜레스테롤
    ldl?: number;     // LDL 콜레스테롤
    hdl?: number;     // HDL 콜레스테롤
    tg?: number;      // 중성지방
    fpg?: number;     // 공복혈당
    hba1c?: number;   // 당화혈색소
    egfr?: number;    // 신사구체여과율
  };
  
  // 건강 상태 분류
  conditions: {
    obesity: 'normal' | 'overweight' | 'obesity';
    hypertension: 'normal' | 'elevated' | 'stage1' | 'stage2';
    dyslipidemia: boolean;
    diabetes: boolean;
  };
  
  // 정형외과 질환 (JJ 데이터의 conditionId 키들)
  orthopedics: string[];
  
  // 수영 프로필
  swim_profile: {
    level: SwimLevel;
    swim_hr_peak_land?: number | null;
    rpe_tolerance?: string;
  };
  
  // 운동 목표
  goals: string[]; // ['blood_pressure_control', 'fat_loss', 'lipid_control', 'performance', 'pain_control']
  
  // 순응도 (0~1)
  adherence_last_week: number;
  
  // 증상 플래그
  symptoms_flags: string[]; // ['chest_pain', 'unusual_dyspnea', 'dizziness', 'blurred_vision']
}

// 수영 영법 블록 정의
export interface StrokeBlock {
  stroke: Stroke;
  block: string; // 예: "30' easy", "20' @RPE 11-13"
}

// 세션 계획 정의
export interface SessionPlan {
  day: string;                    // 요일 ('Mon', 'Tue', ...)
  focus: string[];                // 세션 목표
  stroke_plan: StrokeBlock[];     // 영법별 계획
  constraints: string[];          // 제약사항 (정형 가이드 기반)
  intensity_cues: {              // 강도 지표
    primary: string;
    secondary?: string;
  };
  stop_rules: string[];          // 중지 규칙
}

// 최종 계획 출력
export interface PlanOutput {
  microcycle_week: number;                    // 마이크로사이클 주차
  weekly_target_min: number;                 // 주간 목표 시간 (분)
  medical_clearance_required: boolean;       // 의료 확인 필요 여부
  sessions: SessionPlan[];                   // 세션 계획들
  strength_days: number;                     // 근력 운동 일수
  next_week_adjustment: 'progress_+5%' | 'progress_+10%' | 'maintain' | 'deload_-10%' | 'deload_-20%';
  notes: string[];                           // 투명성 노트 ('추측입니다', '확실하지 않음', '모르겠습니다')
}

// 의학적 근거 인터페이스 (정형 데이터용)
export interface MedicalCitation {
  id: string;        // 키: 예) BARTELS_2016_CDSR
  citation: string;  // 정식 서지
  link: string;      // PubMed/PMC/DOI
  level: 'SR/MA' | 'RCT' | 'CPG' | 'Observational' | 'Expert';
  keyFindings: string; // 1~2줄 핵심 결과
}

// 영법별 가이드라인
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

// 관절질환별 가이드라인
export interface JointConditionGuidance {
  conditionId: string;
  conditionName: string;
  category: Category;
  severity: 'mild' | 'moderate' | 'severe';
  swimmingGuidance: Record<Stroke, StrokeGuidance>;
  exerciseRestrictions: {
    intensityReduction: number; // %
    durationLimit: number;      // 분
    frequencyLimit: number;     // 주당 세션 수
    contraindicatedExercises: string[];
    recommendedExercises: string[];
  };
}

// WHO/ACSM 기준 상수
export interface WHOACSMGuidelines {
  mod_min: number;  // 중등도 최소 (분/주)
  mod_max: number;  // 중등도 최대 (분/주)
  vig_min: number;  // 고강도 최소 (분/주)
  vig_max: number;  // 고강도 최대 (분/주)
}

// 세션 길이 범위
export type SessionRange = [number, number]; // [최소, 최대] 분

// 프로그레션 타입
export type ProgressionType = 'progress_+5%' | 'progress_+10%' | 'maintain' | 'deload_-10%' | 'deload_-20%';

// 강도 지표 타입
export type IntensityCue = 'RPE' | 'HR' | 'Talk_Test' | 'MET';

// 중지 규칙 타입
export type StopRule = 'BP_HIGH' | 'CHEST_PAIN' | 'DYSPNEA' | 'DIZZINESS' | 'BLURRED_VISION';







