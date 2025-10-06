/**
 * 간단한 차트 컴포넌트
 * 
 * 연동되는 데이터:
 * - data: 차트 데이터 배열
 * - title: 차트 제목
 * - type: 차트 타입 (bar, line, pie)
 * - colors: 색상 배열
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/center-statistics, admin/revenue-management, admin/dashboard 등
 */

'use client';

import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'line' | 'pie';
  colors?: string[];
  className?: string;
  maxValue?: number;
}

const defaultColors = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-red-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500'
];

export default function SimpleChart({
  data,
  title,
  type,
  colors = defaultColors,
  className = '',
  maxValue
}: SimpleChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  if (type === 'bar') {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-600">{item.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                    item.color || colors[index % colors.length]
                  }`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                item.color || colors[index % colors.length]
              }`} />
              <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
              <span className="text-sm text-gray-600">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                item.color || colors[index % colors.length]
              }`} />
              <span className="text-sm text-gray-700 flex-1">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

