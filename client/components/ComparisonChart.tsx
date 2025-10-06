/**
 * 비교 차트 컴포넌트
 * 
 * 연동되는 데이터:
 * - centers: 센터 데이터 배열
 * - title: 차트 제목
 * - dataKey: 데이터 키 (revenue, costs 등)
 * - items: 항목 배열 (등록비, 강습비, 매점판매, 인건비, 공과금, 임대료, 기타비용)
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/revenue-management, admin/center-statistics 등
 */

'use client';

import React from 'react';

interface ChartItem {
  key: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  getValue: (center: any) => number;
}

interface ComparisonChartProps {
  centers: any[];
  title: string;
  items: ChartItem[];
  hasRevenue?: boolean;
}

export default function ComparisonChart({
  centers,
  title,
  items,
  hasRevenue = true
}: ComparisonChartProps) {
  if (centers.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">{title}</h2>
        <p className="text-gray-500 text-center py-8">센터를 선택해주세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="text-2xl">{items[0]?.icon || '📊'}</span>
        <span>{title}</span>
        <div className="ml-auto flex gap-2 text-xs">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">💰 실제데이터</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">📊 예상데이터</span>
        </div>
      </h2>
      
      <div className="space-y-6">
        {items.map((item, itemIndex) => (
          <div key={item.key} className="group">
            <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 hover:opacity-80 transition-colors ${item.color}`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {centers.reduce((sum, c) => sum + item.getValue(c), 0).toLocaleString()}원
              </span>
            </h3>
            <div className="space-y-3">
              {centers.map((center, centerIndex) => {
                const amount = item.getValue(center);
                const allAmounts = centers.map(c => item.getValue(c));
                const minAmount = Math.min(...allAmounts);
                const maxAmount = Math.max(...allAmounts);
                const range = maxAmount - minAmount;
                const normalizedAmount = range > 0 ? ((amount - minAmount) / range) * 80 + 10 : 50;
                const percentage = range > 0 ? ((amount - minAmount) / range) * 100 : 0;
                
                return (
                  <div key={`${center.id}-${item.key}`} className="group/item">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-24 text-xs font-medium truncate text-gray-700 group-hover/item:text-gray-900 transition-colors">
                        {center.name}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden shadow-inner group-hover/item:shadow-md transition-shadow">
                        <div 
                          className={`h-8 rounded-full transition-all duration-1000 ease-out group-hover/item:scale-105 ${
                            hasRevenue 
                              ? `bg-gradient-to-r ${item.bgColor} shadow-lg` 
                              : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-lg'
                          }`}
                          style={{ 
                            width: `${normalizedAmount}%`,
                            animationDelay: `${centerIndex * 100}ms`,
                            animation: 'slideInLeft 0.8s ease-out forwards'
                          }}
                        >
                          <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
                        </div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                          {amount.toLocaleString()}원
                        </span>
                      </div>
                      <div className="w-16 text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          hasRevenue ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

