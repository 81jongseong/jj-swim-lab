/**
 * 🏊 영법 선택 섹션 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 주 영법 (mainStrokes) 선택
 * - 제외 영법 (excludedStrokes) 선택
 * - 상호 배타적 관계 처리
 * 
 * 🔗 **연동 파일:**
 * - BulkMemberVariablesModal.tsx (부모 컴포넌트)
 */

'use client';

import React from 'react';

interface StrokesSelectionSectionProps {
  mainStrokes: string[];
  excludedStrokes: string[];
  strokes: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  onUpdate: (data: {
    mainStrokes?: string[];
    excludedStrokes?: string[];
  }) => void;
}

export default function StrokesSelectionSection({
  mainStrokes,
  excludedStrokes,
  strokes,
  onUpdate
}: StrokesSelectionSectionProps) {
  const toggleMainStroke = (strokeId: string) => {
    if (excludedStrokes.includes(strokeId)) {
      alert('제외 영법으로 설정된 영법은 주 영법으로 선택할 수 없습니다.');
      return;
    }
    const isSelected = mainStrokes.includes(strokeId);
    onUpdate({
      mainStrokes: isSelected
        ? mainStrokes.filter(s => s !== strokeId)
        : [...mainStrokes, strokeId]
    });
  };

  const toggleExcludedStroke = (strokeId: string) => {
    if (mainStrokes.includes(strokeId)) {
      alert('주 영법으로 설정된 영법은 제외 영법으로 선택할 수 없습니다.');
      return;
    }
    const isSelected = excludedStrokes.includes(strokeId);
    onUpdate({
      excludedStrokes: isSelected
        ? excludedStrokes.filter(s => s !== strokeId)
        : [...excludedStrokes, strokeId]
    });
  };

  return (
    <>
      {/* 주 영법 */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold text-gray-900 mb-3">🏊 주 영법 (Main Strokes)</h4>
        <p className="text-xs text-gray-600 mb-3">프로그램의 메인으로 사용할 영법 (최소 1개 이상 선택)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {strokes.map(stroke => {
            const isExcluded = excludedStrokes.includes(stroke.id);
            return (
              <button
                key={stroke.id}
                onClick={() => toggleMainStroke(stroke.id)}
                disabled={isExcluded}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  isExcluded 
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : mainStrokes.includes(stroke.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-xl mb-1">{stroke.icon}</div>
                <div className="text-xs">{stroke.label}</div>
                {isExcluded && <div className="text-xs text-red-600 mt-1">제외됨</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 제외 영법 */}
      <div className="border rounded-lg p-4 bg-red-50">
        <h4 className="font-semibold text-gray-900 mb-3">🚫 회피 영법</h4>
        <p className="text-xs text-gray-600 mb-3">부상이나 선호도로 인해 피하고 싶은 영법 (프로그램에서 제외)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {strokes.map(stroke => {
            const isMainStroke = mainStrokes.includes(stroke.id);
            return (
              <button
                key={stroke.id}
                onClick={() => toggleExcludedStroke(stroke.id)}
                disabled={isMainStroke}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  isMainStroke
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : excludedStrokes.includes(stroke.id)
                    ? 'border-red-500 bg-red-100 text-red-700 font-semibold'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-xl mb-1">{stroke.icon}</div>
                <div className="text-xs">{stroke.label}</div>
                {isMainStroke && <div className="text-xs text-blue-600 mt-1">주 영법</div>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

