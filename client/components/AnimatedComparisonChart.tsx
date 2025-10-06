/**
 * 애니메이션이 있는 비교 차트 컴포넌트
 * 
 * 연동되는 데이터:
 * - centers: 센터 데이터 배열
 * - title: 차트 제목
 * - items: 비교할 항목들
 * - hasRevenue: 실제 데이터 여부
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/revenue-management, admin/center-statistics 등
 */

'use client';

import React, { useEffect } from 'react';

interface CenterData {
  id: string;
  name: string;
  region: string;
  district: string;
  revenue: {
    registration: number;
    lessons: number;
    shop: number;
    total: number;
  };
  costs: {
    labor: number;
    utilities: number;
    rent: number;
    other: number;
    total: number;
  };
  netProfit: number;
  profitMargin: number;
}

interface ChartItem {
  key?: keyof CenterData['revenue'] | keyof CenterData['costs'];
  label: string;
  bgColor?: string;
  amount?: number;
  color?: string;
}

interface CenterComparisonData {
  center: string;
  items: Array<{ label: string; amount: number; color?: string }>;
}

interface AnimatedComparisonChartProps {
  centers?: CenterData[];
  title: string;
  items?: ChartItem[];
  hasRevenue?: boolean;
  itemType?: 'revenue' | 'costs';
  data?: CenterComparisonData[];
}

// 센터의 수익 상태를 판단하는 함수
function getCenterStatus(center: CenterData): 'profit' | 'break-even' | 'loss' {
  if (center.netProfit > 0) return 'profit';
  if (center.netProfit < 0) return 'loss';
  return 'break-even';
}

// 센터명 색상 클래스를 반환하는 함수
function getCenterNameColorClass(status: 'profit' | 'break-even' | 'loss'): string {
  switch (status) {
    case 'profit':
      return 'text-blue-600 font-semibold';
    case 'break-even':
      return 'text-gray-600 font-medium';
    case 'loss':
      return 'text-red-600 font-semibold';
    default:
      return 'text-gray-700';
  }
}

export default function AnimatedComparisonChart({
  centers,
  title,
  items,
  hasRevenue,
  itemType,
  data
}: AnimatedComparisonChartProps) {
  
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInLeft {
        0% {
          transform: translateX(-100%);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeInUp {
        0% {
          transform: translateY(20px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .animate-slideInLeft {
        animation: slideInLeft 0.8s ease-out forwards;
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // 새로운 data prop을 사용하는 경우 (건강 데이터 등)
  if (data && data.length > 0) {
    const allAmounts = data.flatMap(d => d.items.map(item => item.amount));
    const minAmount = Math.min(...allAmounts);
    const maxAmount = Math.max(...allAmounts);
    const range = maxAmount - minAmount || 1;

    const getColorClass = (color?: string) => {
      switch (color) {
        case 'blue': return 'bg-gradient-to-r from-blue-400 to-blue-500';
        case 'green': return 'bg-gradient-to-r from-green-400 to-green-500';
        case 'yellow': return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
        case 'orange': return 'bg-gradient-to-r from-orange-400 to-orange-500';
        case 'red': return 'bg-gradient-to-r from-red-400 to-red-500';
        case 'purple': return 'bg-gradient-to-r from-purple-400 to-purple-500';
        case 'gray': return 'bg-gradient-to-r from-gray-300 to-gray-400';
        default: return 'bg-gradient-to-r from-blue-400 to-blue-500';
      }
    };

    return (
      <div className="space-y-6">
        {data.map((centerData, centerIdx) => (
          <div key={centerData.center} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-blue-600 mb-4 text-lg">{centerData.center}</h4>
            <div className="space-y-3">
              {centerData.items.map((item, itemIdx) => {
                const normalizedWidth = range > 0
                  ? 10 + ((item.amount - minAmount) / range) * 80
                  : 10;

                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="font-semibold text-gray-900">
                        {item.amount}명
                      </span>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${getColorClass(item.color)} transition-all duration-700 ease-out hover:opacity-80 animate-slideInLeft flex items-center justify-end pr-2`}
                        style={{
                          width: `${normalizedWidth}%`,
                          animationDelay: `${(centerIdx * centerData.items.length + itemIdx) * 0.1}s`
                        }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {item.amount > 0 ? `${item.amount}명` : ''}
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
    );
  }

  // 기존 재무 데이터용 로직
  if (!centers || centers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl animate-fadeInUp">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
      
      {items.map((item, itemIndex) => {
        // 해당 항목의 모든 센터 값들
        const allItemAmounts = centers.map(center => center[itemType][item.key] as number);
        const minItemAmount = Math.min(...allItemAmounts);
        const maxItemAmount = Math.max(...allItemAmounts);
        const itemRange = maxItemAmount - minItemAmount;

        const totalItemSum = allItemAmounts.reduce((sum, amount) => sum + amount, 0);

        return (
          <div key={item.key} className="mb-8 last:mb-0">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-700 flex items-center gap-2">
                {item.label}
                <span className="text-sm font-normal text-gray-500">
                  (총 {totalItemSum.toLocaleString()}원)
                </span>
              </h4>
            </div>
            
            {centers.map((center, centerIndex) => {
              const amount = center[itemType][item.key] as number;
              
              // 정규화된 너비 계산 (10% ~ 90% 범위)
              let normalizedAmount = 0;
              if (itemRange > 0) {
                normalizedAmount = ((amount - minItemAmount) / itemRange) * 80 + 10;
              } else {
                normalizedAmount = amount > 0 ? 50 : 0;
              }

              const percentageOfMax = maxItemAmount > 0 ? (amount / maxItemAmount) * 100 : 0;
              
              // 센터의 수익 상태에 따른 색상 결정
              const centerStatus = getCenterStatus(center);
              const nameColorClass = getCenterNameColorClass(centerStatus);

              return (
                <div key={center.id} className="flex items-center gap-4 mb-3 group/item">
                  <p className={`w-24 text-sm ${nameColorClass} group-hover/item:opacity-80 transition-opacity duration-300`}>
                    {center.name} {hasRevenue ? '💰' : '📊'}
                  </p>
                  
                  <div className="flex-1 relative h-8 bg-gray-100 rounded-full shadow-inner overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out group-hover/item:scale-105 animate-slideInLeft ${
                        hasRevenue 
                          ? `bg-gradient-to-r ${item.bgColor} shadow-lg` 
                          : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-lg'
                      }`}
                      style={{ 
                        width: `${normalizedAmount}%`,
                        animationDelay: `${centerIndex * 100 + itemIndex * 200}ms`
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
                    </div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                      {amount.toLocaleString()}원
                    </span>
                  </div>
                  
                  <span className="w-12 text-right text-sm font-medium text-gray-600">
                    {percentageOfMax.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
