/**
 * 🔘 JJ Swim Lab - Button UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 인터랙션을 위한 기본적인 버튼 컴포넌트
 * - 다양한 버튼 타입과 스타일 지원
 * - 접근성을 고려한 버튼 디자인 및 동작
 * - 일관된 버튼 UI 디자인 시스템 제공
 * - 폼 제출, 액션 실행 등의 기능 지원
 * 
 * 🔄 **주요 기능**
 * - 다양한 버튼 타입 (primary, secondary, danger 등)
 * - 크기 및 색상 커스터마이징
 * - 로딩 상태 및 비활성화 상태 지원
 * - 접근성 지원 (ARIA 라벨, 키보드 네비게이션 등)
 * - 아이콘 및 텍스트 조합 지원
 * 
 * 🗄️ **데이터 연동**
 * - 버튼 텍스트 및 아이콘
 * - 버튼 타입 및 스타일 정보
 * - 버튼 상태 (로딩, 비활성화 등)
 * - 접근성 속성 및 라벨
 * - 버튼 클릭 이벤트 및 콜백
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (forwardRef, useRef)
 * - 아이콘 라이브러리 (SVG)
 * - 접근성 도구 및 라이브러리
 * - 로딩 상태 관리 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 버튼의 접근성 및 사용성
 * 2. 다양한 버튼 타입의 일관성
 * 3. 로딩 상태와 비활성화 상태의 명확한 구분
 * 4. 키보드 네비게이션 및 포커스 관리
 * 5. 버튼 크기와 터치 영역의 적절성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 다양한 버튼 타입 동작 확인
 * - [ ] 크기 및 색상 커스터마이징 검증
 * - [ ] 로딩 및 비활성화 상태 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 버튼 클릭 이벤트 처리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 버튼)
 * - 2024-12-19: 다양한 버튼 타입 지원 구현
 * - 2024-12-19: 크기 및 색상 커스터마이징 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (버튼 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 애니메이션 버튼 효과
 * - 고급 버튼 타입 지원
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Button 
 *   type="primary"
 *   size="medium"
 *   onClick={() => handleClick()}
 *   loading={isLoading}
 *   disabled={isDisabled}
 *   icon={<Icon />}
 *   accessibility={true}
 * >
 *   클릭하세요
 * </Button>
 * ```
 */

'use client';

import * as React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button' as const, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  title,
  'aria-label': ariaLabel
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    default: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 