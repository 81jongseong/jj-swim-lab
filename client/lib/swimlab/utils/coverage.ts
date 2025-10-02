/**
 * 🏊 SwimLab - 컨디션 규칙 커버리지 측정 + 템플릿 생성
 * 
 * 📋 **파일 목적**
 * - 전체 컨디션 중 규칙 매핑이 있는 비율 측정
 * - 미매핑 컨디션의 룰 템플릿 자동 생성
 * - 규칙 보강 우선순위 파악
 * 
 * 🔄 **주요 기능**
 * - measureCoverage: 전체 컨디션의 규칙 매핑률 계산
 * - generateRuleTemplates: 미매핑 컨디션의 룰 템플릿 생성
 * - applyRules: 단일 조건 룰 적용 (모의 구현)
 */

import { CONDITIONS } from '@/lib/swimlab/data/conditions_full';

// rules.ts의 applyRules를 모의 구현
// 실제 프로젝트에서는 실제 rules.ts를 import
function applyRules(id: string) {
  // 현재 매핑된 조건들
  const WITH_RULES = [
    'shoulder_impingement',
    'rotator_cuff_irritation',
    'scapular_dyskinesis',
    'patellofemoral_pain',
    'patellar_tendinopathy',
    'it_band_syndrome',
    'lumbar_extension_intolerance',
    'lumbar_flexion_intolerance',
    'achilles_tendinopathy',
    'plantar_fasciitis',
    'long_covid_fatigue',
    'general_deconditioning',
    'sleep_deprived',
    'upper_respiratory',
    'fatigue_high',
  ];
  
  const hasRule = WITH_RULES.includes(id);
  
  if (hasRule) {
    return {
      recommendMethods: ['method1'],
      avoidMethods: [],
      recommendDrills: [],
      avoidDrills: [],
    };
  }
  
  return null;
}

/**
 * 룰 매핑 커버리지 측정
 */
export function measureCoverage(){
  const ids = (CONDITIONS as any[]).map(c=>c.id||c.name||c.label).filter(Boolean);
  let hits = 0;
  
  for (const id of ids){
    const r = applyRules(id);
    if (r && (
      r.recommendMethods?.length || 
      r.avoidMethods?.length || 
      r.recommendDrills?.length || 
      r.avoidDrills?.length
    )) {
      hits++;
    }
  }
  
  return { 
    total: ids.length, 
    withRules: hits, 
    ratio: +(hits/Math.max(1, ids.length)*100).toFixed(1) 
  };
}

/**
 * 룰 미매핑 템플릿 자동 생성 (바로 붙여넣기용)
 */
export function generateRuleTemplates(): string {
  const ids = (CONDITIONS as any[]).map(c=>c.id||c.name||c.label).filter(Boolean);
  
  const missing = ids.filter(id=>{
    const r = applyRules(id);
    return !(r && (
      r.recommendMethods?.length || 
      r.avoidMethods?.length || 
      r.recommendDrills?.length || 
      r.avoidDrills?.length
    ));
  });
  
  const head = `// Auto-generated rule stubs for unmapped conditions
// 붙여넣기 위치: src/swimlab/utils/rules.ts
// 생성 일시: ${new Date().toISOString()}
// 미매핑 컨디션: ${missing.length}개

`;
  
  const body = missing.map(id => `export const RULE_${id} = {
  id: '${id}',
  recommendMethods: [],       // 예: ['technique_focus','tempo_descending']
  avoidMethods: [],            // 예: ['sprint_intervals']
  recommendDrills: [],         // 예: ['single_arm_free','scull_front']
  avoidDrills: [],             // 예: ['dolphin_underwater']
  rationale: '추가 설명(동작/볼륨/강도/휴식/장비 영향)',
  evidence: []                 // 예: [{key:'shoulder_load_2020', url:'https://...'}]
};`).join('\n\n');
  
  const footer = `\n\n// ✅ export 에 RULE_* 병합 로직 추가 필요
// 예시:
// export function applyRules(conditionId: string) {
//   switch(conditionId) {
${missing.slice(0, 3).map(id => `//     case '${id}': return RULE_${id};`).join('\n')}
//     ...
//   }
// }
`;
  
  return head + body + footer;
}

export function getCoverageReport() {
  const cov = measureCoverage();
  
  return {
    summary: `${cov.withRules}/${cov.total} (${cov.ratio}%)`,
    needsWork: cov.ratio < 50,
    message: cov.ratio < 50 
      ? `규칙 매핑률이 ${cov.ratio}%로 낮습니다. rules.ts에 매핑을 추가하면 더 많은 컨디션에서 ✓/⚠ 주석이 표시됩니다.`
      : `규칙 매핑률 ${cov.ratio}% - 양호합니다!`
  };
}

