/**
 * 필터 패널 컴포넌트
 * 
 * 연동되는 데이터:
 * - filters: 필터 정의 배열
 * - values: 현재 필터 값들
 * - onFilterChange: 필터 변경 콜백
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/dashboard, admin/center-management, admin/users 등
 */

'use client';

import React from 'react';

interface FilterOption {
  label: string;
  value: string | number;
}

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

interface FilterPanelProps {
  filters: Filter[];
  values: { [key: string]: any };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters?: () => void;
  className?: string;
  title?: string;
  collapsible?: boolean;
}

export default function FilterPanel({
  filters,
  values,
  onFilterChange,
  onClearFilters,
  className = "",
  title = "필터",
  collapsible = true
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsible);

  const renderFilter = (filter: Filter) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value || null)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${filter.className || ''}`}
          >
            <option value="">전체</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: any) => v !== option.value);
                    onFilterChange(filter.key, newValues.length > 0 ? newValues : null);
                  }}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value || null)}
            placeholder={filter.placeholder}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${filter.className || ''}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value ? Number(e.target.value) : null)}
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${filter.className || ''}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value || null)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${filter.className || ''}`}
          />
        );

      case 'daterange':
        const startValue = value?.start || '';
        const endValue = value?.end || '';
        
        return (
          <div className="flex gap-2">
            <input
              type="date"
              value={startValue}
              onChange={(e) => onFilterChange(filter.key, { ...value, start: e.target.value || null })}
              placeholder="시작일"
              className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${filter.className || ''}`}
            />
            <span className="flex items-center text-gray-500">~</span>
            <input
              type="date"
              value={endValue}
              onChange={(e) => onFilterChange(filter.key, { ...value, end: e.target.value || null })}
              placeholder="종료일"
              className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${filter.className || ''}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(values).some(value => 
    value !== null && value !== undefined && value !== '' && 
    !(Array.isArray(value) && value.length === 0)
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                필터 초기화
              </button>
            )}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isCollapsed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 필터 내용 */}
      {!isCollapsed && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map(filter => (
              <div key={filter.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                {renderFilter(filter)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

