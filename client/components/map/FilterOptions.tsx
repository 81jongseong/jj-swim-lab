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
  { value: '06:00-09:00', label: '🌅 새벽' },
  { value: '09:00-12:00', label: '🌞 오전' },
  { value: '12:00-14:00', label: '🕐 점심' },
  { value: '14:00-18:00', label: '☀️ 오후' },
  { value: '18:00-22:00', label: '🌙 저녁' }
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
  { value: '12', label: '12레인' }
];

const POOL_LENGTHS: FilterOption[] = [
  { value: '25', label: '25m' },
  { value: '50', label: '50m' }
];

export default function FilterOptions({ filters, onFilterChange }: FilterOptionsProps) {
  const toggleOption = (filterKey: string, value: string) => {
    const currentValues = filters[filterKey as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...filters, [filterKey]: newValues });
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

      {/* 선호 시간대 */}
      <div className="p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">🕐</span>
          선호 시간대
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {TIME_SLOTS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleOption('preferredTimes', option.value)}
              className={`px-3 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
                filters.preferredTimes.includes(option.value)
                  ? 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-lg ring-2 ring-orange-300'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
          레인 수
        </label>
        <div className="grid grid-cols-5 gap-2">
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
      </div>

      {/* 수영장 거리 */}
      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📏</span>
          수영장 거리
        </label>
        <div className="grid grid-cols-2 gap-3">
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
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

