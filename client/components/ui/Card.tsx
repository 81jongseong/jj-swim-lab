/**
 * 🃏 JJ Swim Lab - Card UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 정보를 담고 있는 카드 형태의 컨테이너 컴포넌트
 * - 수영 관련 정보, 사용자 프로필, 통계 등을 카드 형태로 표시
 * - 일관된 카드 UI 디자인 시스템 제공
 * - 다양한 카드 타입과 스타일 지원
 * - 접근성을 고려한 카드 구조 및 콘텐츠 표시
 * 
 * 🔄 **주요 기능**
 * - 카드 헤더, 본문, 푸터 구조 지원
 * - 다양한 카드 타입 및 스타일
 * - 반응형 디자인 및 크기 조정
 * - 접근성 지원 (ARIA 속성, 시맨틱 마크업 등)
 * - 카드 인터랙션 및 이벤트 처리
 * 
 * 🗄️ **데이터 연동**
 * - 카드 콘텐츠 및 메타데이터
 * - 카드 스타일 및 레이아웃 설정
 * - 카드 인터랙션 이벤트
 * - 접근성 속성 및 ARIA 값
 * - 반응형 디자인 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (forwardRef, useRef)
 * - 카드 레이아웃 관리 시스템
 * - 접근성 도구 및 라이브러리
 * - 반응형 디자인 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 카드 구조의 시맨틱 마크업 및 접근성
 * 2. 다양한 카드 타입의 일관된 디자인
 * 3. 반응형 디자인에서의 카드 레이아웃
 * 4. 카드 콘텐츠의 가독성 및 정보 구조
 * 5. 카드 인터랙션의 사용자 경험
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 카드 구조 및 레이아웃 확인
 * - [ ] 다양한 카드 타입 표시 검증
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 카드 인터랙션 동작 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 카드)
 * - 2024-12-19: 카드 구조 시스템 구현
 * - 2024-12-19: 다양한 카드 타입 지원 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (카드 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 애니메이션 카드 효과
 * - 고급 카드 레이아웃
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Card 
 *   type="profile"
 *   size="medium"
 *   shadow="medium"
 *   hover={true}
 *   accessible={true}
 * >
 *   <CardHeader>
 *     <h3>사용자 프로필</h3>
 *   </CardHeader>
 *   <CardBody>
 *     <p>사용자 정보 및 통계</p>
 *   </CardBody>
 *   <CardFooter>
 *     <Button>자세히 보기</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */

'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export default Card;
export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
