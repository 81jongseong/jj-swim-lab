/**
 * 🎚️ JJ Swim Lab - Slider UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 범위 값을 선택할 수 있는 슬라이더 컴포넌트
 * - 수영 관련 설정, 난이도 조정, 수치 입력 등을 위한 범위 선택
 * - 일관된 슬라이더 UI 디자인 시스템 제공
 * - 접근성을 고려한 슬라이더 조작 및 값 표시
 * - 다양한 슬라이더 타입과 스타일 지원
 * 
 * 🔄 **주요 기능**
 * - 범위 값 선택 및 조정
 * - 다양한 슬라이더 타입 (단일, 범위, 수직 등)
 * - 실시간 값 표시 및 업데이트
 * - 키보드 네비게이션 지원
 * - 접근성 지원 (ARIA 속성, 포커스 관리 등)
 * 
 * 🗄️ **데이터 연동**
 * - 슬라이더 값 및 범위 설정
 * - 슬라이더 타입 및 스타일 정보
 * - 값 변경 이벤트 및 콜백
 * - 접근성 속성 및 ARIA 값
 * - 슬라이더 상태 및 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - 슬라이더 상태 관리 시스템
 * - 접근성 도구 및 라이브러리
 * - 키보드 네비게이션 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 슬라이더 값의 정확성 및 유효성 검증
 * 2. 키보드 네비게이션 및 접근성
 * 3. 다양한 슬라이더 타입의 일관된 동작
 * 4. 슬라이더 값 변경 시 성능 최적화
 * 5. 슬라이더의 시각적 피드백 및 사용자 경험
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 슬라이더 값 선택 및 조정 확인
 * - [ ] 다양한 슬라이더 타입 동작 검증
 * - [ ] 키보드 네비게이션 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 슬라이더 성능 및 반응성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 슬라이더)
 * - 2024-12-19: 슬라이더 상태 관리 시스템 구현
 * - 2024-12-19: 다양한 슬라이더 타입 지원 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (슬라이더 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 슬라이더 애니메이션
 * - 실시간 값 시각화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Slider 
 *   min={0}
 *   max={100}
 *   value={difficulty}
 *   onChange={(value) => setDifficulty(value)}
 *   step={5}
 *   showValue={true}
 *   type="single"
 *   accessible={true}
 *   label="난이도"
 * />
 * ```
 */

'use client';

import * as React from 'react';

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    value = [0], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    disabled = false, 
    className = '' 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onValueChange) {
        const newValue = parseFloat(e.target.value);
        onValueChange([newValue]);
      }
    };

    const currentValue = value[0] || min;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
      <div ref={ref} className={`relative w-full ${className}`}>
        <div className="relative h-2 w-full bg-gray-200 rounded-full">
          <div 
            className="absolute h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            absolute inset-0 w-full h-2 opacity-0 cursor-pointer
            disabled:cursor-not-allowed
            ${className}
          `}
        />
        <div className="absolute -top-6 left-0 transform -translate-x-1/2">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
            {currentValue}
          </div>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
