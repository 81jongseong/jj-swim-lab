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
  conditionIds?: string[]; // 질환 ID 리스트
}

export default function StrokesSelectionSection({
  mainStrokes,
  excludedStrokes,
  strokes,
  onUpdate,
  conditionIds = []
}: StrokesSelectionSectionProps) {
  // 🏥 질환별 영법 경고 가져오기
  const getStrokeWarning = (strokeId: string): string | null => {
    if (!conditionIds || conditionIds.length === 0) return null;
    
    // condition-rules-v4.ts의 로직 간소화 버전
    const strokeWarnings: Record<string, string[]> = {
      freestyle: [],
      backstroke: [],
      breaststroke: [],
      butterfly: []
    };
    
    conditionIds.forEach(condId => {
      // 어깨 충돌증
      if (condId.includes('shoulder_impingement') || condId.includes('견관절')) {
        strokeWarnings.freestyle.push('어깨 충돌증: 자유형 주의 (강도 70%로 조절)');
        strokeWarnings.butterfly.push('어깨 충돌증: 접영 금지 (관절 부담 과다)');
      }
      // 회전근개 손상
      if (condId.includes('rotator_cuff') || condId.includes('회전근개')) {
        strokeWarnings.freestyle.push('회전근개 손상: 자유형 주의 (강도 조절 필요)');
        strokeWarnings.butterfly.push('회전근개 손상: 접영 금지 (회전 부담)');
      }
      // 무릎 연골 손상
      if (condId.includes('knee') || condId.includes('무릎')) {
        strokeWarnings.breaststroke.push('무릎 질환: 평영 금지 (웨지킥 부담)');
      }
      // 허리 디스크
      if (condId.includes('lumbar') || condId.includes('허리')) {
        strokeWarnings.breaststroke.push('허리 질환: 평영 주의 (허리 굴곡)');
        strokeWarnings.butterfly.push('허리 질환: 접영 금지 (과도한 척추 움직임)');
      }
    });
    
    return strokeWarnings[strokeId as keyof typeof strokeWarnings]?.[0] || null;
  };

  const toggleMainStroke = (strokeId: string) => {
    if (excludedStrokes.includes(strokeId)) {
      alert('제외 영법으로 설정된 영법은 주 영법으로 선택할 수 없습니다.');
      return;
    }
    
    // 🚨 질환 경고 체크
    const warning = getStrokeWarning(strokeId);
    if (warning) {
      const confirmed = confirm(`⚠️ ${warning}\n\n그래도 이 영법을 선택하시겠습니까?\n(강사와 상담 후 진행을 권장합니다)`);
      if (!confirmed) return;
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
            const isSelected = mainStrokes.includes(stroke.id);
            const warning = getStrokeWarning(stroke.id);
            const hasWarning = warning !== null;
            
            return (
              <button
                key={stroke.id}
                onClick={() => toggleMainStroke(stroke.id)}
                disabled={isExcluded}
                className={`px-4 py-3 border-2 rounded-lg transition-all relative ${
                  isExcluded 
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isSelected
                    ? hasWarning
                      ? 'border-yellow-500 bg-yellow-100 text-yellow-800 font-bold shadow-lg ring-2 ring-yellow-400'
                      : 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : hasWarning
                    ? 'border-yellow-400 hover:border-yellow-500 bg-yellow-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {hasWarning && <div className="absolute -top-2 -right-2 text-2xl animate-pulse">⚠️</div>}
                {isSelected && hasWarning && <div className="absolute -top-1 -left-1 text-sm">✓</div>}
                <div className="text-xl mb-1">{stroke.icon}</div>
                <div className={`text-xs ${isSelected && hasWarning ? 'font-bold' : ''}`}>{stroke.label}</div>
                {isExcluded && <div className="text-xs text-red-600 mt-1">제외됨</div>}
                {hasWarning && !isExcluded && (
                  <div className={`text-xs mt-1 ${isSelected ? 'text-yellow-800 font-bold' : 'text-yellow-600'}`}>
                    {isSelected ? '⚠️ 선택됨 (주의)' : '주의 필요'}
                  </div>
                )}
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

