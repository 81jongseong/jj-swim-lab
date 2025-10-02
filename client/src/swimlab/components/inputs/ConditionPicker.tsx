/**
 * SwimLab Data Pack v4 - 조건(질환) 다중 선택 컴포넌트
 * 
 * 한국어 라벨 검색/칩 기반 선택, 내부는 정규 id 자동 매핑
 * 
 * 관련 파일:
 * - client/src/swimlab/components/Planner.tsx
 * - client/src/swimlab/utils/idmap.ts
 * - client/src/swimlab/data/condition_labels.ts
 */

'use client';
import React, { useMemo, useState } from 'react';
import { normalizeConditionId, seedConditionIds } from '../../utils/idmap';

export type ConditionItem = { id: string; label: string; synonyms?: string[] };

function fuseScore(q: string, item: ConditionItem) {
  const s = (item.label + ' ' + (item.synonyms||[]).join(' ')).toLowerCase();
  return s.includes(q.toLowerCase()) ? 1 : 0;
}

export default function ConditionPicker({
  source, value, onChange, placeholder='예: 어깨 충돌, 무릎 앞 통증…'
}:{
  source: ConditionItem[];
  value: string[];                      // canonical ids
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  // id 자동 시드(오탈자/하이픈/스페이스 인식)
  useMemo(()=> seedConditionIds(source.map(s=>s.id), Object.fromEntries(source.map(s=>[s.id, s.synonyms||[]]))), [source]);

  const [q, setQ] = useState('');
  const added = new Set(value);

  const hits = useMemo(()=>{
    if (!q.trim()) return source.slice(0, 8);
    return source
      .map(it=>({it, sc: fuseScore(q, it)}))
      .filter(x=>x.sc>0)
      .slice(0, 8)
      .map(x=>x.it);
  }, [q, source]);

  const add = (raw: string) => {
    const norm = normalizeConditionId(raw);
    if (!added.has(norm)) onChange([...value, norm]);
    setQ('');
  };
  const remove = (id: string) => onChange(value.filter(v=>v!==id));

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          value={q} onChange={e=>setQ(e.target.value)} placeholder={placeholder}
          onKeyDown={e=>{ if (e.key==='Enter' && q.trim()) add(q); }}
        />
        <button className="border rounded px-2 py-1" onClick={()=> q.trim() && add(q)}>추가</button>
      </div>

      {/* 추천/검색 결과 */}
      {q.trim() && (
        <div className="flex flex-wrap gap-2">
          {hits.map(it=>(
            <button
              key={it.id}
              onClick={()=>add(it.label)}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
              title={`id: ${it.id}`}
            >{it.label}</button>
          ))}
        </div>
      )}

      {/* 선택된 칩 */}
      <div className="flex flex-wrap gap-2">
        {value.map(id=>(
          <span key={id} className="px-2 py-1 text-xs border rounded-full bg-blue-50 flex items-center gap-1">
            {source.find(s=>s.id===id)?.label || id}
            <button className="ml-1 hover:text-red-600" onClick={()=>remove(id)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

