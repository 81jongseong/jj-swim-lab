/**
 * SwimLab Data Pack v4 - Planner 컴포넌트
 * 
 * 주간/월간/대회 타임라인, 이력 관리, RPE 부하 추적, .ics 내보내기
 * 
 * 관련 파일:
 * - client/src/swimlab/utils/storage.ts
 * - client/src/swimlab/utils/planner.ts
 * - client/src/swimlab/utils/glossary.ts
 * - client/src/swimlab/utils/engine.ts
 */

'use client';
import React, { useMemo, useState } from 'react';
import { TRAINING_METHODS } from '../data/trainingMethods';
import { DRILLS } from '../data/drills';
import { buildProgram } from '../utils/engine';
import { History, SwimSession } from '../utils/storage';
import { generateWeekSpecs, macrocycleToRace, generateICS } from '../utils/planner';
import { GLOSSARY } from '../utils/glossary';
import MultiEventPicker, { type RaceTarget } from './inputs/MultiEventPicker';
import ConditionPicker from './inputs/ConditionPicker';
import { CONDITION_LABELS } from '../data/condition_labels';

function isoMonday(d = new Date()) {
  const day = (d.getDay()+6)%7; // 월=0
  const m = new Date(d); m.setDate(d.getDate()-day);
  return m.toISOString().slice(0,10);
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export default function Planner() {
  // 공통 상태
  const [pool, setPool] = useState<25|50>(25);
  const [stroke, setStroke] = useState<'FR'|'BK'|'BR'|'FL'>('FR');
  const [css100, setCss100] = useState<number | ''>('');
  const [condIds, setCondIds] = useState<string[]>([]); // 정규 id 배열로 변경
  const [baseMeters, setBaseMeters] = useState(2000);
  const [skill, setSkill] = useState<'Beginner'|'Intermediate'|'Advanced'>('Intermediate');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [raceTargets, setRaceTargets] = useState<RaceTarget[]>([]); // 다중 종목

  // 주간/매크로 설정
  const [monday, setMonday] = useState(isoMonday());
  const [preset, setPreset] = useState<'Base'|'Build'|'Peak'|'Taper'|'Recovery'>('Build');
  const [race, setRace] = useState('');
  const [anchorMode, setAnchorMode] = useState<'none'|'soft'|'hard'>('soft'); // Q2
  const [variancePct, setVariancePct] = useState(20); // Q2

  // History
  const [hist, setHist] = useState<SwimSession[]>(History.list());
  const refresh = ()=> setHist(History.list());

  // 용어 팝오버
  const [showGloss, setShowGloss] = useState(false);

  // 주간 계획 미리보기
  const conditionIdsStr = condIds.join(' '); // 배열 → 문자열
  const weekSpecs = useMemo(()=> generateWeekSpecs({
    startDate: monday, baseMeters, pool, stroke, preset, 
    conditionIds: conditionIdsStr,
    anchorMode, variancePct, // Q2: 앵커 모드 + 변주율
  }), [monday, baseMeters, pool, stroke, preset, conditionIdsStr, anchorMode, variancePct]);

  const makeSession = (spec: ReturnType<typeof generateWeekSpecs>[number]) => {
    const plan = buildProgram({
      methods: TRAINING_METHODS, drills: DRILLS,
      goal: spec.goal, targetMeters: spec.meters, pool: spec.pool,
      stroke, 
      cssPer100: typeof css100==='number'?css100:undefined,
      conditionIds: spec.conditionIds,
      heightCm: typeof heightCm==='number'?heightCm:undefined,
      skill,
    });
    const s: SwimSession = {
      id: uuid(),
      date: spec.date,
      title: `${spec.goal} (${spec.meters}m)`,
      goal: spec.goal,
      meters: spec.meters,
      pool, stroke,
      conditionIds: conditionIdsStr,
      cssPer100: typeof css100==='number'?css100:undefined,
      plan,
    };
    return s;
  };

  const saveWeek = () => {
    weekSpecs.forEach(ws => History.save(makeSession(ws)));
    refresh();
  };

  const exportJSON = () => {
    const blob = new Blob([History.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'SwimLab_History.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportICS = () => {
    const ics = generateICS(hist);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'SwimLab_Schedule.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  const macro = useMemo(()=> race ? macrocycleToRace({ startMonday: monday, raceDate: race }) : null, [monday, race]);

  // RPE 입력 모달
  const [rpeModal, setRpeModal] = useState<SwimSession | null>(null);
  const [rpeValue, setRpeValue] = useState(6);
  const [duration, setDuration] = useState(60);

  const saveRPE = () => {
    if (!rpeModal) return;
    const updated = { ...rpeModal, rpe: rpeValue, duration, sessionLoad: rpeValue * duration, completed: true };
    History.save(updated);
    refresh();
    setRpeModal(null);
  };

  // 주간 요약
  const weekSummary = useMemo(() => History.weekSummary(monday), [hist, monday]);

  return (
    <div className="p-4 max-w-[1100px] mx-auto text-sm">
      <h1 className="text-2xl font-bold mb-2">Swim Planner · History</h1>

      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <div className="border rounded p-3 space-y-2">
          <div className="font-semibold">기본 설정</div>
          <label className="flex items-center justify-between gap-2">
            <span>풀 길이</span>
            <select value={pool} onChange={e=>setPool(Number(e.target.value) as 25|50)} className="border rounded px-2 py-1">
              <option value={25}>25m</option><option value={50}>50m</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>영법</span>
            <select value={stroke} onChange={e=>setStroke(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="FR">Free</option><option value="BK">Back</option>
              <option value="BR">Breast</option><option value="FL">Fly</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>숙련</span>
            <select value={skill} onChange={e=>setSkill(e.target.value as any)} className="border rounded px-2 py-1">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>키(cm)</span>
            <input placeholder="175" value={heightCm} onChange={e=>setHeightCm(e.target.value?Number(e.target.value):'')} className="border rounded px-2 py-1 w-20"/>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>CSS (초/100m)</span>
            <input placeholder="95" value={css100} onChange={e=>setCss100(e.target.value?Number(e.target.value):'')} className="border rounded px-2 py-1 w-20"/>
          </label>
          <div className="border-t pt-2 mt-2">
            <div className="font-medium mb-1 text-xs">질환·특수상황 선택</div>
            <ConditionPicker source={CONDITION_LABELS} value={condIds} onChange={setCondIds} />
          </div>
          <button className="border rounded px-3 py-1 w-full" onClick={()=>setShowGloss(v=>!v)}>
            {showGloss?'용어 닫기':'📖 용어 설명'}
          </button>
          {showGloss && (
            <ul className="text-xs list-disc pl-4 space-y-1">
              {GLOSSARY.map((g,i)=><li key={i}><b>{g.term}</b> — {g.easy} ({g.short}). {g.tip}</li>)}
            </ul>
          )}
        </div>

        <div className="border rounded p-3 space-y-2">
          <div className="font-semibold">주간 계획</div>
          <label className="flex items-center justify-between gap-2">
            <span>주 시작(월)</span>
            <input type="date" value={monday} onChange={e=>setMonday(e.target.value)} className="border rounded px-2 py-1"/>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>하루 기준 거리</span>
            <input type="number" value={baseMeters} onChange={e=>setBaseMeters(parseInt(e.target.value||'0'))} className="border rounded px-2 py-1 w-24"/>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>단계</span>
            <select value={preset} onChange={e=>setPreset(e.target.value as any)} className="border rounded px-2 py-1">
              <option>Base</option><option>Build</option><option>Peak</option><option>Taper</option><option>Recovery</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>앵커 모드</span>
            <select value={anchorMode} onChange={e=>setAnchorMode(e.target.value as any)} className="border rounded px-2 py-1 text-xs">
              <option value="none">None</option>
              <option value="soft">Soft</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>변주율(%)</span>
            <input type="number" value={variancePct} onChange={e=>setVariancePct(Number(e.target.value||'20'))} className="border rounded px-2 py-1 w-16"/>
          </label>
          <button className="border rounded px-3 py-1 w-full bg-blue-50" onClick={saveWeek}>💾 이 주 계획 저장</button>
          <div className="text-xs opacity-70">
            주간 요약: {weekSummary.sessions}세션 · {weekSummary.totalMeters}m · 부하 {Math.round(weekSummary.totalLoad)}
          </div>
        </div>

        <div className="border rounded p-3 space-y-2">
          <div className="font-semibold">대회 타임라인</div>
          <label className="flex items-center justify-between gap-2">
            <span>대회일</span>
            <input type="date" value={race} onChange={e=>setRace(e.target.value)} className="border rounded px-2 py-1"/>
          </label>
          {macro && (
            <div className="text-xs opacity-80">
              대회까지 {macro.weeks}주<br/>
              단계: {macro.stages.join(' → ')}
            </div>
          )}
          
          <div className="border-t pt-2 mt-2">
            <div className="font-medium mb-1 text-xs">종목·목표기록</div>
            <details>
              <summary className="cursor-pointer text-xs opacity-70">종목 선택 펼치기</summary>
              <div className="mt-2">
                <MultiEventPicker value={raceTargets} onChange={setRaceTargets} compact />
              </div>
            </details>
          </div>
          
          <button className="border rounded px-3 py-1 w-full" onClick={exportJSON}>📄 JSON 내보내기</button>
          <button className="border rounded px-3 py-1 w-full" onClick={exportICS}>📅 .ics 내보내기</button>
        </div>
      </div>

      {/* 주간 미리보기 */}
      <div className="border rounded p-3 mb-3">
        <div className="font-semibold mb-2">주간 미리보기 ({weekSpecs.length}일)</div>
        <div className="grid md:grid-cols-2 gap-2">
          {weekSpecs.map((s,i)=>(
            <div key={i} className="border rounded p-2 bg-gray-50">
              <div className="font-medium">{s.date} · {s.goal} · {s.meters}m</div>
              <div className="text-xs opacity-80">pool {s.pool}m · stroke {stroke} · cond {s.conditionIds||'-'}</div>
              <div className="text-[11px] mt-1 opacity-70">→ 저장 시 세트 자동 생성</div>
            </div>
          ))}
        </div>
      </div>

      {/* 저장된 이력 */}
      <div className="border rounded p-3">
        <div className="font-semibold mb-2">History ({hist.length})</div>
        {hist.length===0 ? <div className="text-xs opacity-70">저장된 세션이 없습니다.</div> : (
          <div className="grid md:grid-cols-2 gap-2">
            {hist.map(h=>(
              <div className={`border rounded p-2 ${h.completed?'bg-green-50':'bg-white'}`} key={h.id}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{h.date} · {h.title}</div>
                  {h.completed && <span className="text-xs px-2 py-0.5 bg-green-200 rounded">완료</span>}
                </div>
                <div className="text-xs opacity-80">pool {h.pool}m · stroke {h.stroke} · cond {h.conditionIds||'-'}</div>
                {h.rpe && h.duration && (
                  <div className="text-xs mt-1">
                    RPE: {h.rpe}/10 · {h.duration}분 · 부하: {h.sessionLoad}
                  </div>
                )}
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs">세부 세트 보기</summary>
                  {[...h.plan.WU,...h.plan.PRE,...h.plan.MAIN,...h.plan.CD].map((blk, i)=>(
                    <div key={i} className="text-[11px] mt-1">
                      <b>{blk.name}</b> ({blk.meters}m)
                      <ul className="list-disc pl-4">{blk.items.map((it,idx)=><li key={idx}>{it}</li>)}</ul>
                    </div>
                  ))}
                  {h.plan.notes?.length ? (
                    <div className="text-[11px] mt-1 bg-yellow-50 p-1 rounded">
                      {h.plan.notes.map((n,i)=><div key={i}>• {n}</div>)}
                    </div>
                  ) : null}
                </details>
                <div className="flex gap-2 mt-2">
                  {!h.completed && (
                    <button className="border rounded px-2 py-1 text-xs bg-blue-50" onClick={()=>{setRpeModal(h); setRpeValue(6); setDuration(60);}}>
                      완료 기록
                    </button>
                  )}
                  <button className="border rounded px-2 py-1 text-xs" onClick={()=>{History.remove(h.id); refresh();}}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RPE 입력 모달 */}
      {rpeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={()=>setRpeModal(null)}>
          <div className="bg-white max-w-md w-full rounded-xl p-4 m-4" onClick={e=>e.stopPropagation()}>
            <div className="font-semibold mb-3">{rpeModal.title} 완료 기록</div>
            <div className="space-y-2">
              <label className="flex items-center justify-between gap-2">
                <span>RPE (1~10)</span>
                <input type="number" min={1} max={10} value={rpeValue} onChange={e=>setRpeValue(parseInt(e.target.value)||6)} className="border rounded px-2 py-1 w-20"/>
              </label>
              <label className="flex items-center justify-between gap-2">
                <span>실제 시간(분)</span>
                <input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value)||0)} className="border rounded px-2 py-1 w-20"/>
              </label>
              <div className="text-xs opacity-70">Session-RPE 부하: {rpeValue} × {duration} = {rpeValue * duration}</div>
              <div className="flex gap-2 mt-3">
                <button className="border rounded px-3 py-1 bg-green-50" onClick={saveRPE}>저장</button>
                <button className="border rounded px-3 py-1" onClick={()=>setRpeModal(null)}>취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

