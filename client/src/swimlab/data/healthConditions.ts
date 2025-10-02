/**
 * SwimLab PRO Kit Q3 - 건강·질환 규칙 데이터
 * 
 * 관절계, 피부, 일반질환, 정신, 특수상황별 안전 규칙과 조정 사항
 */

import { HealthCondition } from '../types';

export const HEALTH_CONDITIONS: HealthCondition[] = [
  // 관절계 질환
  {
    id: "lumbar_disc_herniation",
    name: "요추 추간판탈출증(허리디스크)",
    category: "joint",
    severity: "moderate",
    impacts: {
      technique: "접영 회피, 배영 권장",
      volume: "볼륨 20% 감소",
      intensity: "Z3 이하로 제한",
      rest: "휴식 +15초",
      contraindication: "요추 신전 동작 금지"
    },
    adjustments: {
      cap: "Z3",
      restBonus: 15,
      avoid: { butterfly: true },
      notes: ["접영 회피", "배영 권장", "스노클로 경추 회전/신전 감소"],
      evidenceIds: ["JOSPT_LBP_2021", "JAMA_Aquatic_LBP_2022"]
    },
    description: "요추 추간판이 탈출되어 신경을 압박하는 질환"
  },
  {
    id: "lumbar_spinal_stenosis",
    name: "요추관협착증",
    category: "joint",
    severity: "moderate",
    impacts: {
      technique: "접영 회피, 중립 척추 유지",
      volume: "볼륨 15% 감소",
      intensity: "Z3 이하로 제한",
      rest: "휴식 +10초",
      contraindication: "척추 신전 동작 제한"
    },
    adjustments: {
      cap: "Z3",
      restBonus: 10,
      avoid: { butterfly: true },
      notes: ["접영 회피", "중립 척추 유지"],
      evidenceIds: ["JOA_LSS_2021"]
    },
    description: "요추관이 좁아져 신경이 압박받는 질환"
  },
  {
    id: "patellofemoral_pain",
    name: "무릎 앞통증 증후군(PFPS)",
    category: "joint",
    severity: "mild",
    impacts: {
      technique: "평영킥 범위 축소",
      volume: "볼륨 10% 감소",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "넓은 외전 킥 회피"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      avoid: { breaststroke: true },
      notes: ["평영킥 범위 축소", "넓은 외전 킥 회피"],
      evidenceIds: ["JOSPT_PFPS_2019"]
    },
    description: "무릎 앞쪽 통증을 일으키는 질환"
  },
  {
    id: "knee_ligament_injury",
    name: "무릎 인대 손상(ACL/MCL 등)",
    category: "joint",
    severity: "moderate",
    impacts: {
      technique: "평영킥 완전 회피",
      volume: "볼륨 30% 감소",
      intensity: "Z3 이하로 제한",
      rest: "휴식 +20초",
      contraindication: "개구리킥 전/후방 전단 금지"
    },
    adjustments: {
      cap: "Z3",
      restBonus: 20,
      avoid: { breaststroke: true },
      notes: ["평영킥 완전 회피", "개구리킥 전/후방 전단 금지"],
      evidenceIds: ["JOSPT_KneeLig_2017"]
    },
    description: "무릎 인대가 손상된 상태"
  },
  {
    id: "meniscal_tear",
    name: "반월상연골 손상",
    category: "joint",
    severity: "moderate",
    impacts: {
      technique: "평영킥 회피, 무릎 회전 제한",
      volume: "볼륨 25% 감소",
      intensity: "Z3 이하로 제한",
      rest: "휴식 +15초",
      contraindication: "무릎 회전 동작 금지"
    },
    adjustments: {
      cap: "Z3",
      restBonus: 15,
      avoid: { breaststroke: true },
      notes: ["평영킥 회피", "무릎 회전 제한"],
      evidenceIds: ["JOSPT_Meniscus_2018"]
    },
    description: "무릎 반월상연골이 손상된 상태"
  },
  {
    id: "achilles_tendinopathy",
    name: "아킬레스건병증",
    category: "joint",
    severity: "moderate",
    impacts: {
      technique: "핀 제한, 강한 플랜타플렉션 회피",
      volume: "볼륨 20% 감소",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +15초",
      contraindication: "돌핀킥 강도 제한"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 15,
      avoid: { butterfly: true },
      notes: ["핀 제한", "강한 플랜타플렉션 회피", "돌핀킥 강도 제한"],
      evidenceIds: ["JOSPT_Achilles_2024"]
    },
    description: "아킬레스건에 염증이 생긴 상태"
  },
  {
    id: "plantar_fasciitis",
    name: "족저근막염",
    category: "joint",
    severity: "mild",
    impacts: {
      technique: "강한 푸시오프 회피",
      volume: "볼륨 10% 감소",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "핀 사용 금지"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      avoid: { butterfly: true },
      notes: ["강한 푸시오프 회피", "핀 사용 금지"],
      evidenceIds: ["JOSPT_PlantarFascia_2023"]
    },
    description: "발바닥 근막에 염증이 생긴 상태"
  },
  {
    id: "axial_spondyloarthritis",
    name: "축성 척추관절염",
    category: "joint",
    severity: "moderate",
    impacts: {
      technique: "접영 회피, 척추 유연성 운동",
      volume: "볼륨 15% 감소",
      intensity: "Z3 이하로 제한",
      rest: "휴식 +10초",
      contraindication: "척추 강직 동작 제한"
    },
    adjustments: {
      cap: "Z3",
      restBonus: 10,
      avoid: { butterfly: true },
      notes: ["접영 회피", "척추 유연성 운동"],
      evidenceIds: ["AXSPA_EULAR_2022"]
    },
    description: "척추와 천장관절에 염증이 생기는 질환"
  },

  // 피부 질환
  {
    id: "open_wound",
    name: "미치유 상처/거즈로 덮기 어려운 상처",
    category: "skin",
    severity: "moderate",
    impacts: {
      technique: "공공수영장 금지",
      volume: "수영 완전 금지",
      intensity: "수영 완전 금지",
      rest: "수영 완전 금지",
      contraindication: "감염 위험"
    },
    adjustments: {
      avoid: { freestyle: true, backstroke: true, breaststroke: true, butterfly: true, elementary_backstroke: true, sidestroke: true },
      notes: ["공공수영장 감염/오염 위험", "상처 치유 전 회피"],
      evidenceIds: ["CDC_Wounds", "WHO_Pools"]
    },
    description: "치유되지 않은 상처로 인한 감염 위험"
  },
  {
    id: "diarrheal_illness",
    name: "설사성 질환 또는 크립토스포리디움 의심",
    category: "skin",
    severity: "severe",
    impacts: {
      technique: "수영 완전 금지",
      volume: "수영 완전 금지",
      intensity: "수영 완전 금지",
      rest: "수영 완전 금지",
      contraindication: "대변-수계 전파 위험"
    },
    adjustments: {
      avoid: { freestyle: true, backstroke: true, breaststroke: true, butterfly: true, elementary_backstroke: true, sidestroke: true },
      notes: ["대변-수계 전파 방지", "증상 소실 후 2주 회피"],
      evidenceIds: ["CDC_Diarrhea"]
    },
    description: "설사성 질환으로 인한 수계 전파 위험"
  },

  // 일반 질환
  {
    id: "hypertension",
    name: "고혈압",
    category: "general",
    severity: "moderate",
    impacts: {
      technique: "무호흡 스프린트 금지",
      volume: "EN1-EN3 중심",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "과도한 혈압 상승 회피"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      notes: ["EN1-EN3 중심", "무호흡 스프린트 금지", "과도한 혈압 상승 회피"],
      evidenceIds: ["ADA_2025_PA"]
    },
    description: "혈압이 정상보다 높은 상태"
  },
  {
    id: "diabetes",
    name: "당뇨",
    category: "general",
    severity: "moderate",
    impacts: {
      technique: "저혈당 대처 준비",
      volume: "규칙적 운동",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "발상태 점검 필수"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      notes: ["저혈당 대처", "발상태 점검", "규칙적 운동"],
      evidenceIds: ["ADA_2025_PA"]
    },
    description: "혈당 조절이 필요한 상태"
  },
  {
    id: "asthma",
    name: "천식",
    category: "general",
    severity: "mild",
    impacts: {
      technique: "준비운동 필수",
      volume: "점진적 증가",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "SABA 사전사용"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      notes: ["준비운동 필수", "SABA 사전사용", "점진적 증가"],
      evidenceIds: ["GINA_Exercise"]
    },
    description: "기도 염증으로 인한 호흡곤란"
  },
  {
    id: "pregnancy",
    name: "임신",
    category: "general",
    severity: "mild",
    impacts: {
      technique: "과열 방지",
      volume: "적당한 강도 유지",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "미끄럼 주의"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      notes: ["과열 방지", "미끄럼 주의", "적당한 강도 유지"],
      evidenceIds: ["ACOG_Pregnancy_Exercise"]
    },
    description: "임신 중 안전한 운동"
  },

  // 정신 건강
  {
    id: "depression",
    name: "우울",
    category: "mental",
    severity: "mild",
    impacts: {
      technique: "규칙적 운동",
      volume: "EN1-EN2 중심",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "과도한 피로 회피"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      notes: ["규칙적 운동", "EN1-EN2 중심", "과도한 피로 회피"],
      evidenceIds: []
    },
    description: "우울감으로 인한 운동 동기 저하"
  },
  {
    id: "anxiety",
    name: "불안",
    category: "mental",
    severity: "mild",
    impacts: {
      technique: "안정적인 환경",
      volume: "EN1-EN2 중심",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +5초",
      contraindication: "스트레스 상황 회피"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 5,
      notes: ["안정적인 환경", "EN1-EN2 중심", "스트레스 상황 회피"],
      evidenceIds: []
    },
    description: "불안감으로 인한 운동 제약"
  },

  // 특수 상황
  {
    id: "openwater_beginner",
    name: "오픈워터 입문",
    category: "special",
    severity: "mild",
    impacts: {
      technique: "안전 장비 착용",
      volume: "짧은 거리부터",
      intensity: "Z4 이하로 제한",
      rest: "휴식 +10초",
      contraindication: "혼자 수영 금지"
    },
    adjustments: {
      cap: "Z4",
      restBonus: 10,
      notes: ["안전 장비 착용", "짧은 거리부터", "혼자 수영 금지"],
      evidenceIds: []
    },
    description: "오픈워터 수영 초보자"
  },
  {
    id: "cold_water",
    name: "저수온",
    category: "special",
    severity: "moderate",
    impacts: {
      technique: "적응 시간 필요",
      volume: "볼륨 20% 감소",
      intensity: "Z3 이하로 제한",
      rest: "휴식 +15초",
      contraindication: "저체온증 주의"
    },
    adjustments: {
      cap: "Z3",
      restBonus: 15,
      notes: ["적응 시간 필요", "저체온증 주의", "볼륨 20% 감소"],
      evidenceIds: []
    },
    description: "저수온 환경에서의 수영"
  }
];





