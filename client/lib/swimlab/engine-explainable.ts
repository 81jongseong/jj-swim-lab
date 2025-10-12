/**
 * 🔬 설명가능(Explainable) 수영 엔진
 * 
 * 모든 페이스/휴식/세트 구성에 대한 과학적 근거를 자동으로 생성
 * 
 * 연동되는 파일:
 * - client/types/evidence.ts - Evidence 타입 및 레지스트리
 * - client/lib/swimlab/engine-v31.ts - 기본 엔진 로직
 */

import { EvidenceKey } from '@/types/evidence';

type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';

const Z_REST = { Z1: 10, Z2: 15, Z3: 20, Z4: 35, Z5: 60 } as const;

/**
 * Zone별 페이스 계산 (CSS 기준)
 */
export function pace100(css100: number, zone: Zone): number {
  const z = {
    Z1: css100 + 16,   // 회복
    Z2: css100 + 8,    // 유산소
    Z3: css100 + 0,    // 역치
    Z4: Math.max(css100 - 8, css100 * 0.9),   // VO₂
    Z5: Math.max(css100 - 15, css100 * 0.82)  // 스프린트
  } as const;
  return Math.round(z[zone]);
}

/**
 * 페이스 선택의 과학적 근거 설명
 */
export function explainPace(zone: Zone): { txt: string; ev: EvidenceKey[] } {
  if (zone === 'Z1') {
    return {
      txt: 'CSS 기반 Z1(회복) → 호흡·기술 정렬, 젖산 제거 촉진',
      ev: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
    };
  }
  if (zone === 'Z2') {
    return {
      txt: 'CSS 기반 Z2(유산소 기초) → 미토콘드리아 밀도↑, 지방 대사 개선',
      ev: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
    };
  }
  if (zone === 'Z3') {
    return {
      txt: 'CSS(=CV) 근처의 역치 강도(MLSS 근사) → 템포/지속 속도 유지 훈련',
      ev: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993', 'CV_INTERVALS_TOUBEKIS_2011']
    };
  }
  if (zone === 'Z4') {
    return {
      txt: '역치 초과의 고강도(VO₂↑) → 세트 품질 유지를 위해 거리를 짧게',
      ev: ['CV_INTERVALS_TOUBEKIS_2011']
    };
  }
  if (zone === 'Z5') {
    return {
      txt: '최대 강도(신경근 자극) → 매우 짧은 거리, 매우 긴 휴식 필요',
      ev: ['SPRINT_REST_TOUBEKIS_2005', 'PCR_RECOVERY_BAKER_2010']
    };
  }
  return {
    txt: 'CSS 기반 존 매핑',
    ev: ['CSS_VALIDITY_WAKAYOSHI_1992']
  };
}

/**
 * 휴식 시간의 과학적 근거 설명
 */
export function explainRest(
  zone: Zone,
  chlorineSensitive: boolean,
  addRest: number = 0
): { restSec: number; whyRest: string; ev: EvidenceKey[] } {
  const base = Z_REST[zone];
  const chlorineBonus = chlorineSensitive ? 10 : 0;
  const target = base + chlorineBonus + addRest;

  const ev: EvidenceKey[] = [];
  let txt = '';

  if (zone === 'Z5') {
    ev.push('SPRINT_REST_TOUBEKIS_2005', 'PCR_RECOVERY_BAKER_2010', 'PCR_RECOVERY_31PMRS_2025');
    txt = `Z5 기본 r${base}″`;
    if (chlorineBonus > 0) txt += ` + 염소 민감 +${chlorineBonus}″`;
    if (addRest > 0) txt += ` + 컨디션 조정 +${addRest}″`;
    txt += ` → r${target}″. 스프린트는 PCr 재합성(반감기 30초, 완전 회복 3-5분) 위해 긴 휴식 필수`;
  } else if (zone === 'Z4') {
    ev.push('SPRINT_REST_TOUBEKIS_2005', 'PCR_RECOVERY_BAKER_2010', 'PCR_RECOVERY_31PMRS_2025');
    txt = `Z4 기본 r${base}″`;
    if (chlorineBonus > 0) txt += ` + 염소 민감 +${chlorineBonus}″`;
    if (addRest > 0) txt += ` + 컨디션 조정 +${addRest}″`;
    txt += ` → r${target}″. 고강도는 PCr 재합성·젖산 제거 시간 확보 필요`;
  } else if (zone === 'Z3') {
    ev.push('CV_INTERVALS_TOUBEKIS_2011', 'PCR_RECOVERY_BAKER_2010');
    txt = `Z3 기본 r${base}″`;
    if (chlorineBonus > 0) txt += ` + 염소 민감 +${chlorineBonus}″`;
    if (addRest > 0) txt += ` + 컨디션 조정 +${addRest}″`;
    txt += ` → r${target}″. 역치 근처 반복 유지 위해 20–30″ 권장`;
  } else if (zone === 'Z2') {
    ev.push('CSS_MLSS_WAKAYOSHI_1993');
    txt = `Z2 기본 r${base}″`;
    if (chlorineBonus > 0) txt += ` + 염소 민감 +${chlorineBonus}″`;
    if (addRest > 0) txt += ` + 컨디션 조정 +${addRest}″`;
    txt += ` → r${target}″. 기술 유지와 환기 위한 짧은 회복`;
  } else {
    ev.push('CSS_VALIDITY_WAKAYOSHI_1992');
    txt = `Z1 기본 r${base}″`;
    if (chlorineBonus > 0) txt += ` + 염소 민감 +${chlorineBonus}″`;
    if (addRest > 0) txt += ` + 컨디션 조정 +${addRest}″`;
    txt += ` → r${target}″. 저강도 회복/환기`;
  }

  // 염소 민감 시 호흡/피부 자극 관리 근거 추가
  if (chlorineSensitive) {
    ev.push('CHLORAMINE_IRRITATION_CDC_2025', 'CHLORAMINE_INDOOR_JACOBS_2007', 'POOL_AIR_TECHBRIEF_CTDPH');
  }

  return { restSec: target, whyRest: txt, ev };
}

/**
 * 세트 구성의 과학적 근거 설명
 */
export function explainSet(params: {
  zone: Zone;
  reps: number;
  dist: number;
  label?: string;
  theme?: string;
  isCapped?: boolean;
}): { whySet: string; ev: EvidenceKey[] } {
  const ev: EvidenceKey[] = [];
  let txt = '';

  if (params.label?.includes('워밍업')) {
    ev.push('CSS_VALIDITY_WAKAYOSHI_1992');
    txt = '워밍업으로 체온·가동성 확보, 이후 템포 세트 품질 보장';
  } else if (params.label?.includes('쿨다운')) {
    ev.push('CSS_VALIDITY_WAKAYOSHI_1992');
    txt = '쿨다운으로 젖산 제거 촉진, 회복 시작';
  } else if (params.label?.includes('팔 드릴')) {
    ev.push('CSS_VALIDITY_WAKAYOSHI_1992');
    txt = '팔 드릴(풀부이)로 상체 근력·캐치 기술 집중 향상';
  } else if (params.label?.includes('발차기')) {
    ev.push('CSS_VALIDITY_WAKAYOSHI_1992');
    txt = '발차기(킥보드)로 하체 추진력·체간 안정성 강화';
  } else if (params.label?.includes('빌드업')) {
    ev.push('CSS_MLSS_WAKAYOSHI_1993');
    txt = '빌드업으로 기술-속도 조화, 점진적 강도 증가';
  } else if (params.zone === 'Z3' && params.dist >= 150) {
    ev.push('CSS_MLSS_WAKAYOSHI_1993', 'CV_INTERVALS_TOUBEKIS_2011');
    txt = '기술 무너지지 않는 선에서 지구력·페이스 분배 능력 강화';
    if (params.isCapped) {
      txt += ' (질환/컨디션으로 거리 조정됨)';
    }
  } else if (params.zone === 'Z2' && params.dist >= 200) {
    ev.push('CSS_MLSS_WAKAYOSHI_1993');
    txt = '지속 수영으로 유산소 기초 강화, 미토콘드리아 밀도↑';
  } else if (params.zone === 'Z4' || params.zone === 'Z5') {
    ev.push('SPRINT_REST_TOUBEKIS_2005', 'CV_INTERVALS_TOUBEKIS_2011');
    txt = '품질 높은 스프린트-유사 자극, 신경근 동원력 향상';
    if (params.isCapped) {
      ev.push('CHLORAMINE_IRRITATION_CDC_2025');
      txt += ' (염소 민감으로 총량 제한됨)';
    }
  } else {
    ev.push('CSS_VALIDITY_WAKAYOSHI_1992');
    txt = params.label || '세트 목적에 맞는 반복·거리 구성';
  }

  return { whySet: txt, ev };
}

/**
 * 설명가능 세트 생성
 */
export interface ExplainableSetParams {
  stroke: Stroke;
  reps: number;
  dist: number;
  zone: Zone;
  css100ByStroke: Record<string, number>;
  chlorineSensitive: boolean;
  addRest?: number;
  label?: string;
  theme?: string;
  isCapped?: boolean;
}

export interface ExplainableSetItem {
  stroke: Stroke;
  desc: string;
  meters: number;
  zone: Zone;
  restSec: number;
  // 설명가능성
  whyPace: string;
  whyRest: string;
  whySet: string;
  evidenceKeys: EvidenceKey[];
}

export function makeExplainableSet(params: ExplainableSetParams): ExplainableSetItem {
  const baseCss = params.css100ByStroke[params.stroke] ?? params.css100ByStroke['freestyle'] ?? 100;
  const p100 = pace100(baseCss, params.zone);
  
  const { restSec, whyRest, ev: restEv } = explainRest(
    params.zone,
    params.chlorineSensitive,
    params.addRest ?? 0
  );
  
  const { txt: paceTxt, ev: paceEv } = explainPace(params.zone);
  const { whySet, ev: setEv } = explainSet({
    zone: params.zone,
    reps: params.reps,
    dist: params.dist,
    label: params.label,
    theme: params.theme,
    isCapped: params.isCapped
  });

  const paceFmt = `${Math.floor(p100 / 60)}:${String(p100 % 60).padStart(2, '0')}`;
  const zoneLabel = params.zone === 'Z3' ? 'CSS±0″' :
                    params.zone === 'Z4' ? 'CSS−8″' :
                    params.zone === 'Z2' ? 'CSS+8″' :
                    params.zone === 'Z1' ? 'CSS+16″' : 'CSS−15″';
  
  const desc = `${params.reps}×${params.dist}m ${params.label || ''} @ ${zoneLabel}, r${restSec}″`;

  // Evidence 키 중복 제거
  const allEvidenceKeys = Array.from(new Set([...paceEv, ...restEv, ...setEv]));

  return {
    stroke: params.stroke,
    desc,
    meters: params.reps * params.dist,
    zone: params.zone,
    restSec,
    whyPace: paceTxt,
    whyRest,
    whySet,
    evidenceKeys: allEvidenceKeys
  };
}










