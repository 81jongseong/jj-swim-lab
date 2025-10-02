/**
 * SwimLab Data Pack v4 - 유틸리티 함수들
 * 
 * 페이지네이션, 필터링, 증거 집계 등의 유틸리티 함수 제공
 * 
 * 관련 파일:
 * - client/src/swimlab/data/trainingMethods.ts
 * - client/src/swimlab/data/drills.ts
 * - client/src/swimlab/components/SwimProgramGenerator.tsx
 */

export type Category = 'Endurance'|'Speed'|'Technique'|'RaceStrategy'|'OpenWater';

export type Evidence = { label: string; url: string };

export type TrainingMethod = {
  id: string;
  title: string;
  whenToUse: string;
  whoShouldUse: string;
  howToDo: string;
  intensityAndVolume: string;
  pros: string;
  cons: string;
  cautions: string;
  category: Category;
  recommendedDrills: string[];
  evidence: Evidence[];
};

export type Drill = {
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
  evidence: Evidence[];
};

// 페이지네이션
export function paginate<T>(items: readonly T[], page = 1, pageSize = 24) {
  const p = Math.max(1, page);
  const start = (p - 1) * pageSize;
  const end = start + pageSize;
  return {
    page: p,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    data: items.slice(start, end),
  };
}

// 문자열 포함 체크
function haystack(obj: Record<string, any>) {
  return Object.values(obj)
    .map(v => (Array.isArray(v) ? v.join(' ') : (typeof v === 'string' ? v : '')))
    .join(' ')
    .toLowerCase();
}

// 메서드 필터
export function filterMethods(methods: readonly TrainingMethod[], opts?: {
  category?: Category;
  text?: string;
  drillId?: string;    // 추천 드릴 역검색
}) {
  const { category, text, drillId } = opts || {};
  const t = text?.toLowerCase() || '';
  return methods.filter(m => {
    const byCat = category ? m.category === category : true;
    const byText = t ? haystack(m).includes(t) : true;
    const byDrill = drillId ? (m.recommendedDrills || []).includes(drillId) : true;
    return byCat && byText && byDrill;
  });
}

// 드릴 필터
export function filterDrills(drills: readonly Drill[], opts?: {
  text?: string;
  tag?: string;
}) {
  const { text, tag } = opts || {};
  const t = text?.toLowerCase() || '';
  return drills.filter(d => {
    const byText = t ? haystack(d).includes(t) : true;
    const byTag = tag ? d.tags?.includes(tag) : true;
    return byText && byTag;
  });
}

// 증거(근거) 집계: 중복 URL 제거 + 출현 빈도
export function collectEvidence(methods: readonly TrainingMethod[], drills: readonly Drill[]) {
  const all: Evidence[] = [
    ...methods.flatMap(m => m.evidence || []),
    ...drills.flatMap(d => d.evidence || []),
  ];
  const map = new Map<string, { label: string; url: string; count: number }>();
  for (const e of all) {
    const key = e.url.trim();
    const prev = map.get(key);
    if (prev) prev.count += 1;
    else map.set(key, { ...e, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

// 카운트 요약(간단 점검)
export function countAll(opts: {
  methods?: readonly TrainingMethod[];
  drills?: readonly Drill[];
  conditionsCount?: number; // 외부에서 CONDITIONS.length 넘기기
}) {
  const { methods = [], drills = [], conditionsCount = 0 } = opts || {};
  return {
    methods: methods.length,
    drills: drills.length,
    conditions: conditionsCount,
  };
}
