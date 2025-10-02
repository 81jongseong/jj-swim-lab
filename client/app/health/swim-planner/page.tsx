"use client";

import React, { useMemo, useState, useEffect } from "react";

/**
 * SwimHealthPlanner.tsx — JJ Swim Lab (웹 UI: 질환×영법 안전도 + 개인화 훈련 산출)
 *
 * 목표:
 * 1) 관절·피부·이비인후/호흡·대사심혈관·신경·정신·특수상황(임신/면역저하 등) 조건 라이브러리
 * 2) 6영법(자유/배영/평영/접영/기본배영/사이드)별: 가능여부(Safe/Caution/Avoid), 주의점, 장단점, 수정, 근거 링크
 * 3) 개인 건강정보/페이스/목표 입력 → 세트가 즉시 재계산(거리·속도·휴식) + "왜" 툴팁
 * 4) 외부 데이터(JSON) 업로드/내장 Joint-28 자동 병합
 *
 * 사용법:
 * - 이 파일을 src/ 폴더에 넣고 App에서 <SwimHealthPlanner/> 렌더.
 * - Tailwind 사용(선택박스 불투명·겹침 방지 스타일 포함).
 * - 데이터 스키마는 아래 ConditionGuideline & EvidenceSource 참고.
 *
 * 주의(교육/계획 용): 개인 의료 지시는 항상 우선.
 */

// ========================= 타입 & 공통 =========================
export type Stroke = "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "elementary_backstroke" | "sidestroke";
export type SafetyLevel = "safe" | "caution" | "avoid";
export type Category =
  | "spine" | "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle"
  | "derm" | "ent_respiratory" | "cardiometabolic" | "neuro" | "mental" | "special";

export interface EvidenceSource { id: string; label: string; url: string; }
export interface StrokeRule {
  level: SafetyLevel;
  reason: string;
  allowedMovements: string[];
  prohibitedMovements: string[];
  modifications: string[];
  alternatives: Stroke[];
  evidenceIds: string[]; // EvidenceSource.id
  details: string;
}
export interface ConditionGuideline {
  id: string;
  name: string;
  category: Category;
  severity: "mild" | "moderate" | "severe";
  strokeGuide: Record<Stroke, StrokeRule>;
}

export type PoolLength = 25 | 50;
export type Zone = "EN1" | "EN2" | "EN3" | "Z4" | "Z5";
export type Goal = "ENDURANCE" | "THRESHOLD" | "VO2MAX" | "SPRINT";

export interface AthleteContext {
  poolLength: PoolLength;
  cssPer100: number; // 초/100m
  racePacePer100?: number; // 선택
  weeklySessions: number;
  sessionMinutes: number;
  goal: Goal;
  conditionIds: string[];
}

export interface Rationale {
  distanceWhy: string;
  paceWhy: string;
  restWhy: string;
  methodWhy: string;
  safetyWhy: string[];
  references: string[]; // EvidenceSource url 목록
}

export interface SetSpec {
  reps: number;
  distance: number; // per rep (m)
  stroke: Stroke;
  zone: Zone;
  pacePer100?: number; // 초/100m (Z5 제외)
  targetRepeatSec?: number; // 목표 수행시간(초)
  restSec?: number; // rXX"
  methodId: string;
  notes?: string[];
  rationale: Rationale;
}

// ========================= 근거(출처) — 신뢰성 높은 기관 우선 =========================
const EVIDENCE: EvidenceSource[] = [
  // 공중보건/수영 일반
  { id:"CDC_Diarrhea", label:"CDC Healthy Swimming — Diarrhea: Don't Swim When You're Sick", url:"https://www.cdc.gov/healthy-swimming/prevention/swimming-diarrhea.html" },
  { id:"CDC_Wounds", label:"CDC Healthy Swimming — Swimmers with Wounds/Illness", url:"https://www.cdc.gov/healthy-swimming/swimmers/index.html" },
  { id:"WHO_Pools", label:"WHO Guidelines for Safe Recreational Water Environments (Pools)", url:"https://iris.who.int/handle/10665/42853" },

  // 임신
  { id:"ACOG_Pregnancy_Exercise", label:"ACOG — Physical Activity & Exercise During Pregnancy", url:"https://www.acog.org/womens-health/faqs/exercise-during-pregnancy" },

  // 간질/발작
  { id:"Epilepsy_Water", label:"Epilepsy Foundation — Water Safety", url:"https://www.epilepsy.com/living-epilepsy/healthy-living/safety/staying-safe-water" },

  // 천식/운동유발 기관지수축(EIB)
  { id:"GINA_Exercise", label:"GINA — Asthma Strategy: Exercise & Sports (overview)", url:"https://ginasthma.org/gina-reports/" },

  // 당뇨·운동
  { id:"ADA_2025_PA", label:"ADA Standards of Care 2025 — Physical Activity", url:"https://diabetesjournals.org/care" },

  // 외이도염(수영자귀)
  { id:"AAO_OtitisExterna", label:"AAO-HNSF Clinical Practice Guideline: Acute Otitis Externa (2014 update)", url:"https://www.entnet.org/quality-practice/quality-products/clinical-practice-guidelines/acute-otitis-externa/" },

  // 습진/피부
  { id:"NEA_Swimming", label:"National Eczema Association — Swimming & Eczema (tips)", url:"https://nationaleczema.org/blog/swimming-eczema/" },
  { id:"DermNet_TineaPedis", label:"DermNet — Tinea pedis (Athlete's foot)", url:"https://dermnetnz.org/topics/tinea-pedis" },

  // (관절 계열 대표 근거 ID — 간단 버전)
  { id:"JOSPT_LBP_2021", label:"JOSPT 2021 — Low Back Pain CPG", url:"https://www.jospt.org/doi/10.2519/jospt.2021.0304" },
  { id:"JAMA_Aquatic_LBP_2022", label:"JAMA Netw Open 2022 — Aquatic vs PT for cLBP", url:"https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2788216" },
  { id:"NASS_LDH_2012", label:"NASS 2012 — Lumbar Disc Herniation", url:"https://www.spine.org/Research-Clinical-Care/Quality-Improvement/Clinical-Guidelines" },
  { id:"JOA_LSS_2021", label:"JOA 2021 — Lumbar Spinal Stenosis CPG", url:"https://minds.jcqhc.or.jp/n/med/4/med0023/G0001035/0001" },
  { id:"AXSPA_EULAR_2022", label:"ASAS–EULAR 2022 — axSpA", url:"https://ard.bmj.com/content/81/7/925" },

  { id:"RCRSP_JOSPT_2025", label:"JOSPT 2025 — Rotator Cuff Tendinopathy CPG", url:"https://www.jospt.org" },
  { id:"SAPS_SR_2020", label:"JOSPT 2020 — Subacromial Pain Exercise SR", url:"https://www.jospt.org" },
  { id:"BESS_Instability_2019", label:"BESS/BOA 2019 — Atraumatic Shoulder Instability", url:"https://bess.ac.uk" },

  { id:"JOSPT_LateralElbow_2022", label:"JOSPT 2022 — Lateral Elbow Pain CPG", url:"https://www.jospt.org" },
  { id:"MedialEpic_2023", label:"Orthop Rev 2023 — Medial Epicondylitis Overview", url:"https://orthopedicreviews.openmedicalpublishing.org" },

  { id:"AAOS_CTS_2024", label:"AAOS 2024 — Carpal Tunnel Syndrome CPG", url:"https://www.aaos.org" },
  { id:"TFCC_SR_2020", label:"J Hand Microsurg 2020 — TFCC SR", url:"https://www.thieme-connect.com" },
  { id:"JOSPT_DRF_2024", label:"JOSPT 2024 — Distal Radius Fx Rehab CPG", url:"https://www.jospt.org" },
  { id:"DQT_Cochrane_2009", label:"Cochrane 2009 — de Quervain's injection", url:"https://www.cochranelibrary.com" },
  { id:"DQT_JAMA_2023", label:"JAMA Netw Open 2023 — de Quervain SR", url:"https://jamanetwork.com" },

  { id:"JOSPT_HipOA_2017", label:"JOSPT 2017 — Hip OA CPG", url:"https://www.jospt.org" },
  { id:"JOSPT_NonarthriticHip_2023", label:"JOSPT 2023 — Nonarthritic Hip Pain CPG", url:"https://www.jospt.org" },
  { id:"Cochrane_Aquatic_OA_2016", label:"Cochrane 2016 — Aquatic Exercise for OA", url:"https://doi.org/10.1002/14651858.CD005523.pub3" },

  { id:"Cochrane_KneeOA_2015", label:"Cochrane 2015 — Knee OA Exercise", url:"https://www.cochranelibrary.com" },
  { id:"JOSPT_Meniscus_2018", label:"JOSPT 2018 — Meniscus/Cartilage CPG", url:"https://www.jospt.org" },
  { id:"JOSPT_KneeLig_2017", label:"JOSPT 2017 — Knee Ligament CPG", url:"https://www.jospt.org" },
  { id:"JOSPT_PFPS_2019", label:"JOSPT 2019 — Patellofemoral Pain CPG", url:"https://www.jospt.org" },

  { id:"JOSPT_AnkleSprain_2021", label:"JOSPT 2021 — Lateral Ankle Sprain/CAI CPG", url:"https://www.jospt.org" },
  { id:"JOSPT_Achilles_2024", label:"JOSPT 2024 — Midportion Achilles Tendinopathy CPG", url:"https://www.jospt.org" },
  { id:"JOSPT_PlantarFascia_2023", label:"JOSPT 2023 — Heel Pain/Plantar Fasciitis CPG", url:"https://www.jospt.org" },
];

// ========================= 도우미(시간/페이스/문자열) =========================
function mmssToSec(s: string): number {
  const [m, r] = s.split(":");
  const sec = parseInt(r || "0", 10);
  const min = parseInt(m || "0", 10);
  return min * 60 + sec;
}
function secToPace100(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ========================= 안전 보정 규칙(카테고리별) =========================
interface SafetyAdjust { restBonusSec: number; zoneCap?: Zone; strokeAvoid?: Partial<Record<Stroke, boolean>>; notes: string[]; evidence: string[]; }
const SAFETY_RULES: Record<Category, SafetyAdjust> = {
  spine:   { restBonusSec: 5, zoneCap: "Z4", strokeAvoid:{ butterfly:true }, notes:["접영 회피","스노클로 경추 회전/신전 감소"], evidence:["JOSPT_LBP_2021","JAMA_Aquatic_LBP_2022"] },
  shoulder:{ restBonusSec: 5, zoneCap: "Z4", strokeAvoid:{ butterfly:true }, notes:["패들 제한","볼륨·케이던스 관리"], evidence:["RCRSP_JOSPT_2025","SAPS_SR_2020"] },
  elbow:   { restBonusSec: 5, zoneCap: "Z4", strokeAvoid:{ butterfly:true }, notes:["패들 금지","하이케이던스 회피"], evidence:["JOSPT_LateralElbow_2022","MedialEpic_2023"] },
  wrist:   { restBonusSec: 5, zoneCap: "Z4", strokeAvoid:{ butterfly:true }, notes:["손목 중립","강한 스컬 회피"], evidence:["AAOS_CTS_2024","TFCC_SR_2020","JOSPT_DRF_2024","DQT_JAMA_2023"] },
  hip:     { restBonusSec: 5, zoneCap: "Z4", strokeAvoid:{ butterfly:true, breaststroke:true }, notes:["평영킥 범위 축소"], evidence:["JOSPT_HipOA_2017","JOSPT_NonarthriticHip_2023","Cochrane_Aquatic_OA_2016"] },
  knee:    { restBonusSec: 5, zoneCap: "Z4", strokeAvoid:{ breaststroke:true }, notes:["평영킥 스냅 회피"], evidence:["Cochrane_KneeOA_2015","JOSPT_Meniscus_2018","JOSPT_KneeLig_2017","JOSPT_PFPS_2019","Cochrane_Aquatic_OA_2016"] },
  ankle:   { restBonusSec: 5, zoneCap: "Z4", strokeAvoid:{ breaststroke:true, butterfly:true }, notes:["핀 제한","돌핀킥 강도↓"], evidence:["JOSPT_AnkleSprain_2021","JOSPT_Achilles_2024","JOSPT_PlantarFascia_2023"] },

  derm: { restBonusSec: 0, strokeAvoid:{}, zoneCap: undefined, notes:["활성 감염/미치유 상처 시 공공수영장 금지"], evidence:["CDC_Diarrhea","CDC_Wounds","WHO_Pools"] },
  ent_respiratory: { restBonusSec: 0, strokeAvoid:{}, zoneCap: undefined, notes:["수영자귀 예방: 수영 후 귀 건조/알코올-식초 드롭(지시 시)", "EIB: 준비운동·SABA 사전사용(지시 시)"], evidence:["AAO_OtitisExterna","GINA_Exercise"] },
  cardiometabolic: { restBonusSec: 0, strokeAvoid:{}, zoneCap: undefined, notes:["고혈압/당뇨는 EN1–EN3 중심, 점진 과부하"], evidence:["ADA_2025_PA"] },
  neuro: { restBonusSec: 10, strokeAvoid:{}, zoneCap: "EN3", notes:["간질: 감독·버디 시스템·발작 유발요인 회피"], evidence:["Epilepsy_Water"] },
  mental: { restBonusSec: 0, strokeAvoid:{}, zoneCap: undefined, notes:["불안/우울: 규칙적 EN1–EN2가 안전·효과적"], evidence:[] },
  special: { restBonusSec: 0, strokeAvoid:{}, zoneCap: undefined, notes:["임신: 수영은 안전한 운동으로 권장(개별 지시 따름)"], evidence:["ACOG_Pregnancy_Exercise"] },
};

function foldSafety(conditionIds: string[], lib: ConditionGuideline[]): { restBonus: number; zoneCap?: Zone; avoid: Partial<Record<Stroke, boolean>>; notes: string[]; evidenceUrls: string[] } {
  let bonus = 0; let cap: Zone | undefined; const avoid: Partial<Record<Stroke, boolean>> = {}; const notes: string[] = []; const evid: string[] = [];
  const byId: Record<string, ConditionGuideline> = Object.fromEntries(lib.map(c => [c.id, c]));
  for (const id of conditionIds) {
    const c = byId[id]; if (!c) continue;
    const s = SAFETY_RULES[c.category];
    if (s) {
      bonus += s.restBonusSec;
      notes.push(...s.notes);
      for (const k of (Object.keys(s.strokeAvoid || {}) as Stroke[])) { if ((s.strokeAvoid as any)[k]) avoid[k] = true; }
      if (s.zoneCap) { const order = (z: Zone) => z === "Z5" ? 5 : z === "Z4" ? 4 : z === "EN3" ? 3 : z === "EN2" ? 2 : 1; if (!cap || order(s.zoneCap) < order(cap)) cap = s.zoneCap; }
      evid.push(...s.evidence.map(eid => (EVIDENCE.find(e => e.id === eid)?.url || "")));
    }
  }
  return { restBonus: bonus, zoneCap: cap, avoid, notes: Array.from(new Set(notes)).filter(Boolean), evidenceUrls: Array.from(new Set(evid)).filter(Boolean) };
}

// ========================= 페이스/휴식 로직 =========================
const PACE_OFFSETS: Record<Zone, { min: number; max: number }> = {
  EN1: { min: +15, max: +30 }, // CSS +15~30"/100m
  EN2: { min: +5, max: +14 },
  EN3: { min: 0, max: +4 },
  Z4:  { min: -5, max: -2 },
  Z5:  { min: -8, max: -6 },
};

function restFor(zone: Zone, repeatSec: number, safetyBonus: number): number {
  // 근거 요지: EN1은 불필요한 긴 휴식 금지(밀도 유지), EN2는 10–20"로 대사/폼 균형, EN3는 20–30"(임계 체류), Z4는 30–45"(고강도 산소섭취), Z5는 완전회복(>=60").
  const base = zone === "EN1" ? (repeatSec >= 90 ? 10 : 5)
             : zone === "EN2" ? (repeatSec >= 120 ? 20 : 10)
             : zone === "EN3" ? (repeatSec >= 120 ? 30 : 20)
             : zone === "Z4"  ? (repeatSec >= 60 ? 40 : 30)
             : 60; // Z5
  return base + safetyBonus;
}

// ========================= 훈련법 라벨(간단) =========================
const METHOD_LABEL: Record<string, string> = {
  even: "Even EN2",
  threshold: "Threshold/CSS",
  vo2: "VO₂max Intervals",
  sprint_quality: "Sprint/Power",
  descend: "Descend",
  build: "Build within",
};

// ========================= 샘플 조건 + 외부 업로드 =========================
const six: Stroke[] = ["freestyle","backstroke","breaststroke","butterfly","elementary_backstroke","sidestroke"];
const R = (level: SafetyLevel, reason: string, more: Partial<StrokeRule> = {}): StrokeRule => ({ level, reason, allowedMovements: [], prohibitedMovements: [], modifications: [], alternatives: [], evidenceIds: [], details: "", ...more });

const SAMPLE_CONDITIONS: ConditionGuideline[] = [
  // ——— 피부/감염/상처
  { id:"open_wound", name:"미치유 상처/거즈로 덮기 어려운 상처", category:"derm", severity:"moderate", strokeGuide: Object.fromEntries(six.map(st => [st, R("avoid","공공수영장 감염/오염 위험 — 상처 치유 전 회피",{evidenceIds:["CDC_Wounds","WHO_Pools"], details:"방수 드레싱으로 완전 덮개+의료지시 필요."})])) as Record<Stroke, StrokeRule> },
  { id:"diarrheal_illness", name:"설사성 질환 또는 크립토스포리디움 의심(최근)", category:"derm", severity:"severe", strokeGuide: Object.fromEntries(six.map(st => [st, R("avoid","대변-수계 전파 방지 — 증상 소실 후 대기기간 필요",{evidenceIds:["CDC_Diarrhea"], details:"증상 소실 후 2주 회피 권장(CDC)."})])) as Record<Stroke, StrokeRule> },
  { id:"eczema_mild", name:"경증 아토피/습진(비감염)", category:"derm", severity:"mild", strokeGuide: Object.fromEntries(six.map(st => [st, R("safe","자극 최소화 전제",{modifications:["수영 전후 보습","노출 시간 제한"], evidenceIds:["NEA_Swimming"]})])) as Record<Stroke, StrokeRule> },
  { id:"tinea_pedis", name:"무좀(족부백선)", category:"derm", severity:"mild", strokeGuide: Object.fromEntries(six.map(st => [st, R("safe","치료 중·샤워실 슬리퍼 착용",{modifications:["발 완전 건조"], evidenceIds:["DermNet_TineaPedis"]})])) as Record<Stroke, StrokeRule> },

  // ——— 이비인후/호흡
  { id:"otitis_externa", name:"급성 외이도염(수영자귀)", category:"ent_respiratory", severity:"moderate", strokeGuide: Object.fromEntries(six.map(st => [st, R("avoid","치료/무증상 회복 전 수영 회피",{evidenceIds:["AAO_OtitisExterna"]})])) as Record<Stroke, StrokeRule> },
  { id:"asthma_eib", name:"천식/운동유발기관지수축(EIB)", category:"ent_respiratory", severity:"mild", strokeGuide: { freestyle: R("safe","수온·습도가 기도에 우호",{modifications:["준비운동","지시에 따른 SABA 사전사용"], evidenceIds:["GINA_Exercise"]}), backstroke: R("safe","동일"), breaststroke: R("safe","동일"), butterfly: R("caution","과호흡·고환기 위험"), elementary_backstroke: R("safe","저강도 대체"), sidestroke: R("safe","저강도 대체") } },

  // ——— 대사/심혈관
  { id:"hypertension_controlled", name:"고혈압(조절)", category:"cardiometabolic", severity:"moderate", strokeGuide: Object.fromEntries(six.map(st => [st, R("safe","중등도 유산소 권장",{modifications:["EN1–EN3 중심","무호흡 스프린트 과다 금지"], evidenceIds:["ADA_2025_PA"]})])) as Record<Stroke, StrokeRule> },
  { id:"diabetes_t2", name:"제2형 당뇨", category:"cardiometabolic", severity:"moderate", strokeGuide: Object.fromEntries(six.map(st => [st, R("safe","유산소·저항 혼합 권장",{modifications:["저혈당 대처","발상태 점검"], evidenceIds:["ADA_2025_PA"]})])) as Record<Stroke, StrokeRule> },

  // ——— 신경/정신
  { id:"epilepsy_controlled", name:"간질(조절)", category:"neuro", severity:"moderate", strokeGuide: Object.fromEntries(six.map(st => [st, R("caution","물속 발작 위험 — 감독·버디 필수",{modifications:["감독 하 얕은 수심"], evidenceIds:["Epilepsy_Water"]})])) as Record<Stroke, StrokeRule> },
  { id:"anxiety_depression", name:"불안/우울(안정)", category:"mental", severity:"mild", strokeGuide: Object.fromEntries(six.map(st => [st, R("safe","규칙적 유산소가 증상 개선과 연관",{modifications:["EN1–EN2 규칙성"], evidenceIds:[]})])) as Record<Stroke, StrokeRule> },

  // ——— 특수상황
  { id:"pregnancy_uncomplicated", name:"임신(합병증 없음)", category:"special", severity:"mild", strokeGuide: Object.fromEntries(six.map(st => [st, R("safe","임신 중 안전한 운동",{modifications:["과열 방지","미끄럼 주의"], evidenceIds:["ACOG_Pregnancy_Exercise"]})])) as Record<Stroke, StrokeRule> },
];

// 외부 JSON 업로드로 병합(JSON 스키마: ConditionGuideline[])
function useConditionLibrary(): [ConditionGuideline[], (added: ConditionGuideline[] ) => void, (arr: ConditionGuideline[]) => void] {
  const [lib, setLib] = useState<ConditionGuideline[]>(SAMPLE_CONDITIONS);
  const merge = (added: ConditionGuideline[]) => {
    const map = new Map<string, ConditionGuideline>();
    [...lib, ...added].forEach(c => map.set(c.id, c));
    setLib(Array.from(map.values()));
  };
  const replaceAll = (arr: ConditionGuideline[]) => setLib(arr);
  return [lib, merge, replaceAll];
}

// ========================= JOINT-28 (내장 생성기) =========================
function buildJoint28(): ConditionGuideline[] {
  // 카테고리 템플릿(간단)
  const T: Record<Exclude<Category, "derm"|"ent_respiratory"|"cardiometabolic"|"neuro"|"mental"|"special">, Record<Stroke, StrokeRule>> = {
    spine: {
      freestyle: R("caution","요추/경추 신전·회전",{alternatives:["backstroke","elementary_backstroke"]}),
      backstroke: R("safe","중립 척추 유지 용이"),
      breaststroke: R("caution","개구리킥 말기 요추 전단"),
      butterfly: R("avoid","요추 신전/파동 부하 큼"),
      elementary_backstroke: R("safe","저속·저충격"),
      sidestroke: R("caution","체간 비틀림/측굴")
    },
    shoulder: {
      freestyle: R("caution","오버헤드 반복 부담",{alternatives:["breaststroke","elementary_backstroke"]}),
      backstroke: R("caution","오버헤드이나 충돌 위험↓"),
      breaststroke: R("safe","오버헤드 범위 작음"),
      butterfly: R("avoid","양측 동시 오버헤드 + 큰 토크"),
      elementary_backstroke: R("safe","저부하"),
      sidestroke: R("caution","편측 부하")
    },
    elbow: {
      freestyle: R("caution","전완 회내외/손목신전 반복"),
      backstroke: R("caution","오버헤드 풀스루"),
      breaststroke: R("safe","팔 토크 낮음"),
      butterfly: R("avoid","양측 고부하 캐치/풀"),
      elementary_backstroke: R("safe","저부하"),
      sidestroke: R("caution","편측 반복")
    },
    wrist: {
      freestyle: R("caution","손목 굴신/편위 반복"),
      backstroke: R("safe","중립 유지 용이"),
      breaststroke: R("safe","스컬 범위 제한 시"),
      butterfly: R("avoid","강한 캐치/스컬"),
      elementary_backstroke: R("safe","저속/중립"),
      sidestroke: R("caution","편측 스컬 반복")
    },
    hip: {
      freestyle: R("safe","플러터킥 전단 낮음"),
      backstroke: R("safe","중립 고관절"),
      breaststroke: R("caution","외회전/외전 반복으로 충돌 가능"),
      butterfly: R("avoid","신전-굴곡 큰 파동"),
      elementary_backstroke: R("safe","저부하"),
      sidestroke: R("caution","비대칭 킥")
    },
    knee: {
      freestyle: R("safe","무릎 전단/회전 낮음"),
      backstroke: R("safe","동일"),
      breaststroke: R("caution","개구리킥 내반/회전 스트레스"),
      butterfly: R("caution","돌핀에 의한 굴신 부하"),
      elementary_backstroke: R("safe","저부하"),
      sidestroke: R("caution","비대칭 킥")
    },
    ankle: {
      freestyle: R("caution","플랜타플렉션 반복 부하"),
      backstroke: R("caution","유사(플러터킥)"),
      breaststroke: R("avoid","말기 외회전/외반 스냅"),
      butterfly: R("avoid","돌핀킥 반복부하"),
      elementary_backstroke: R("safe","킥 부하 낮음"),
      sidestroke: R("caution","비대칭 킥")
    }
  };
  const EV: Record<string, string[]> = {
    spine: ["JOSPT_LBP_2021","JAMA_Aquatic_LBP_2022","NASS_LDH_2012","JOA_LSS_2021","AXSPA_EULAR_2022"],
    shoulder: ["RCRSP_JOSPT_2025","SAPS_SR_2020","BESS_Instability_2019"],
    elbow: ["JOSPT_LateralElbow_2022","MedialEpic_2023"],
    wrist: ["AAOS_CTS_2024","TFCC_SR_2020","JOSPT_DRF_2024","DQT_Cochrane_2009","DQT_JAMA_2023"],
    hip: ["JOSPT_HipOA_2017","JOSPT_NonarthriticHip_2023","Cochrane_Aquatic_OA_2016"],
    knee: ["Cochrane_KneeOA_2015","JOSPT_Meniscus_2018","JOSPT_KneeLig_2017","JOSPT_PFPS_2019","Cochrane_Aquatic_OA_2016"],
    ankle: ["JOSPT_AnkleSprain_2021","JOSPT_Achilles_2024","JOSPT_PlantarFascia_2023"],
  } as any;

  const meta = [
    // 척추(5)
    { id:'lumbar_disc_herniation', name:'요추 추간판탈출증(허리디스크)', category:'spine', severity:'moderate' },
    { id:'lumbar_spinal_stenosis', name:'요추관협착증', category:'spine', severity:'moderate' },
    { id:'chronic_nonspecific_lbp', name:'만성 비특이적 요통', category:'spine', severity:'moderate' },
    { id:'cervical_radiculopathy', name:'경추 신경뿌리병증/경부통', category:'spine', severity:'mild' },
    { id:'axial_spondyloarthritis', name:'축성 척추관절염', category:'spine', severity:'moderate' },
    // 어깨(6)
    { id:'rotator_cuff_tendinopathy', name:'회전근개 건병증', category:'shoulder', severity:'moderate' },
    { id:'subacromial_pain_syndrome', name:'견봉하 통증증후군(SAPS)', category:'shoulder', severity:'moderate' },
    { id:'glenohumeral_instability', name:'견관절 불안정성', category:'shoulder', severity:'moderate' },
    { id:'adhesive_capsulitis', name:'유착성 관절낭염(오십견)', category:'shoulder', severity:'moderate' },
    { id:'ac_joint_arthropathy', name:'견쇄관절 병증', category:'shoulder', severity:'mild' },
    { id:'swimmer_shoulder_overuse', name:'수영선수 어깨 과사용', category:'shoulder', severity:'moderate' },
    // 팔꿈치(2)
    { id:'lateral_epicondylalgia', name:'외측 상과 건병증(테니스엘보우)', category:'elbow', severity:'moderate' },
    { id:'medial_epicondylitis', name:'내측 상과염(골프엘보우)', category:'elbow', severity:'mild' },
    // 손목/손(3)
    { id:'carpal_tunnel_syndrome', name:'수근관증후군', category:'wrist', severity:'mild' },
    { id:'de_quervain_tenosynovitis', name:'드퀘르벵 건초염', category:'wrist', severity:'mild' },
    { id:'tfcc_injury', name:'TFCC 손상', category:'wrist', severity:'moderate' },
    // 고관절(4)
    { id:'hip_osteoarthritis', name:'고관절 골관절염', category:'hip', severity:'moderate' },
    { id:'femoroacetabular_impingement', name:'대퇴비구 충돌증후군(FAI)', category:'hip', severity:'moderate' },
    { id:'acetabular_labral_tear', name:'고관절 관절순 파열', category:'hip', severity:'moderate' },
    { id:'post_total_hip_arthroplasty', name:'고관절 치환술 후(의료진 지시 하)', category:'hip', severity:'mild' },
    // 무릎(4)
    { id:'knee_osteoarthritis', name:'무릎 골관절염', category:'knee', severity:'moderate' },
    { id:'meniscal_tear', name:'반월상연골 손상', category:'knee', severity:'moderate' },
    { id:'knee_ligament_injury', name:'무릎 인대 손상(ACL/MCL 등)', category:'knee', severity:'moderate' },
    { id:'patellofemoral_pain', name:'무릎 앞통증 증후군(PFPS)', category:'knee', severity:'mild' },
    // 발목/발(4)
    { id:'acute_lateral_ankle_sprain', name:'급성 가쪽 발목 염좌', category:'ankle', severity:'moderate' },
    { id:'chronic_ankle_instability', name:'만성 발목 불안정성', category:'ankle', severity:'moderate' },
    { id:'achilles_tendinopathy', name:'아킬레스건병증', category:'ankle', severity:'moderate' },
    { id:'plantar_fasciitis', name:'족저근막염', category:'ankle', severity:'mild' },
  ] as Array<{id:string;name:string;category:keyof typeof T;severity:"mild"|"moderate"|"severe"}>;

  const overrides: Record<string, Partial<Record<Stroke, Partial<StrokeRule>>>> = {
    lumbar_disc_herniation: { backstroke:{ level:"safe" }, butterfly:{ level:"avoid" } },
    lumbar_spinal_stenosis: { butterfly:{ level:"avoid" } },
    cervical_radiculopathy: { backstroke:{ level:"safe", reason:"경추 중립 용이" }, butterfly:{ level:"avoid" } },

    glenohumeral_instability: { freestyle:{ level:"caution", reason:"전방/후방 불안정성", prohibitedMovements:["후방 과신전 리커버리","패들"] }, butterfly:{ level:"avoid" } },
    adhesive_capsulitis: { freestyle:{ level:"caution", reason:"ROM 제한" }, backstroke:{ level:"safe" }, butterfly:{ level:"avoid" } },
    ac_joint_arthropathy: { freestyle:{ level:"caution", reason:"가슴 앞모으기 스컬 회피" }, butterfly:{ level:"avoid" } },
    swimmer_shoulder_overuse: { freestyle:{ level:"caution", reason:"볼륨/밀도 과다 관리" }, butterfly:{ level:"avoid" } },

    lateral_epicondylalgia: { freestyle:{ level:"caution", prohibitedMovements:["패들","하이케이던스"] }, butterfly:{ level:"avoid" } },
    medial_epicondylitis: { freestyle:{ level:"caution" }, butterfly:{ level:"avoid" } },

    tfcc_injury: { freestyle:{ level:"caution", prohibitedMovements:["척측 편위 하중","강한 스컬"] } },

    femoroacetabular_impingement: { breaststroke:{ level:"caution", prohibitedMovements:["넓은 개구리킥","말기 스냅"] }, butterfly:{ level:"avoid" } },
    acetabular_labral_tear: { breaststroke:{ level:"caution" }, butterfly:{ level:"avoid" } },
    post_total_hip_arthroplasty: { freestyle:{ level:"safe", modifications:["초기 외전/내회전 제한 준수"] }, breaststroke:{ level:"caution" }, butterfly:{ level:"avoid" } },

    knee_ligament_injury: { breaststroke:{ level:"avoid", reason:"개구리킥 전/후방 전단" } },
    patellofemoral_pain: { breaststroke:{ level:"caution", prohibitedMovements:["넓은 외전"] } },

    acute_lateral_ankle_sprain: { breaststroke:{ level:"avoid" }, butterfly:{ level:"avoid" }, freestyle:{ level:"caution", modifications:["풀부이로 킥 제외"] } },
    chronic_ankle_instability: { breaststroke:{ level:"avoid" } },
    achilles_tendinopathy: { freestyle:{ level:"caution", prohibitedMovements:["핀","강한 플랜타플렉션"] }, butterfly:{ level:"avoid" } },
    plantar_fasciitis: { freestyle:{ level:"caution", prohibitedMovements:["강한 푸시오프","핀"] }, butterfly:{ level:"avoid" } },
  };

  return meta.map(m => {
    const base = JSON.parse(JSON.stringify(T[m.category])) as Record<Stroke, StrokeRule>;
    const catE = EV[m.category] || [];
    (Object.keys(base) as Stroke[]).forEach(st => { base[st].evidenceIds = catE; });
    const ov = overrides[m.id] || {};
    (Object.keys(ov) as Stroke[]).forEach(st => { Object.assign(base[st], ov[st]); });
    return { id:m.id, name:m.name, category:m.category as Category, severity:m.severity as any, strokeGuide: base } as ConditionGuideline;
  });
}

// ========================= 처방 엔진 =========================
function buildPlan(ctx: AthleteContext, lib: ConditionGuideline[]): { sets: SetSpec[]; totalMeters: number; totalRestSec: number } {
  const safety = foldSafety(ctx.conditionIds, lib);
  const goalToZone: Record<Goal, Zone[]> = {
    ENDURANCE: ["EN2","EN1","EN3"],
    THRESHOLD: ["EN3","EN2"],
    VO2MAX: ["Z4","EN3"],
    SPRINT: ["Z5","Z4"],
  };
  let zones = goalToZone[ctx.goal];
  if (safety.zoneCap) zones = zones.filter(z => {
    const ord = (x: Zone) => x === "Z5" ? 5 : x === "Z4" ? 4 : x === "EN3" ? 3 : x === "EN2" ? 2 : 1;
    return ord(z) <= ord(safety.zoneCap as Zone);
  });
  if (zones.length === 0) zones = ["EN2"]; // 보수적 기본

  const css = ctx.cssPer100;
  const baseRep = ctx.poolLength; // 25m or 50m

  const targetMainMinutes = Math.max(10, Math.min(35, ctx.sessionMinutes - 10)); // WU/CD 제외
  const sets: SetSpec[] = [];

  for (const z of zones) {
    const paceRange = PACE_OFFSETS[z];
    const pacePer100 = z === "Z5" ? undefined : Math.round(css + (paceRange.min + paceRange.max) / 2);
    const repTime = z === "Z5" ? Math.round((ctx.poolLength / 100) * (Math.max(20, css - 6))) : Math.round((baseRep / 100) * (pacePer100 || css));
    const rest = restFor(z, repTime, safety.restBonus);

    const cycle = repTime + rest;
    const reps = Math.max(4, Math.min(24, Math.round((targetMainMinutes * 60) / Math.max(20, cycle))));

    const fallback: Stroke = "freestyle";
    const stroke: Stroke = safety.avoid["butterfly"] && z !== "Z5" ? "backstroke" : fallback;

    sets.push({
      reps,
      distance: baseRep,
      stroke,
      zone: z,
      pacePer100,
      targetRepeatSec: repTime,
      restSec: rest,
      methodId: z === "EN2" ? "even" : z === "EN3" ? "threshold" : z === "Z4" ? "vo2" : z === "Z5" ? "sprint_quality" : "descend",
      notes: safety.notes,
      rationale: {
        distanceWhy: `${baseRep}m 단위는 페이스 유지·측정 용이(페이스 클록/길이 기반).`,
        paceWhy: z === "Z5" ? "스프린트는 지정 페이스 대신 최고속 추구." : `CSS 대비 ${PACE_OFFSETS[z].min}~${PACE_OFFSETS[z].max}″/100m 범위에서 ${z} 생리대상 유지.`,
        restWhy: `반복시간 ${repTime}s와 ${z} 특성에 따라 r${rest}s (누적 품질·대사목표 균형).`,
        methodWhy: METHOD_LABEL[z === "EN2" ? "even" : z === "EN3" ? "threshold" : z === "Z4" ? "vo2" : z === "Z5" ? "sprint_quality" : "descend"],
        safetyWhy: safety.notes,
        references: safety.evidenceUrls,
      },
    });
  }

  const totalMeters = sets.reduce((a, s) => a + s.reps * s.distance, 0);
  const totalRestSec = sets.reduce((a, s) => a + (s.restSec || 0) * s.reps, 0);
  return { sets, totalMeters, totalRestSec };
}

// ========================= UI 컴포넌트 =========================
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    {children}
  </section>
);

const Badge: React.FC<{ level: SafetyLevel }> = ({ level }) => {
  const cls = level === "safe" ? "bg-green-100 text-green-800"
    : level === "caution" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800";
  const label = level === "safe" ? "SAFE" : level === "caution" ? "CAUTION" : "AVOID";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>;
};

function urlOf(id: string): string | undefined { return EVIDENCE.find(e => e.id === id)?.url; }

const ConditionCard: React.FC<{ c: ConditionGuideline }> = ({ c }) => (
  <div className="rounded-2xl shadow p-4 bg-white border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <div>
        <div className="text-base font-semibold">{c.name}</div>
        <div className="text-xs text-slate-500">{c.category}</div>
      </div>
      <div className="text-xs px-2 py-0.5 rounded bg-slate-100">{c.severity}</div>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm">
      {(Object.keys(c.strokeGuide) as Stroke[]).map((s) => (
        <div key={s} className="flex items-start gap-2 p-2 rounded bg-slate-50">
          <div className="w-28 text-slate-600">{s}</div>
          <div className="flex-1">
            <Badge level={c.strokeGuide[s].level} />
            <div className="text-slate-600 mt-1">{c.strokeGuide[s].reason}</div>
          </div>
        </div>
      ))}
    </div>
    <details className="mt-3">
      <summary className="cursor-pointer text-sm text-slate-700">자세히 / 근거</summary>
      <div className="text-sm mt-2 space-y-1">
        <div className="text-slate-700">공통 수정: {(new Set((Object.values(c.strokeGuide).flatMap(v => v.modifications)))).size > 0 ? Array.from(new Set(Object.values(c.strokeGuide).flatMap(v => v.modifications))).join(", ") : "—"}</div>
        <div className="text-slate-700">근거: {Array.from(new Set(Object.values(c.strokeGuide).flatMap(v => v.evidenceIds))).map(e => <a key={e} href={urlOf(e)} target="_blank" rel="noreferrer" className="text-sky-700 underline mr-2">{e}</a>)}</div>
      </div>
    </details>
  </div>
);

const CoachPrompts: React.FC<{ ctx: AthleteContext; libCount: number }> = ({ ctx, libCount }) => {
  const q1 = `Q1) ${ctx.goal} 목표에서 세트 밀도를 더 올려도 안전할까? (선택 질환 고려, 현재 ${ctx.sessionMinutes}분/주 ${ctx.weeklySessions}회)`;
  const q2 = `Q2) CSS 재평가가 필요할까? (입력 ${secToPace100(ctx.cssPer100)}/100m, 최근 기록과 비교)`;
  const q3 = `Q3) 라이브러리(${libCount}개) 중 내 케이스에 추가해야 할 질환/상황이 있을까?`;
  return (
    <div className="mt-4 p-3 rounded-lg bg-sky-50 border border-sky-200 text-sm">
      <div className="font-semibold mb-2">코치 질문(추천)</div>
      <ul className="list-disc pl-5 space-y-1">
        <li>{q1}</li>
        <li>{q2}</li>
        <li>{q3}</li>
      </ul>
    </div>
  );
};

const PlannerPanel: React.FC<{ lib: ConditionGuideline[] }> = ({ lib }) => {
  const [poolLength, setPoolLength] = useState<PoolLength>(25);
  const [cssText, setCssText] = useState("1:40");
  const [weekly, setWeekly] = useState(3);
  const [minutes, setMinutes] = useState(40);
  const [goal, setGoal] = useState<Goal>("ENDURANCE");
  const [selected, setSelected] = useState<string[]>([]);

  const ctx: AthleteContext = useMemo(() => ({
    poolLength, cssPer100: mmssToSec(cssText), racePacePer100: undefined,
    weeklySessions: weekly, sessionMinutes: minutes, goal, conditionIds: selected,
  }), [poolLength, cssText, weekly, minutes, goal, selected]);

  const { sets, totalMeters, totalRestSec } = useMemo(() => buildPlan(ctx, lib), [ctx, lib]);

  const copySet = (s: SetSpec) => {
    const txt = `${s.reps}×${s.distance} ${s.stroke} [${s.zone}] @ ${s.pacePer100?secToPace100(s.pacePer100):"최고속"}/100, r${s.restSec}" — ${METHOD_LABEL[s.methodId]}`;
    navigator.clipboard?.writeText(txt);
  };

  return (
    <div className="rounded-2xl bg-white shadow p-4 border border-slate-200">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">풀 길이</label>
          <select value={poolLength} onChange={e=>setPoolLength(Number(e.target.value) as PoolLength)} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value={25}>25m</option>
            <option value={50}>50m</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">CSS (100m)</label>
          <input value={cssText} onChange={e=>setCssText(e.target.value)} placeholder="1:40" className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"/>
        </div>
        <div>
          <label className="text-sm font-medium">주당 횟수 / 세션 시간</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input type="number" min={1} max={10} value={weekly} onChange={e=>setWeekly(Number(e.target.value))} className="px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400"/>
            <input type="number" min={20} max={120} value={minutes} onChange={e=>setMinutes(Number(e.target.value))} className="px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400"/>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">목표</label>
          <select value={goal} onChange={e=>setGoal(e.target.value as Goal)} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="ENDURANCE">지구력(EN)</option>
            <option value="THRESHOLD">임계 템포</option>
            <option value="VO2MAX">VO₂max</option>
            <option value="SPRINT">스프린트</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">건강/질환 선택(여러 개)</label>
          <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-auto p-2 bg-slate-50 rounded-md border border-slate-200">
            {lib.map(c => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.includes(c.id)} onChange={()=> setSelected(s => s.includes(c.id) ? s.filter(x=>x!==c.id) : [...s, c.id])} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">메인 세트(자동 산출) — 총 {totalMeters} m, 휴식 {Math.round(totalRestSec/60)} 분</h3>
        <div className="space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">{s.reps}×{s.distance} {s.stroke} [{s.zone}]</span>
                <span className="text-slate-600">@ {s.pacePer100 ? secToPace100(s.pacePer100) : "최고속"} /100m</span>
                <span className="text-slate-600">r{s.restSec}"</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700">{METHOD_LABEL[s.methodId] || s.methodId}</span>
                <button onClick={()=>copySet(s)} className="ml-auto text-xs px-2 py-1 rounded bg-sky-600 text-white">복사</button>
              </div>
              <details className="mt-1">
                <summary className="text-xs text-slate-700 cursor-pointer">왜(WHY)? 클릭</summary>
                <div className="mt-2 text-sm space-y-1">
                  <div>거리: {s.rationale.distanceWhy}</div>
                  <div>페이스: {s.rationale.paceWhy}</div>
                  <div>휴식: {s.rationale.restWhy}</div>
                  <div>훈련법: {s.rationale.methodWhy}</div>
                  {s.rationale.safetyWhy.length > 0 && <div>안전: {s.rationale.safetyWhy.join(", ")}</div>}
                  {s.rationale.references.length > 0 && (
                    <div>근거: {s.rationale.references.map((u, idx) => <a key={idx} href={u} target="_blank" rel="noreferrer" className="text-sky-700 underline mr-2">ref{idx+1}</a>)}</div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>

      <CoachPrompts ctx={ctx} libCount={lib.length} />
    </div>
  );
};

const LibraryPanel: React.FC<{ lib: ConditionGuideline[]; onAdd: (arr: ConditionGuideline[]) => void }> = ({ lib, onAdd }) => {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => lib.filter(c => (c.name+" "+c.category).toLowerCase().includes(q.toLowerCase())), [lib, q]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result)) as ConditionGuideline[];
        onAdd(arr);
      } catch (_err) {
        alert("JSON 파싱 실패 — 스키마를 확인하세요(ConditionGuideline[]).");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl bg-white shadow p-4 border border-slate-200">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold">조건 라이브러리(샘플 + 업로드 + 내장 Joint-28)</h3>
        <label className="text-sm px-3 py-1 rounded bg-sky-600 text-white cursor-pointer">
          JSON 업로드<input type="file" accept="application/json" className="hidden" onChange={onUpload} />
        </label>
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="검색(이름/카테고리)" className="w-full mb-3 px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400"/>
      <div className="grid md:grid-cols-2 gap-3 max-h-[520px] overflow-auto">
        {filtered.map(c => <ConditionCard key={c.id} c={c} />)}
      </div>
    </div>
  );
};

// ========================= 메인 앱 =========================
const SwimHealthPlanner: React.FC = () => {
  const [lib, addLib, replaceAll] = useConditionLibrary();

  // 내장 Joint-28 자동 병합(최초 1회)
  useEffect(() => {
    const joint = buildJoint28();
    addLib(joint);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 간단 검증 테스트(콘솔)
  useEffect(() => {
    const okSix = lib.every(c => Object.keys(c.strokeGuide).length === 6);
    console.assert(okSix, "[TEST] 각 조건은 6영법을 모두 포함해야 합니다.");
  }, [lib]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">JJ Swim Lab — 질환×영법 안전도 + 개인화 처방</h1>
        <nav className="text-sm text-slate-600">데이터 확장: JSON 업로드 / 내장 Joint-28 포함</nav>
      </header>

      <Section title="1) 개인 정보·목표">
        <PlannerPanel lib={lib} />
      </Section>

      <Section title="2) 조건 라이브러리">
        <LibraryPanel lib={lib} onAdd={addLib} />
      </Section>

      <footer className="text-xs text-slate-500 pt-4 border-t">
        출처 예시: {EVIDENCE.map(e => <a key={e.id} href={e.url} target="_blank" rel="noreferrer" className="underline mr-2">{e.label}</a>)}
      </footer>
    </div>
  );
};

export default SwimHealthPlanner;
