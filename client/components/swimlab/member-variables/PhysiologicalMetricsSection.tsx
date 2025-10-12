/**
 * 🧬 생리학적 지표 입력 섹션 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - VO2max, 최고심박수, 안정심박수 입력
 * - 개선 한계 판단 및 맞춤형 강도 조절용
 * 
 * 🔗 **연동 파일:**
 * - BulkMemberVariablesModal.tsx (부모 컴포넌트)
 * - User.studentInfo.swimmingProfile (저장 데이터)
 */

'use client';

import React from 'react';

interface PhysiologicalMetricsSectionProps {
  vo2max?: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
  onUpdate: (metrics: {
    vo2max?: number;
    maxHeartRate?: number;
    restingHeartRate?: number;
  }) => void;
}

export default function PhysiologicalMetricsSection({
  vo2max,
  maxHeartRate,
  restingHeartRate,
  onUpdate
}: PhysiologicalMetricsSectionProps) {
  const handleSetDefault = () => {
    onUpdate({
      vo2max: 40,
      maxHeartRate: 180,
      restingHeartRate: 70
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">🧬 생리학적 지표</h4>
          <p className="text-xs text-gray-600 mt-1">
            개선 한계 판단 및 맞춤형 강도 조절을 위한 과학적 지표 (선택사항)
          </p>
        </div>
        <button
          onClick={handleSetDefault}
          className="text-xs text-purple-600 hover:text-purple-800"
        >
          기본값 설정
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* VO2max */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VO2max (ml/kg/min)
          </label>
          <input
            type="number"
            value={vo2max || ''}
            onChange={(e) => onUpdate({ 
              vo2max: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            placeholder="예: 45"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            일반인: 30-40, 운동선수: 50+
          </p>
        </div>
        
        {/* 최고심박수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            최고심박수 (bpm)
          </label>
          <input
            type="number"
            value={maxHeartRate || ''}
            onChange={(e) => onUpdate({ 
              maxHeartRate: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            placeholder="예: 180"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            공식: 220 - 나이
          </p>
        </div>
        
        {/* 안정심박수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            안정심박수 (bpm)
          </label>
          <input
            type="number"
            value={restingHeartRate || ''}
            onChange={(e) => onUpdate({ 
              restingHeartRate: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            placeholder="예: 70"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            아침에 측정한 심박수
          </p>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700 mb-2">
          💡 <strong>생리학적 지표를 모르는 경우:</strong>
        </p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>비워두셔도 됩니다:</strong> 레벨, CSS, 완료율만으로도 프로그램 생성 가능</li>
          <li><strong>입력하면 더 정확:</strong> 개인별 맞춤형 강도 조절 가능</li>
          <li><strong>스마트워치 연동 예정:</strong> Apple Watch, Garmin에서 자동 수집</li>
        </ul>
      </div>
    </div>
  );
}

