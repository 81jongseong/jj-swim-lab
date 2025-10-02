import React, { useMemo, useState } from "react";

/**
 * SwimProgramGenerator.tsx
 * 목적: 건강정보 + 질환/특수상황 + 목표 + 마스터즈 기준을 반영하여
 *       즉시 훈련 프로그램(거리/페이스/휴식/드릴/훈련법)을 산출하고 비교한다.
 *
 * 설치 전제: React 18+ 프로젝트. 별도 라이브러리 불필요(순수 TSX).
 *
 * 사용법:
 *   1) 이 파일을 프로젝트에 저장: src/SwimProgramGenerator.tsx
 *   2) 임시 페이지에서 <SwimProgramGenerator />를 렌더링
 *      예) src/App.tsx 내에서:  export default function App(){ return <SwimProgramGenerator/> }
 *
 * 데이터 주입:
 *   - Masters 기준: 아래 기본 샘플 + CSV 업로드로 확장(메뉴의 "기준 데이터 업로드").
 *   - CSV 스키마는 본문 하단의 csvSchema 설명 및 템플릿 참고.
 */

// ============================== 타입 ==============================
type Sex = "M" | "F";
type PoolCourse = "LCM50" | "SCM25" | "SCY25";
type Stroke = "FR" | "BK" | "BR" | "FL" | "IM";
type Goal =
  | "VO2max"
  | "Speed"
  | "Threshold"
  | "Endurance";

type ConditionTag =
  | "lumbar_disc"
  | "knee_OA"
  | "shoulder_RCRSP"
  | "ankle_sprain"
  | "CTS"
  | "HTN"
  | "Dyslipidemia"
  | "Obesity"
  | "Asthma"
  | "Dermatitis"
  | "Pregnancy"
  | "Diabetes";

type DrillId =
  | "fs_6_1_6" | "fs_fist" | "fs_single_arm" | "fs_scull1" | "fs_tarzan"
  | "bk_6switch" | "br_kick_back" | "fl_single" | "st_streamline";

type MethodId =
  | "threshold" | "vo2" | "sprint" | "even" | "descend" | "ladder" | "pyramid" | "drillswim" | "pull" | "kick";

type Zone = "Z1"|"Z2"|"Z3"|"Z4"|"Z5";

type MastersAnchor = {
  course: PoolCourse;
  ageMin: number;
  ageMax: number;
  sex: Sex;
  stroke: Stroke;
  distance: number; // meters (SCY도 환산 내부 처리)
  label: string;    // "World Aquatics WR" | "USMS NR" | "KOR NR" etc.
  recordTimeSec: number; // 기록(초). 모를 경우 NaN 허용
  source?: string;
};

type HealthProfile = {
  age: number;
  sex: Sex;
  poolCourse: PoolCourse;
  poolLengthM: number; // 25 or 50
  heightCm?: number;
  weightKg?: number;
  conditions: ConditionTag[];
  weeklySessions: number;
  sessionMinutes: number;
  best100mSec?: number;     // 사용자가 입력한 최근 100m 최고 기록(초) — 없으면 CSS 추정에 anchors 사용
  goal: Goal;
};

type SetLine = {
  reps: number;
  repDistanceM: number;
  stroke: Stroke;
  targetZone: Zone;
  targetPacePer100: number; // sec/100m
  sendoffSec?: number;      // on/send-off
  restSec?: number;         // r
  method: MethodId;
  drills?: DrillId[];
  tooltip: string;
};

// ============================== 유틸: 포맷팅 ==============================
function secToMMSS(sec: number | undefined) {
  if (sec===undefined || !isFinite(sec)) return "—";
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s/60);
  const r = s%60;
  return `${m}:${r.toString().padStart(2,"0")}`;
}
function paceTag(p100: number){ return isFinite(p100) ? `${secToMMSS(p100)}/100m` : "—"; }
function clamp(n:number, lo:number, hi:number){ return Math.max(lo, Math.min(hi, n)); }
function round(n:number, d=0){ const k=10**d; return Math.round(n*k)/k; }

// ============================== Masters 기준(샘플) ==============================
/**
 * 기본 샘플: 최소한의 기준(100FR)만 포함. 전체 표는 CSV로 업로드하여 대체/병합.
 * - 남 25–29세 100m FR LCM 세계기록 48.72s (2025-09-01 PDF) — World Aquatics Masters
 *   출처: https://www.worldaquatics.com/records/hall-of-fame?course=&gender=&stroke=&distance=&agegroup=&page=1
 *   PDF: Swimming World Records Masters as of 01.09.2025 (LCM)
 * - 여 25–29세 100m FR (빈칸) → CSV로 채우기
 */
const DEFAULT_ANCHORS: MastersAnchor[] = [
  { course:"LCM50", ageMin:25, ageMax:29, sex:"M", stroke:"FR", distance:100, label:"World Aquatics WR", recordTimeSec:48.72, source:"World Aquatics Masters, 2025-09-01 PDF" },
  { course:"LCM50", ageMin:25, ageMax:29, sex:"F", stroke:"FR", distance:100, label:"World Aquatics WR", recordTimeSec:NaN, source:"World Aquatics Masters, 2025-09-01 PDF" },
];

// ============================== 드릴/훈련법(요약) ==============================
const DRILL_INFO: Record<DrillId, {name:string; helps:string[]}> = {
  fs_6_1_6:{name:"FR 6-1-6", helps:["롤링","호흡정렬"]},
  fs_fist:{name:"FR Fist", helps:["전완감각(DPS)"]},
  fs_single_arm:{name:"FR Single Arm", helps:["캐치/프레스","비대칭 교정"]},
  fs_scull1:{name:"FR Scull #1", helps:["프론트 캐치 각도"]},
  fs_tarzan:{name:"FR Tarzan", helps:["사이팅","헤드업 제어"]},
  bk_6switch:{name:"BK 6-kick Switch", helps:["롤링","코어"]},
  br_kick_back:{name:"BR Kick on Back", helps:["무릎각/발스냅"]},
  fl_single:{name:"FL Single Arm", helps:["양→편측 전이"]},
  st_streamline:{name:"Streamline Push", helps:["브레이크아웃"]},
};

const METHOD_INFO: Record<MethodId,{name:string; why:string; zones:Zone[]}> = {
  threshold:{name:"Threshold/CSS", why:"임계 템포 능력 향상", zones:["Z3"]},
  vo2:{name:"VO₂ Intervals", why:"고속 내성/산소섭취량", zones:["Z4"]},
  sprint:{name:"Sprint/Power", why:"신경근 파워/최고속", zones:["Z5"]},
  even:{name:"Even Split", why:"페이스 안정", zones:["Z2","Z3"]},
  descend:{name:"Descend", why:"가속/분배능력", zones:["Z3","Z4"]},
  ladder:{name:"Ladder", why:"거리 단계 적응", zones:["Z2","Z3"]},
  pyramid:{name:"Pyramid", why:"중간 피크 적응", zones:["Z2","Z3"]},
  drillswim:{name:"Drill/Swim", why:"기술→수영 전이", zones:["Z1","Z2"]},
  pull:{name:"Pull", why:"상지 추진/정렬", zones:["Z2","Z3"]},
  kick:{name:"Kick", why:"하체 추진", zones:["Z2","Z3"]},
};

// ============================== CSS/페이스 추정 ==============================
/**
 * CSS 추정 원칙:
 * 1) 사용자가 best100mSec 제공 시 → CSS ≈ best100 + 8~12s/100 (일반 마스터즈의 경우)
 * 2) 미제공 시 → Masters 앵커(동연령/성별/코스) 100FR 기록 × 배수(예: 1.35~1.70)로 추정
 */
function estimateCSS100(profile:HealthProfile, anchors:MastersAnchor[]): number {
  if (profile.best100mSec && isFinite(profile.best100mSec)) {
    return profile.best100mSec + 10; // 중간값 10초 가산
  }
  // 앵커 탐색
  const cand = anchors.find(a =>
    a.course===profile.poolCourse && a.stroke==="FR" && a.distance===100 &&
    profile.age>=a.ageMin && profile.age<=a.ageMax && a.sex===profile.sex && isFinite(a.recordTimeSec)
  );
  const anchor = cand?.recordTimeSec ?? 60; // fallback 60s
  const multiplier =
    profile.goal==="Speed" ? 1.35 :
    profile.goal==="VO2max" ? 1.45 :
    profile.goal==="Threshold" ? 1.55 :
    1.65; // Endurance
  return anchor * multiplier;
}

// 존별 페이스(초/100m) 범위
function zonePace(pCSS:number, zone:Zone): [number,number] {
  switch(zone){
    case "Z1": return [pCSS+15, pCSS+30];
    case "Z2": return [pCSS+5,  pCSS+14];
    case "Z3": return [pCSS-0,  pCSS+4];
    case "Z4": return [pCSS-5,  pCSS-2];
    case "Z5": return [pCSS-9,  pCSS-6];
  }
}

// ============================== 휴식 로직 ==============================
/**
 * 휴식(레스트) 제안 로직 요약:
 * - Z1: 10–20″
 * - Z2: 15–30″
 * - Z3: 20–40″ (임계 유지)
 * - Z4: 30–60″ (고강도 인터벌)
 * - Z5: 60–90″ (스프린트 품질 확보)
 * 조정 팩터:
 * - 연령 50+: +10~15″
 * - 질환(요통/어깨/천식 등): +5~20″ (안전 우선)
 * - 반복거리↑: 비례 가산(100m당 +5~10″)
 */
function suggestRestSec(zone:Zone, repMeters:number, age:number, conditions:ConditionTag[]): number {
  const base = (():[number,number]=>{
    switch(zone){
      case "Z1": return [10,20];
      case "Z2": return [15,30];
      case "Z3": return [20,40];
      case "Z4": return [30,60];
      case "Z5": return [60,90];
    }
  })();
  let lo=base[0], hi=base[1];
  // 반복거리 보정
  const per100 = repMeters/100;
  lo += Math.max(0, Math.floor((per100-1)*6));
  hi += Math.max(0, Math.floor((per100-1)*10));
  // 연령 보정
  if (age>=50){ lo+=10; hi+=15; }
  // 상태 보정
  const risk = conditions.filter(c => ["lumbar_disc","shoulder_RCRSP","asthma","Asthma","HTN"].includes(c)).length;
  lo += risk*3; hi += risk*5;
  return Math.round((lo+hi)/2);
}

// ============================== 세트 생성 로직 ==============================
function planMainSets(profile:HealthProfile, anchors:MastersAnchor[]): SetLine[] {
  const css = estimateCSS100(profile, anchors);
  const z = {
    Z1: zonePace(css,"Z1"),
    Z2: zonePace(css,"Z2"),
    Z3: zonePace(css,"Z3"),
    Z4: zonePace(css,"Z4"),
    Z5: zonePace(css,"Z5"),
  };

  // 세션 길이 기반 총거리 대략치(분당 25m easy 가정 후 조정)
  const baseMeters = profile.sessionMinutes * 20; // 20m/min ≈ 쉬운 지속
  const goalFactor = (profile.goal==="Endurance") ? 1.0 :
                     (profile.goal==="Threshold") ? 0.9 :
                     (profile.goal==="VO2max") ? 0.8 : 0.7; // Speed일수록 메인세트 거리↓
  const targetSessionMeters = Math.round(baseMeters * goalFactor / 25) * 25;

  const sets: SetLine[] = [];

  const add = (s:SetLine)=>sets.push(s);

  if (profile.goal==="Endurance"){
    // Even + Ladder 중심
    const rep = profile.poolLengthM===25 ? 200 : 200;
    const reps = Math.max(3, Math.round(targetSessionMeters/(rep*1.8)));
    const rest = suggestRestSec("Z2", rep, profile.age, profile.conditions);
    add({
      reps, repDistanceM:rep, stroke:"FR", targetZone:"Z2",
      targetPacePer100: (z.Z2[0]+z.Z2[1])/2, restSec:rest, method:"even",
      drills:["st_streamline"],
      tooltip:`지속 지구력: Even Split @ ${paceTag((z.Z2[0]+z.Z2[1])/2)} / r${rest}″`
    });
    // 마무리 Z3 100s
    const reps2 = clamp(Math.round((targetSessionMeters - reps*rep)/100), 4, 10);
    const rest2 = suggestRestSec("Z3", 100, profile.age, profile.conditions);
    add({
      reps:reps2, repDistanceM:100, stroke:"FR", targetZone:"Z3",
      targetPacePer100:(z.Z3[0]+z.Z3[1])/2, restSec:rest2, method:"threshold",
      drills:["fs_6_1_6"],
      tooltip:`임계 전후 유지(CSS): r${rest2}″`
    });
  } else if (profile.goal==="Threshold"){
    // 100s @ Z3, 200s @ Z3
    const r1 = suggestRestSec("Z3", 100, profile.age, profile.conditions);
    add({ reps:8, repDistanceM:100, stroke:"FR", targetZone:"Z3", restSec:r1,
      targetPacePer100:(z.Z3[0]+z.Z3[1])/2, method:"threshold", drills:["fs_6_1_6"],
      tooltip:`Threshold 유지: ${paceTag((z.Z3[0]+z.Z3[1])/2)}, r${r1}″`
    });
    const r2 = suggestRestSec("Z3", 200, profile.age, profile.conditions);
    add({ reps:4, repDistanceM:200, stroke:"FR", targetZone:"Z3", restSec:r2,
      targetPacePer100:(z.Z3[0]+z.Z3[1])/2, method:"ladder", drills:["fs_scull1"],
      tooltip:`200 유지 페이스 감각, r${r2}″`
    });
  } else if (profile.goal==="VO2max"){
    // 50s/100s @ Z4 Descend
    const r1 = suggestRestSec("Z4", 100, profile.age, profile.conditions);
    add({ reps:6, repDistanceM:100, stroke:"FR", targetZone:"Z4", restSec:r1,
      targetPacePer100:(z.Z4[0]+z.Z4[1])/2, method:"descend", drills:["fs_single_arm"],
      tooltip:`VO₂ 간헐: ${paceTag((z.Z4[0]+z.Z4[1])/2)}, r${r1}″`
    });
    const r2 = suggestRestSec("Z4", 50, profile.age, profile.conditions);
    add({ reps:8, repDistanceM:50, stroke:"FR", targetZone:"Z4", restSec:r2,
      targetPacePer100:(z.Z4[0]+z.Z4[1])/2, method:"vo2", drills:["st_streamline"],
      tooltip:`50 고강도 반복, r${r2}″`
    });
  } else { // Speed
    const r1 = suggestRestSec("Z5", 25, profile.age, profile.conditions);
    add({ reps:12, repDistanceM:25, stroke:"FR", targetZone:"Z5", restSec:r1,
      targetPacePer100:(z.Z5[0]+z.Z5[1])/2, method:"sprint", drills:["st_streamline","fs_tarzan"],
      tooltip:`스프린트 품질: full rest 경향, r${r1}″`
    });
    const r2 = suggestRestSec("Z4", 50, profile.age, profile.conditions);
    add({ reps:6, repDistanceM:50, stroke:"FR", targetZone:"Z4", restSec:r2,
      targetPacePer100:(z.Z4[0]+z.Z4[1])/2, method:"descend", drills:["fs_fist"],
      tooltip:`디센딩 1→6, r${r2}″`
    });
  }

  return sets;
}

// ============================== CSV 업로드/병합 ==============================
/**
 * CSV 스키마:
 * course,ageMin,ageMax,sex,stroke,distance,label,recordTimeSec,source
 * 예) LCM50,25,29,M,FR,100,World Aquatics WR,48.72,https://...
 */
function parseCSV(text:string): MastersAnchor[] {
  const rows = text.split(/\r?\n/).filter(Boolean);
  const out: MastersAnchor[] = [];
  const header = rows.shift()!;
  const cols = header.split(",");
  const idx = (k:string)=> cols.findIndex(c=>c.trim()===k);
  const get = (arr:string[], k:string)=> arr[idx(k)]?.trim();
  rows.forEach(line=>{
    const arr = line.split(",");
    const rec: MastersAnchor = {
      course: (get(arr,"course") as PoolCourse) ?? "LCM50",
      ageMin: parseInt(get(arr,"ageMin") || "25",10),
      ageMax: parseInt(get(arr,"ageMax") || "29",10),
      sex: (get(arr,"sex") as Sex) ?? "M",
      stroke: (get(arr,"stroke") as Stroke) ?? "FR",
      distance: parseInt(get(arr,"distance") || "100",10),
      label: get(arr,"label") || "Unknown",
      recordTimeSec: parseFloat(get(arr,"recordTimeSec") || "NaN"),
      source: get(arr,"source") || undefined
    };
    out.push(rec);
  });
  return out;
}

// ============================== UI 컴포넌트 ==============================
const Box: React.FC<{title:string; children:React.ReactNode}> = ({title, children}) => (
  <div style={{border:"1px solid #e5e7eb", borderRadius:12, padding:16, background:"#fff"}}>
    <div style={{fontWeight:700, marginBottom:8}}>{title}</div>
    {children}
  </div>
);

const L = (props:any)=><label style={{display:"block", fontSize:12, color:"#4b5563", marginTop:8}} {...props}/>;

function ProfileEditor({value, onChange, title}:{value:HealthProfile; onChange:(v:HealthProfile)=>void; title:string}){
  return (
    <Box title={title}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:12}}>
        <div>
          <L>나이</L>
          <input type="number" value={value.age}
            onChange={e=>onChange({...value, age: parseInt(e.target.value||"0",10)})}
            style={{width:"100%"}}/>
        </div>
        <div>
          <L>성별</L>
          <select value={value.sex} onChange={e=>onChange({...value, sex: e.target.value as Sex})} style={{width:"100%"}}>
            <option value="M">남</option>
            <option value="F">여</option>
          </select>
        </div>
        <div>
          <L>코스</L>
          <select value={value.poolCourse} onChange={e=>onChange({...value, poolCourse: e.target.value as PoolCourse})} style={{width:"100%"}}>
            <option value="LCM50">LCM 50m</option>
            <option value="SCM25">SCM 25m</option>
            <option value="SCY25">SCY 25y</option>
          </select>
        </div>
        <div>
          <L>레인 길이(m)</L>
          <select value={value.poolLengthM} onChange={e=>onChange({...value, poolLengthM: parseInt(e.target.value,10)})} style={{width:"100%"}}>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <L>주당 횟수</L>
          <input type="number" value={value.weeklySessions}
            onChange={e=>onChange({...value, weeklySessions: parseInt(e.target.value||"0",10)})}
            style={{width:"100%"}}/>
        </div>
        <div>
          <L>세션 시간(분)</L>
          <input type="number" value={value.sessionMinutes}
            onChange={e=>onChange({...value, sessionMinutes: parseInt(e.target.value||"0",10)})}
            style={{width:"100%"}}/>
        </div>
        <div>
          <L>최근 100m 최고기록(초) — 없으면 비워두기</L>
          <input type="number" value={value.best100mSec ?? ""}
            onChange={e=>onChange({...value, best100mSec: e.target.value===""? undefined : parseFloat(e.target.value)})}
            style={{width:"100%"}}/>
        </div>
        <div>
          <L>목표</L>
          <select value={value.goal} onChange={e=>onChange({...value, goal: e.target.value as Goal})} style={{width:"100%"}}>
            <option value="Endurance">지구력</option>
            <option value="Threshold">템포/임계</option>
            <option value="VO2max">VO₂</option>
            <option value="Speed">스피드</option>
          </select>
        </div>
      </div>
      <L>질환/특수상황</L>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:8}}>
        {["lumbar_disc","knee_OA","shoulder_RCRSP","ankle_sprain","CTS","HTN","Dyslipidemia","Obesity","Asthma","Dermatitis","Pregnancy","Diabetes"].map((c:any)=>{
          const checked = value.conditions.includes(c);
          return (
            <label key={c} style={{fontSize:12}}>
              <input type="checkbox" checked={checked} onChange={()=>{
                const next = checked ? value.conditions.filter(x=>x!==c) : [...value.conditions, c];
                onChange({...value, conditions: next});
              }}/> {c}
            </label>
          );
        })}
      </div>
    </Box>
  );
}

// ============================== 표·툴팁 ==============================
function SetTable({sets}:{sets:SetLine[]}){
  return (
    <table style={{width:"100%", borderCollapse:"collapse"}}>
      <thead>
        <tr style={{background:"#f3f4f6"}}>
          <th style={{textAlign:"left", padding:8}}>세트</th>
          <th style={{textAlign:"left", padding:8}}>페이스</th>
          <th style={{textAlign:"left", padding:8}}>휴식</th>
          <th style={{textAlign:"left", padding:8}}>훈련법</th>
          <th style={{textAlign:"left", padding:8}}>드릴</th>
          <th style={{textAlign:"left", padding:8}}>왜?</th>
        </tr>
      </thead>
      <tbody>
        {sets.map((s, i)=>{
          const totalM = s.reps * s.repDistanceM;
          return (
            <tr key={i} style={{borderTop:"1px solid #e5e7eb"}}>
              <td style={{padding:8}}>{s.reps} × {s.repDistanceM}m {s.stroke}</td>
              <td style={{padding:8}}>{paceTag(s.targetPacePer100)}</td>
              <td style={{padding:8}}>{s.restSec ? `r${s.restSec}″` : (s.sendoffSec? `on ${secToMMSS(s.sendoffSec)}`:"—")}</td>
              <td style={{padding:8}}>{METHOD_INFO[s.method].name}</td>
              <td style={{padding:8}}>{(s.drills||[]).map(d=>DRILL_INFO[d].name).join(", ")}</td>
              <td style={{padding:8}} title={s.tooltip}>
                <span style={{display:"inline-block", padding:"2px 6px", background:"#eef2ff", borderRadius:6, fontSize:12, cursor:"help"}}>툴팁</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ============================== 메인 컴포넌트 ==============================
export default function SwimProgramGenerator(){
  const [anchors, setAnchors] = useState<MastersAnchor[]>(DEFAULT_ANCHORS);
  const [csvName, setCsvName] = useState<string>("");

  const [A, setA] = useState<HealthProfile>({
    age: 35, sex:"M", poolCourse:"LCM50", poolLengthM:50,
    conditions: [], weeklySessions:3, sessionMinutes:60,
    goal:"Threshold",
  });
  const [B, setB] = useState<HealthProfile>({
    age: 55, sex:"F", poolCourse:"LCM50", poolLengthM:50,
    conditions: ["knee_OA","HTN"], weeklySessions:3, sessionMinutes:45,
    goal:"Endurance",
  });

  const setsA = useMemo(()=>planMainSets(A, anchors), [A, anchors]);
  const setsB = useMemo(()=>planMainSets(B, anchors), [B, anchors]);

  const totalA = setsA.reduce((s,x)=>s+x.reps*x.repDistanceM,0);
  const totalB = setsB.reduce((s,x)=>s+x.reps*x.repDistanceM,0);

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if (!f) return;
    setCsvName(f.name);
    const fr = new FileReader();
    fr.onload = () => {
      try{
        const txt = String(fr.result);
        const rows = parseCSV(txt);
        // 병합(같은 키는 대체)
        const key = (m:MastersAnchor)=>[m.course,m.ageMin,m.ageMax,m.sex,m.stroke,m.distance,m.label].join("|");
        const map = new Map<string, MastersAnchor>();
        [...anchors, ...rows].forEach(r => map.set(key(r), r));
        setAnchors(Array.from(map.values()));
      }catch(err){
        alert("CSV 파싱 실패: " + (err as any).message);
      }
    };
    fr.readAsText(f);
  }

  const cssA = estimateCSS100(A, anchors);
  const cssB = estimateCSS100(B, anchors);

  return (
    <div style={{maxWidth:1200, margin:"0 auto", padding:16, fontFamily:"system-ui, -apple-system, Roboto, 'Noto Sans KR', sans-serif"}}>
      <h1 style={{fontSize:24, fontWeight:800, margin:"8px 0"}}>JJ Swim Lab — 건강·질환·마스터즈 기준 프로그램 생성기</h1>
      <p style={{color:"#374151"}}>
        Masters 기준은 CSV 업로드로 확장 가능. 기본 CSS 추정은 사용자 100m 기록 또는 연령/성별 세계기록의 배수를 사용.
      </p>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:12}}>
        <ProfileEditor title="프로필 A" value={A} onChange={setA} />
        <ProfileEditor title="프로필 B" value={B} onChange={setB} />
      </div>

      <div style={{display:"flex", alignItems:"center", gap:12, marginTop:12}}>
        <input type="file" accept=".csv" onChange={handleCSV}/>
        <span style={{fontSize:12, color:"#6b7280"}}>{csvName || "기준 데이터 업로드(csv)"}</span>
        <a href="https://www.worldaquatics.com/records/hall-of-fame?course=&gender=&stroke=&distance=&agegroup=&page=1" target="_blank" rel="noreferrer" style={{fontSize:12}}>World Aquatics Masters(공식)</a>
        <a href="https://www.usms.org/events/usms-records/pool-usms-records" target="_blank" rel="noreferrer" style={{fontSize:12}}>USMS Records</a>
        <a href="https://www.korswim.co.kr/home/home.php?go=cs/sub1_05" target="_blank" rel="noreferrer" style={{fontSize:12}}>대한수영연맹 마스터즈 기록(성인부)</a>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16}}>
        <Box title={`A 세션(추정 CSS ${paceTag(cssA)}) — 총 ${totalA}m`}>
          <SetTable sets={setsA}/>
        </Box>
        <Box title={`B 세션(추정 CSS ${paceTag(cssB)}) — 총 ${totalB}m`}>
          <SetTable sets={setsB}/>
        </Box>
      </div>

      <Box title="설명(요약)">
        <ul style={{margin:0, paddingLeft:18, color:"#374151", lineHeight:1.6}}>
          <li>CSS 추정: 사용자 100m 기록이 없으면 동연령·성별 세계기록을 기준으로 배수(목표별 1.35–1.70)를 적용.</li>
          <li>존 페이스: Z1=CSS+15~30″/100, Z2=+5~14″, Z3=±0~+4″, Z4=−5~−2″, Z5=−9~−6″.</li>
          <li>휴식: Z1 10–20″, Z2 15–30″, Z3 20–40″, Z4 30–60″, Z5 60–90″. 연령/질환/반복거리로 자동 가산.</li>
          <li>드릴 추천: 세트 목적과 통증 위험에 따라 자동 제안(예: 요통 → 접영/강돌핀 회피, Tarzan 제한).</li>
          <li>CSV 스키마: course,ageMin,ageMax,sex,stroke,distance,label,recordTimeSec,source</li>
        </ul>
      </Box>

      <div style={{fontSize:12, color:"#6b7280", marginTop:8}}>
        * Masters 세계기록 출처: World Aquatics Masters. 국내기록: 대한수영연맹(성인부) 공지 확인. USMS는 미국 내 국가기록/Top10 제공.
      </div>
    </div>
  );
}

/* ==== CSV 스키마 도움말 ====
course: LCM50 | SCM25 | SCY25
ageMin,ageMax: 예) 25,29
sex: M | F
stroke: FR | BK | BR | FL | IM
distance: m 기준(야드도 m로 기입, 예: 91.44→100으로 환산하거나 별도 SCY25 코스로 구분)
label: "World Aquatics WR" | "KOR NR" | "USMS NR" | "All-Time Top10 #1" 등
recordTimeSec: 초 단위 기록 (예: 48.72)
source: 원본 페이지 또는 PDF 링크
*/