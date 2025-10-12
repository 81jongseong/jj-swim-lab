/**
 * 🔬 설명가능(Explainable) 수영 엔진 - Evidence 타입
 * 
 * 모든 페이스/휴식/세트 구성의 과학적 근거를 추적
 */

export type EvidenceKey =
  // CSS/CV 타당성
  | 'CSS_VALIDITY_WAKAYOSHI_1992'
  | 'CSS_MLSS_WAKAYOSHI_1993'
  | 'CV_INTERVALS_TOUBEKIS_2011'
  // 휴식 시간 & 회복
  | 'SPRINT_REST_TOUBEKIS_2005'
  | 'PCR_RECOVERY_BAKER_2010'
  | 'PCR_RECOVERY_31PMRS_2025'
  // 염소/클로라민 자극
  | 'CHLORAMINE_IRRITATION_CDC_2025'
  | 'CHLORAMINE_INDOOR_JACOBS_2007'
  | 'POOL_AIR_TECHBRIEF_CTDPH'
  // 안전
  | 'HYPOXIC_SAFETY_USASWIM';

export interface EvidenceItem {
  title: string;
  url: string;
  note?: string;
  year?: number;
  authors?: string;
}

/**
 * Evidence 레지스트리 - 모든 과학적 근거의 출처
 */
export const EVIDENCE: Record<EvidenceKey, EvidenceItem> = {
  CSS_VALIDITY_WAKAYOSHI_1992: {
    title: 'Critical velocity as an index for competitive swimming',
    url: 'https://pubmed.ncbi.nlm.nih.gov/1555562/',
    year: 1992,
    authors: 'Wakayoshi K, et al.',
    note: 'CSS=CV의 타당성을 수영 피험자로 검증'
  },
  CSS_MLSS_WAKAYOSHI_1993: {
    title: 'Does critical swimming velocity represent MLSS?',
    url: 'https://link.springer.com/article/10.1007/BF00863406',
    year: 1993,
    authors: 'Wakayoshi K, et al.',
    note: 'CSS가 MLSS(최대 젖산 안정 상태)를 근사함을 입증'
  },
  CV_INTERVALS_TOUBEKIS_2011: {
    title: 'Interval training responses at intensities relative to CV',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21459668/',
    year: 2011,
    authors: 'Toubekis AG, et al.',
    note: 'CV 상대 강도에서의 생리반응 및 인터벌 효과'
  },
  SPRINT_REST_TOUBEKIS_2005: {
    title: 'Different rest intervals & active/passive recovery in repeated sprint swimming',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15778899/',
    year: 2005,
    authors: 'Toubekis AG, et al.',
    note: '25m 스프린트 반복에서 긴 휴식(45–120s)이 퍼포먼스 유지에 유리'
  },
  PCR_RECOVERY_BAKER_2010: {
    title: 'Metabolic energy systems & PCr biphasic recovery review',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3005844/',
    year: 2010,
    authors: 'Baker JS, et al.',
    note: 'PCr 회복 동역학 리뷰: 반감기 ~30초, 3-5분에 80-90% 회복'
  },
  PCR_RECOVERY_31PMRS_2025: {
    title: 'Meta-analysis of PCr recovery kinetics by 31P-MRS',
    url: 'https://analyticalsciencejournals.onlinelibrary.wiley.com/doi/10.1002/nbm.70023',
    year: 2025,
    authors: 'Various authors',
    note: 'PCr 회복 속도론 메타분석 (31P 자기공명분광법)'
  },
  CHLORAMINE_IRRITATION_CDC_2025: {
    title: 'CDC — Chloramines & pool operation (skin/eye/respiratory irritation)',
    url: 'https://www.cdc.gov/healthy-swimming/toolkit/chloramines-and-pool-operation.html',
    year: 2025,
    authors: 'CDC',
    note: '클로라민이 점막·호흡기에 자극, 환기/노출 관리 필요'
  },
  CHLORAMINE_INDOOR_JACOBS_2007: {
    title: 'Trichloramine exposure & respiratory symptoms in indoor pools',
    url: 'https://publications.ersnet.org/content/erj/29/4/690',
    year: 2007,
    authors: 'Jacobs JH, et al.',
    note: '실내 풀 공기 중 트리클로라민과 호흡기 증상 연관성'
  },
  POOL_AIR_TECHBRIEF_CTDPH: {
    title: 'Indoor air pollution at indoor swimming pools — Technical brief',
    url: 'https://portal.ct.gov/-/media/departments-and-agencies/dph/dph/environmental_health/eoha/pdf/technicalbriefindoorswiwfinalpdf.pdf',
    year: 2015,
    authors: 'CT Department of Public Health',
    note: '실내 수영장 공기 오염 기술 브리핑'
  },
  HYPOXIC_SAFETY_USASWIM: {
    title: 'USA Swimming — Hypoxic training safety recommendations',
    url: 'https://www.gomotionapp.com/eznslsc/UserFiles/File/Minutes/Year2015/Fall%20HOD/Reports/Safety-SafeSport/Draft%202%20Hypoxic%20Training%20protocol.pdf',
    year: 2015,
    authors: 'USA Swimming',
    note: '저산소 훈련 안전 가이드: 장시간 숨참기·과호흡 금지'
  }
};










