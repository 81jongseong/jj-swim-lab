/**
 * 🏊 JJ Swim Lab - 컨디션 빠른 선택 컴포넌트 (최종 버전)
 * 
 * 📋 **컴포넌트 목적**
 * - 주관식 입력 없이 클릭만으로 컨디션 선택
 * - ACUTE(당일 상태) / CHRONIC(질환) 두 축 분리
 * - 코치 프리셋 슬롯(1~5) 저장/불러오기
 * - 빠른 적용 프리셋 버튼
 * 
 * 🔄 **주요 기능**
 * - 칩 방식으로 당일 컨디션 선택 (수면부족, 피로 등)
 * - 질환·특수상황 체크박스 선택 (어깨, 무릎 등)
 * - 슬롯 툴바: 저장/불러오기/비우기 (이름 입력 없음)
 * - 프리셋 버튼으로 일괄 적용
 * - 선택된 항목 실시간 표시
 * 
 * 🗄️ **데이터 연동**
 * - conditions.config.ts (컨디션 정의)
 * - presets.ts (슬롯 저장/불러오기)
 * - rules_multi.ts (조건 중재)
 * - engine.ts (세트 자동 조정 + ✓/⚠ 주석)
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ConditionQuickPick 
 *   value={condIds} 
 *   onChange={setCondIds}
 * />
 * ```
 */

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  EXPOSE_EXTENDED, ACUTE_BASE, CHRONIC_BASE, ACUTE_EXTENDED, CHRONIC_EXTENDED, PRESETS,
  QuickCondition
} from '@/lib/swimlab/config/conditions.config';
import { saveConditionPreset, loadConditionPreset, clearConditionPreset, listConditionPresets } from '@/lib/swimlab/utils/presets';
import { applyRules } from '@/lib/swimlab/utils/rules';
import { labelOfMethod, labelOfDrill } from '@/lib/swimlab/utils/labels';

const RECENT_KEY = 'swimlab.conditions.recent.v1';
const MAX_RECENT = 8;

function useConditions(){
  const ACUTE: QuickCondition[] = EXPOSE_EXTENDED ? [...ACUTE_BASE, ...ACUTE_EXTENDED] : [...ACUTE_BASE];
  const CHRONIC: QuickCondition[] = EXPOSE_EXTENDED ? [...CHRONIC_BASE, ...CHRONIC_EXTENDED] : [...CHRONIC_BASE];
  return { ACUTE, CHRONIC };
}

function pickTop(arr?: string[], n=2){ 
  return (arr||[]).slice(0,n); 
}

function getTooltip(id:string, fallback?:string){
  const r = applyRules(id);
  if (!r) return fallback || '';
  
  const rec = [
    ...pickTop(r.recommendMethods).map(labelOfMethod),
    ...pickTop(r.recommendDrills).map(labelOfDrill)
  ].filter(Boolean);
  
  const avo = [
    ...pickTop(r.avoidMethods).map(labelOfMethod),
    ...pickTop(r.avoidDrills).map(labelOfDrill)
  ].filter(Boolean);

  const recTxt = rec.length ? `추천: ${rec.join(', ')}` : '';
  const avoTxt = avo.length ? `회피: ${avo.join(', ')}` : '';
  const both = [recTxt, avoTxt].filter(Boolean).join(' | ');
  
  if (both) return both;
  return fallback || '';
}

function Chip({ active, label, title, onToggle }:{ active:boolean; label:string; title?:string; onToggle:()=>void }){
  return (
    <button 
      title={title}
      onClick={onToggle} 
      className={`px-2 py-1 text-xs border rounded-full transition-colors ${
        active
          ? 'bg-black text-white border-black' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

export default function ConditionQuickPick({ value, onChange }:{ value: string[]; onChange:(ids:string[])=>void }){
  const { ACUTE, CHRONIC } = useConditions();
  const set = useMemo(()=> new Set(value), [value]);

  // 필터 상태
  const [cat, setCat] = useState<string>('전체');
  const [tagFilter, setTagFilter] = useState<string>('전체');
  const [search, setSearch] = useState('');
  const [openAll, setOpenAll] = useState(false);
  const [slot, setSlot] = useState<number>(1);

  // 최근 선택
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(()=>{ try{ setRecent(JSON.parse(localStorage.getItem(RECENT_KEY)||'[]')); }catch{ /* noop */ } },[]);
  
  const pushRecent = (id:string)=>{
    const next = [id, ...recent.filter(x=>x!==id)].slice(0, MAX_RECENT);
    setRecent(next); 
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const all = useMemo(()=> {
    const merged = [...ACUTE, ...CHRONIC];
    const byCat = cat==='전체' ? merged : merged.filter(x=>x.category===cat);
    const byTag = tagFilter==='전체' ? byCat : byCat.filter(x=> (x.tags||[]).includes(tagFilter));
    const t = search.trim().toLowerCase();
    return t ? byTag.filter(x=> (x.label+x.id+(x.tags||[]).join(' ')).toLowerCase().includes(t)) : byTag;
  }, [ACUTE, CHRONIC, cat, tagFilter, search]);

  const categories = ['전체', ...Array.from(new Set([...ACUTE, ...CHRONIC].map(x=>x.category).filter(Boolean))) as string[]];
  const tags = ['전체', ...Array.from(new Set(([...ACUTE, ...CHRONIC].flatMap(x=>x.tags||[]))))];

  const toggle = (id:string)=>{
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(Array.from(next));
    pushRecent(id);
  };
  
  const applyPreset = (ids:string[])=> {
    const newIds = Array.from(new Set([...value, ...ids]));
    onChange(newIds);
    
    // 시각적 피드백
    const addedCount = ids.filter(id => !value.includes(id)).length;
    if (addedCount > 0) {
      alert(`✅ ${addedCount}개의 컨디션이 추가되었습니다!`);
    } else {
      alert('ℹ️ 이미 모두 선택되어 있습니다.');
    }
  };

  const slots = listConditionPresets();

  return (
    <>
    <div className="grid gap-3 p-3 border rounded-lg bg-gray-50">
      {/* 슬롯 툴바: 이름 입력 없이 Save/Load/Clear */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-white p-2 rounded border">
        <span className="opacity-70 font-medium">코치 프리셋</span>
        <select 
          className="border rounded px-2 py-1 bg-white" 
          value={slot} 
          onChange={e=>setSlot(Number(e.target.value))}
        >
          {[1,2,3,4,5].map(n=>
            <option key={n} value={n}>
              슬롯 #{n} ({slots.find(s=>s.slot===n)?.count||0}개)
            </option>
          )}
        </select>
        <button 
          className="border rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" 
          onClick={()=>onChange(loadConditionPreset(slot))}
        >
          📥 불러오기
        </button>
        <button 
          className="border rounded px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200" 
          onClick={()=>saveConditionPreset(slot, value)}
        >
          💾 저장
        </button>
        <button 
          className="border rounded px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200" 
          onClick={()=>{ clearConditionPreset(slot); }}
        >
          🗑️ 비우기
        </button>
      </div>


      {/* 필터 - 선택박스 설명 추가 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] text-gray-600 mb-1">1️⃣ 부위별 필터</label>
          <select className="w-full border rounded px-2 py-1 text-xs" value={cat} onChange={e=>setCat(e.target.value)}>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-gray-600 mb-1">2️⃣ 태그 필터</label>
          <select className="w-full border rounded px-2 py-1 text-xs" value={tagFilter} onChange={e=>setTagFilter(e.target.value)}>
            {tags.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] text-gray-600 mb-1">🔍 검색어 (한글/영문 모두 가능)</label>
          <input 
            className="w-full border rounded px-2 py-1 text-xs" 
            placeholder="예: 어깨, shoulder, impingement…" 
            value={search} 
            onChange={e=>setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* 전체 보기 버튼 - 더 눈에 띄게 */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg border-2 border-blue-300">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <div>
            <div className="text-sm font-semibold text-gray-800">전체 질환·특수상황 목록</div>
            <div className="text-xs text-gray-600">50개 이상의 컨디션을 검색하고 선택하세요</div>
          </div>
        </div>
        <button 
          className="px-4 py-2 text-sm border-2 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border-blue-400 font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={() => setOpenAll(true)}
        >
          🔍 전체 목록 열기
        </button>
      </div>
      
      <div className="text-sm font-medium text-gray-700 border-t pt-3">
        빠른 선택 (자주 사용하는 {ACUTE.length + CHRONIC.length}개)
      </div>

      {/* 최근 선택 */}
      {!!recent.length && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs opacity-70 font-medium">최근:</span>
          {recent.map(id=>{
            const item = ([...ACUTE, ...CHRONIC].find(x=>x.id===id));
            if (!item) return null;
            return <Chip key={id} label={item.label} active={set.has(id)} title={getTooltip(id, item.tip)} onToggle={()=>toggle(id)} />;
          })}
        </div>
      )}

      {/* 당일 컨디션 (ACUTE) */}
      <div>
        <div className="text-sm font-medium mb-2 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">당일</span>
          당일 컨디션 ({all.filter(x=>x.group==='ACUTE').length}개)
        </div>
        <div className="flex flex-wrap gap-2">
          {ACUTE.filter(a=> all.includes(a as any)).map(c =>
            <Chip key={c.id} active={set.has(c.id)} label={c.label} title={getTooltip(c.id, c.tip)} onToggle={()=>toggle(c.id)} />
          )}
        </div>
      </div>

      {/* 질환·특수상황 (CHRONIC) */}
      <div>
        <div className="text-sm font-medium mb-2 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">질환</span>
          질환·특수상황 ({all.filter(x=>x.group==='CHRONIC').length}개)
        </div>
        <div className="flex flex-wrap gap-2">
          {CHRONIC.filter(a=> all.includes(a as any)).map(c =>
            <Chip key={c.id} active={set.has(c.id)} label={c.label} title={getTooltip(c.id, c.tip)} onToggle={()=>toggle(c.id)} />
          )}
        </div>
      </div>

      {/* 선택된 항목 표시 */}
      {!!value.length && (
        <div className="text-xs text-gray-600 pt-2 border-t bg-white p-2 rounded">
          <span className="font-medium">✓ 선택됨 ({value.length}개):</span> {value.join(', ')}
        </div>
      )}
    </div>
    
    {/* 전체 컨디션 드로어 */}
    {openAll && (
      <>
        {/* Dynamic import to avoid SSR issues */}
        {typeof window !== 'undefined' && (
          React.createElement(
            require('@/components/swimlab/AllConditionsDrawer').default,
            { value, onChange, onClose: () => setOpenAll(false) }
          )
        )}
      </>
    )}
    </>
  );
}

