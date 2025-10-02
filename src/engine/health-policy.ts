/**
 * 🏊‍♂️ JJ Swim Lab - 건강 정책 및 도스 규칙 엔진
 * 
 * 📋 목적
 * - WHO/ACSM 기준 기반 운동 도스 계산
 * - 고혈압/비만/고지혈증 가드레일 적용
 * - 수중 HR 보정 및 의료 확인 필요성 판단
 * - 혈압 중지 규칙 및 안전 기준 설정
 * 
 * 🎯 사용 목적
 * - 수영 트레이닝 계획의 과학적 근거 제공
 * - 개인 건강 상태에 따른 맞춤형 도스 조정
 * - 안전한 운동 강도 및 빈도 설정
 * 
 * 📅 개발 히스토리
 * - 2025-09-23: 초기 건강 정책 규칙 설계
 * - 2025-09-23: WHO/ACSM 기준 및 가드레일 구현
 * - 2025-09-23: 수중 HR 보정 알고리즘 추가
 * 
 * 👨‍💻 개발자 정보
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-23
 * - 상태: ✅ 완성 (모든 건강 정책 규칙 구현)
 */

import { HealthInput, SwimLevel, WHOACSMGuidelines, SessionRange } from '../types';

// ────────────────────────────────────────────────────────────────────────────────
// WHO/ACSM 기준 상수
// ────────────────────────────────────────────────────────────────────────────────
export const WHO_BASE: WHOACSMGuidelines = {
  mod_min: 150,  // 중등도 최소 (분/주)
  mod_max: 300,  // 중등도 최대 (분/주)
  vig_min: 75,   // 고강도 최소 (분/주)
  vig_max: 150   // 고강도 최대 (분/주)
};

// ────────────────────────────────────────────────────────────────────────────────
// 의료 확인 필요성 판단
// ────────────────────────────────────────────────────────────────────────────────
export function medicalClearanceNeeded(input: HealthInput): boolean {
  const sbp = input.vitals?.rest_bp?.sbp ?? 0;
  const dbp = input.vitals?.rest_bp?.dbp ?? 0;
  
  // ACSM 사전참여 알고리즘 요약: 고강도 목표 + CMR 질환/증상 or SBP/DBP 위험수치 등
  
  // 1. 혈압 기준 (시작 금지)
  if (sbp >= 180 || dbp >= 110) {
    return true;
  }
  
  // 2. 증상 플래그 존재
  if (input.symptoms_flags?.length > 0) {
    return true;
  }
  
  // 3. Stage2 고혈압이면서 고강도 추구 등 추가 보수 조건
  if (input.conditions.hypertension === 'stage2' && input.swim_profile.level === 'advanced') {
    return true;
  }
  
  // 4. 당뇨병 + 고혈압 조합
  if (input.conditions.diabetes && input.conditions.hypertension !== 'normal') {
    return true;
  }
  
  // 5. 나이 + 다중 위험요인
  if (input.demographics.age >= 65 && 
      (input.conditions.diabetes || input.conditions.hypertension !== 'normal' || input.conditions.dyslipidemia)) {
    return true;
  }
  
  return false;
}

// ────────────────────────────────────────────────────────────────────────────────
// 주간 도스 계산 (분)
// ────────────────────────────────────────────────────────────────────────────────
export function weeklyDoseMinutes(input: HealthInput): number {
  let base = 180; // 기본 목표 (분/주)
  
  // 목표에 따른 가중치 적용
  
  // 1. 비만(감량 우선) → 250+ 분/주
  if (input.conditions.obesity !== 'normal') {
    base = Math.max(base, 250);
  }
  
  // 2. 고혈압 → 빈도↑ 중심으로 180~210 분/주
  if (input.conditions.hypertension === 'stage2') {
    base = Math.max(base, 210);
  } else if (input.conditions.hypertension === 'stage1') {
    base = Math.max(base, 200);
  } else if (input.conditions.hypertension === 'elevated') {
    base = Math.max(base, 190);
  }
  
  // 3. 고지혈증 → 180~240 분/주
  if (input.conditions.dyslipidemia) {
    base = Math.max(base, 200);
  }
  
  // 4. 당뇨병 → 추가 증가
  if (input.conditions.diabetes) {
    base = Math.max(base, 220);
  }
  
  // 5. 수영 레벨별 조정
  if (input.swim_profile.level === 'beginner') {
    base = Math.min(base, 200); // 초보자는 과도한 도스 방지
  } else if (input.swim_profile.level === 'advanced') {
    base = Math.min(base, 300); // 상급자도 WHO 최대치 이내
  }
  
  // 6. 순응도 기반 조정
  if (input.adherence_last_week < 0.6) {
    base = Math.round(base * 0.8); // 순응도 낮으면 도스 감소
  }
  
  return Math.round(base);
}

// ────────────────────────────────────────────────────────────────────────────────
// 레벨별 세션 길이 범위
// ────────────────────────────────────────────────────────────────────────────────
export function levelSessionRange(level: SwimLevel): SessionRange {
  switch (level) {
    case 'beginner':
      return [30, 35];
    case 'intermediate':
      return [40, 50];
    case 'advanced':
      return [50, 60];
    default:
      return [30, 35];
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// 강도 지표 설정
// ────────────────────────────────────────────────────────────────────────────────
export function rpePrimary(): string {
  return 'RPE 11–13(중등도)';
}

export function hrSecondary(input: HealthInput): string | undefined {
  // 베타차단제 복용 시 HR 지표 비활성화
  if (input.vitals?.on_beta_blocker) {
    return undefined;
  }
  
  // 수중 HR 보정: 육상 목표에서 −10~15bpm
  return 'HR: 육상 목표에서 −10~15bpm(수중 보정, 개인차 큼 — 확실하지 않음)';
}

// ────────────────────────────────────────────────────────────────────────────────
// 혈압 중지 규칙
// ────────────────────────────────────────────────────────────────────────────────
export const BP_STOP_RULE = 'SBP≥250 or DBP≥115(즉시 중지)';

// ────────────────────────────────────────────────────────────────────────────────
// 일반적인 중지 규칙들
// ────────────────────────────────────────────────────────────────────────────────
export const COMMON_STOP_RULES = [
  BP_STOP_RULE,
  'chest_pain',
  'unusual_dyspnea',
  'dizziness',
  'blurred_vision',
  'nausea',
  'severe_fatigue'
];

// ────────────────────────────────────────────────────────────────────────────────
// 운동 빈도 계산
// ────────────────────────────────────────────────────────────────────────────────
export function calculateFrequency(input: HealthInput): number {
  // 고혈압: 빈도↑ (5-7일/주)
  if (input.conditions.hypertension !== 'normal') {
    return 5;
  }
  
  // 비만: 빈도↑ (5-6일/주)
  if (input.conditions.obesity !== 'normal') {
    return 5;
  }
  
  // 일반적인 경우: 4-5일/주
  return 4;
}

// ────────────────────────────────────────────────────────────────────────────────
// 세션당 시간 계산
// ────────────────────────────────────────────────────────────────────────────────
export function calculateSessionDuration(input: HealthInput): number {
  const weeklyMin = weeklyDoseMinutes(input);
  const frequency = calculateFrequency(input);
  const [minPer, maxPer] = levelSessionRange(input.swim_profile.level);
  
  const perSession = Math.ceil(weeklyMin / frequency);
  
  // 레벨별 최대치 이내로 제한
  return Math.min(perSession, maxPer);
}

// ────────────────────────────────────────────────────────────────────────────────
// 강도 조정 팩터
// ────────────────────────────────────────────────────────────────────────────────
export function getIntensityAdjustment(input: HealthInput): number {
  let adjustment = 1.0;
  
  // 고혈압: 강도 감소
  if (input.conditions.hypertension === 'stage2') {
    adjustment *= 0.8;
  } else if (input.conditions.hypertension === 'stage1') {
    adjustment *= 0.9;
  }
  
  // 당뇨병: 강도 감소
  if (input.conditions.diabetes) {
    adjustment *= 0.85;
  }
  
  // 순응도 낮음: 강도 감소
  if (input.adherence_last_week < 0.6) {
    adjustment *= 0.8;
  }
  
  return Math.max(adjustment, 0.6); // 최소 60% 강도 유지
}

// ────────────────────────────────────────────────────────────────────────────────
// 안전성 체크
// ────────────────────────────────────────────────────────────────────────────────
export function safetyCheck(input: HealthInput): { safe: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // 혈압 체크
  const sbp = input.vitals?.rest_bp?.sbp ?? 0;
  const dbp = input.vitals?.rest_bp?.dbp ?? 0;
  
  if (sbp >= 160 || dbp >= 100) {
    warnings.push('고혈압 주의: 운동 중 혈압 모니터링 필요');
  }
  
  // 나이 체크
  if (input.demographics.age >= 70) {
    warnings.push('고령자: 점진적 강도 증가 권장');
  }
  
  // 정형외과 질환 체크
  if (input.orthopedics.length > 2) {
    warnings.push('다중 관절질환: 개별 반응 모니터링 중요');
  }
  
  // 순응도 체크
  if (input.adherence_last_week < 0.5) {
    warnings.push('낮은 순응도: 목표 조정 고려');
  }
  
  return {
    safe: warnings.length === 0,
    warnings
  };
}







