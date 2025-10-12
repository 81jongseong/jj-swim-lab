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
}

export default function CSSInputSection({ 
  css, 
  cssInfo, 
  strokes, 
  onUpdate 
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

