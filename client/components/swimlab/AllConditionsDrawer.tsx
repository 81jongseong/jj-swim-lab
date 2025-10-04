/**
 * 🏊 SwimLab - 전체 컨디션 드로어
 * 
 * 📋 **컴포넌트 목적**
 * - 전체 컨디션 목록 검색 및 선택
 * - QuickPick에서 버튼 클릭으로 열림
 * - 가상 스크롤 + 검색 필터
 * 
 * 🔄 **주요 기능**
 * - 50+ 컨디션 목록 표시
 * - 실시간 검색 (라벨, 키워드)
 * - 카테고리별 필터
 * - 선택/해제 토글
 * - 드로어 형태 UI (하단 슬라이드)
 */

'use client';
import React, { useMemo, useState } from 'react';
import { CONDITIONS, type ConditionFull } from '@/lib/swimlab/data/conditions_full';
import { normalizeConditionId } from '@/lib/swimlab/utils/idmap';

export default function AllConditionsDrawer({ 
  value, 
  onChange, 
  onClose 
}:{
  value: string[]; 
  onChange: (ids: string[]) => void; 
  onClose: () => void;
}){
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('');
  const set = useMemo(() => new Set(value), [value]);
  
  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const cats = new Set(CONDITIONS.map(c => c.category).filter(Boolean));
    return Array.from(cats).sort();
  }, []);

  // 필터링된 목록
  const list = useMemo(() => {
    let base = CONDITIONS as ConditionFull[];
    
    // 카테고리 필터
    if (category) {
      base = base.filter(c => c.category === category);
    }
    
    // 검색어 필터
    if (q.trim()) {
      const t = q.toLowerCase();
      base = base.filter(c => {
        const searchText = [
          c.label,
          c.id,
          ...(c.keywords || [])
        ].join(' ').toLowerCase();
        return searchText.includes(t);
      });
    }
    
    // 최대 300개로 제한 (성능)
    return base.slice(0, 300);
  }, [q, category]);

  const toggle = (conditionId: string) => {
    const id = normalizeConditionId(conditionId);
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(Array.from(next));
  };

  // 통계
  const acuteCount = list.filter(c => c.group === 'ACUTE').length;
  const chronicCount = list.filter(c => c.group === 'CHRONIC').length;
  const selectedCount = value.length;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={onClose}>
      <div 
        className="w-full bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 border-b sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">전체 컨디션 목록</h3>
            <button 
              onClick={onClose}
              className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
            >
              ✕ 닫기
            </button>
          </div>
          
          {/* 검색 바 */}
          <div className="flex gap-2 mb-3">
            <input 
              className="flex-1 border rounded px-3 py-2 text-sm" 
              placeholder="검색 (예: impingement, knee, 어깨…)" 
              value={q} 
              onChange={e => setQ(e.target.value)}
              autoFocus
            />
            <select 
              className="border rounded px-3 py-2 text-sm bg-white"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">전체 카테고리</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 통계 */}
          <div className="flex gap-4 text-xs text-gray-600">
            <span>🟡 당일: {acuteCount}개</span>
            <span>🔴 질환: {chronicCount}개</span>
            <span>✓ 선택됨: {selectedCount}개</span>
            <span>표시: {list.length}개</span>
          </div>
        </div>

        {/* 컨디션 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {list.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>검색 결과가 없습니다</p>
              <p className="text-xs mt-2">다른 검색어를 시도해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {list.map((c, i) => {
                const id = normalizeConditionId(c.id);
                const isSelected = set.has(id);
                
                return (
                  <button 
                    key={i}
                    onClick={() => toggle(c.id)} 
                    className={`
                      px-3 py-2 text-xs border rounded text-left
                      transition-colors
                      ${isSelected 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white hover:bg-gray-50 border-gray-300'
                      }
                    `}
                  >
                    <div className="font-medium">{c.label}</div>
                    {c.category && (
                      <div className={`text-[10px] mt-1 ${isSelected ? 'opacity-70' : 'opacity-50'}`}>
                        {c.group === 'ACUTE' ? '🟡' : '🔴'} {c.category}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            💡 팁: 검색창에 영어 또는 한글로 입력하세요. 예: &quot;shoulder&quot;, &quot;어깨&quot;, &quot;무릎&quot;
          </div>
        </div>
      </div>
    </div>
  );
}

