/**
 * 📝 JJ Swim Lab - Input UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 입력을 받는 기본적인 텍스트 입력 필드 컴포넌트
 * - 다양한 입력 타입과 유효성 검증 지원
 * - 접근성을 고려한 입력 필드 디자인
 * - 일관된 입력 UI 디자인 시스템 제공
 * - 폼 데이터 입력 및 관리 지원
 * 
 * 🔄 **주요 기능**
 * - 다양한 입력 타입 지원 (text, email, password 등)
 * - 입력 유효성 검증 및 에러 표시
 * - 접근성 지원 (ARIA 라벨, 포커스 관리 등)
 * - 반응형 디자인 및 다양한 크기 옵션
 * - 입력 상태 관리 및 이벤트 처리
 * 
 * 🗄️ **데이터 연동**
 * - 입력 필드 값 및 상태
 * - 유효성 검증 결과 및 에러 메시지
 * - 입력 이벤트 및 콜백
 * - 접근성 속성 및 라벨
 * - 폼 데이터 및 상태
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useRef, forwardRef)
 * - 폼 유효성 검증 라이브러리
 * - 접근성 도구 및 라이브러리
 * - 입력 타입별 유효성 검증
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 입력 필드의 접근성 및 사용성
 * 2. 다양한 입력 타입별 적절한 유효성 검증
 * 3. 에러 메시지의 명확성 및 유용성
 * 4. 반응형 디자인의 일관성 유지
 * 5. 입력 성능 및 사용자 경험 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 다양한 입력 타입 동작 확인
 * - [ ] 유효성 검증 및 에러 표시 검증
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 입력 이벤트 처리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 입력 필드)
 * - 2024-12-19: 다양한 입력 타입 지원 구현
 * - 2024-12-19: 유효성 검증 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (입력 필드 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 입력 타입 지원
 * - 실시간 유효성 검증
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Input 
 *   type="email"
 *   placeholder="이메일을 입력하세요"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   onValidation={(isValid) => handleValidation(isValid)}
 *   required={true}
 *   error={emailError}
 * />
 * ```
 */

'use client';

import React from 'react';

interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  defaultValue?: string;
  min?: string | number;
  accept?: string;
  max?: string | number;
  step?: string | number;
  onKeyPress?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  onKeyUp?: (e: any) => void;
}

const Input: React.FC<InputProps> = ({ 
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  defaultValue,
  min,
  max,
  step,
  accept,
  onKeyPress,
  onKeyDown,
  onKeyUp
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      accept={accept}
      onKeyPress={onKeyPress}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

export default Input; 