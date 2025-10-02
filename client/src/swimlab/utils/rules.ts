/**
 * SwimLab Data Pack v4 - 조건별 추천/회피 규칙 (MSK 28개 + 근거) + Q1: id 정규화 + 자동 시드
 * 
 * CONDITIONS와 연결하는 추천/금지 룰
 * 
 * 관련 파일:
 * - client/src/swimlab/data/conditions_full.ts
 * - client/src/swimlab/data/conditions_msk28_index.ts
 * - client/src/swimlab/data/trainingMethods.ts
 * - client/src/swimlab/data/drills.ts
 * - client/src/swimlab/utils/idmap.ts
 */

import { normalizeConditionId, seedConditionIds } from './idmap';
import { MSK_28_IDS } from '../data/conditions_msk28_index';

export type Evidence = { label: string; url: string };
export type Rule = {
  id: string;
  recommend: { methods?: string[]; drills?: string[] };
  avoid: { methods?: string[]; drills?: string[] };
  rationale: string;
  evidence?: Evidence[];
};

// 공통 근거(재사용)
const E = {
  shoulderLoad: { label: '상지 스트로크 효율/부하', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6926714/' },
  cssMlss:     { label: 'CSS/MLSS 개요',           url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8107465/' },
  sprintRest:  { label: '반복 스프린트 휴식 비율', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10356687/' },
  hypoxic:     { label: '저호흡/블랙아웃 공동 성명', url: 'https://www.redcross.org/content/dam/redcross/training-services/scientific-advisory-council/2022%20Hypoxic%20Blackout%20-%20Joint%20Statement%20-%20Red%20Cross%20Y%20USA%20Swimming%2010-31-2022.pdf' },
  stream:      { label: '정렬/스트림라인 팁',      url: 'https://www.usaswimming.org/news/2021/10/05/five-freestyle-tips-to-start-your-season' },
  uwKick:      { label: '언더워터 돌핀 킥(테크/부하)', url: 'https://swimswam.com/underwater-dolphin-kick-book/' },
  owDraft:     { label: '오픈워터 드래프팅 연구', url: 'https://www.jssm.org/jssm-07-60.xml-Fulltext' }
};

// 헬퍼: 고강도/저항/패들/언더워터/저호흡 회피 프리셋
const A = {
  highPower: { methods: ['08','11'], drills: ['D36','D38','D39'] },          // 스프린트·패들·저항
  hypoxic:   { methods: ['19','08'], drills: ['D19','D16','D27'] },          // 저호흡·과잠영
  lumbar:    { methods: ['20','08'], drills: ['D16','D27'] },                // 언더워터·돌핀
};

// 28개 룰. 추천·회피 id는 TRAINING_METHODS_PLUS / DRILLS_PLUS의 id 기준임.
export const RULES: Rule[] = [
  // Shoulder & Upper Thorax
  { id: 'shoulder_impingement',
    recommend: { methods: ['25','05','13','10'], drills: ['D05','D06','D07','D12','D35'] },
    avoid: A.highPower,
    rationale: '견봉하 공간 보호: 감각·정렬·저강도 위주, 패들/고저항 축소.',
    evidence: [E.shoulderLoad] },
  { id: 'rotator_cuff_irritation',
    recommend: { methods: ['13','05','10'], drills: ['D05','D06','D07','D18'] },
    avoid: A.highPower,
    rationale: '회전근개 과부하 감축: 스컬링·풀 중심, 패들 최소화.',
    evidence: [E.shoulderLoad] },
  { id: 'labral_irritation',
    recommend: { methods: ['10','05','13'], drills: ['D12','D05','D06'] },
    avoid: A.highPower,
    rationale: '전방 캡슐/와순 스트레스 감소: 긴 글라이드·과진입 금지.',
    evidence: [E.shoulderLoad] },
  { id: 'biceps_tendinopathy',
    recommend: { methods: ['05','10','13'], drills: ['D05','D06'] },
    avoid: { methods: ['11'], drills: ['D36'] },
    rationale: '장두건 부하 감축: 패들/깊은 캐치 과부하 피함.',
    evidence: [E.shoulderLoad] },
  { id: 'ac_joint_pain',
    recommend: { methods: ['25','05','10'], drills: ['D12','D18'] },
    avoid: { methods: ['11','08'], drills: ['D36','D38'] },
    rationale: '견봉쇄골 관절 압박 감소: 장비 파워 제한.',
    evidence: [E.shoulderLoad] },
  { id: 'scapular_dyskinesis',
    recommend: { methods: ['13','05'], drills: ['D12','D05','D06','D07'] },
    avoid: { methods: ['11'], drills: ['D36'] },
    rationale: '견갑 리듬 회복 우선: 감각·정렬 드릴.',
    evidence: [E.shoulderLoad] },
  { id: 'thoracic_outlet_syndrome',
    recommend: { methods: ['25','05'], drills: ['D12','D18'] },
    avoid: { methods: ['08','11'], drills: ['D36','D38'] },
    rationale: '상완신경총/혈관 압박 감소: 과고속/과가동 범위 회피.',
    evidence: [E.shoulderLoad] },
  { id: 'rib_stress_irritation',
    recommend: { methods: ['25','05'], drills: ['D12'] },
    avoid: { methods: ['08','20'], drills: ['D16','D27'] },
    rationale: '늑골 스트레스 감축: 언더워터/폭발적 스타트 축소.',
    evidence: [E.stream, E.uwKick] },

  // Spine
  { id: 'cervical_strain',
    recommend: { methods: ['25','05'], drills: ['D12','D18'] },
    avoid: { methods: ['21'], drills: ['D17'] },
    rationale: '경추 과신전 회피: 헤드업/다이브 빈도 축소.',
    evidence: [E.stream] },
  { id: 'lumbar_extension_intolerance',
    recommend: { methods: ['10','05','25'], drills: ['D12','D14','D35'] },
    avoid: A.lumbar,
    rationale: '요추 과신전 유발 요소 축소(언더워터/돌핀).',
    evidence: [E.uwKick, E.stream] },
  { id: 'lumbar_flexion_intolerance',
    recommend: { methods: ['10','05','25'], drills: ['D35'] },
    avoid: { methods: ['08'], drills: [] },
    rationale: '요추 굴곡 반복 자극 제한, 안정적 풀 기반.',
    evidence: [E.stream] },
  { id: 'costochondritis',
    recommend: { methods: ['25','05'], drills: ['D12'] },
    avoid: { methods: ['08','21'], drills: [] },
    rationale: '흉곽 전벽 압통 시 폭발/충격성 동작 줄이기.',
    evidence: [E.stream] },

  // Elbow/Wrist/Hand
  { id: 'medial_epicondylitis',
    recommend: { methods: ['25','05','13'], drills: ['D05','D06'] },
    avoid: { methods: ['11'], drills: ['D36'] },
    rationale: '내측상과 부하 감소: 패들 파워 축소.',
    evidence: [E.shoulderLoad] },
  { id: 'lateral_epicondylitis',
    recommend: { methods: ['25','05'], drills: ['D05','D06'] },
    avoid: { methods: ['11'], drills: ['D36'] },
    rationale: '외측상과 스트레스 감소: 캐치 각도 보수.',
    evidence: [E.shoulderLoad] },
  { id: 'wrist_tendinopathy',
    recommend: { methods: ['25','05'], drills: ['D05','D06'] },
    avoid: { methods: ['11'], drills: ['D36'] },
    rationale: '수근부 통증 시 패들/저항 감축.',
    evidence: [E.shoulderLoad] },
  { id: 'tenosynovitis_hand',
    recommend: { methods: ['25','05'], drills: ['D05'] },
    avoid: { methods: ['11'], drills: ['D36'] },
    rationale: '힘 과부하 줄이고 감각 기반.',
    evidence: [E.shoulderLoad] },
  { id: 'tmj_irritation',
    recommend: { methods: ['25','05'], drills: ['D12'] },
    avoid: { methods: [], drills: ['D17'] },
    rationale: '과도한 헤드업·충격 회피.',
    evidence: [E.stream] },

  // Hip/Groin/Knee
  { id: 'hip_flexor_strain',
    recommend: { methods: ['05','25'], drills: ['D12','D14'] },
    avoid: { methods: ['08','20'], drills: ['D16'] },
    rationale: '힙 굴곡 파워/돌핀 과부하 축소.',
    evidence: [E.uwKick] },
  { id: 'hip_fai_irritation',
    recommend: { methods: ['05','25'], drills: ['D12'] },
    avoid: { methods: ['08'], drills: [] },
    rationale: '엉덩관절 충돌 회피: 큰 ROM 고강도 제한.',
    evidence: [E.stream] },
  { id: 'groin_adductor_strain',
    recommend: { methods: ['05','25'], drills: ['D12'] },
    avoid: { methods: [], drills: [] },
    rationale: '평영킥 과가동/외회전 줄이기.',
    evidence: [E.stream] },
  { id: 'patellofemoral_pain',
    recommend: { methods: ['05','25','06'], drills: ['D11','D12','D13','D14'] },
    avoid: { methods: [], drills: [] },
    rationale: '무릎 통증 시 브레스트킥 대체, 정렬·사이드 킥.',
    evidence: [E.stream] },
  { id: 'patellar_tendinopathy',
    recommend: { methods: ['05','25'], drills: ['D12','D14'] },
    avoid: { methods: ['08'], drills: [] },
    rationale: '폭발적 킥/점프 성격 회피.',
    evidence: [E.stream] },
  { id: 'it_band_syndrome',
    recommend: { methods: ['25','05'], drills: ['D12','D14'] },
    avoid: { methods: [], drills: [] },
    rationale: '라인 유지·사이드 킥으로 ITB 마찰 자극 완화.',
    evidence: [E.stream] },

  // Ankle/Foot
  { id: 'ankle_sprain_history',
    recommend: { methods: ['25','05'], drills: ['D14','D13'] },
    avoid: { methods: ['08'], drills: [] },
    rationale: '급가속/폭발성 킥 회피, 라인 유지.',
    evidence: [E.stream] },
  { id: 'achilles_tendinopathy',
    recommend: { methods: ['25','05'], drills: ['D14'] },
    avoid: { methods: ['08'], drills: ['D15'] },
    rationale: '버티컬 킥/폭발 킥 축소.',
    evidence: [E.stream] },
  { id: 'plantar_fasciitis',
    recommend: { methods: ['25','05'], drills: ['D14'] },
    avoid: { methods: ['08'], drills: ['D15'] },
    rationale: '족저부 통증 자극 줄이기.',
    evidence: [E.stream] },

  // Systemic/General
  { id: 'general_deconditioning',
    recommend: { methods: ['25','05','23'], drills: ['D12','D29'] },
    avoid: { methods: ['08','11','19'], drills: ['D36','D38'] },
    rationale: '점진·저강도·템포 유지 기반 재조건.',
    evidence: [E.cssMlss] },
  { id: 'long_covid_fatigue',
    recommend: { methods: ['25','05'], drills: ['D12','D29'] },
    avoid: { methods: ['08','06','19'], drills: [] },
    rationale: '지각된 노력 기반 저강도·짧은 세션, 고강도/저호흡 회피.',
    evidence: [E.cssMlss, E.hypoxic] },
];

// Q1: MSK28이 있으면 자동으로 별칭 시드(스페이스/하이픈 등 변형 인식)
try { seedConditionIds(MSK_28_IDS as unknown as string[]); } catch { /* noop */ }

// 룰 조회(정규화 id)
export function applyRules(conditionId: string) {
  const norm = normalizeConditionId(conditionId);
  const r = RULES.find(x => x.id === norm);
  if (!r) return null;
  const uniq = (arr?: string[]) => Array.from(new Set(arr || []));
  return {
    recommendMethods: uniq(r.recommend.methods),
    avoidMethods: uniq(r.avoid.methods),
    recommendDrills: uniq(r.recommend.drills),
    avoidDrills: uniq(r.avoid.drills),
    rationale: r.rationale,
    evidence: r.evidence || [],
  };
}

