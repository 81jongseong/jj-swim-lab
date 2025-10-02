/**
 * SwimLab Data Pack v4 - Q1: CONDITION id 정규화 + 동의어/오탈자 매핑 + 자동 시드
 * 
 * 동의어/오탈자 → 공식 id 매핑 + 런타임 확장
 * 
 * 관련 파일:
 * - client/src/swimlab/utils/rules.ts
 * - client/src/swimlab/utils/rules_multi.ts
 * - client/src/swimlab/data/conditions_msk28_index.ts
 */

// CONDITION id 정규화 + 동의어/오탈자 매핑 + 실제 id 자동 시드

// 내부 동적 별칭 저장소
const RUNTIME_ALIASES: Record<string, string> = Object.create(null);

// 기본 동의어(핵심 약어/오탈자/하이픈/스페이스 변형)
const BASE_ALIASES: Record<string, string> = {
  // Shoulder & Thorax
  'impingement': 'shoulder_impingement',
  'rc_irritation': 'rotator_cuff_irritation',
  'rotator-cuff': 'rotator_cuff_irritation',
  'labrum': 'labral_irritation',
  'ac-joint': 'ac_joint_pain',
  'scap-dyskinesis': 'scapular_dyskinesis',
  'tos': 'thoracic_outlet_syndrome',
  'rib-stress': 'rib_stress_irritation',
  // Spine
  'cervical': 'cervical_strain',
  'lumbar-ext': 'lumbar_extension_intolerance',
  'lumbar-flex': 'lumbar_flexion_intolerance',
  'costo': 'costochondritis',
  // Elbow/Wrist/Hand
  'golfers-elbow': 'medial_epicondylitis',
  'tennis-elbow': 'lateral_epicondylitis',
  'wrist': 'wrist_tendinopathy',
  'hand-tenosynovitis': 'tenosynovitis_hand',
  'tmj': 'tmj_irritation',
  // Hip/Groin/Knee
  'hip-flexor': 'hip_flexor_strain',
  'fai': 'hip_fai_irritation',
  'adductor': 'groin_adductor_strain',
  'pfps': 'patellofemoral_pain',
  'patellar-tendon': 'patellar_tendinopathy',
  'itb': 'it_band_syndrome',
  // Ankle/Foot
  'ankle-sprain': 'ankle_sprain_history',
  'achilles': 'achilles_tendinopathy',
  'pf': 'plantar_fasciitis',
  // Systemic
  'deconditioning': 'general_deconditioning',
  'long-covid': 'long_covid_fatigue',
};

function norm(s: string) {
  return s.trim().toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[\s\-]+/g, '_')
    .replace(/__+/g, '_');
}

// 공개: id 정규화
export function normalizeConditionId(input: string) {
  if (!input) return '';
  const k = norm(input);
  return RUNTIME_ALIASES[k] || BASE_ALIASES[k] || k;
}

// 공개: 실제 보유 id로 별칭 자동 시드
export function seedConditionIds(ids: string[], customAliases?: Record<string, string[]>) {
  const setAlias = (alias: string, canonical: string) => {
    const a = norm(alias);
    const c = norm(canonical);
    if (!RUNTIME_ALIASES[a]) RUNTIME_ALIASES[a] = c;
  };

  ids.forEach(id => {
    const c = norm(id);
    // 흔한 변형 시드
    [c, c.replace(/_/g,'-'), c.replace(/_/g,' '), c.replace(/_/g,'')].forEach(v => setAlias(v, c));
    // 머리글자 약어(예: patellofemoral_pain → pp)
    const parts = c.split('_');
    if (parts.length > 1) setAlias(parts.map(p=>p[0]).join(''), c);
  });

  if (customAliases) {
    Object.entries(customAliases).forEach(([canonical, arr]) => arr.forEach(a => setAlias(a, canonical)));
  }
}

// 디버그용
export function dumpAliases() { return { ...BASE_ALIASES, ...RUNTIME_ALIASES }; }
