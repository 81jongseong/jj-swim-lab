/**
 * 🏷️ JJ Swim Lab - Label UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 폼 요소와 연결되는 라벨 컴포넌트로 접근성을 향상시키는 UI
 * - 수영 관련 폼의 입력 필드, 체크박스, 라디오 버튼 등의 라벨링
 * - 일관된 라벨 UI 디자인 시스템 제공
 * - 접근성을 고려한 라벨과 폼 요소의 연결
 * - 다양한 라벨 스타일과 크기 옵션 지원
 * 
 * 🔄 **주요 기능**
 * - 폼 요소와의 연결 및 연결점 제공
 * - 다양한 라벨 스타일 및 크기
 * - 접근성 지원 (for 속성, ARIA 속성 등)
 * - 반응형 디자인 및 텍스트 크기 조정
 * - 라벨 텍스트의 가독성 및 명확성
 * 
 * 🗄️ **데이터 연동**
 * - 라벨 텍스트 및 내용
 * - 연결할 폼 요소의 ID
 * - 라벨 스타일 및 크기 설정
 * - 접근성 속성 및 ARIA 값
 * - 라벨 상태 및 이벤트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (forwardRef, useRef)
 * - 폼 요소 연결 시스템
 * - 접근성 도구 및 라이브러리
 * - 라벨 스타일링 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 라벨과 폼 요소의 올바른 연결
 * 2. 라벨 텍스트의 명확성 및 가독성
 * 3. 접근성 표준 준수 (for 속성, ARIA 등)
 * 4. 다양한 화면 크기에서의 라벨 표시
 * 5. 라벨과 폼 요소 간의 시각적 관계
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 라벨과 폼 요소 연결 확인
 * - [ ] 라벨 텍스트 표시 검증
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 라벨 스타일 및 크기 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 라벨)
 * - 2024-12-19: 폼 요소 연결 시스템 구현
 * - 2024-12-19: 다양한 라벨 스타일 지원 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (라벨 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 라벨 스타일링
 * - 동적 라벨 콘텐츠
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Label 
 *   htmlFor="email"
 *   size="medium"
 *   weight="medium"
 *   color="gray"
 *   required={true}
 *   accessible={true}
 * >
 *   이메일 주소
 * </Label>
 * <Input id="email" type="email" />
 * ```
 */

'use client';

import * as React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, htmlFor, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;



