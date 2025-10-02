/**
 * 🏊‍♂️ JJ Swim Lab - 건강 규칙 및 안전 게이트
 * 
 * 📋 **기능:**
 * - 건강 플래그 기반 안전 제한
 * - 관절 28질환 룰 (Safe/Caution/Avoid)
 * - 특수상황별 제한사항
 */

import { HealthFlags, Zone, Stroke, TrainingMethod, Drill } from './types';

export interface SafetyRestrictions {
  maxIntensity: Zone;
  maxDuration: number; // 분
  maxFrequency: number; // 주당 횟수
  forbiddenStrokes: Stroke[];
  forbiddenMethods: string[];
  forbiddenDrills: string[];
  specialInstructions: string[];
}

export function getSafetyCaps(health: HealthFlags): SafetyRestrictions {
  const restrictions: SafetyRestrictions = {
    maxIntensity: 'Z5',
    maxDuration: 60,
    maxFrequency: 7,
    forbiddenStrokes: [],
    forbiddenMethods: [],
    forbiddenDrills: [],
    specialInstructions: []
  };

  // 고혈압 제한
  if (health.hypertension) {
    restrictions.maxIntensity = 'Z3';
    restrictions.maxDuration = 45;
    restrictions.forbiddenMethods.push('hypoxic', 'sprint', 'vo2max');
    restrictions.forbiddenDrills.push('hypoxic_3_5_7', 'tarzan');
    restrictions.specialInstructions.push('고혈압: 하이폭식 비활성', '고혈압: 고강도 운동 제한');
  }

  // 비만 제한
  if (health.obesity) {
    restrictions.maxIntensity = 'Z3';
    restrictions.maxDuration = 45;
    restrictions.forbiddenMethods.push('sprint', 'vo2max');
    restrictions.specialInstructions.push('비만: 관절 부담 고려한 저강도 운동');
  }

  // 당뇨 제한
  if (health.diabetes) {
    restrictions.maxIntensity = 'Z3';
    restrictions.maxDuration = 45;
    restrictions.specialInstructions.push('당뇨: 혈당 모니터링 필수', '당뇨: 저혈당 대비 필수');
  }

  // 고지혈증 제한
  if (health.dyslipidemia) {
    restrictions.maxIntensity = 'Z3';
    restrictions.specialInstructions.push('고지혈증: 지속적인 유산소 운동 권장');
  }

  // 임신 제한
  if (health.pregnancy) {
    restrictions.maxIntensity = 'Z2';
    restrictions.maxDuration = 30;
    restrictions.maxFrequency = 4;
    restrictions.forbiddenStrokes.push('FL', 'BR');
    restrictions.forbiddenMethods.push('sprint', 'vo2max', 'hypoxic', 'im');
    restrictions.forbiddenDrills.push('hypoxic_3_5_7', 'tarzan', 'body_dolphin');
    restrictions.specialInstructions.push('임신: 복부 압박 피하기', '임신: 고강도 운동 금지');
  }

  // 천식 제한
  if (health.asthma) {
    restrictions.maxIntensity = 'Z3';
    restrictions.forbiddenMethods.push('hypoxic', 'sprint');
    restrictions.forbiddenDrills.push('hypoxic_3_5_7');
    restrictions.specialInstructions.push('천식: 흡입기 휴대 필수', '천식: 호흡 곤란 시 즉시 중단');
  }

  // 수면무호흡 제한
  if (health.osa) {
    restrictions.maxIntensity = 'Z3';
    restrictions.forbiddenMethods.push('hypoxic');
    restrictions.forbiddenDrills.push('hypoxic_3_5_7');
    restrictions.specialInstructions.push('수면무호흡: 하이폭식 운동 금지');
  }

  // 관절 질환별 제한 (28질환 룰)
  if (health.jointConditions && health.jointConditions.length > 0) {
    health.jointConditions.forEach(condition => {
      const jointRestrictions = getJointConditionRestrictions(condition);
      restrictions.forbiddenStrokes.push(...jointRestrictions.forbiddenStrokes);
      restrictions.forbiddenMethods.push(...jointRestrictions.forbiddenMethods);
      restrictions.forbiddenDrills.push(...jointRestrictions.forbiddenDrills);
      restrictions.specialInstructions.push(...jointRestrictions.specialInstructions);
    });
  }

  return restrictions;
}

function getJointConditionRestrictions(condition: string): Partial<SafetyRestrictions> {
  const restrictions: Partial<SafetyRestrictions> = {
    forbiddenStrokes: [],
    forbiddenMethods: [],
    forbiddenDrills: [],
    specialInstructions: []
  };

  // 무릎 질환
  if (condition.includes('knee') || condition.includes('무릎')) {
    restrictions.forbiddenStrokes = ['BR'];
    restrictions.forbiddenMethods = ['kick'];
    restrictions.forbiddenDrills = ['kick_on_back', 'body_dolphin'];
    restrictions.specialInstructions = ['무릎: 평영 킥 금지', '무릎: 킥 집중 훈련 금지'];
  }

  // 어깨 질환
  if (condition.includes('shoulder') || condition.includes('어깨')) {
    restrictions.forbiddenStrokes = ['FL'];
    restrictions.forbiddenMethods = ['pull', 'sprint'];
    restrictions.forbiddenDrills = ['single_arm', 'scull_front', 'scull_mid', 'scull_back'];
    restrictions.specialInstructions = ['어깨: 접영 금지', '어깨: 풀 집중 훈련 금지'];
  }

  // 척추 질환
  if (condition.includes('spine') || condition.includes('척추')) {
    restrictions.forbiddenStrokes = ['FL', 'BR'];
    restrictions.forbiddenMethods = ['sprint', 'im'];
    restrictions.forbiddenDrills = ['body_dolphin', 'kick_on_back'];
    restrictions.specialInstructions = ['척추: 접영/평영 금지', '척추: 고강도 운동 금지'];
  }

  // 발목 질환
  if (condition.includes('ankle') || condition.includes('발목')) {
    restrictions.forbiddenMethods = ['kick'];
    restrictions.forbiddenDrills = ['kick_on_back', 'body_dolphin'];
    restrictions.specialInstructions = ['발목: 킥 집중 훈련 금지'];
  }

  // 팔꿈치 질환
  if (condition.includes('elbow') || condition.includes('팔꿈치')) {
    restrictions.forbiddenMethods = ['pull', 'sprint'];
    restrictions.forbiddenDrills = ['single_arm', 'scull_front', 'scull_mid', 'scull_back'];
    restrictions.specialInstructions = ['팔꿈치: 풀 집중 훈련 금지'];
  }

  // 고관절 질환
  if (condition.includes('hip') || condition.includes('고관절')) {
    restrictions.forbiddenStrokes = ['BR'];
    restrictions.forbiddenMethods = ['kick'];
    restrictions.forbiddenDrills = ['kick_on_back', 'body_dolphin'];
    restrictions.specialInstructions = ['고관절: 평영 킥 금지', '고관절: 킥 집중 훈련 금지'];
  }

  // 손목 질환
  if (condition.includes('wrist') || condition.includes('손목')) {
    restrictions.forbiddenMethods = ['pull'];
    restrictions.forbiddenDrills = ['scull_front', 'scull_mid', 'scull_back'];
    restrictions.specialInstructions = ['손목: 풀 집중 훈련 금지'];
  }

  return restrictions;
}

export function filterMethodsBySafety(
  methods: TrainingMethod[],
  restrictions: SafetyRestrictions
): TrainingMethod[] {
  return methods.filter(method => 
    !restrictions.forbiddenMethods.includes(method.id)
  );
}

export function filterDrillsBySafety(
  drills: Drill[],
  restrictions: SafetyRestrictions
): Drill[] {
  return drills.filter(drill => 
    !restrictions.forbiddenDrills.includes(drill.id)
  );
}

export function getSafetyBadges(health: HealthFlags): string[] {
  const badges: string[] = [];

  if (health.hypertension) badges.push('고혈압: 하이폭식 비활성');
  if (health.obesity) badges.push('비만: 관절 부담 고려');
  if (health.diabetes) badges.push('당뇨: 혈당 모니터링 필수');
  if (health.dyslipidemia) badges.push('고지혈증: 지속적 유산소 권장');
  if (health.pregnancy) badges.push('임신: 복부 압박 피하기');
  if (health.asthma) badges.push('천식: 흡입기 휴대 필수');
  if (health.osa) badges.push('수면무호흡: 하이폭식 금지');

  if (health.jointConditions && health.jointConditions.length > 0) {
    health.jointConditions.forEach(condition => {
      if (condition.includes('knee') || condition.includes('무릎')) {
        badges.push('무릎: 평영 킥 금지');
      }
      if (condition.includes('shoulder') || condition.includes('어깨')) {
        badges.push('어깨: 접영 금지');
      }
      if (condition.includes('spine') || condition.includes('척추')) {
        badges.push('척추: 접영/평영 금지');
      }
    });
  }

  return badges;
}










