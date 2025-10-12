/**
 * 🎯 SwimLab - 개인별 조정사항 실시간 계산 유틸
 * 
 * 📋 **목적**
 * - 단체반 공통 프로그램에 대한 개인별 맞춤 조정사항 계산
 * - 질환/컨디션 기반 페이스 조정 및 주의사항 생성
 * - 실시간 계산으로 DB 부하 감소
 */

export interface PersonalAdjustment {
  paceAdjustment: number; // 페이스 조정 (%)
  paceReason: string;
  restAdjustment: number; // 휴식 시간 조정 (초)
  avoidStrokes: string[];
  avoidDrills: string[];
  avoidEquipment: string[];
  warnings: Array<{
    type: 'health' | 'condition' | 'technique';
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }>;
}

/**
 * 개인별 조정사항 계산
 */
export function calculatePersonalAdjustment(
  healthProfile: any,
  swimmingProfile: any
): PersonalAdjustment {
  const healthConditions = [
    ...(healthProfile?.chronicConditions || []),
    ...(healthProfile?.allergies || [])
  ];
  const conditionIds = swimmingProfile?.conditionIds || [];
  
  let paceAdjustment = 0;
  let paceReason = '';
  let restAdjustment = 0;
  const warnings: any[] = [];
  const avoidStrokes: string[] = [];
  const avoidDrills: string[] = [];
  const avoidEquipment: string[] = [];
  
  // === 질환별 조정 ===
  
  // 어깨 질환
  if (healthConditions.includes('shoulder_impingement') || 
      healthConditions.includes('rotator_cuff') ||
      healthConditions.includes('shoulder_pain')) {
    paceAdjustment += 3;
    paceReason = '어깨 질환';
    restAdjustment += 10;
    avoidStrokes.push('butterfly');
    avoidEquipment.push('paddles', 'large_paddles');
    warnings.push({
      type: 'health',
      severity: 'warning',
      message: '⚠️ 어깨 질환: 팔 동작 범위를 축소하고, 통증 시 즉시 중단하세요. 패들 사용을 피하세요.'
    });
  }
  
  // 무릎 질환
  if (healthConditions.includes('knee_pain') || 
      healthConditions.includes('patellofemoral_pain')) {
    avoidStrokes.push('breaststroke');
    warnings.push({
      type: 'health',
      severity: 'warning',
      message: '⚠️ 무릎 통증: 평영을 피하고, 킥보드 대신 풀부이를 사용하세요.'
    });
  }
  
  // 호흡기 질환
  if (healthConditions.includes('asthma') || 
      healthConditions.includes('chlorine_sensitivity')) {
    paceAdjustment += 5;
    paceReason = paceReason ? `${paceReason}, 호흡기 질환` : '호흡기 질환';
    restAdjustment += 15;
    avoidDrills.push('hypoxic', 'underwater', 'breath_control');
    warnings.push({
      type: 'health',
      severity: 'critical',
      message: '🚨 호흡기 주의: 고강도 세트는 건너뛰고, 호흡 곤란 시 즉시 중단하세요. 충분한 휴식을 취하세요.'
    });
  }
  
  // 척추 질환
  if (healthConditions.includes('back_pain') || 
      healthConditions.includes('spine_issue')) {
    paceAdjustment += 3;
    paceReason = paceReason ? `${paceReason}, 척추 질환` : '척추 질환';
    avoidStrokes.push('butterfly');
    warnings.push({
      type: 'health',
      severity: 'warning',
      message: '⚠️ 척추 주의: 과신전 동작을 피하고, 코어를 안정적으로 유지하세요.'
    });
  }
  
  // === 컨디션별 조정 ===
  
  if (conditionIds.includes('매우 피곤함') || conditionIds.includes('피곤함')) {
    paceAdjustment += 5;
    paceReason = paceReason ? `${paceReason}, 피로` : '피로 상태';
    restAdjustment += 10;
    warnings.push({
      type: 'condition',
      severity: 'info',
      message: '💡 피로 상태: 오늘은 무리하지 말고 여유있게 진행하세요. 페이스를 낮추고 휴식을 늘리세요.'
    });
  }
  
  if (conditionIds.includes('통증 있음')) {
    paceAdjustment += 5;
    paceReason = paceReason ? `${paceReason}, 통증` : '통증';
    restAdjustment += 10;
    warnings.push({
      type: 'condition',
      severity: 'critical',
      message: '🚨 통증 주의: 통증 부위에 무리가 가지 않도록 주의하고, 악화 시 즉시 중단하세요.'
    });
  }
  
  // 조정사항이 없으면 기본 안내
  if (warnings.length === 0) {
    warnings.push({
      type: 'info',
      severity: 'info',
      message: '✅ 특별한 조정사항이 없습니다. 단체반 프로그램을 그대로 진행하세요.'
    });
  }
  
  return {
    paceAdjustment,
    paceReason: paceReason || '기본 페이스',
    restAdjustment,
    avoidStrokes: [...new Set(avoidStrokes)],
    avoidDrills: [...new Set(avoidDrills)],
    avoidEquipment: [...new Set(avoidEquipment)],
    warnings
  };
}

/**
 * 조정된 페이스 계산
 */
export function calculateAdjustedPace(
  basePace: number, // 기본 페이스 (초/100m)
  adjustment: number // 조정 비율 (%)
): number {
  return Math.round(basePace * (1 + adjustment / 100));
}

/**
 * 영법 이름 변환
 */
export function getStrokeName(strokeId: string): string {
  const names: Record<string, string> = {
    'freestyle': '자유형',
    'backstroke': '배영',
    'breaststroke': '평영',
    'butterfly': '접영',
    'IM': '개인혼영'
  };
  return names[strokeId] || strokeId;
}








