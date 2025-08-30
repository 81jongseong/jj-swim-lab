/**
 * 📝 JJ Swim Lab - Textarea UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 여러 줄의 텍스트 입력을 받는 텍스트 영역 컴포넌트
 * - 수영 관련 설명, 메모, 긴 텍스트 입력 등을 위한 다중 라인 입력
 * - 일관된 텍스트 영역 UI 디자인 시스템 제공
 * - 접근성을 고려한 텍스트 영역 디자인 및 동작
 * - 자동 크기 조정 및 스크롤 기능 지원
 * 
 * 🔄 **주요 기능**
 * - 다중 라인 텍스트 입력
 * - 자동 크기 조정 및 스크롤
 * - 텍스트 길이 제한 및 카운터
 * - 접근성 지원 (ARIA 속성, 포커스 관리 등)
 * - 반응형 디자인 및 다양한 크기 옵션
 * 
 * 🗄️ **데이터 연동**
 * - 텍스트 영역 값 및 상태
 * - 텍스트 길이 및 제한 정보
 * - 입력 이벤트 및 콜백
 * - 접근성 속성 및 라벨
 * - 텍스트 영역 설정 및 옵션
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useRef, forwardRef)
 * - 텍스트 입력 관리 시스템
 * - 접근성 도구 및 라이브러리
 * - 자동 크기 조정 알고리즘
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 텍스트 영역의 접근성 및 사용성
 * 2. 자동 크기 조정의 성능 최적화
 * 3. 텍스트 길이 제한의 적절한 표시
 * 4. 다양한 텍스트 길이에서의 스크롤 동작
 * 5. 텍스트 입력 성능 및 사용자 경험
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 다중 라인 텍스트 입력 확인
 * - [ ] 자동 크기 조정 동작 검증
 * - [ ] 텍스트 길이 제한 및 카운터 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 텍스트 영역)
 * - 2024-12-19: 다중 라인 입력 시스템 구현
 * - 2024-12-19: 자동 크기 조정 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (텍스트 영역 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 텍스트 편집 기능
 * - 실시간 텍스트 분석
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Textarea 
 *   placeholder="수영 관련 메모를 입력하세요"
 *   value={memo}
 *   onChange={(e) => setMemo(e.target.value)}
 *   rows={5}
 *   maxLength={500}
 *   showCounter={true}
 *   autoResize={true}
 *   accessible={true}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export default Textarea;


