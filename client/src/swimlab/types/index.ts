/**
 * SwimLab Data Pack v4 - 타입 정의 (ChatGPT 세세한 구조)
 * 
 * 건강·질환 규칙, 훈련법 카탈로그, 드릴 데이터, 마스터즈 기준 등을 포함한
 * 포괄적인 수영 프로그램 생성 시스템
 */

// ========== 기본 타입 ==========
export type Stroke = "FR" | "BK" | "BR" | "FL" | "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "elementary_backstroke" | "sidestroke";
export type SafetyLevel = "safe" | "caution" | "avoid";
export type Goal = "ENDURANCE" | "THRESHOLD" | "VO2MAX" | "SPRINT";
export type Zone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "EN1" | "EN2" | "EN3";
export type PoolLength = 25 | 50;
export type Sex = "male" | "female";

// ========== 드릴 (ChatGPT 세세한 구조 v2) ==========
export interface Drill {
  id: string;
  name: string;
  definition: string;
  why: string;
  when: string;
  who: string;
  how: string;
  pros: string;
  cons: string;
  cautions: string;
  cues: string[];
  examples: string[];
  tags: string[];
  evidence: { label: string; url: string }[];
}

// ========== 훈련법 (ChatGPT 세세한 구조 v2) ==========
export interface TrainingMethod {
  id: string;
  title: string;
  whenToUse: string;
  whoShouldUse: string;
  howToDo: string;
  intensityAndVolume: string;
  pros: string;
  cons: string;
  cautions: string;
  category: 'Endurance'|'Speed'|'Technique'|'RaceStrategy'|'OpenWater';
  recommendedDrills: string[]; // e.g., ['D01','D29']
  evidence: { label: string; url: string }[];
}

// ========== 질환 (ChatGPT 세세한 구조) ==========
export type ImpactType = 'movement'|'volume'|'intensity'|'rest'|'equipment'|'breath';
export type StrokeName = 'freestyle'|'backstroke'|'breaststroke'|'butterfly'|'elementary_backstroke'|'sidestroke';

export interface Condition {
  id: string;
  name: string;
  category: 'spine'|'shoulder'|'elbow'|'wrist'|'hip'|'knee'|'ankle'|'skin'|'ent'|'chronic'|'mental'|'special'|'other';
  severity?: 'mild'|'moderate'|'severe';
  impacts: { type: ImpactType; how: string; delta?: number }[];
  strokeNotes?: Partial<Record<StrokeName, {level: SafetyLevel; mods?: string[]}>>;
  evidenceKeys: string[];
  notes?: string[];
}

// ========== 영법 안전성 ==========
export interface StrokeSafety {
  stroke: Stroke;
  pros: string[];
  cons: string[];
  cautions: string[];
  typicalUse: string[];
  evidenceKeys: string[];
}

// ========== 의학적 근거 ==========
export interface Evidence {
  key: string;
  title: string;
  url: string;
  year?: number;
  note?: string;
}

// ========== 마스터즈 기준 ==========
export interface MastersStandard {
  ageGroup: string;
  sex: Sex;
  stroke: Stroke;
  distance: number;
  time: number; // 초
  country: "domestic" | "international";
}

// ========== 세트 스펙 ==========
export interface SetSpec {
  reps: number;
  distance: number;
  stroke: Stroke;
  zone: Zone;
  pacePer100: number;
  restSec: number;
  methodId: string;
  rationale: {
    distanceWhy: string;
    paceWhy: string;
    restWhy: string;
    methodWhy: string;
    safetyWhy: string[];
    zoneCap?: Zone;
  };
}

// ========== 선수 프로필 ==========
export interface AthleteProfile {
  age: number;
  sex: Sex;
  course: PoolLength;
  sessionMinutes: number;
  weeklySessions: number;
  conditions: string[];
  goal: Goal;
  cssPer100: number;
}

// ========== 기타 ==========
export interface TooltipData {
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
}

export interface CSVUploadResult {
  success: boolean;
  message: string;
  data?: MastersStandard[];
  errors?: string[];
}

// ========== 건강 카테고리 (레거시 호환) ==========
export type HealthCategory = "joint" | "skin" | "general" | "mental" | "special";
export type ImpactAxis = "technique" | "volume" | "intensity" | "rest" | "contraindication";

export interface AdjustmentRule {
  cap?: Zone;
  restBonus?: number;
  avoid?: Partial<Record<Stroke, boolean>>;
  notes?: string[];
  evidenceIds?: string[];
}

export interface HealthCondition {
  id: string;
  name: string;
  category: HealthCategory;
  severity: "mild" | "moderate" | "severe";
  impacts: Record<ImpactAxis, string>;
  adjustments: AdjustmentRule;
  description: string;
}