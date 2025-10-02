/**
 * SwimLab Data Pack v4 - 종목 다중 선택 컴포넌트
 * 
 * 체크박스로 여러 종목 선택 + 목표 기록 입력 (mm:ss 형식)
 * 
 * 관련 파일:
 * - client/src/swimlab/components/Planner.tsx
 * - client/src/swimlab/utils/planner.ts
 */

'use client';
import React from 'react';

export type RaceEvent =
  | '50FR'|'100FR'|'200FR'|'400FR'
  | '50BK'|'100BK'|'200BK'
  | '50BR'|'100BR'|'200BR'
  | '50FL'|'100FL'|'200FL'
  | '200IM'|'400IM';

export type RaceTarget = { event: RaceEvent; targetSec: number };

const EVENT_LABELS: Record<RaceEvent, string> = {
  '50FR':'자유형 50m', '100FR':'자유형 100m', '200FR':'자유형 200m', '400FR':'자유형 400m',
  '50BK':'배영 50m','100BK':'배영 100m','200BK':'배영 200m',
  '50BR':'평영 50m','100BR':'평영 100m','200BR':'평영 200m',
  '50FL':'접영 50m','100FL':'접영 100m','200FL':'접영 100m',
  '200IM':'개인혼영 200m','400IM':'개인혼영 400m'
};

function parseMMSS(v: string): number {
  // "1:10" -> 70, "70" -> 70
  const t = v.trim();
  if (!t) return 0;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const m = t.match(/^(\d+):(\d{1,2})$/);
  if (m) return parseInt(m[1])*60 + parseInt(m[2]);
  return 0;
}

function fmtMMSS(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const mm = Math.floor(s/60);
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

export default function MultiEventPicker({
  value, onChange, compact=false
}:{
  value: RaceTarget[]; onChange:(next: RaceTarget[])=>void; compact?: boolean;
}) {
  const setEvent = (ev: RaceEvent, checked: boolean) => {
    const exists = value.find(v => v.event === ev);
    if (checked && !exists) onChange([...value, { event: ev, targetSec: 0 }]);
    if (!checked && exists) onChange(value.filter(v => v.event !== ev));
  };
  const setTime = (ev: RaceEvent, mmss: string) => {
    const sec = parseMMSS(mmss);
    onChange(value.map(v => v.event===ev ? { ...v, targetSec: sec } : v));
  };
  const sections: {title:string; items: RaceEvent[]}[] = [
    { title:'자유형', items:['50FR','100FR','200FR','400FR'] },
    { title:'배영',   items:['50BK','100BK','200BK'] },
    { title:'평영',   items:['50BR','100BR','200BR'] },
    { title:'접영',   items:['50FL','100FL','200FL'] },
    { title:'개인혼영', items:['200IM','400IM'] },
  ];
  return (
    <div className="grid gap-2">
      {sections.map(sec=>(
        <div key={sec.title} className="border rounded p-2">
          <div className="font-medium mb-1">{sec.title}</div>
          <div className={`grid ${compact?'grid-cols-2':'grid-cols-2 md:grid-cols-4'} gap-2`}>
            {sec.items.map(ev=>{
              const picked = value.find(v => v.event===ev);
              return (
                <label key={ev} className="flex items-center gap-2 border rounded px-2 py-1">
                  <input
                    type="checkbox"
                    checked={!!picked}
                    onChange={e=>setEvent(ev, e.target.checked)}
                  />
                  <span className="text-sm">{EVENT_LABELS[ev]}</span>
                  {picked && (
                    <span className="ml-auto flex items-center gap-1 text-xs">
                      <span>목표</span>
                      <input
                        className="border rounded px-1 py-0.5 w-16 text-right"
                        placeholder="mm:ss"
                        defaultValue={picked.targetSec? fmtMMSS(picked.targetSec):''}
                        onBlur={e=>setTime(ev, e.target.value)}
                      />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!!value.length && (
        <div className="text-xs opacity-70">
          선택: {value.map(v=>`${EVENT_LABELS[v.event]}${v.targetSec?`(${fmtMMSS(v.targetSec)})`:''}`).join(', ')}
        </div>
      )}
    </div>
  );
}

