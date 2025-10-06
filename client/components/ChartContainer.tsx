/**
 * 차트 컨테이너 컴포넌트
 * 
 * 연동되는 데이터:
 * - title: 차트 제목
 * - children: 차트 컴포넌트
 * - loading: 로딩 상태
 * - error: 에러 상태
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/dashboard, admin/center-management, admin/analytics 등
 */

'use client';

import React from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
  actions?: React.ReactNode;
  icon?: string;
}

export default function ChartContainer({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  className = "",
  actions,
  icon
}: ChartContainerProps) {
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <span className="text-2xl">{icon}</span>}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium">데이터를 불러올 수 없습니다</p>
              <p className="text-gray-500 text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </div>

      {/* 차트 내용 */}
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

