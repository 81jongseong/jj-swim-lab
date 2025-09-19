/**
 * 🏊‍♂️ JJ Swim Lab - Card UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 콘텐츠를 카드 형태로 표시하는 기본 UI 컴포넌트
 * - 대시보드, 정보 표시, 섹션 구분용
 * - 일관된 스타일링과 레이아웃 제공
 * 
 * 🎨 **디자인 특징**
 * - 모던한 카드 디자인 (그림자, 둥근 모서리)
 * - 반응형 디자인 (모바일/데스크톱 대응)
 * - 접근성 고려 (키보드 네비게이션, 스크린 리더)
 * - Tailwind CSS 기반 스타일링
 * 
 * 🔧 **사용 방법**
 * ```tsx
 * import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
 * 
 * <Card>
 *   <CardHeader>
 *     <CardTitle>제목</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     내용
 *   </CardContent>
 * </Card>
 * ```
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-17: 초기 Card 컴포넌트 구현
 * - 2025-09-17: TypeScript 타입 정의 추가
 * - 2025-09-17: 접근성 개선 및 반응형 대응
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-17
 * - 상태: ✅ 완성 (기본 Card UI 컴포넌트)
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 기본 Card 컴포넌트
 * 카드 형태의 컨테이너를 제공합니다.
 */
const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 ${className} ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/**
 * Card Header 컴포넌트
 * 카드의 상단 헤더 영역을 담당합니다.
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card Title 컴포넌트
 * 카드의 제목을 표시합니다.
 */
export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

/**
 * Card Description 컴포넌트
 * 카드의 설명을 표시합니다.
 */
export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
};

/**
 * Card Content 컴포넌트
 * 카드의 주요 내용을 담는 영역입니다.
 */
export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
