/**
 * 📦 JJ Swim Lab - CardGrid 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 카드 목록을 반응형 그리드 레이아웃으로 표시
 * - 햄버거 메뉴가 나오는 화면(1024px 미만): 2열
 * - 그 외 화면(1024px 이상): 4열
 * - 필요시 커스터마이징 가능한 열 수 설정
 * 
 * 🔄 **주요 기능**
 * - 반응형 그리드 레이아웃 (모바일 2열, 데스크톱 4열)
 * - 커스터마이징 가능한 열 수 설정
 * - 간격(gap) 조정 가능
 * - 추가 클래스명 지원
 * 
 * 🗄️ **데이터 연동**
 * - children을 통해 카드 컴포넌트들을 받음
 * 
 * 🛠️ **필요한 설치 파일**
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 기본값은 모바일 2열, 데스크톱 4열
 * 2. 필요시 mobileCols, desktopCols로 커스터마이징
 * 3. gap은 기본 4 (1rem), 필요시 조정
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 기본 사용 (모바일 2열, 데스크톱 4열)
 * <CardGrid>
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </CardGrid>
 * 
 * // 커스터마이징 (모바일 1열, 데스크톱 3열)
 * <CardGrid mobileCols={1} desktopCols={3}>
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </CardGrid>
 * ```
 */

'use client';

import React from 'react';

interface CardGridProps {
  children: React.ReactNode;
  /** 모바일 화면(1024px 미만)에서의 열 수, 기본값: 2 */
  mobileCols?: 1 | 2;
  /** 데스크톱 화면(1024px 이상)에서의 열 수, 기본값: 4 */
  desktopCols?: 2 | 3 | 4 | 5 | 6;
  /** 그리드 간격, 기본값: 4 (1rem) */
  gap?: 2 | 3 | 4 | 6 | 8;
  /** 추가 클래스명 */
  className?: string;
  /** @deprecated - mobileCols 사용 권장 */
  cols?: 1 | 2;
  /** @deprecated - mobileCols 사용 권장 */
  mdCols?: 2 | 3 | 4;
  /** @deprecated - desktopCols 사용 권장 */
  lgCols?: 2 | 3 | 4 | 5 | 6;
}

/**
 * 카드 그리드 레이아웃 컴포넌트
 * - 햄버거 메뉴가 나오는 화면(1024px 미만): mobileCols 열
 * - 그 외 화면(1024px 이상): desktopCols 열
 */
export default function CardGrid({
  children,
  mobileCols,
  desktopCols,
  gap = 4,
  className = '',
  cols,
  mdCols,
  lgCols
}: CardGridProps) {
  // 레거시 props 지원
  const actualMobileCols = mobileCols ?? cols ?? 2;
  const actualDesktopCols = desktopCols ?? lgCols ?? mdCols ?? 4;
  // Tailwind 동적 클래스명 문제 해결을 위해 명시적 클래스 매핑
  const mobileColsMap: Record<1 | 2, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2'
  };

  const desktopColsMap: Record<2 | 3 | 4 | 5 | 6, string> = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6'
  };

  const gapMap: Record<2 | 3 | 4 | 6 | 8, string> = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  const gridColsClass = `${mobileColsMap[actualMobileCols as 1 | 2]} ${desktopColsMap[actualDesktopCols as 2 | 3 | 4 | 5 | 6]}`;
  const gapClass = gapMap[gap];

  return (
    <div className={`grid ${gridColsClass} ${gapClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

