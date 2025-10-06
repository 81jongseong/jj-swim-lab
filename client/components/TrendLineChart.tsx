/**
 * TrendLineChart.tsx
 * 
 * 다중 라인 추세 차트 컴포넌트
 * - 여러 항목(센터, 제품 등)의 시계열 데이터를 선형 그래프로 시각화
 * - X축 기준 통합 호버 툴팁 (모든 라인의 값을 한번에 표시)
 * - 애니메이션: 선 그리기, 점 등장, 그라데이션 영역
 * - 고정된 시드 기반 랜덤 데이터 생성 (호버 시 그래프 변형 방지)
 * 
 * 연동 데이터:
 * - labels: X축 라벨 배열 (날짜, 월 등)
 * - data: 각 라인의 데이터 배열
 * - metric: 표시할 지표 정보 (단위, 소수점 자릿수)
 * 
 * 연동 파일:
 * - client/app/admin/health/overview/page.tsx (건강 추세)
 * - 기타 시계열 데이터가 필요한 페이지
 */

'use client';

import React, { useState } from 'react';

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface TrendLineData {
  name: string;
  color: string;
  data: TrendDataPoint[];
}

export interface TrendMetric {
  label: string;
  unit: string;
  decimals?: number; // 소수점 자릿수 (기본값: 0)
}

interface TrendLineChartProps {
  data: TrendLineData[];
  metric: TrendMetric;
  height?: string; // 차트 높이 (기본값: '400px')
  showLegend?: boolean; // 범례 표시 여부 (기본값: true)
  showGrid?: boolean; // 그리드 표시 여부 (기본값: true)
  animationDuration?: number; // 애니메이션 지속 시간(초) (기본값: 1.5)
}

export default function TrendLineChart({
  data,
  metric,
  height = '400px',
  showLegend = true,
  showGrid = true,
  animationDuration = 1.5
}: TrendLineChartProps) {
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // 데이터가 없으면 빈 상태 표시
  if (!data || data.length === 0 || !data[0]?.data || data[0].data.length === 0) {
    return (
      <div 
        className="w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

  // Y축 범위 계산
  const allValues = data.flatMap(line => line.data.map(point => point.value));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;
  const padding = range * 0.1; // 10% 여유 공간
  const yMin = Math.max(0, minValue - padding);
  const yMax = maxValue + padding;
  const yRange = yMax - yMin;

  // Y축 눈금 값 계산 (5개 눈금)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = yMin + (yRange * i / 4);
    return metric.decimals ? value.toFixed(metric.decimals) : Math.round(value);
  });

  // 각 라인의 SVG path 데이터 생성
  const linesData = data.map(line => {
    const points = line.data.map((point, idx) => {
      const x = (idx / (line.data.length - 1)) * 100;
      const y = ((yMax - point.value) / yRange) * 100;
      return { x, y, value: point.value };
    });

    const pathData = points.map((p, idx) => 
      `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const areaPath = pathData + ` L 100 100 L 0 100 Z`;

    return { ...line, points, pathData, areaPath };
  });

  // 값 포맷팅
  const formatValue = (value: number) => {
    if (metric.decimals !== undefined) {
      return value.toFixed(metric.decimals);
    }
    return Math.round(value).toString();
  };

  return (
    <div className="w-full" style={{ height }}>
      <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col h-full">
          {/* 범례 */}
          {showLegend && (
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
              {data.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: line.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {line.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 차트 영역 */}
          <div className="flex-1 relative">
            {/* Y축 눈금 */}
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
              {yTicks.reverse().map((tick, idx) => (
                <div key={idx} className="text-right">
                  {tick}
                  {metric.unit && <span className="text-gray-400 ml-0.5">{metric.unit}</span>}
                </div>
              ))}
            </div>

            {/* 차트 컨테이너 */}
            <div className="absolute left-12 top-0 right-0 bottom-0">
              {/* X축 호버 영역 (투명 수직 영역들) */}
              <div className="absolute left-0 top-0 right-0 bottom-8 flex">
                {data[0].data.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 cursor-pointer"
                    onMouseEnter={() => setHoveredPointIdx(idx)}
                    onMouseLeave={() => setHoveredPointIdx(null)}
                  ></div>
                ))}
              </div>

              {/* 라인 차트 SVG */}
              <svg 
                className="absolute left-0 top-0 right-0 bottom-8 w-full h-full pointer-events-none" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                <defs>
                  {/* 그라데이션 정의 */}
                  {linesData.map((line, idx) => (
                    <linearGradient 
                      key={idx} 
                      id={`lineGradient-${idx}`} 
                      x1="0%" 
                      y1="0%" 
                      x2="0%" 
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={line.color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={line.color} stopOpacity="0.05" />
                    </linearGradient>
                  ))}
                </defs>

                {/* 그리드 라인 */}
                {showGrid && (
                  <g className="animate-fade-in" opacity="0.2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 25}
                        x2="100"
                        y2={i * 25}
                        stroke="#cbd5e1"
                        strokeWidth="0.3"
                        vectorEffect="non-scaling-stroke"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </g>
                )}

                {/* 각 라인 그리기 */}
                {linesData.map((line, lineIdx) => (
                  <g key={lineIdx}>
                    {/* 그라데이션 영역 */}
                    <path
                      d={line.areaPath}
                      fill={`url(#lineGradient-${lineIdx})`}
                      opacity="0.6"
                    />

                    {/* 라인 (애니메이션) */}
                    <path
                      d={line.pathData}
                      fill="none"
                      stroke={line.color}
                      strokeWidth="0.6"
                      vectorEffect="non-scaling-stroke"
                      className="animate-pulse"
                      style={{ animationDuration: `${animationDuration}s`, animationDelay: `${lineIdx * 0.2}s` }}
                    />

                    {/* 점 (애니메이션 + 호버) */}
                    {line.points.map((point, pointIdx) => {
                      const isHovered = hoveredPointIdx === pointIdx;

                      return (
                        <g key={pointIdx}>
                          {/* 메인 점 */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={isHovered ? "1.8" : "1.2"}
                            fill={line.color}
                            stroke="#fff"
                            strokeWidth="0.4"
                            vectorEffect="non-scaling-stroke"
                            className="transition-all duration-200 animate-pulse"
                            style={{ animationDelay: `${lineIdx * 0.2 + pointIdx * 0.1}s` }}
                          />
                          {/* 호버 시 외곽 링 */}
                          {isHovered && (
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="2.5"
                              fill="none"
                              stroke={line.color}
                              strokeWidth="0.3"
                              vectorEffect="non-scaling-stroke"
                              opacity="0.5"
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                ))}
              </svg>

              {/* X축 호버 수직선 */}
              {hoveredPointIdx !== null && (
                <div
                  className="absolute top-0 bottom-8 w-px bg-blue-400 opacity-50"
                  style={{
                    left: `${(hoveredPointIdx / (data[0].data.length - 1)) * 100}%`
                  }}
                ></div>
              )}

              {/* X축 호버 통합 툴팁 */}
              {hoveredPointIdx !== null && (
                <div
                  className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-50 pointer-events-none"
                  style={{
                    left: `${(hoveredPointIdx / (data[0].data.length - 1)) * 100}%`,
                    bottom: '50px',
                    transform: 'translateX(-50%)',
                    minWidth: '180px'
                  }}
                >
                  {/* 날짜/라벨 */}
                  <div className="font-bold text-sm mb-2 pb-2 border-b border-gray-700">
                    📅 {data[0].data[hoveredPointIdx].date}
                  </div>

                  {/* 각 라인의 값 */}
                  <div className="space-y-1.5">
                    {data.map((line, idx) => {
                      const point = line.data[hoveredPointIdx];
                      const displayValue = formatValue(point.value);

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: line.color }}
                            ></div>
                            <span className="text-xs font-medium text-gray-200">
                              {line.name}
                            </span>
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: line.color }}
                          >
                            {displayValue}
                            {metric.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 툴팁 화살표 */}
                  <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 transform rotate-45 -translate-x-1/2"></div>
                </div>
              )}

              {/* X축 라벨 */}
              <div className="absolute left-0 right-0 bottom-0 h-8 flex justify-between items-center text-xs text-gray-500">
                {data[0].data.map((point, idx) => {
                  // 라벨이 너무 많으면 일부만 표시
                  const totalLabels = data[0].data.length;
                  const showEvery = totalLabels > 10 ? Math.ceil(totalLabels / 8) : 1;
                  const shouldShow = idx % showEvery === 0 || idx === totalLabels - 1;

                  return (
                    <div
                      key={idx}
                      className={`flex-1 text-center ${!shouldShow && 'invisible'}`}
                    >
                      {point.date}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS 애니메이션은 Tailwind CSS 클래스로 처리 */}
    </div>
  );
}


