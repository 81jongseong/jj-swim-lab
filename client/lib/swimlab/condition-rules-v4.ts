/**
 * 🏥 컨디션/질환별 규칙 v4 - 카테고리별 차등 적용
 * 
 * 핵심 원칙:
 * - CSS(Critical Swim Speed)는 역치 지표 → 기본 유지
 * - 일괄 %감속 ❌
 * - MSK(근골격계) → 동작/장비/강도 상한(Z cap)
 * - ENT/호흡/피부 → 노출/휴식/고강도 총량
 * - 컨디션 → Zone 노출·세트 길이·휴식 조정
 * - 영법별 차등: 28가지 관절질환 데이터 기반
 * 
 * 연동되는 데이터:
 * - client/swim-training-engine/src/data/jj-swim-lab-joint-guidance.ts (28 질환)
 * - 각 질환마다 6가지 영법별 safe/caution/avoid 레벨
 * - medicalEvidence 포함
 * 
 * 연동되는 파일:
 * - client/types/evidence.ts
 * - client/lib/swimlab/engine-v31.ts
 */

import { EvidenceKey } from '@/types/evidence';
import { allJointConditions } from '@/swim-training-engine/src/data/jj-swim-lab-joint-guidance';

type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';

export interface ConditionRuleResult {
  // CSS 조정 (기본은 0%, 특수한 경우만)
  cssPct: number;
  
  // Zone 제한
  zoneRestrictions: {
    allowZ5: boolean;
    z4MaxMeters: number; // Z4 총량 cap (Infinity = 무제한)
    z3MaxMeters: number; // Z3 총량 cap
  };
  
  // 장비 제한
  equipmentRestrictions: {
    forbiddenEquipment: string[]; // ['패들', '큰 패들']
    recommendedEquipment: string[]; // ['풀부이', '핀']
  };
  
  // 휴식 조정 (초)
  restBonus: {
    Z1: number;
    Z2: number;
    Z3: number;
    Z4: number;
    Z5: number;
  };
  
  // 영법별 조정
  strokeAdjustments: {
    [stroke: string]: {
      avoid: boolean;          // 완전 회피
      reduceVolume: boolean;   // 볼륨 축소
      volumePct: number;       // 볼륨 %
    };
  };
  
  // 드릴/동작 제한
  drillRestrictions: string[]; // ['긴 잠영', '저산소', '하이폭식']
  
  // 설명
  explanation: string;
  evidenceKeys: EvidenceKey[];
}

/**
 * 28가지 관절질환 데이터 기반 영법별 차등 적용
 */
export function applyJointCondition(conditionId: string): ConditionRuleResult {
  const condition = allJointConditions.find(c => c.conditionId === conditionId);
  
  if (!condition) {
    return createEmptyRule();
  }
  
  const result: ConditionRuleResult = {
    cssPct: 0, // CSS 유지 ✅
    zoneRestrictions: {
      allowZ5: true,
      z4MaxMeters: Infinity,
      z3MaxMeters: Infinity
    },
    equipmentRestrictions: {
      forbiddenEquipment: [],
      recommendedEquipment: []
    },
    restBonus: { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0 },
    strokeAdjustments: {},
    drillRestrictions: [],
    explanation: '',
    evidenceKeys: []
  };
  
  // 영법별 레벨 분석
  const strokes: Stroke[] = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'];
  
  let avoidCount = 0;
  let cautionCount = 0;
  
  strokes.forEach(stroke => {
    const guidance = condition.swimmingGuidance?.[stroke];
    if (!guidance) {
      result.strokeAdjustments[stroke] = { avoid: false, reduceVolume: false, volumePct: 1.0 };
      return;
    }
    
    if (guidance.level === 'avoid') {
      result.strokeAdjustments[stroke] = { avoid: true, reduceVolume: false, volumePct: 0 };
      avoidCount++;
    } else if (guidance.level === 'caution') {
      result.strokeAdjustments[stroke] = { avoid: false, reduceVolume: true, volumePct: 0.7 };
      cautionCount++;
      
      // 동작 제한을 drillRestrictions에 추가
      result.drillRestrictions.push(...(guidance.prohibitedMovements || []));
    } else {
      result.strokeAdjustments[stroke] = { avoid: false, reduceVolume: false, volumePct: 1.0 };
    }
  });
  
  // 질환 카테고리별 추가 조정
  if (condition.category === 'shoulder') {
    result.equipmentRestrictions.forbiddenEquipment.push('패들', '큰 패들');
    result.zoneRestrictions.z4MaxMeters = 300;
    result.restBonus = { Z1: 0, Z2: 0, Z3: 5, Z4: 10, Z5: 10 };
  } else if (condition.category === 'elbow') {
    result.equipmentRestrictions.forbiddenEquipment.push('패들', '핀');
    result.equipmentRestrictions.recommendedEquipment.push('킥보드', '풀부이');
    result.zoneRestrictions.z4MaxMeters = 400;
    result.restBonus = { Z1: 0, Z2: 5, Z3: 10, Z4: 15, Z5: 20 };
  } else if (condition.category === 'knee') {
    result.equipmentRestrictions.recommendedEquipment.push('풀부이'); // 킥 부담 최소화
    result.restBonus = { Z1: 0, Z2: 0, Z3: 0, Z4: 5, Z5: 10 };
  } else if (condition.category === 'spine') {
    result.zoneRestrictions.allowZ5 = false;
    result.zoneRestrictions.z4MaxMeters = 200;
    result.restBonus = { Z1: 0, Z2: 5, Z3: 10, Z4: 15, Z5: 20 };
  }
  
  result.explanation = `${condition.conditionName}: ${Object.entries(result.strokeAdjustments)
    .filter(([_, adj]) => adj.avoid || adj.reduceVolume)
    .map(([s, adj]) => `${s}=${adj.avoid ? '금지' : adj.volumePct * 100 + '%'}`)
    .join(', ')}`;
  
  if (result.equipmentRestrictions.forbiddenEquipment.length > 0) {
    result.explanation += `, ${result.equipmentRestrictions.forbiddenEquipment.join('/')} 금지`;
  }
  
  if (result.zoneRestrictions.z4MaxMeters < Infinity) {
    result.explanation += `, Z4 ≤${result.zoneRestrictions.z4MaxMeters}m`;
  }
  
  result.evidenceKeys = ['CSS_VALIDITY_WAKAYOSHI_1992'];
  
  return result;
}

/**
 * 테니스 엘보 (Lateral Epicondylitis)
 */
export function applyTennisElbow(): ConditionRuleResult {
  return {
    cssPct: 0, // CSS 유지 ✅
    
    zoneRestrictions: {
      allowZ5: false,
      z4MaxMeters: 400,
      z3MaxMeters: Infinity
    },
    
    equipmentRestrictions: {
      forbiddenEquipment: ['패들', '핀'],
      recommendedEquipment: ['킥보드', '풀부이'] // 그립/손목 부하 최소화
    },
    
    restBonus: {
      Z1: 0,
      Z2: 5,
      Z3: 10,
      Z4: 15,
      Z5: 20
    },
    
    strokeAdjustments: {
      freestyle: { avoid: false, reduceVolume: true, volumePct: 0.7 }, // 풀링 축소
      backstroke: { avoid: false, reduceVolume: true, volumePct: 0.8 },
      breaststroke: { avoid: false, reduceVolume: false, volumePct: 1.0 },
      butterfly: { avoid: false, reduceVolume: true, volumePct: 0.6 }
    },
    
    drillRestrictions: ['강한 풀링', '패들 드릴'],
    
    explanation: '테니스 엘보: 패들/핀 금지, 풀링 세트 축소, 킥/기술 비중↑. 그립/손목 반복 스트레스 관리',
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
  };
}

/**
 * 염소 민감성 (Chlorine Sensitivity)
 * 
 * 중요: 중등도 이상 염소 민감성은 수영 부적합!
 * 경미한 경우만 관리하에 수영 가능
 */
export function applyChlorineSensitivity(severity: 'mild' | 'moderate' | 'severe' = 'mild'): ConditionRuleResult | null {
  // 중등도 이상: 수영 금지, 대체 운동 권장
  if (severity === 'moderate' || severity === 'severe') {
    return {
      cssPct: 0,
      zoneRestrictions: { allowZ5: false, z4MaxMeters: 0, z3MaxMeters: 0 },
      equipmentRestrictions: { forbiddenEquipment: [], recommendedEquipment: [] },
      restBonus: { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0 },
      strokeAdjustments: {},
      drillRestrictions: [],
      explanation: `⚠️ ${severity === 'severe' ? '심각한' : '중등도'} 염소 민감성: 실내 수영장 부적합! 대체 운동 권장 (러닝, 자전거, 야외 수영장, 오픈워터)`,
      evidenceKeys: ['CHLORAMINE_IRRITATION_CDC_2025', 'CHLORAMINE_INDOOR_JACOBS_2007']
    };
  }
  
  // 경미한 염소 민감: 관리하에 수영 가능
  return {
    cssPct: 0, // CSS 유지 ✅
    
    zoneRestrictions: {
      allowZ5: false, // Z5 금지 (고강도 호흡↑)
      z4MaxMeters: 300, // Z4 총량 cap ≤300m (고강도 노출↓)
      z3MaxMeters: Infinity
    },
    
    equipmentRestrictions: {
      forbiddenEquipment: [], // 패들은 어깨 문제이므로 염소 민감에서는 금지 안함
      recommendedEquipment: []
    },
    
    restBonus: {
      Z1: 10, // 모든 Zone +10초 (환기 시간 확보)
      Z2: 10,
      Z3: 10,
      Z4: 10,
      Z5: 10
    },
    
    strokeAdjustments: {
      backstroke: { avoid: false, reduceVolume: false, volumePct: 1.2 }, // 배영 비중 20% 증가 (얼굴 물 밖 노출↑)
      freestyle: { avoid: false, reduceVolume: false, volumePct: 1.0 },
      breaststroke: { avoid: false, reduceVolume: false, volumePct: 1.0 },
      butterfly: { avoid: false, reduceVolume: false, volumePct: 1.0 }
    },
    
    drillRestrictions: ['긴 잠영', '저산소', '하이폭식', '7-9번 호흡', '스컬링-잠영'],
    
    explanation: '💧 경미한 염소 민감 (관리 가능): Z5 금지, Z4 ≤300m, 휴식 +10″, 긴 잠영/저산소 제외, 배영 비중↑. 환기 시간 확보 및 고강도 노출 최소화',
    evidenceKeys: ['CHLORAMINE_IRRITATION_CDC_2025', 'CHLORAMINE_INDOOR_JACOBS_2007', 'POOL_AIR_TECHBRIEF_CTDPH']
  };
}

/**
 * 천식 (Asthma - Exercise Induced)
 */
export function applyAsthma(): ConditionRuleResult {
  return {
    cssPct: 0,
    
    zoneRestrictions: {
      allowZ5: false,
      z4MaxMeters: 400,
      z3MaxMeters: Infinity
    },
    
    equipmentRestrictions: {
      forbiddenEquipment: ['스노클'],
      recommendedEquipment: []
    },
    
    restBonus: {
      Z1: 5,
      Z2: 10,
      Z3: 15,
      Z4: 20,
      Z5: 30
    },
    
    strokeAdjustments: {},
    
    drillRestrictions: ['저산소', '하이폭식', '긴 잠영'],
    
    explanation: '천식: Z5 금지, Z4 ≤400m, 휴식 +10-20″, 호흡 패턴 주의, 저산소 훈련 제외',
    evidenceKeys: ['HYPOXIC_SAFETY_USASWIM', 'CHLORAMINE_IRRITATION_CDC_2025']
  };
}

/**
 * 무릎 통증 (Knee Pain / Patellofemoral Pain)
 */
export function applyKneePain(): ConditionRuleResult {
  return {
    cssPct: 0,
    
    zoneRestrictions: {
      allowZ5: true,
      z4MaxMeters: Infinity,
      z3MaxMeters: Infinity
    },
    
    equipmentRestrictions: {
      forbiddenEquipment: [],
      recommendedEquipment: ['풀부이'] // 킥 부담 최소화
    },
    
    restBonus: {
      Z1: 0,
      Z2: 0,
      Z3: 0,
      Z4: 5,
      Z5: 10
    },
    
    strokeAdjustments: {
      breaststroke: { avoid: true, reduceVolume: false, volumePct: 0 }, // 평영 금지 (무릎 부담↑)
      butterfly: { avoid: false, reduceVolume: true, volumePct: 0.7 },  // 접영 축소 (돌핀킥)
      freestyle: { avoid: false, reduceVolume: false, volumePct: 1.0 },
      backstroke: { avoid: false, reduceVolume: false, volumePct: 1.0 }
    },
    
    drillRestrictions: ['킥보드 과부하', '돌핀킥 과도'],
    
    explanation: '무릎 통증: 평영 금지, 접영 돌핀킥 축소, 킥보드 드릴 감소, 풀부이 권장',
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
  };
}

/**
 * 컨디션 기반 조정 (당일 컨디션)
 * 
 * 핵심: 당일 컨디션은 운동량(거리/세트)을 바꾸지 않음!
 * 단지 페이스와 휴식만 조정 (같은 거리를 더 느리게/더 쉬면서)
 * 
 * @param condition - 컨디션 상태 (또는 'health_adjusted'로 건강 상태 반영)
 * @param hasPain - 통증 여부
 * @param intensityPercent - 건강 상태 기반 강도 (70% = 0.7, 없으면 condition 기반 조정)
 */
export function applyDayCondition(
  condition: 'very_good' | 'good' | 'normal' | 'tired' | 'very_tired' | 'health_adjusted', 
  hasPain: boolean,
  intensityPercent?: number
): ConditionRuleResult {
  let cssPct = 0;
  let restAdd = { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0 };
  let explanation = '';
  
  // 🏥 건강 상태 기반 과학적 조정 (intensityPercent가 있을 때)
  if (intensityPercent !== undefined && intensityPercent < 1.0) {
    // 과학적 페이스 조정: 70% 강도 → 페이스를 1/0.7 = 1.43배로 (43% 느리게)
    // CSS 퍼센트로 변환: (1/intensityPercent - 1) * 100
    cssPct = (1 / intensityPercent - 1); // 0.7 → 0.43 (43% 느리게)
    
    // 휴식도 비례적으로 증가 (강도 낮을수록 더 많은 회복 필요)
    const restMultiplier = (1 / intensityPercent - 1); // 0.7 → 0.43
    restAdd = {
      Z1: Math.round(10 * restMultiplier), // 기본 10초 * 0.43 = 4초
      Z2: Math.round(15 * restMultiplier), // 기본 15초 * 0.43 = 6초
      Z3: Math.round(20 * restMultiplier), // 기본 20초 * 0.43 = 9초
      Z4: Math.round(30 * restMultiplier), // 기본 30초 * 0.43 = 13초
      Z5: Math.round(40 * restMultiplier)  // 기본 40초 * 0.43 = 17초
    };
    
    const intensityPctDisplay = Math.round(intensityPercent * 100);
    const paceIncreaseDisplay = Math.round(cssPct * 100);
    explanation = `🏥 건강 상태 조정: ${intensityPctDisplay}% 강도 → 페이스 +${paceIncreaseDisplay}%, 휴식 증가. 과학적 운동 처방 (ACSM/WHO 기준)`;
    
    console.log('🏥 건강 상태 기반 페이스 조절:', {
      intensityPercent,
      cssPct,
      paceMultiplier: (1 + cssPct).toFixed(2) + 'x',
      restAdd
    });
  }
  // 컨디션에 따른 페이스/휴식 조정 (거리는 그대로!)
  else if (condition === 'very_good') {
    // 매우 좋을 때: 조금 더 빠르게
    cssPct = -0.02; // CSS -2% (페이스 2% 빠르게)
    restAdd = { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0 };
    explanation = '💪 컨디션 매우 좋음: 페이스 -2% (같은 거리를 더 빠르게). 체력이 좋을 때 페이스 향상';
  } else if (condition === 'tired') {
    // 피곤할 때: 페이스 느리게, 휴식 길게
    cssPct = 0.05; // CSS +5% (페이스 5% 느리게)
    restAdd = { Z1: 0, Z2: 5, Z3: 5, Z4: 10, Z5: 15 };
    explanation = '😓 컨디션 피곤함: 페이스 +5%, 휴식 +5-15초 (같은 거리를 천천히). 무리하지 않고 완수';
  } else if (condition === 'very_tired') {
    // 매우 피곤할 때: 페이스 많이 느리게, 휴식 많이 길게
    cssPct = 0.10; // CSS +10% (페이스 10% 느리게)
    restAdd = { Z1: 5, Z2: 10, Z3: 10, Z4: 15, Z5: 20 };
    explanation = '😴 컨디션 매우 피곤함: 페이스 +10%, 휴식 +5-20초 (같은 거리를 매우 천천히). 회복 우선';
  } else {
    explanation = '😊 컨디션 보통/좋음: 표준 페이스 및 휴식';
  }
  
  if (hasPain) {
    restAdd.Z1 += 0;
    restAdd.Z2 += 5;
    restAdd.Z3 += 5;
    restAdd.Z4 += 10;
    restAdd.Z5 += 10;
    cssPct += 0.03; // 페이스 +3% 추가
    explanation += ' | 🤕 통증 있음: 페이스 +3%, 휴식 +5-10초 추가';
  }
  
  return {
    cssPct,
    zoneRestrictions: {
      allowZ5: true, // 당일 컨디션은 Zone 제한 안함 (거리 유지 위해)
      z4MaxMeters: Infinity,
      z3MaxMeters: Infinity
    },
    equipmentRestrictions: {
      forbiddenEquipment: [],
      recommendedEquipment: []
    },
    restBonus: restAdd,
    strokeAdjustments: {}, // 당일 컨디션은 영법 조정 안함
    drillRestrictions: [],
    explanation: explanation || '컨디션 보통/좋음: 표준 프로그램',
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CV_INTERVALS_TOUBEKIS_2011']
  };
}

/**
 * 빈 규칙 생성
 */
function createEmptyRule(): ConditionRuleResult {
  return {
    cssPct: 0,
    zoneRestrictions: { allowZ5: true, z4MaxMeters: Infinity, z3MaxMeters: Infinity },
    equipmentRestrictions: { forbiddenEquipment: [], recommendedEquipment: [] },
    restBonus: { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0 },
    strokeAdjustments: {},
    drillRestrictions: [],
    explanation: '',
    evidenceKeys: []
  };
}

/**
 * 여러 컨디션 병합 (28가지 관절질환 + 특수 컨디션)
 * @param intensityPercent - 건강 상태 기반 강도 (70% = 0.7)
 */
export function aggregateConditionRules(
  conditionIds: string[], 
  dayCondition: string, 
  hasPain: boolean,
  intensityPercent?: number
): ConditionRuleResult {
  const rules: ConditionRuleResult[] = [];
  
  // 🏥 28가지 관절질환 자동 적용
  conditionIds.forEach(conditionId => {
    const jointRule = applyJointCondition(conditionId);
    if (jointRule.explanation) {
      rules.push(jointRule);
    }
  });
  
  // 🫁 염소 민감성 (특수 처리)
  if (conditionIds.includes('chlorine_sensitivity')) {
    const chlorineRule = applyChlorineSensitivity();
    if (chlorineRule) {
      rules.push(chlorineRule);
    }
  }
  
  // 🫁 천식 (특수 처리)
  if (conditionIds.includes('asthma') || conditionIds.includes('asthma_exercise')) {
    rules.push(applyAsthma());
  }
  
  // 📅 당일 컨디션 규칙 (건강 상태 강도 반영)
  rules.push(applyDayCondition(dayCondition as any, hasPain, intensityPercent));
  
  // 병합 로직
  const aggregated: ConditionRuleResult = {
    cssPct: 0,
    zoneRestrictions: {
      allowZ5: true,
      z4MaxMeters: Infinity,
      z3MaxMeters: Infinity
    },
    equipmentRestrictions: {
      forbiddenEquipment: [],
      recommendedEquipment: []
    },
    restBonus: { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0 },
    strokeAdjustments: {},
    drillRestrictions: [],
    explanation: '',
    evidenceKeys: []
  };
  
  rules.forEach(rule => {
    // CSS는 가장 보수적 값 (최대 조정치)
    if (Math.abs(rule.cssPct) > Math.abs(aggregated.cssPct)) {
      aggregated.cssPct = rule.cssPct;
    }
    
    // Zone 제한은 가장 엄격한 것 적용
    if (!rule.zoneRestrictions.allowZ5) aggregated.zoneRestrictions.allowZ5 = false;
    if (rule.zoneRestrictions.z4MaxMeters < aggregated.zoneRestrictions.z4MaxMeters) {
      aggregated.zoneRestrictions.z4MaxMeters = rule.zoneRestrictions.z4MaxMeters;
    }
    if (rule.zoneRestrictions.z3MaxMeters < aggregated.zoneRestrictions.z3MaxMeters) {
      aggregated.zoneRestrictions.z3MaxMeters = rule.zoneRestrictions.z3MaxMeters;
    }
    
    // 장비 제한 병합
    aggregated.equipmentRestrictions.forbiddenEquipment.push(...rule.equipmentRestrictions.forbiddenEquipment);
    aggregated.equipmentRestrictions.recommendedEquipment.push(...rule.equipmentRestrictions.recommendedEquipment);
    
    // 휴식 시간은 합산
    (Object.keys(aggregated.restBonus) as Zone[]).forEach(zone => {
      aggregated.restBonus[zone] += rule.restBonus[zone];
    });
    
    // 영법 조정 병합
    Object.entries(rule.strokeAdjustments).forEach(([stroke, adj]) => {
      if (!aggregated.strokeAdjustments[stroke]) {
        aggregated.strokeAdjustments[stroke] = { ...adj };
      } else {
        // avoid가 하나라도 true면 true
        if (adj.avoid) aggregated.strokeAdjustments[stroke].avoid = true;
        // reduceVolume이 하나라도 true면 true
        if (adj.reduceVolume) aggregated.strokeAdjustments[stroke].reduceVolume = true;
        // volumePct는 가장 작은 값
        if (adj.volumePct < aggregated.strokeAdjustments[stroke].volumePct) {
          aggregated.strokeAdjustments[stroke].volumePct = adj.volumePct;
        }
      }
    });
    
    // 드릴 제한 병합
    aggregated.drillRestrictions.push(...rule.drillRestrictions);
    
    // 설명 병합
    if (rule.explanation) {
      if (aggregated.explanation) aggregated.explanation += ' | ';
      aggregated.explanation += rule.explanation;
    }
    
    // Evidence 키 병합
    aggregated.evidenceKeys.push(...rule.evidenceKeys);
  });
  
  // 중복 제거
  aggregated.equipmentRestrictions.forbiddenEquipment = Array.from(new Set(aggregated.equipmentRestrictions.forbiddenEquipment));
  aggregated.equipmentRestrictions.recommendedEquipment = Array.from(new Set(aggregated.equipmentRestrictions.recommendedEquipment));
  aggregated.drillRestrictions = Array.from(new Set(aggregated.drillRestrictions));
  aggregated.evidenceKeys = Array.from(new Set(aggregated.evidenceKeys)) as EvidenceKey[];
  
  return aggregated;
}

