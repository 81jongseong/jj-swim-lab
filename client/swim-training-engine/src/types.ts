/**
 * JJ Swim Lab: 건강·질환·기술 기반 수영 프로그램 생성기
 * 데이터 스키마 정의
 */

export type PoolLen = 25 | 50;
export type Sex = 'M' | 'F';
export type Goal = 'fatloss' | 'endurance' | 'performance';
export type Zone = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5';
export type Stroke = 'FR'|'BK'|'BR'|'FL'|'IM';

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
  totalMeters: number;
  sets: SessionSet[];
  safetyBadges: string[]; // "고혈압: 하이폭식 비활성" 등
};

export type WeekPlan = {
  summary: {
    totalMeters: number;
    zoneDist: Record<Zone, number>;
    sessions: number;
  };
  sessions: SessionPlan[];
};