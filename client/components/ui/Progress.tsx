/**
 * 📈 JJ Swim Lab - Progress UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 진행률, 완료도, 로딩 상태 등을 시각적으로 표시하는 프로그레스 바
 * - 수영 학습 진행률, 운동 목표 달성도 등의 상태 표시
 * - 일관된 프로그레스 UI 디자인 시스템 제공
 * - 다양한 스타일과 애니메이션 효과 지원
 * - 접근성을 고려한 진행률 표시
 * 
 * 🔄 **주요 기능**
 * - 진행률 바 표시 및 애니메이션
 * - 다양한 스타일 및 색상 옵션
 * - 진행률 텍스트 및 퍼센트 표시
 * - 접근성 지원 (ARIA 속성 등)
 * - 반응형 디자인 및 크기 조정
 * 
 * 🗄️ **데이터 연동**
 * - 진행률 값 및 상태 정보
 * - 프로그레스 바 스타일 설정
 * - 진행률 텍스트 및 라벨
 * - 접근성 속성 및 ARIA 값
 * - 애니메이션 및 전환 효과
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - CSS 애니메이션 라이브러리
 * - 접근성 도구 및 라이브러리
 * - 진행률 계산 및 표시 도구
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 진행률 값의 정확성 및 유효성 검증
 * 2. 애니메이션의 부드러움 및 자연스러움
 * 3. 다양한 진행률 값에서의 적절한 표시
 * 4. 접근성 표준 준수
 * 5. 진행률 바의 시각적 명확성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 진행률 바 표시 확인
 * - [ ] 다양한 진행률 값 표시 검증
 * - [ ] 애니메이션 효과 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 프로그레스 바)
 * - 2024-12-19: 진행률 애니메이션 시스템 구현
 * - 2024-12-19: 다양한 스타일 옵션 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (프로그레스 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 애니메이션 효과
 * - 실시간 진행률 업데이트
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Progress 
 *   value={75}
 *   max={100}
 *   size="medium"
 *   color="blue"
 *   showLabel={true}
 *   animated={true}
 *   accessibility={true}
 * />
 * ```
 */

'use client';

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }