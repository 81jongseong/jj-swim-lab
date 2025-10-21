/**
 * 간단한 막대 차트 컴포넌트
 * 
 * 연동되는 데이터:
 * - data: 차트 데이터 배열
 * - xKey: X축 키
 * - yKey: Y축 키
 * - color: 막대 색상
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/dashboard, admin/analytics, admin/center-management 등
 */

'use client';

import React from 'react';

interface ChartData {
  [key: string]: any;
}

interface SimpleBarChartProps {
  // 기존 모드 (차트 데이터 배열)
  data?: ChartData[];
  xKey?: string;
  yKey?: string;
  
  // 단일 바 모드
  label?: string;
  value?: number;
  maxValue?: number;
  
  // 공통 옵션
  color?: string;
  maxHeight?: number;
  showValues?: boolean;
  horizontal?: boolean;
  className?: string;
}

export default function SimpleBarChart({
  data,
  xKey,
  yKey,
  label,
  value,
  maxValue,
  color = '#3B82F6',
  maxHeight = 300,
  showValues = true,
  horizontal = false,
  className = ""
}: SimpleBarChartProps) {
  // 단일 바 모드
  if (label !== undefined && value !== undefined && maxValue !== undefined) {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValues && (
            <span className="text-sm font-bold text-gray-800">
              {value.toLocaleString()}원
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    );
  }
  
  // 차트 데이터 모드
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        데이터가 없습니다.
      </div>
    );
  }

  // 최대값 계산
  const dataMaxValue = Math.max(...data.map(item => Number(item[yKey!]) || 0));
  const minValue = Math.min(...data.map(item => Number(item[yKey!]) || 0));
  const range = dataMaxValue - minValue || 1;

  if (horizontal) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((item, index) => {
          const value = Number(item[yKey]) || 0;
          const percentage = range > 0 ? ((value - minValue) / range) * 100 : 0;
          const normalizedWidth = 10 + (percentage * 0.8); // 10%-90% 범위로 정규화
          
          return (
            <div 
              key={index} 
              className="space-y-2 group/item animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 group-hover/item:text-gray-900 transition-colors duration-300 truncate">
                  {item[xKey]}
                </span>
                {showValues && (
                  <span className="text-sm font-bold text-gray-800 group-hover/item:text-blue-600 transition-colors duration-300">
                    {value.toLocaleString()}{typeof value === 'number' && value > 100 ? '원' : '%'}
                  </span>
                )}
              </div>
              <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-1000 ease-out animate-slideInLeft shadow-md group-hover/item:shadow-lg"
                  style={{
                    width: `${normalizedWidth}%`,
                    background: `linear-gradient(90deg, ${color}dd, ${color})`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div>최소: {minValue.toLocaleString()}</div>
        <div className="text-right">최대: {dataMaxValue.toLocaleString()}</div>
      </div>
      
      <div 
        className="flex items-end justify-between gap-2"
        style={{ height: maxHeight }}
      >
        {data.map((item, index) => {
          const value = Number(item[yKey]) || 0;
          const percentage = range > 0 ? ((value - minValue) / range) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all duration-1000 ease-out"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: color,
                    minHeight: value > 0 ? '4px' : '0px'
                  }}
                />
                {showValues && value > 0 && (
                  <div className="absolute -top-6 text-xs text-gray-600 font-medium">
                    {value.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center break-words max-w-full">
                {String(item[xKey]).length > 10 
                  ? `${String(item[xKey]).substring(0, 8)}...`
                  : item[xKey]
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
