/**
 * SwimProgramGenerator.tsx — JJ Swim Lab (A/B 비교 + 마스터즈 기준 연동)
 * 
 * 목표:
 * 1) A/B 비교: 나이/성별/코스/세션시간/주당횟수/질환/특수상황/목표를 좌우로 비교
 * 2) 마스터즈 기준 연동: CSV 업로드로 연령대별 기준 기록(국내·국제) 반영
 * 3) 질환/특수상황 반영: 안전보정 → 휴식 가산·세트 대체 → 즉시 반영
 * 4) 드릴/훈련법 추천: 목표 + 영법별 약점에 맞춰 자동 추천
 * 5) CSV 병합: 여러 CSV 업로드로 기준 병합
 * 
 * 사용법:
 * - 이 파일을 src/ 폴더에 넣고 App에서 <SwimProgramGenerator/> 렌더
 * - data/masters-anchor-template.csv를 data/ 폴더에 넣기
 * - CSV 업로드 버튼으로 마스터즈 기준 추가 업로드
 */

import React, { useState, useEffect, useMemo } from 'react';

// ========================= 타입 정의 =========================
type Stroke = "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "elementary_backstroke" | "sidestroke";
type SafetyLevel = "safe" | "caution" | "avoid";
type Goal = "ENDURANCE" | "THRESHOLD" | "VO2MAX" | "SPRINT";
type Zone = "EN1" | "EN2" | "EN3" | "Z4" | "Z5";
type PoolLength = 25 | 50;

interface AthleteProfile {
  age: number;
  sex: "male" | "female";
  course: "25m" | "50m";
  sessionMinutes: number;
  weeklySessions: number;
  conditions: string[];
  specialSituations: string[];
  goal: Goal;
  cssPer100: number; // 초/100m
}

interface MastersStandard {
  ageGroup: string;
  sex: "male" | "female";
  stroke: Stroke;
  distance: number;
  time: number; // 초
  country: "domestic" | "international";
}

interface SetSpec {
  reps: number;
  distance: number;
  stroke: Stroke;
  zone: Zone;
  pacePer100: number;
  restSec: number;
  methodId: string;
  rationale: {
    distanceWhy: string;
    paceWhy: string;
    restWhy: string;
    methodWhy: string;
    safetyWhy: string[];
  };
}

interface DrillRecommendation {
  id: string;
  name: string;
  description: string;
  strokes: Stroke[];
  benefits: string[];
  whenToUse: string;
}

// ========================= 마스터즈 기준 데이터 =========================
const DEFAULT_MASTERS_STANDARDS: MastersStandard[] = [
  // 25-29 남성 (국내 기준)
  { ageGroup: "25-29", sex: "male", stroke: "freestyle", distance: 100, time: 65, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "freestyle", distance: 200, time: 140, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "freestyle", distance: 400, time: 300, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "backstroke", distance: 100, time: 70, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "backstroke", distance: 200, time: 150, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "breaststroke", distance: 100, time: 75, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "breaststroke", distance: 200, time: 160, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "butterfly", distance: 100, time: 70, country: "domestic" },
  { ageGroup: "25-29", sex: "male", stroke: "butterfly", distance: 200, time: 155, country: "domestic" },
  
  // 25-29 여성 (국내 기준)
  { ageGroup: "25-29", sex: "female", stroke: "freestyle", distance: 100, time: 75, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "freestyle", distance: 200, time: 160, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "freestyle", distance: 400, time: 340, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "backstroke", distance: 100, time: 80, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "backstroke", distance: 200, time: 170, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "breaststroke", distance: 100, time: 85, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "breaststroke", distance: 200, time: 180, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "butterfly", distance: 100, time: 80, country: "domestic" },
  { ageGroup: "25-29", sex: "female", stroke: "butterfly", distance: 200, time: 175, country: "domestic" },
  
  // 30-34 남성 (국내 기준)
  { ageGroup: "30-34", sex: "male", stroke: "freestyle", distance: 100, time: 68, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "freestyle", distance: 200, time: 145, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "freestyle", distance: 400, time: 310, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "backstroke", distance: 100, time: 73, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "backstroke", distance: 200, time: 155, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "breaststroke", distance: 100, time: 78, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "breaststroke", distance: 200, time: 165, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "butterfly", distance: 100, time: 73, country: "domestic" },
  { ageGroup: "30-34", sex: "male", stroke: "butterfly", distance: 200, time: 160, country: "domestic" },
  
  // 30-34 여성 (국내 기준)
  { ageGroup: "30-34", sex: "female", stroke: "freestyle", distance: 100, time: 78, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "freestyle", distance: 200, time: 165, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "freestyle", distance: 400, time: 350, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "backstroke", distance: 100, time: 83, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "backstroke", distance: 200, time: 175, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "breaststroke", distance: 100, time: 88, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "breaststroke", distance: 200, time: 185, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "butterfly", distance: 100, time: 83, country: "domestic" },
  { ageGroup: "30-34", sex: "female", stroke: "butterfly", distance: 200, time: 180, country: "domestic" },
];

// ========================= 질환별 안전 규칙 =========================
const SAFETY_RULES: Record<string, { restBonus: number; zoneCap?: Zone; strokeAvoid: Partial<Record<Stroke, boolean>>; notes: string[] }> = {
  "허리디스크": { restBonus: 5, zoneCap: "Z4", strokeAvoid: { butterfly: true }, notes: ["접영 회피", "배영 권장"] },
  "어깨충돌증후군": { restBonus: 5, zoneCap: "Z4", strokeAvoid: { butterfly: true }, notes: ["패들 제한", "평영 권장"] },
  "무릎관절염": { restBonus: 5, zoneCap: "Z4", strokeAvoid: { breaststroke: true }, notes: ["평영킥 회피", "자유형 권장"] },
  "발목염좌": { restBonus: 5, zoneCap: "Z4", strokeAvoid: { breaststroke: true, butterfly: true }, notes: ["핀 제한", "돌핀킥 회피"] },
  "고혈압": { restBonus: 0, notes: ["EN1-EN3 중심", "무호흡 스프린트 금지"] },
  "당뇨": { restBonus: 0, notes: ["저혈당 대처", "발상태 점검"] },
  "천식": { restBonus: 0, notes: ["준비운동 필수", "SABA 사전사용"] },
  "임신": { restBonus: 0, notes: ["과열 방지", "미끄럼 주의"] },
};

// ========================= 드릴 추천 데이터 =========================
const DRILL_RECOMMENDATIONS: DrillRecommendation[] = [
  {
    id: "catch-up",
    name: "캐치업 드릴",
    description: "한 팔이 완전히 앞으로 나간 후 다른 팔 시작",
    strokes: ["freestyle"],
    benefits: ["풀링 효율성 향상", "균형감 개발"],
    whenToUse: "자유형 풀링이 약한 경우, 지구력 향상 목표"
  },
  {
    id: "fist-swim",
    name: "주먹 수영",
    description: "주먹을 쥐고 수영하여 전완부 감각 향상",
    strokes: ["freestyle", "backstroke"],
    benefits: ["전완부 감각 향상", "풀링 효율성 증가"],
    whenToUse: "전완부 감각이 부족한 경우, 풀링 기술 향상 목표"
  },
  {
    id: "sculling",
    name: "스컬링",
    description: "팔을 좌우로 움직이며 추진력 생성",
    strokes: ["breaststroke", "butterfly"],
    benefits: ["스컬링 기술 향상", "상체 안정성 증가"],
    whenToUse: "평영/접영 스컬링이 약한 경우, 상체 강화 목표"
  },
  {
    id: "kick-board",
    name: "킥보드 킥킹",
    description: "킥보드를 잡고 킥만으로 수영",
    strokes: ["freestyle", "backstroke", "breaststroke"],
    benefits: ["하체 강화", "킥 기술 향상"],
    whenToUse: "킥이 약한 경우, 하체 강화 목표"
  },
  {
    id: "pull-buoy",
    name: "풀부이 풀링",
    description: "풀부이를 끼고 팔만으로 수영",
    strokes: ["freestyle", "backstroke"],
    benefits: ["상체 강화", "풀링 기술 향상"],
    whenToUse: "상체가 약한 경우, 풀링 기술 향상 목표"
  }
];

// ========================= 유틸리티 함수 =========================
function getAgeGroup(age: number): string {
  if (age < 25) return "18-24";
  if (age < 30) return "25-29";
  if (age < 35) return "30-34";
  if (age < 40) return "35-39";
  if (age < 45) return "40-44";
  if (age < 50) return "45-49";
  if (age < 55) return "50-54";
  if (age < 60) return "55-59";
  if (age < 65) return "60-64";
  if (age < 70) return "65-69";
  if (age < 75) return "70-74";
  return "75+";
}

function estimateCSSFromMasters(age: number, sex: "male" | "female", standards: MastersStandard[]): number {
  const ageGroup = getAgeGroup(age);
  const freestyle100 = standards.find(s => 
    s.ageGroup === ageGroup && 
    s.sex === sex && 
    s.stroke === "freestyle" && 
    s.distance === 100
  );
  
  if (freestyle100) {
    // 100m 기록을 100m 페이스로 변환 (기록의 85-90% 수준이 CSS)
    return Math.round(freestyle100.time * 0.875);
  }
  
  // 기본값 (나이/성별별 추정)
  const baseCSS = sex === "male" ? 70 : 80;
  const ageFactor = Math.max(0.7, 1 - (age - 25) * 0.01);
  return Math.round(baseCSS * ageFactor);
}

function buildTrainingPlan(profile: AthleteProfile, standards: MastersStandard[]): SetSpec[] {
  const safety = profile.conditions.reduce((acc, condition) => {
    const rule = SAFETY_RULES[condition];
    if (rule) {
      acc.restBonus += rule.restBonus;
      if (rule.zoneCap) acc.zoneCap = rule.zoneCap;
      acc.notes.push(...rule.notes);
      Object.assign(acc.strokeAvoid, rule.strokeAvoid);
    }
    return acc;
  }, { restBonus: 0, zoneCap: undefined as Zone | undefined, notes: [] as string[], strokeAvoid: {} as Partial<Record<Stroke, boolean>> });

  const goalToZones: Record<Goal, Zone[]> = {
    ENDURANCE: ["EN2", "EN1", "EN3"],
    THRESHOLD: ["EN3", "EN2"],
    VO2MAX: ["Z4", "EN3"],
    SPRINT: ["Z5", "Z4"],
  };

  let zones = goalToZones[profile.goal];
  if (safety.zoneCap) {
    const zoneOrder = { EN1: 1, EN2: 2, EN3: 3, Z4: 4, Z5: 5 };
    zones = zones.filter(z => zoneOrder[z] <= zoneOrder[safety.zoneCap!]);
  }

  const poolLength = profile.course === "25m" ? 25 : 50;
  const targetMainMinutes = Math.max(10, Math.min(35, profile.sessionMinutes - 10));
  const sets: SetSpec[] = [];

  for (const zone of zones) {
    const paceOffsets = {
      EN1: { min: 15, max: 30 },
      EN2: { min: 5, max: 14 },
      EN3: { min: 0, max: 4 },
      Z4: { min: -5, max: -2 },
      Z5: { min: -8, max: -6 },
    };

    const pacePer100 = zone === "Z5" ? profile.cssPer100 - 6 : 
                      profile.cssPer100 + (paceOffsets[zone].min + paceOffsets[zone].max) / 2;
    
    const repTime = Math.round((poolLength / 100) * pacePer100);
    const restSec = zone === "EN1" ? 5 + safety.restBonus :
                   zone === "EN2" ? 10 + safety.restBonus :
                   zone === "EN3" ? 20 + safety.restBonus :
                   zone === "Z4" ? 30 + safety.restBonus : 60 + safety.restBonus;

    const cycle = repTime + restSec;
    const reps = Math.max(4, Math.min(24, Math.round((targetMainMinutes * 60) / cycle)));

    // 안전한 영법 선택
    let stroke: Stroke = "freestyle";
    if (safety.strokeAvoid.butterfly && zone !== "Z5") stroke = "backstroke";
    if (safety.strokeAvoid.breaststroke && zone !== "Z5") stroke = "freestyle";

    const methodLabels = {
      EN1: "Even EN1",
      EN2: "Even EN2", 
      EN3: "Threshold/CSS",
      Z4: "VO₂max Intervals",
      Z5: "Sprint/Power"
    };

    sets.push({
      reps,
      distance: poolLength,
      stroke,
      zone,
      pacePer100: Math.round(pacePer100),
      restSec,
      methodId: zone,
      rationale: {
        distanceWhy: `${poolLength}m 단위는 페이스 유지·측정 용이`,
        paceWhy: zone === "Z5" ? "스프린트는 최고속 추구" : `CSS 대비 ${paceOffsets[zone].min}~${paceOffsets[zone].max}초/100m 범위`,
        restWhy: `${zone} 특성에 따라 r${restSec}초 (안전보정 +${safety.restBonus}초)`,
        methodWhy: methodLabels[zone],
        safetyWhy: safety.notes
      }
    });
  }

  return sets;
}

function getDrillRecommendations(profile: AthleteProfile): DrillRecommendation[] {
  const recommendations: DrillRecommendation[] = [];
  
  // 목표별 추천
  if (profile.goal === "ENDURANCE") {
    recommendations.push(DRILL_RECOMMENDATIONS[0]); // 캐치업
    recommendations.push(DRILL_RECOMMENDATIONS[3]); // 킥보드
  } else if (profile.goal === "THRESHOLD") {
    recommendations.push(DRILL_RECOMMENDATIONS[1]); // 주먹수영
    recommendations.push(DRILL_RECOMMENDATIONS[4]); // 풀부이
  } else if (profile.goal === "VO2MAX") {
    recommendations.push(DRILL_RECOMMENDATIONS[2]); // 스컬링
    recommendations.push(DRILL_RECOMMENDATIONS[1]); // 주먹수영
  } else if (profile.goal === "SPRINT") {
    recommendations.push(DRILL_RECOMMENDATIONS[4]); // 풀부이
    recommendations.push(DRILL_RECOMMENDATIONS[2]); // 스컬링
  }

  // 질환별 추천
  if (profile.conditions.includes("허리디스크")) {
    recommendations.push(DRILL_RECOMMENDATIONS[3]); // 킥보드 (접영 회피)
  }
  if (profile.conditions.includes("어깨충돌증후군")) {
    recommendations.push(DRILL_RECOMMENDATIONS[0]); // 캐치업 (패들 제한)
  }

  return recommendations.slice(0, 3); // 최대 3개 추천
}

// ========================= 메인 컴포넌트 =========================
const SwimProgramGenerator: React.FC = () => {
  const [mastersStandards, setMastersStandards] = useState<MastersStandard[]>(DEFAULT_MASTERS_STANDARDS);
  const [profileA, setProfileA] = useState<AthleteProfile>({
    age: 30,
    sex: "male",
    course: "25m",
    sessionMinutes: 40,
    weeklySessions: 3,
    conditions: [],
    specialSituations: [],
    goal: "ENDURANCE",
    cssPer100: 70
  });
  const [profileB, setProfileB] = useState<AthleteProfile>({
    age: 35,
    sex: "female", 
    course: "25m",
    sessionMinutes: 45,
    weeklySessions: 2,
    conditions: [],
    specialSituations: [],
    goal: "THRESHOLD",
    cssPer100: 80
  });

  // CSS 자동 추정
  useEffect(() => {
    const estimatedCSSA = estimateCSSFromMasters(profileA.age, profileA.sex, mastersStandards);
    setProfileA(prev => ({ ...prev, cssPer100: estimatedCSSA }));
  }, [profileA.age, profileA.sex, mastersStandards]);

  useEffect(() => {
    const estimatedCSSB = estimateCSSFromMasters(profileB.age, profileB.sex, mastersStandards);
    setProfileB(prev => ({ ...prev, cssPer100: estimatedCSSB }));
  }, [profileB.age, profileB.sex, mastersStandards]);

  const planA = useMemo(() => buildTrainingPlan(profileA, mastersStandards), [profileA, mastersStandards]);
  const planB = useMemo(() => buildTrainingPlan(profileB, mastersStandards), [profileB, mastersStandards]);
  const drillsA = useMemo(() => getDrillRecommendations(profileA), [profileA]);
  const drillsB = useMemo(() => getDrillRecommendations(profileB), [profileB]);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const newStandards: MastersStandard[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 6) {
          newStandards.push({
            ageGroup: values[0],
            sex: values[1] as "male" | "female",
            stroke: values[2] as Stroke,
            distance: parseInt(values[3]),
            time: parseInt(values[4]),
            country: values[5] as "domestic" | "international"
          });
        }
      }
      
      // 기존 데이터와 병합
      setMastersStandards(prev => {
        const merged = [...prev];
        newStandards.forEach(newStd => {
          const existingIndex = merged.findIndex(existing => 
            existing.ageGroup === newStd.ageGroup &&
            existing.sex === newStd.sex &&
            existing.stroke === newStd.stroke &&
            existing.distance === newStd.distance &&
            existing.country === newStd.country
          );
          if (existingIndex >= 0) {
            merged[existingIndex] = newStd;
          } else {
            merged.push(newStd);
          }
        });
        return merged;
      });
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const headers = "ageGroup,sex,stroke,distance,time,country";
    const sampleData = [
      "25-29,male,freestyle,100,65,domestic",
      "25-29,male,freestyle,200,140,domestic",
      "25-29,female,freestyle,100,75,domestic",
      "30-34,male,freestyle,100,68,domestic",
      "30-34,female,freestyle,100,78,domestic"
    ];
    const csvContent = [headers, ...sampleData].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'masters-anchor-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">JJ Swim Lab — A/B 비교 수영 프로그램 생성기</h1>
        <p className="text-gray-600">마스터즈 기준 연동 + 질환별 안전보정 + 드릴 추천</p>
      </header>

      {/* CSV 업로드 섹션 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">마스터즈 기준 데이터 관리</h2>
        <div className="flex gap-4 items-center">
          <button
            onClick={downloadCSVTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            CSV 템플릿 다운로드
          </button>
          <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
            CSV 업로드
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-600">
            현재 {mastersStandards.length}개 기준 데이터 로드됨
          </span>
        </div>
      </div>

      {/* A/B 비교 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 프로필 A */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">프로필 A</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">나이</label>
              <input
                type="number"
                value={profileA.age}
                onChange={(e) => setProfileA(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <select
                value={profileA.sex}
                onChange={(e) => setProfileA(prev => ({ ...prev, sex: e.target.value as "male" | "female" }))}
                className="w-full p-2 border rounded"
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">코스</label>
              <select
                value={profileA.course}
                onChange={(e) => setProfileA(prev => ({ ...prev, course: e.target.value as "25m" | "50m" }))}
                className="w-full p-2 border rounded"
              >
                <option value="25m">25m</option>
                <option value="50m">50m</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">세션시간(분)</label>
              <input
                type="number"
                value={profileA.sessionMinutes}
                onChange={(e) => setProfileA(prev => ({ ...prev, sessionMinutes: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">주당횟수</label>
              <input
                type="number"
                value={profileA.weeklySessions}
                onChange={(e) => setProfileA(prev => ({ ...prev, weeklySessions: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CSS(초/100m)</label>
              <input
                type="number"
                value={profileA.cssPer100}
                onChange={(e) => setProfileA(prev => ({ ...prev, cssPer100: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">목표</label>
            <select
              value={profileA.goal}
              onChange={(e) => setProfileA(prev => ({ ...prev, goal: e.target.value as Goal }))}
              className="w-full p-2 border rounded"
            >
              <option value="ENDURANCE">지구력</option>
              <option value="THRESHOLD">임계</option>
              <option value="VO2MAX">VO₂max</option>
              <option value="SPRINT">스프린트</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">질환/상황</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(SAFETY_RULES).map(condition => (
                <label key={condition} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileA.conditions.includes(condition)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfileA(prev => ({ ...prev, conditions: [...prev.conditions, condition] }));
                      } else {
                        setProfileA(prev => ({ ...prev, conditions: prev.conditions.filter(c => c !== condition) }));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 훈련 계획 A */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">훈련 계획 A</h3>
            <div className="space-y-2">
              {planA.map((set, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {set.reps}×{set.distance}m {set.stroke} [{set.zone}]
                    </span>
                    <span className="text-sm text-gray-600">
                      @ {Math.floor(set.pacePer100/60)}:{String(set.pacePer100%60).padStart(2,'0')}/100m, r{set.restSec}s
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer">왜?</summary>
                    <div className="text-xs mt-1 space-y-1">
                      <div>거리: {set.rationale.distanceWhy}</div>
                      <div>페이스: {set.rationale.paceWhy}</div>
                      <div>휴식: {set.rationale.restWhy}</div>
                      <div>방법: {set.rationale.methodWhy}</div>
                      {set.rationale.safetyWhy.length > 0 && (
                        <div>안전: {set.rationale.safetyWhy.join(", ")}</div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* 드릴 추천 A */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">드릴 추천 A</h3>
            <div className="space-y-2">
              {drillsA.map((drill, i) => (
                <div key={i} className="bg-green-50 p-3 rounded">
                  <div className="font-medium">{drill.name}</div>
                  <div className="text-sm text-gray-600">{drill.description}</div>
                  <div className="text-xs text-green-600 mt-1">{drill.whenToUse}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 프로필 B */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">프로필 B</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">나이</label>
              <input
                type="number"
                value={profileB.age}
                onChange={(e) => setProfileB(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <select
                value={profileB.sex}
                onChange={(e) => setProfileB(prev => ({ ...prev, sex: e.target.value as "male" | "female" }))}
                className="w-full p-2 border rounded"
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">코스</label>
              <select
                value={profileB.course}
                onChange={(e) => setProfileB(prev => ({ ...prev, course: e.target.value as "25m" | "50m" }))}
                className="w-full p-2 border rounded"
              >
                <option value="25m">25m</option>
                <option value="50m">50m</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">세션시간(분)</label>
              <input
                type="number"
                value={profileB.sessionMinutes}
                onChange={(e) => setProfileB(prev => ({ ...prev, sessionMinutes: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">주당횟수</label>
              <input
                type="number"
                value={profileB.weeklySessions}
                onChange={(e) => setProfileB(prev => ({ ...prev, weeklySessions: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CSS(초/100m)</label>
              <input
                type="number"
                value={profileB.cssPer100}
                onChange={(e) => setProfileB(prev => ({ ...prev, cssPer100: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">목표</label>
            <select
              value={profileB.goal}
              onChange={(e) => setProfileB(prev => ({ ...prev, goal: e.target.value as Goal }))}
              className="w-full p-2 border rounded"
            >
              <option value="ENDURANCE">지구력</option>
              <option value="THRESHOLD">임계</option>
              <option value="VO2MAX">VO₂max</option>
              <option value="SPRINT">스프린트</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">질환/상황</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(SAFETY_RULES).map(condition => (
                <label key={condition} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileB.conditions.includes(condition)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfileB(prev => ({ ...prev, conditions: [...prev.conditions, condition] }));
                      } else {
                        setProfileB(prev => ({ ...prev, conditions: prev.conditions.filter(c => c !== condition) }));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 훈련 계획 B */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">훈련 계획 B</h3>
            <div className="space-y-2">
              {planB.map((set, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {set.reps}×{set.distance}m {set.stroke} [{set.zone}]
                    </span>
                    <span className="text-sm text-gray-600">
                      @ {Math.floor(set.pacePer100/60)}:{String(set.pacePer100%60).padStart(2,'0')}/100m, r{set.restSec}s
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-sm text-green-600 cursor-pointer">왜?</summary>
                    <div className="text-xs mt-1 space-y-1">
                      <div>거리: {set.rationale.distanceWhy}</div>
                      <div>페이스: {set.rationale.paceWhy}</div>
                      <div>휴식: {set.rationale.restWhy}</div>
                      <div>방법: {set.rationale.methodWhy}</div>
                      {set.rationale.safetyWhy.length > 0 && (
                        <div>안전: {set.rationale.safetyWhy.join(", ")}</div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* 드릴 추천 B */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">드릴 추천 B</h3>
            <div className="space-y-2">
              {drillsB.map((drill, i) => (
                <div key={i} className="bg-green-50 p-3 rounded">
                  <div className="font-medium">{drill.name}</div>
                  <div className="text-sm text-gray-600">{drill.description}</div>
                  <div className="text-xs text-green-600 mt-1">{drill.whenToUse}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 비교 요약 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">A/B 비교 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">총 거리</h3>
            <div className="text-2xl font-bold text-blue-600">
              {planA.reduce((sum, set) => sum + set.reps * set.distance, 0)}m
            </div>
            <div className="text-sm text-gray-600">vs</div>
            <div className="text-2xl font-bold text-green-600">
              {planB.reduce((sum, set) => sum + set.reps * set.distance, 0)}m
            </div>
          </div>
          <div className="bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">총 휴식시간</h3>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(planA.reduce((sum, set) => sum + set.restSec * set.reps, 0) / 60)}분
            </div>
            <div className="text-sm text-gray-600">vs</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(planB.reduce((sum, set) => sum + set.restSec * set.reps, 0) / 60)}분
            </div>
          </div>
          <div className="bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">세트 수</h3>
            <div className="text-2xl font-bold text-blue-600">{planA.length}개</div>
            <div className="text-sm text-gray-600">vs</div>
            <div className="text-2xl font-bold text-green-600">{planB.length}개</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwimProgramGenerator;





