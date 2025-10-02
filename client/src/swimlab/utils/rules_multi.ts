/**
 * SwimLab Data Pack v4 - Q3: 다중 조건 병합/중재 로직
 * 
 * 여러 조건을 동시에 적용할 때 충돌 해결 (회피 > 추천 우선)
 * 
 * 관련 파일:
 * - client/src/swimlab/utils/rules.ts
 * - client/src/swimlab/utils/idmap.ts
 * - client/src/swimlab/utils/engine.ts
 */

// 다중 조건 병합/중재 로직(Q3)

import { normalizeConditionId } from './idmap';
import type { Evidence } from './rules';
import { applyRules as applySingleRule } from './rules';

export type CombinedRules = {
  input: string[];
  normalized: string[];
  recommendMethods: string[];
  avoidMethods: string[];
  recommendDrills: string[];
  avoidDrills: string[];
  cautions: string[];  // 충돌로 제외된 항목 id
  rationale: string[]; // 각 조건 설명 모음
  evidence: Evidence[]; // 조건 근거 합본(중복 제거)
};

// 우선순위: 안전상 회피(avoid) > 권장(recommend)
// 충돌 시: 해당 항목은 제외하고 "cautions"에 기록
export function applyRulesMulti(conditionIds: string | string[]): CombinedRules | null {
  const rawList = Array.isArray(conditionIds) ? conditionIds : `${conditionIds}`.split(/[,\s]+/);
  const list = rawList.map(s=>s.trim()).filter(Boolean);
  if (!list.length) return null;

  const normalized = list.map(normalizeConditionId);

  // 초기 컨테이너
  const recM = new Set<string>(), recD = new Set<string>();
  const avM = new Set<string>(), avD = new Set<string>();
  const rationale: string[] = [];
  const evMap = new Map<string, Evidence>();

  for (const raw of normalized) {
    const r = applySingleRule(raw);
    if (!r) continue;
    r.recommendMethods?.forEach(x => recM.add(x));
    r.recommendDrills?.forEach(x => recD.add(x));
    r.avoidMethods?.forEach(x => avM.add(x));
    r.avoidDrills?.forEach(x => avD.add(x));
    if (r.rationale) rationale.push(`[${raw}] ${r.rationale}`);
    (r.evidence || []).forEach(e => evMap.set(e.url, e));
  }

  // 충돌 정리: avoid가 우선 → 충돌 항목은 caution으로 이동(추천에서 제거)
  const cautions: string[] = [];
  for (const x of Array.from(recM)) if (avM.has(x)) { recM.delete(x); cautions.push(x); }
  for (const x of Array.from(recD)) if (avD.has(x)) { recD.delete(x); cautions.push(x); }

  return {
    input: list,
    normalized,
    recommendMethods: Array.from(recM),
    avoidMethods: Array.from(avM),
    recommendDrills: Array.from(recD),
    avoidDrills: Array.from(avD),
    cautions: Array.from(new Set(cautions)),
    rationale,
    evidence: Array.from(evMap.values()),
  };
}

