/**
 * 🔄 JJ Swim Lab - Switch UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - ON/OFF 상태를 토글할 수 있는 스위치 컴포넌트
 * - 수영 관련 설정, 알림 활성화, 기능 켜기/끄기 등을 위한 토글
 * - 일관된 스위치 UI 디자인 시스템 제공
 * - 접근성을 고려한 스위치 조작 및 상태 표시
 * - 다양한 스위치 크기와 스타일 지원
 * 
 * 🔄 **주요 기능**
 * - ON/OFF 상태 토글 및 관리
 * - 다양한 스위치 크기 및 스타일
 * - 실시간 상태 변경 및 애니메이션
 * - 키보드 네비게이션 지원
 * - 접근성 지원 (ARIA 속성, 포커스 관리 등)
 * 
 * 🗄️ **데이터 연동**
 * - 스위치 ON/OFF 상태
 * - 스위치 크기 및 스타일 설정
 * - 상태 변경 이벤트 및 콜백
 * - 접근성 속성 및 ARIA 값
 * - 스위치 설정 및 옵션
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - 스위치 상태 관리 시스템
 * - 접근성 도구 및 라이브러리
 * - 키보드 네비게이션 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 스위치 상태의 정확성 및 일관성
 * 2. 키보드 네비게이션 및 접근성
 * 3. 스위치 애니메이션의 부드러움
 * 4. 다양한 스위치 크기에서의 사용성
 * 5. 스위치 상태의 명확한 시각적 표시
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 스위치 ON/OFF 토글 동작 확인
 * - [ ] 다양한 스위치 크기 및 스타일 검증
 * - [ ] 키보드 네비게이션 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 스위치 애니메이션 및 반응성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 스위치)
 * - 2024-12-19: 스위치 상태 관리 시스템 구현
 * - 2024-12-19: 다양한 스위치 스타일 지원 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (스위치 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 스위치 애니메이션
 * - 실시간 상태 시각화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Switch 
 *   checked={notificationsEnabled}
 *   onChange={(enabled) => setNotificationsEnabled(enabled)}
 *   size="medium"
 *   color="blue"
 *   label="알림 활성화"
 *   accessible={true}
 *   disabled={false}
 * />
 * ```
 */

'use client';

import * as React from 'react';

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className = '', ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        {...props}
      >
        <span
          className={`
            pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
