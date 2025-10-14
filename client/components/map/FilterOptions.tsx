/**
 * 🎛️ 필터 옵션 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 가격, 시간, 요일, 레인, 거리 등 필터
 * - 모던 토글 버튼 디자인
 * - 선택된 옵션 표시
 * 
 * 🔗 **연동 파일**:
 * - client/app/map/page.tsx
 */

'use client';

import React from 'react';

interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

interface FilterOptionsProps {
  filters: {
    selectedPriceTypes: string[];
    selectedPrices: string[];
    preferredTimes: string[];
    preferredDays: string[];
    includeHolidays: boolean;
    selectedLanes: string[];
    selectedLengths: string[];
    selectedCapacities: string[];
    selectedUsageHistory: string[];
  };
  onFilterChange: (filters: any) => void;
}

const PRICE_TYPES: FilterOption[] = [
  { value: 'lessons', label: '🎓 강습', icon: '🎓' },
  { value: 'free_swimming', label: '🏊 자유수영', icon: '🏊' }
];

const PRICE_RANGES: FilterOption[] = [
  { value: '50000', label: '5만원 이하' },
  { value: '80000', label: '8만원 이하' },
  { value: '100000', label: '10만원 이하' },
  { value: '150000', label: '15만원 이하' }
];

const TIME_SLOTS: FilterOption[] = [
  { value: '06:00-09:00', label: '🌅 06:00-09:00 (새벽)' },
  { value: '09:00-12:00', label: '🌞 09:00-12:00 (오전)' },
  { value: '12:00-14:00', label: '🕐 12:00-14:00 (점심)' },
  { value: '14:00-18:00', label: '☀️ 14:00-18:00 (오후)' },
  { value: '18:00-22:00', label: '🌙 18:00-22:00 (저녁)' },
  { value: '22:00-24:00', label: '🌃 22:00-24:00 (심야)' }
];

const WEEK_DAYS: FilterOption[] = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' }
];

const POOL_LANES: FilterOption[] = [
  { value: '4', label: '4레인' },
  { value: '6', label: '6레인' },
  { value: '8', label: '8레인' },
  { value: '10', label: '10레인' },
  { value: '15', label: '15레인' },
  { value: '20', label: '20레인' }
];

const POOL_LENGTHS: FilterOption[] = [
  { value: '25', label: '25m (단수영장)' },
  { value: '50', label: '50m (장수영장)' }
];

export default function FilterOptions({ filters, onFilterChange }: FilterOptionsProps) {
  const [customLanes, setCustomLanes] = React.useState('');
  const [customLength, setCustomLength] = React.useState('');
  const [expandedTimeSlot, setExpandedTimeSlot] = React.useState<string | null>(null);

  const toggleOption = (filterKey: string, value: string) => {
    const currentValues = filters[filterKey as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...filters, [filterKey]: newValues });
  };

  const addCustomLanes = () => {
    const lanes = parseInt(customLanes);
    if (lanes >= 1 && lanes <= 50) {
      toggleOption('selectedLanes', customLanes);
      setCustomLanes('');
    }
  };

  const addCustomLength = () => {
    const length = parseInt(customLength);
    if (length >= 10 && length <= 100) {
      toggleOption('selectedLengths', customLength);
      setCustomLength('');
    }
  };

  // 시간대별 세부 시간 생성
  const getDetailedHours = (timeSlot: string): string[] => {
    const [start, end] = timeSlot.split('-').map(t => parseInt(t.split(':')[0]));
    const hours: string[] = [];
    for (let h = start; h < end; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00-${(h + 1).toString().padStart(2, '0')}:00`);
    }
    return hours;
  };

  return (
    <div className="space-y-6">
      {/* 가격 유형 */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          가격 유형
        </label>
        <div className="flex gap-3">
          {PRICE_TYPES.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleOption('selectedPriceTypes', option.value)}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
                filters.selectedPriceTypes.includes(option.value)
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg ring-2 ring-blue-300'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div>{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 선호 시간대 - 2단계 선택 */}
      <div className="p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">🕐</span>
          선호 시간대
        </label>
        
        {/* 1단계: 시간대 블록 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {TIME_SLOTS.map((option) => {
            const isExpanded = expandedTimeSlot === option.value;
            const hasSelection = getDetailedHours(option.value).some(h => filters.preferredTimes.includes(h));
            
            return (
              <div key={option.value}>
                <button
                  onClick={() => setExpandedTimeSlot(isExpanded ? null : option.value)}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
                    hasSelection
                      ? 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-lg ring-2 ring-orange-300'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400'
                  }`}
                >
                  <div className="text-lg mb-1">{option.label.split(' ')[0]}</div>
                  <div className="text-xs opacity-90">{option.label.split(' ')[1]}</div>
                  {isExpanded && <div className="text-xs mt-1">▼ 시간 선택</div>}
                </button>
                
                {/* 2단계: 세부 시간 (1시간 단위) */}
                {isExpanded && (
                  <div className="mt-2 p-3 bg-white rounded-lg border-2 border-orange-300 shadow-lg">
                    <div className="text-xs font-bold text-gray-700 mb-2">1시간 단위 선택:</div>
                    <div className="grid grid-cols-1 gap-1">
                      {getDetailedHours(option.value).map((hour) => (
                        <button
                          key={hour}
                          onClick={() => toggleOption('preferredTimes', hour)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            filters.preferredTimes.includes(hour)
                              ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-orange-100'
                          }`}
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-600">💡 시간대를 클릭하면 1시간 단위로 세부 선택 가능</p>
      </div>

      {/* 선호 요일 */}
      <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          선호 요일
        </label>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEK_DAYS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleOption('preferredDays', option.value)}
              className={`px-2 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
                filters.preferredDays.includes(option.value)
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg ring-2 ring-purple-300'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onFilterChange({ ...filters, includeHolidays: !filters.includeHolidays })}
          className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            filters.includeHolidays
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-400'
          }`}
        >
          🎉 공휴일 포함
        </button>
      </div>

      {/* 레인 수 */}
      <div className="p-5 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border border-cyan-200">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">🏊‍♂️</span>
          레인 수 (이상)
        </label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {POOL_LANES.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleOption('selectedLanes', option.value)}
              className={`px-3 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
                filters.selectedLanes.includes(option.value)
                  ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg ring-2 ring-cyan-300'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-cyan-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {/* 수동 입력 */}
        <div className="flex gap-2">
          <input
            type="number"
            value={customLanes}
            onChange={(e) => setCustomLanes(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomLanes()}
            placeholder="직접 입력 (예: 12)"
            min="1"
            max="50"
            className="flex-1 px-4 py-2 border-2 border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <button
            onClick={addCustomLanes}
            disabled={!customLanes}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            추가
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">💡 1~50레인까지 입력 가능 (보조 풀 포함)</p>
      </div>

      {/* 수영장 거리 */}
      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📏</span>
          수영장 거리 (이상)
        </label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {POOL_LENGTHS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleOption('selectedLengths', option.value)}
              className={`px-4 py-4 rounded-xl font-bold text-base transition-all transform hover:scale-105 ${
                filters.selectedLengths.includes(option.value)
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg ring-2 ring-green-300'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400'
              }`}
            >
              <div className="text-2xl mb-1">{option.value}m</div>
              <div className="text-xs opacity-90">{option.label.split(' ')[1]}</div>
            </button>
          ))}
        </div>
        {/* 수동 입력 */}
        <div className="p-3 bg-white rounded-lg border-2 border-green-300">
          <label className="text-xs font-bold text-gray-700 mb-2 block">특수 길이 입력:</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={customLength}
              onChange={(e) => setCustomLength(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomLength()}
              placeholder="예: 20, 33 등"
              min="10"
              max="100"
              className="flex-1 px-4 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <button
              onClick={addCustomLength}
              disabled={!customLength}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              추가
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">10~100m (어린이 풀, 특수 규격 등)</p>
        </div>
      </div>
    </div>
  );
}

