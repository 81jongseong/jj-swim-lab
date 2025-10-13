/**
 * 🏊 CSS 입력 섹션 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 회원별 CSS (Critical Swim Speed) 입력
 * - 4가지 영법별 CSS 값 설정
 * - 마지막 측정 정보 표시
 * 
 * 🔗 **연동 파일:**
 * - BulkMemberVariablesModal.tsx (부모 컴포넌트)
 * - User.studentInfo.swimmingProfile.css (저장 데이터)
 */

'use client';

import React from 'react';

interface CSSInputSectionProps {
  css: Record<string, number>;
  cssInfo?: {
    lastUpdated?: Date;
    updatedByRole?: 'instructor' | 'self';
  };
  strokes: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  onUpdate: (css: Record<string, number>) => void;
  cssMeasurementPoolLength?: number; // CSS 측정한 수영장 길이
  onCssMeasurementPoolLengthUpdate?: (length: number) => void;
}

export default function CSSInputSection({ 
  css, 
  cssInfo, 
  strokes, 
  onUpdate,
  cssMeasurementPoolLength = 25,
  onCssMeasurementPoolLengthUpdate
}: CSSInputSectionProps) {
  const handleSetDefault = () => {
    const defaultCSS = { 
      freestyle: 90, 
      backstroke: 100, 
      breaststroke: 110, 
      butterfly: 95 
    };
    onUpdate(defaultCSS);
  };

  const handleCSSChange = (strokeId: string, value: string) => {
    onUpdate({
      ...css,
      [strokeId]: parseInt(value) || 0
    });
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">📊 CSS (Critical Swim Speed)</h4>
          {cssInfo?.lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              마지막 측정: {new Date(cssInfo.lastUpdated).toLocaleDateString()} 
              {cssInfo.updatedByRole && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  cssInfo.updatedByRole === 'instructor' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {cssInfo.updatedByRole === 'instructor' ? '👨‍🏫 강사 측정' : '👤 본인 입력'}
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={handleSetDefault}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          기본값 설정
        </button>
      </div>
      
      {/* CSS 측정 수영장 길이 */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="block text-sm font-semibold text-blue-900 mb-2">
          🏊 CSS 측정 수영장 길이
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cssPoolLength"
              value="25"
              checked={cssMeasurementPoolLength === 25}
              onChange={() => onCssMeasurementPoolLengthUpdate?.(25)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">25m 풀</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cssPoolLength"
              value="50"
              checked={cssMeasurementPoolLength === 50}
              onChange={() => onCssMeasurementPoolLengthUpdate?.(50)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">50m 풀</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cssPoolLength"
              value="custom"
              checked={cssMeasurementPoolLength !== 25 && cssMeasurementPoolLength !== 50}
              onChange={() => {}}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">직접 입력:</span>
            <input
              type="number"
              value={cssMeasurementPoolLength !== 25 && cssMeasurementPoolLength !== 50 ? cssMeasurementPoolLength : ''}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 25;
                if (val >= 10 && val <= 100) {
                  onCssMeasurementPoolLengthUpdate?.(val);
                }
              }}
              onFocus={(e) => {
                if (cssMeasurementPoolLength === 25 || cssMeasurementPoolLength === 50) {
                  onCssMeasurementPoolLengthUpdate?.(20);
                }
              }}
              placeholder="15-30"
              className="w-16 px-2 py-1 border border-blue-300 rounded text-sm"
              min="10"
              max="100"
            />
            <span className="text-xs text-gray-600">m</span>
          </label>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          💡 <strong>중요:</strong> CSS를 측정한 수영장 길이를 선택하세요.
          {cssMeasurementPoolLength === 25 && ' 25m 풀은 턴이 많아 CSS가 더 빠릅니다.'}
          {cssMeasurementPoolLength === 50 && ' 50m 풀은 턴이 적어 CSS가 더 느립니다.'}
          {cssMeasurementPoolLength !== 25 && cssMeasurementPoolLength !== 50 && ` ${cssMeasurementPoolLength}m 풀: 100m 당 ${Math.floor(100/cssMeasurementPoolLength)-1}턴`}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          📚 Psycharakis & Sanders (2008): 턴당 0.3-0.6초 이득 (평균 0.4초)
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {strokes.map(stroke => (
          <div key={stroke.id}>
            <label className="block text-xs text-gray-600 mb-1">
              {stroke.icon} {stroke.label}
            </label>
            <div className="relative">
              <input
                type="number"
                value={css[stroke.id] || ''}
                onChange={(e) => handleCSSChange(stroke.id, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm pr-12"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                초/100m
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

