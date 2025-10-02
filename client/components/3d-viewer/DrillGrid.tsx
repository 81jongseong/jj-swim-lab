/**
 * 🎴 드릴 카드 그리드 + 필터
 * 
 * 📋 **의존성**:
 * - ../../data/drills3d.ts
 * - ./DrillCard.tsx
 * 
 * 🔄 **사용처**:
 * - /3d-viewer 페이지
 * 
 * 🎨 **기능**:
 * - 영법별 필터링 (ALL/FR/BK/BR/FL/IM)
 * - 검색 (제목, 설명, 태그, 큐)
 * - 반응형 그리드 (2/3/4열)
 * - 공개된 드릴만 표시 (체험 모드)
 * 
 * 📅 **수정 히스토리**:
 * - 2025-01-22: 초기 생성
 */

'use client';

import React, { useMemo, useState } from 'react';
import { getPublicDrills } from '../../data/drills3d';
import DrillCard from './DrillCard';
import type { StrokeType } from '../../types/drill3d';

export default function DrillGrid() {
  const [stroke, setStroke] = useState<'ALL' | StrokeType>('ALL');
  const [query, setQuery] = useState('');

  const publicDrills = useMemo(() => getPublicDrills(), []);

  const filteredList = useMemo(() => {
    const q = query.toLowerCase();
    return publicDrills.filter((d) => {
      const matchStroke = stroke === 'ALL' || d.stroke === stroke;
      const matchQuery =
        q === '' ||
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        d.cues.some((cue) => cue.toLowerCase().includes(q));
      return matchStroke && matchQuery;
    });
  }, [publicDrills, stroke, query]);

  return (
    <div className="grid gap-4">
      {/* 필터 & 검색 */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        {/* 영법 필터 */}
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={stroke}
          onChange={(e) => setStroke(e.target.value as any)}
        >
          <option value="ALL">🏊 모든 영법</option>
          <option value="FR">🏊‍♂️ 자유형</option>
          <option value="BK">🏊‍♀️ 배영</option>
          <option value="BR">🏊 평영</option>
          <option value="FL">🦋 접영</option>
          <option value="IM">🎯 IM</option>
        </select>

        {/* 검색 */}
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="🔍 검색 (예: 캐치, 킥, 타이밍...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* 결과 개수 */}
        <div className="text-xs text-gray-500 flex items-center gap-1 px-2">
          <span className="font-medium text-gray-900">{filteredList.length}</span>개 드릴
        </div>
      </div>

      {/* 카드 그리드 */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredList.map((item) => (
            <DrillCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">드릴을 찾을 수 없습니다</h3>
          <p className="text-gray-600">
            {query ? '다른 검색어를 시도해보세요' : '필터를 변경하거나 검색어를 입력하세요'}
          </p>
        </div>
      )}

      {/* 안내 메시지 */}
      {filteredList.length > 0 && (
        <div className="text-xs text-gray-500 text-center mt-2">
          💡 카드를 클릭하면 우측(또는 하단)에서 3D 뷰어로 볼 수 있습니다
        </div>
      )}
    </div>
  );
}

