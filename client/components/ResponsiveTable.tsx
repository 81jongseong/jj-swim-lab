/**
 * 📊 JJ Swim Lab - ResponsiveTable 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 모든 테이블에 일관된 반응형 스타일 적용
 * - 모바일과 데스크탑 환경에서 최적화된 테이블 표시
 * - 테이블 스크롤 및 오버플로우 처리
 * - 재사용 가능한 테이블 구조 컴포넌트 제공
 * 
 * 🔄 **주요 기능**
 * - 반응형 테이블 래퍼 (ResponsiveTable)
 * - 테이블 헤더 컴포넌트 (TableHeader, TableHeaderCell)
 * - 테이블 본문 컴포넌트 (TableBody, TableRow, TableCell)
 * - 모바일 환경에서 가로 스크롤 지원
 * - 일관된 스타일링 및 테마 적용
 * 
 * 🗄️ **데이터 연동**
 * - props를 통한 테이블 데이터 전달
 * - children을 통한 테이블 내용 구성
 * - Tailwind CSS 클래스 기반 스타일링
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (children props)
 * - Tailwind CSS (반응형 클래스)
 * - TypeScript (타입 정의)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테이블 내용은 children으로 전달
 * 2. 모바일에서 가로 스크롤이 필요한 경우 overflow-x-auto 사용
 * 3. 테이블 헤더는 고정하고 본문만 스크롤 가능
 * 4. 반응형 브레이크포인트에 따른 스타일 적용
 * 5. 접근성을 위한 적절한 ARIA 라벨 설정
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 반응형 스타일 클래스 확인
 * - [ ] 모바일 스크롤 동작 검증
 * - [ ] 테이블 헤더 고정 상태 확인
 * - [ ] 접근성 속성 검증
 * - [ ] 크로스 브라우저 호환성 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 반응형 테이블)
 * - 2024-12-19: 테이블 구조 컴포넌트 분리
 * - 2024-12-19: 모바일 최적화 스타일 적용
 * - 2024-12-19: 재사용 가능한 컴포넌트 설계
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (반응형 테이블 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 테이블 정렬 기능 추가
 * - 테이블 필터링 기능
 * - 테이블 페이지네이션
 * - 테이블 검색 기능
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ResponsiveTable>
 *   <TableHeader>
 *     <TableHeaderCell>이름</TableHeaderCell>
 *     <TableHeaderCell>이메일</TableHeaderCell>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>홍길동</TableCell>
 *       <TableCell>hong@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </ResponsiveTable>
 * ```
 */

'use client';

import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px] divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

// 테이블 헤더 컴포넌트
export function TableHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      <tr>
        {children}
      </tr>
    </thead>
  );
}

// 테이블 헤더 셀 컴포넌트
export function TableHeaderCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

// 테이블 바디 컴포넌트
export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

// 테이블 행 컴포넌트
export function TableRow({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr 
      className={`hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// 테이블 셀 컴포넌트
export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

// 모바일용 카드 컴포넌트
export function MobileCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 border ${className}`}>
      {children}
    </div>
  );
}

// 모바일용 카드 행 컴포넌트
export function MobileCardRow({ label, value, className = '' }: { 
  label: string; 
  value: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right flex-1 ml-4 text-single-line">{value}</span>
    </div>
  );
}
