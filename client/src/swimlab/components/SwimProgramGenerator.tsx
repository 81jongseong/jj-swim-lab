/**
 * SwimLab Data Pack v4 - Swim Program Generator Component
 * Q2: 키/숙련 입력 + Auto SPL 토글
 * Q3: Evidence 탭 카테고리 필터 & 한 줄 요약(툴팁)
 * 
 * 관련 파일:
 * - client/src/swimlab/data/trainingMethods.ts (TRAINING_METHODS)
 * - client/src/swimlab/data/drills.ts (DRILLS)
 * - client/src/swimlab/utils/catalog.ts
 * - client/src/swimlab/utils/rules.ts
 * - client/src/swimlab/utils/engine.ts
 * - client/src/swimlab/utils/idmap.ts
 * - client/app/swimlab/page.tsx
 */

'use client';
import React, { useMemo, useState } from 'react';
import { TRAINING_METHODS } from '../data/trainingMethods';
import { DRILLS } from '../data/drills';
import { Category, paginate, filterMethods, filterDrills, countAll, type TrainingMethod, type Drill } from '../utils/catalog';
// buildProgram 대신 generateWeeklyPlan 사용 (최신 API)
import { generateWeeklyPlan, type Input as EngineInput } from '../../../lib/swimlab/engine-v31';

// 레거시 buildProgram 호환 래퍼
const buildProgram = (params: any) => {
  const input: Partial<EngineInput> = {
    startDate: new Date().toISOString().slice(0, 10),
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    weeklyMinutes: 180,
    weeklyMeters: params.targetMeters || 3000,
    poolLen: params.pool || 25,
    strokesAllowed: [params.stroke || 'freestyle'],
    strokesAvoid: [],
    css100: params.cssPer100 ? { [params.stroke]: params.cssPer100 } : {},
    conditionIds: params.conditionIds || [],
    dayCondition: 'normal',
    goal: params.goal || '체력 향상',
    level: params.skill || 'intermediate'
  };
  
  try {
    const weekPlan = generateWeeklyPlan(input as EngineInput);
    return {
      warmup: weekPlan.days[0]?.sets.slice(0, 2) || [],
      main: weekPlan.days[0]?.sets.slice(2, -1) || [],
      cooldown: weekPlan.days[0]?.sets.slice(-1) || [],
      totalMeters: weekPlan.days[0]?.totalMeters || 0,
      estimatedMinutes: weekPlan.days[0]?.totalDuration || 60
    };
  } catch (error) {
    console.error('프로그램 생성 오류:', error);
    return {
      warmup: [],
      main: [],
      cooldown: [],
      totalMeters: params.targetMeters || 0,
      estimatedMinutes: 60
    };
  }
};

// PR 텍스트 파싱 (기본 구현)
const parsePRText = (text: string) => ({ FR: 0, BK: 0, BR: 0, FL: 0 });
const estimateCSSFromPRs = (prs: any) => ({ FR: 0, BK: 0, BR: 0, FL: 0 });
const estimateTargetSPL25 = (stroke: string) => 15;
import { History, type SwimSession } from '../utils/storage';
import { applyRulesMulti } from '../utils/rules_multi';
import Planner from './Planner';

type TabKey = 'Program'|'Methods'|'Drills'|'Conditions'|'Evidence'|'Planner';
const PAGE_SIZE = 24;

interface SwimProgramGeneratorProps {
  initialConditions?: string[];
}

export default function SwimProgramGenerator({ initialConditions = [] }: SwimProgramGeneratorProps) {
  const [tab, setTab] = useState<TabKey>('Program');

  // Program
  const [goal, setGoal] = useState<'Endurance'|'Tempo'|'Speed'|'Race'|'Technique'|'OpenWater'|'Rehab'|'Recovery'>('Endurance');
  const [targetMeters, setTargetMeters] = useState(2000);
  const [poolLen, setPoolLen] = useState<25|50>(25);
  const [css100, setCss100] = useState<number | ''>(''); // sec/100
  const [conditionInput, setConditionInput] = useState(''); // Q3: 다중 조건 입력 "shoulder_impingement pfps" 등
  const [stroke, setStroke] = useState<'FR'|'BK'|'BR'|'FL'>('FR'); // Q2: 영법
  const [skill, setSkill] = useState<'Beginner'|'Intermediate'|'Advanced'>('Intermediate');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [autoSPL, setAutoSPL] = useState(true);
  const [targetSPL25, setTargetSPL25] = useState(18);
  const [withTT, setWithTT] = useState(true); // Q2: TT 비프 시뮬레이션 표시
  const [prText, setPrText] = useState('');

  // 초기 컨디션 설정
  useEffect(() => {
    if (initialConditions.length > 0) {
      setConditionInput(initialConditions.join(' '));
    }
  }, [initialConditions]);

  // Auto SPL 동기화
  const splAutoValue = useMemo(()=> {
    if (!autoSPL) return targetSPL25;
    return estimateTargetSPL25({
      heightCm: typeof heightCm === 'number' ? heightCm : undefined,
      skill,
      goal,
      cssPer100: typeof css100 === 'number' ? css100 : undefined,
      stroke, // Q2: 영법 추가
    });
  }, [autoSPL, heightCm, skill, goal, css100, stroke, targetSPL25]);

  const program = useMemo(() => buildProgram({
    methods: TRAINING_METHODS, drills: DRILLS,
    goal, targetMeters, pool: poolLen,
    cssPer100: typeof css100 === 'number' ? css100 : undefined,
    conditionIds: conditionInput || undefined, // Q3: 다중 조건 입력
    targetSPL25: splAutoValue,
    heightCm: typeof heightCm === 'number' ? heightCm : undefined,
    skill,
    stroke,
    withTT, // Q2: TT 비프 시뮬레이션
  }), [goal, targetMeters, poolLen, css100, conditionInput, splAutoValue, heightCm, skill, stroke, withTT]);

  // Methods/Drills
  const [mCat, setMCat] = useState<Category|''>('');
  const [mText, setMText] = useState('');
  const [mPage, setMPage] = useState(1);
  const [dText, setDText] = useState('');
  const [dTag, setDTag] = useState('');
  const [dPage, setDPage] = useState(1);

  const filteredMethods = useMemo(() => paginate(filterMethods(TRAINING_METHODS, { category: mCat || undefined, text: mText || undefined }), mPage, PAGE_SIZE), [mCat, mText, mPage]);
  const filteredDrills  = useMemo(() => paginate(filterDrills(DRILLS, { text: dText || undefined, tag: dTag || undefined }), dPage, PAGE_SIZE), [dText, dTag, dPage]);

  const counts = useMemo(() => countAll({ methods: TRAINING_METHODS, drills: DRILLS }), []);

  // Q3: Evidence 상세(카테고리 필터/요약)
  const [evCat, setEvCat] = useState<Category|''>('');
  const evidenceDetailed = useMemo(()=>{
    // url → {label,url,count,byCat}
    const map = new Map<string, {label:string; url:string; count:number; byCat:Record<Category, number>}>();
    const touch = (url:string, label:string, cats:Category[])=>{
      const k = url.trim();
      const v = map.get(k) || { label, url:k, count:0, byCat: { Endurance:0, Speed:0, Technique:0, RaceStrategy:0, OpenWater:0 } };
      v.count += 1;
      cats.forEach(c=> v.byCat[c] += 1);
      map.set(k, v);
    };
    TRAINING_METHODS.forEach(m=>{
      (m.evidence||[]).forEach(e=>touch(e.url, e.label, [m.category]));
    });
    DRILLS.forEach(d=>{
      (d.evidence||[]).forEach(e=>touch(e.url, e.label, ['Technique']));
    });
    // Q3: 한 줄 요약(알려진 레이블 몇 개만)
    const summaryDict: Record<string,string> = {
      'CSS/MLSS 개요': '지속가능 임계속도(CSS)와 MLSS 개념 요약(지구력 페이스 산정 근거).',
      '반복 스프린트 휴식 비율': '반복 스프린트 시 충분 휴식(1:5~1:8)이 성능 유지에 유리.',
      '저호흡/블랙아웃 공동 성명': '의도적 저호흡은 안전 리스크. 무산소·저산소 훈련 시 각별한 관리 필요.',
      '상지 스트로크 효율/부하': '어깨 부하 관리: 패들/저항은 점진·보수적으로.',
      '오픈워터 드래프팅 연구': '드래프팅이 에너지 절감과 페이스 유지에 도움.',
      '정렬/스트림라인 팁': '좋은 정렬은 저항 감소와 효율 증대의 핵심.',
      '언더워터 돌핀 킥(테크/부하)': '언더워터 킥은 기술 숙련과 부하 관리 모두 필요.',
    };
    const arr = Array.from(map.values()).map(v=>({ ...v, summary: summaryDict[v.label] || '' }));
    arr.sort((a,b)=> b.count - a.count);
    return arr;
  }, []);

  const evidenceFiltered = evCat
    ? evidenceDetailed.filter(e => e.byCat[evCat] > 0)
    : evidenceDetailed;

  // Modal
  const [modal, setModal] = useState<{type: 'method'|'drill'; payload: TrainingMethod|Drill }|null>(null);

  // 장비 아이콘 & 회피 배지
  const getEquipmentIcons = (title: string, howToDo: string) => {
    const s = (title + ' ' + howToDo).toLowerCase();
    const icons: string[] = [];
    if (/(paddle|패들)/.test(s)) icons.push('🖐️');
    if (/(fin|핀)/.test(s)) icons.push('🦶');
    if (/(snorkel|스노클)/.test(s)) icons.push('🤿');
    if (/(pull|풀\b)/.test(s)) icons.push('🛟');
    if (/(board|보드)/.test(s)) icons.push('🛶');
    if (/(parachute|band|저항)/.test(s)) icons.push('🎒');
    return icons;
  };
  const isAvoidByCondition = (id: string) => {
    if (!conditionInput) return false;
    // Q3: 다중 조건 병합 확인
    const multi = applyRulesMulti(conditionInput);
    return !!multi?.avoidMethods?.includes(id);
  };

  return (
    <div className="p-4 max-w-[1100px] mx-auto text-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Swim Program Generator (PRO)</h1>
          <p className="opacity-70">Methods {counts.methods} · Drills {counts.drills}</p>
        </div>
        
        {/* 네비게이션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/swimlab-demo', '_blank')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            ⚙️ 컨디션 설정
          </button>
          
          {initialConditions.length > 0 && (
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-green-200">
              ✅ {initialConditions.length}개 컨디션 적용됨
            </div>
          )}
        </div>
      </div>

      <nav className="flex gap-2 mb-4 flex-wrap">
        {(['Program','Methods','Drills','Conditions','Evidence','Planner'] as TabKey[]).map(k => (
          <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 rounded-full border ${tab===k?'bg-black text-white':'bg-white'}`}>{k}</button>
        ))}
      </nav>

      {tab === 'Program' && (
        <section className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-2">
            <label className="flex flex-col gap-1">
              <span className="font-medium">목표</span>
              <select value={goal} onChange={e=>setGoal(e.target.value as any)} className="border rounded px-2 py-1">
                <option>Endurance</option><option>Tempo</option><option>Speed</option>
                <option>Race</option><option>Technique</option><option>OpenWater</option>
                <option>Rehab</option><option>Recovery</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">목표 거리(m)</span>
              <input type="number" value={targetMeters} onChange={e=>setTargetMeters(parseInt(e.target.value||'0'))} className="border rounded px-2 py-1"/>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">풀 길이</span>
              <select value={poolLen} onChange={e=>setPoolLen(Number(e.target.value) as 25|50)} className="border rounded px-2 py-1">
                <option value={25}>25m</option><option value={50}>50m</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">영법</span>
              <select value={stroke} onChange={e=>setStroke(e.target.value as any)} className="border rounded px-2 py-1">
                <option value="FR">Free</option>
                <option value="BK">Back</option>
                <option value="BR">Breast</option>
                <option value="FL">Fly</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">CSS (초/100m)</span>
              <input placeholder="95" value={css100} onChange={e=>setCss100(e.target.value?Number(e.target.value):'')} className="border rounded px-2 py-1"/>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Conditions</span>
              <input placeholder="pfps tos…" value={conditionInput} onChange={e=>setConditionInput(e.target.value)} className="border rounded px-2 py-1"/>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">숙련</span>
              <select value={skill} onChange={e=>setSkill(e.target.value as any)} className="border rounded px-2 py-1">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">키(cm)</span>
              <input placeholder="175" value={heightCm} onChange={e=>setHeightCm(e.target.value?Number(e.target.value):'')} className="border rounded px-2 py-1"/>
            </label>
          </div>

          {/* Q2: Auto SPL 토글 + Q2: TT 시뮬레이션 토글 */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={autoSPL} onChange={e=>setAutoSPL(e.target.checked)}/>
              <span className="font-medium">Auto SPL</span>
            </label>
            {autoSPL && <span className="text-xs opacity-70">자동 추정 SPL: {splAutoValue}</span>}
            {!autoSPL && (
              <label className="flex items-center gap-2">
                <span className="text-xs">수동 SPL(25m):</span>
                <input type="number" value={targetSPL25} onChange={e=>setTargetSPL25(parseInt(e.target.value||'18'))} className="border rounded px-2 py-1 w-16"/>
              </label>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={withTT} onChange={e=>setWithTT(e.target.checked)}/>
              <span className="font-medium">TT 비프 시뮬레이션</span>
            </label>
          </div>

          {/* PR 붙여넣기 → CSS 추정 */}
          <details className="border rounded p-2 bg-gray-50">
            <summary className="cursor-pointer font-medium">PR 텍스트/CSV로 CSS 자동 추정</summary>
            <div className="mt-2 grid gap-2">
              <textarea
                rows={4}
                placeholder={`예)\n100, 1:20\n200 3:00\n400=6:30`}
                value={prText}
                onChange={e=>setPrText(e.target.value)}
                className="border rounded p-2"
              />
              <div className="flex gap-2">
                <button
                  className="border rounded px-3 py-1"
                  onClick={()=>{
                    const prs = parsePRText(prText);
                    const css = estimateCSSFromPRs(prs);
                    if (css) setCss100(Math.round(css));
                  }}
                >CSS 추정값 반영</button>
                <span className="text-xs opacity-70">200/400 또는 100/200 기록이 있을 때 정확도가 높다.</span>
              </div>
            </div>
          </details>

          <ProgramView plan={program} />

          {program.notes?.length ? (
            <div className="border rounded p-2 text-xs bg-yellow-50">
              {program.notes.map((n,i)=><div key={i}>• {n}</div>)}
            </div>
          ) : null}

          {/* 현재 프로그램 저장 버튼 */}
          <div className="flex gap-2">
            <button
              className="border rounded px-4 py-2 bg-blue-50 font-medium"
              onClick={()=>{
                const id = `${new Date().toISOString().slice(0,10)}_${goal}_${targetMeters}_${poolLen}_${stroke}_${Date.now()}`;
                const session: SwimSession = {
                  id,
                  date: new Date().toISOString().slice(0,10),
                  title: `${goal} (${targetMeters}m)`,
                  goal, meters: targetMeters, pool: poolLen, stroke,
                  conditionIds: conditionInput || undefined,
                  cssPer100: typeof css100==='number'?css100:undefined,
                  targetSPL25: splAutoValue,
                  plan: program as any,
                };
                History.save(session);
                alert('프로그램이 History에 저장되었습니다. Planner 탭에서 확인하세요.');
              }}
            >💾 현재 프로그램 저장</button>
          </div>
        </section>
      )}

      {tab === 'Methods' && (
        <MethodsTab
          filtered={filteredMethods}
          mCat={mCat}
          setMCat={setMCat}
          mText={mText}
          setMText={setMText}
          setMPage={setMPage}
          onPage={setMPage}
          isAvoidByCondition={isAvoidByCondition}
          getEquipmentIcons={getEquipmentIcons}
          onDetail={(m)=>setModal({type:'method', payload:m})}
        />
      )}

      {tab === 'Drills' && (
        <DrillsTab
          filtered={filteredDrills}
          dText={dText}
          setDText={setDText}
          dTag={dTag}
          setDTag={setDTag}
          setDPage={setDPage}
          onPage={setDPage}
          onDetail={(d)=>setModal({type:'drill', payload:d})}
        />
      )}

      {tab === 'Conditions' && (
        <ConditionPanel condId={conditionInput} onChange={setConditionInput}/>
      )}

      {tab === 'Evidence' && (
        <section className="space-y-3">
          <div className="flex gap-2 items-center">
            <span className="font-medium">카테고리 필터</span>
            <select value={evCat} onChange={e=>setEvCat(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="">전체</option>
              <option value="Endurance">Endurance</option>
              <option value="Speed">Speed</option>
              <option value="Technique">Technique</option>
              <option value="RaceStrategy">RaceStrategy</option>
              <option value="OpenWater">OpenWater</option>
            </select>
          </div>
          <ul className="space-y-2">
            {evidenceFiltered.map((e, idx) => (
              <li key={idx} className="border rounded p-2">
                <div className="font-medium flex items-center gap-2">
                  <span>{e.label}</span>
                  <span className="text-xs opacity-60">×{e.count}</span>
                  {e.summary && (
                    <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded cursor-help" title={e.summary}>요약</span>
                  )}
                </div>
                <div className="text-[11px] opacity-70 mb-1">
                  Endurance:{e.byCat.Endurance} · Speed:{e.byCat.Speed} · Technique:{e.byCat.Technique} · Race:{e.byCat.RaceStrategy} · OW:{e.byCat.OpenWater}
                </div>
                {e.summary && <p className="text-xs mt-1 opacity-80">{e.summary}</p>}
                <a className="text-blue-600 underline break-all text-xs" href={e.url} target="_blank" rel="noreferrer">{e.url}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'Planner' && <Planner />}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={()=>setModal(null)}>
          <div className="bg-white max-w-[680px] w-full rounded-xl p-4 m-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">
                {modal.type==='method' ? (modal.payload as TrainingMethod).title : (modal.payload as Drill).name}
              </div>
              <button className="border rounded px-2 py-1" onClick={()=>setModal(null)}>닫기</button>
            </div>
            <DetailBody modal={modal}/>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub components ---
function MethodsTab({ filtered, mCat, setMCat, mText, setMText, setMPage, onPage, isAvoidByCondition, getEquipmentIcons, onDetail }:{
  filtered: ReturnType<typeof paginate<TrainingMethod>>;
  mCat: Category|'';
  setMCat: (c: Category|'')=>void;
  mText: string;
  setMText: (t:string)=>void;
  setMPage: (p:number)=>void;
  onPage: (p:number)=>void;
  isAvoidByCondition: (id:string)=>boolean;
  getEquipmentIcons: (t:string,h:string)=>string[];
  onDetail: (m:TrainingMethod)=>void;
}) {
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <select value={mCat} onChange={e=>{setMCat(e.target.value as Category|'' ); setMPage(1);}} className="border rounded px-2 py-1">
          <option value="">카테고리 전체</option>
          <option value="Endurance">Endurance</option><option value="Speed">Speed</option>
          <option value="Technique">Technique</option><option value="RaceStrategy">RaceStrategy</option>
          <option value="OpenWater">OpenWater</option>
        </select>
        <input placeholder="검색어" value={mText} onChange={e=>{setMText(e.target.value); setMPage(1);}} className="border rounded px-2 py-1 col-span-2"/>
        <span className="self-center text-right opacity-70">총 {filtered.total}개</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-auto">
        {filtered.data.map(m => {
          const icons = getEquipmentIcons(m.title, m.howToDo);
          const avoid = isAvoidByCondition(m.id);
          return (
            <div key={m.id} className={`border rounded p-3 bg-white ${avoid?'ring-2 ring-red-300':''}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{m.title}</h3>
                <div className="flex items-center gap-1">
                  {icons.map((ic,i)=><span key={i} title="장비" aria-label="장비">{ic}</span>)}
                  <span className="text-xs px-2 py-0.5 rounded-full border">{m.category}</span>
                </div>
              </div>
              {avoid && <div className="text-[10px] mt-1 px-1.5 py-0.5 inline-block rounded bg-red-100 text-red-700">주의: 현재 조건 회피 대상</div>}
              <p className="mt-1 text-xs opacity-80">{m.whenToUse}</p>
              <p className="mt-1 text-xs"><b>대상:</b> {m.whoShouldUse}</p>
              <p className="mt-1 text-xs"><b>방법:</b> {m.howToDo}</p>
              <p className="mt-1 text-xs opacity-80">{m.intensityAndVolume}</p>
              <div className="flex gap-2 mt-2">
                <button className="border rounded px-2 py-1 text-xs" onClick={()=>onDetail(m)}>상세</button>
              </div>
            </div>
          );
        })}
      </div>
      <Pager page={filtered.page} totalPages={filtered.totalPages} onPage={onPage}/>
    </section>
  );
}

function DrillsTab({ filtered, dText, setDText, dTag, setDTag, setDPage, onPage, onDetail }:{
  filtered: ReturnType<typeof paginate<Drill>>;
  dText: string;
  setDText: (t:string)=>void;
  dTag: string;
  setDTag: (t:string)=>void;
  setDPage: (p:number)=>void;
  onPage: (p:number)=>void;
  onDetail: (d:Drill)=>void;
}) {
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input placeholder="검색어" value={dText} onChange={e=>{setDText(e.target.value); setDPage(1);}} className="border rounded px-2 py-1 col-span-3"/>
        <input placeholder="태그" value={dTag} onChange={e=>{setDTag(e.target.value); setDPage(1);}} className="border rounded px-2 py-1"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-auto">
        {filtered.data.map(d => (
          <div key={d.id} className="border rounded p-3 bg-white">
            <h3 className="font-semibold">{d.name}</h3>
            <p className="mt-1 text-xs opacity-80">{d.definition}</p>
            <p className="mt-1 text-xs"><b>목적:</b> {d.why}</p>
            <p className="mt-1 text-xs"><b>대상:</b> {d.who}</p>
            <p className="mt-1 text-xs"><b>방법:</b> {d.how}</p>
            <div className="flex gap-2 mt-2">
              <button className="border rounded px-2 py-1 text-xs" onClick={()=>onDetail(d)}>상세</button>
            </div>
          </div>
        ))}
      </div>
      <Pager page={filtered.page} totalPages={filtered.totalPages} onPage={onPage}/>
    </section>
  );
}

function ConditionPanel({ condId, onChange }: { condId: string; onChange: (s:string)=>void }) {
  // Q3: 다중 조건 병합
  const multi = condId ? applyRulesMulti(condId) : null;
  
  return (
    <section className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input placeholder="다중 조건(쉼표/스페이스): shoulder_impingement pfps tos" value={condId} onChange={e=>onChange(e.target.value)} className="border rounded px-2 py-1 col-span-2"/>
        <button onClick={()=>onChange(condId.trim())} className="border rounded px-3 py-1">적용</button>
      </div>
      {!condId && <p className="opacity-70">조건 id를 입력하면 추천/회피가 표시된다. 동의어·축약어도 인식. 다중 입력 가능.</p>}
      {condId && !multi && <p className="opacity-70">매칭 RULE 없음. idmap.ts에 동의어 추가 또는 RULES 보강.</p>}
      {multi && (
        <div className="space-y-2">
          <div className="text-xs opacity-70">입력: {multi.input.join(', ')} → 정규화: {multi.normalized.join(', ')}</div>
          <div className="grid md:grid-cols-2 gap-2">
            <div className="border rounded p-3">
              <div className="font-semibold mb-1">추천</div>
              <p className="text-xs"><b>Methods:</b> {multi.recommendMethods.join(', ') || '-'}</p>
              <p className="text-xs"><b>Drills:</b> {multi.recommendDrills.join(', ') || '-'}</p>
            </div>
            <div className="border rounded p-3">
              <div className="font-semibold mb-1">회피</div>
              <p className="text-xs"><b>Methods:</b> {multi.avoidMethods.join(', ') || '-'}</p>
              <p className="text-xs"><b>Drills:</b> {multi.avoidDrills.join(', ') || '-'}</p>
            </div>
          </div>
          {multi.cautions.length > 0 && (
            <div className="border rounded p-3 bg-yellow-50">
              <div className="font-semibold mb-1 text-yellow-800">⚠️ 충돌 항목 (제외됨)</div>
              <p className="text-xs">{multi.cautions.join(', ')}</p>
            </div>
          )}
          <div className="border rounded p-3">
            <div className="font-semibold mb-1">설명</div>
            {multi.rationale.map((r,i)=><p key={i} className="text-xs mb-1">{r}</p>)}
          </div>
          {multi.evidence?.length ? (
            <div className="border rounded p-3">
              <div className="font-semibold mb-1">근거 (통합)</div>
              <ul className="text-xs list-disc pl-4">
                {multi.evidence.map((e,i)=><li key={i}><a className="underline text-blue-600" href={e.url} target="_blank" rel="noreferrer">{e.label}</a></li>)}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ProgramView({ plan }: { plan: ReturnType<typeof buildProgram> }) {
  return (
    <div className="grid gap-2">
      {[...plan.WU, ...plan.PRE, ...plan.MAIN, ...plan.CD].map((blk, i)=>(
        <div key={i} className="border rounded p-3 bg-white">
          <div className="font-semibold">{blk.name} <span className="text-xs opacity-60">({blk.meters} m)</span></div>
          <ul className="list-disc pl-5 text-xs space-y-1">
            {blk.items.map((s, idx)=><li key={idx}>{s}</li>)}
          </ul>
        </div>
      ))}
      <div className="text-xs opacity-70">총 거리: ~{plan.totalMeters} m</div>
    </div>
  );
}

function DetailBody({ modal }:{ modal:{type:'method'|'drill'; payload: TrainingMethod|Drill }}) {
  if (modal.type === 'method') {
    const m = modal.payload as TrainingMethod;
    return (
      <div className="text-xs space-y-1">
        <p><b>언제:</b> {m.whenToUse}</p>
        <p><b>누가:</b> {m.whoShouldUse}</p>
        <p><b>어떻게:</b> {m.howToDo}</p>
        <p><b>강도·볼륨:</b> {m.intensityAndVolume}</p>
        <p><b>장점:</b> {m.pros}</p>
        <p><b>단점:</b> {m.cons}</p>
        <p><b>주의:</b> {m.cautions}</p>
        {m.recommendedDrills?.length ? <p><b>추천 드릴:</b> {m.recommendedDrills.join(', ')}</p> : null}
        {m.evidence?.length ? (
          <div className="mt-2">
            <div className="font-semibold">근거</div>
            <ul className="list-disc pl-4">
              {m.evidence.map((e,i)=><li key={i}><a className="underline text-blue-600" href={e.url} target="_blank" rel="noreferrer">{e.label}</a></li>)}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
  const d = modal.payload as Drill;
  return (
    <div className="text-xs space-y-1">
      <p><b>정의:</b> {d.definition}</p>
      <p><b>왜:</b> {d.why}</p>
      <p><b>언제:</b> {d.when}</p>
      <p><b>누가:</b> {d.who}</p>
      <p><b>어떻게:</b> {d.how}</p>
      <p><b>장점:</b> {d.pros}</p>
      <p><b>단점:</b> {d.cons}</p>
      <p><b>주의:</b> {d.cautions}</p>
      {d.cues?.length ? <p><b>코칭 큐:</b> {d.cues.join(', ')}</p> : null}
      {d.examples?.length ? (
        <div className="mt-1"><b>예시:</b>
          <ul className="list-disc pl-4">{d.examples.map((x,i)=><li key={i}>{x}</li>)}</ul>
        </div>
      ) : null}
      {d.evidence?.length ? (
        <div className="mt-2">
          <div className="font-semibold">근거</div>
          <ul className="list-disc pl-4">
            {d.evidence.map((e,i)=><li key={i}><a className="underline text-blue-600" href={e.url} target="_blank" rel="noreferrer">{e.label}</a></li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p:number)=>void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mt-2">
      <button className="border rounded px-2 py-1" onClick={()=>onPage(Math.max(1, page-1))}>이전</button>
      <span className="text-xs opacity-80">{page}/{totalPages}</span>
      <button className="border rounded px-2 py-1" onClick={()=>onPage(Math.min(totalPages, page+1))}>다음</button>
    </div>
  );
}

