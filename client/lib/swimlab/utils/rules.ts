/**
 * 🏊 SwimLab - 컨디션 규칙 (모의 구현)
 * 
 * 📋 **파일 목적**
 * - 각 컨디션별 추천/회피 메서드 및 드릴 정의
 * - 실제 프로젝트에서는 더 상세한 규칙 구현
 * - coverage.ts에서 사용
 */

export type RuleResult = {
  recommendMethods?: string[];
  avoidMethods?: string[];
  recommendDrills?: string[];
  avoidDrills?: string[];
  rationale?: string;
  evidence?: Array<{key: string; url: string}>;
};

/**
 * 단일 컨디션 규칙 적용
 */
export function applyRules(conditionId: string): RuleResult | null {
  // 현재 매핑된 조건들 (15개)
  switch(conditionId) {
    case 'shoulder_impingement':
      return {
        recommendMethods: ['kick_drill', 'backstroke_technique'],
        avoidMethods: ['butterfly_drill', 'freestyle_sprint'],
        recommendDrills: ['single_arm_backstroke', 'scull_front'],
        avoidDrills: ['dolphin_underwater'],
        rationale: '어깨 충돌: 회전 범위 제한, 고강도 PULL 회피',
      };
    
    case 'rotator_cuff_irritation':
      return {
        recommendMethods: ['technique_focus', 'kick_endurance'],
        avoidMethods: ['sprint_intervals', 'power_pull'],
        recommendDrills: ['catch_up_drill', 'fingertip_drag'],
        avoidDrills: ['butterfly_drill'],
        rationale: '회전근개: 저항 최소화, 기술 중심',
      };
    
    case 'scapular_dyskinesis':
      return {
        recommendMethods: ['scull_progression', 'catch_technique'],
        avoidMethods: ['high_volume_pull'],
        recommendDrills: ['scull_front', 'scull_side'],
        rationale: '견갑 불균형: 스컬로 안정화, 볼륨 제한',
      };
    
    case 'patellofemoral_pain':
      return {
        recommendMethods: ['pull_focus', 'upper_body_endurance'],
        avoidMethods: ['breaststroke_intensive', 'kick_intensive'],
        avoidDrills: ['breaststroke_kick'],
        rationale: '무릎 PFPS: 평영킥 회피, PULL 중심',
      };
    
    case 'it_band_syndrome':
      return {
        recommendMethods: ['pull_moderate', 'technique_drill'],
        avoidMethods: ['kick_intensive', 'high_volume_kick'],
        rationale: '장경인대: 킥 볼륨/강도 감소',
      };
    
    case 'lumbar_extension_intolerance':
      return {
        recommendMethods: ['freestyle_neutral_spine', 'side_breathing'],
        avoidMethods: ['butterfly_dolphin', 'backstroke_arch'],
        avoidDrills: ['dolphin_kick'],
        rationale: '허리 신전 민감: 과신전 동작 회피',
      };
    
    case 'lumbar_flexion_intolerance':
      return {
        recommendMethods: ['neutral_spine_drill', 'backstroke_steady'],
        avoidMethods: ['flip_turn_intensive', 'breaststroke_dive'],
        rationale: '허리 굴곡 민감: 과굴곡 동작 회피',
      };
    
    case 'achilles_tendinopathy':
      return {
        recommendMethods: ['pull_focus', 'gentle_kick'],
        avoidMethods: ['wall_push_hard', 'sprint_kick'],
        rationale: '아킬레스: 벽차기/킥 강도 제한',
      };
    
    case 'plantar_fasciitis':
      return {
        recommendMethods: ['pull_endurance', 'easy_kick'],
        avoidMethods: ['sprint_push_off', 'high_intensity_kick'],
        rationale: '족저근막: 발바닥 부하 최소화',
      };
    
    case 'long_covid_fatigue':
      return {
        recommendMethods: ['low_intensity_steady', 'recovery_swim'],
        avoidMethods: ['high_intensity_intervals', 'race_pace'],
        rationale: '장기 COVID: 저강도 지속, 회복 우선',
      };
    
    case 'general_deconditioning':
      return {
        recommendMethods: ['base_endurance', 'technique_rebuild'],
        avoidMethods: ['sprint_intensive', 'high_volume_sudden'],
        rationale: '컨디션 저하: 기초 재구축, 점진적 증가',
      };
    
    case 'sleep_deprived':
      return {
        recommendMethods: ['easy_technique', 'recovery_swim'],
        avoidMethods: ['high_intensity_main'],
        rationale: '수면부족: 강도 하향, 회복 중심',
      };
    
    case 'upper_respiratory':
      return {
        recommendMethods: ['breathing_drill', 'steady_easy'],
        avoidMethods: ['underwater_intensive', 'hypoxic_drill'],
        rationale: '호흡기: 호흡 부하 제한, 잠수 회피',
      };
    
    case 'fatigue_high':
      return {
        recommendMethods: ['recovery_easy', 'technique_light'],
        avoidMethods: ['sprint_set', 'high_volume_main'],
        rationale: '고피로: 볼륨/강도 감소, 회복 우선',
      };
    
    default:
      return null;
  }
}

