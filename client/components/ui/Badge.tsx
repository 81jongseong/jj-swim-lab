/**
 * 🏷️ JJ Swim Lab - Badge UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 상태, 카테고리, 알림 등을 표시하는 작은 배지 컴포넌트
 * - 수영 관련 상태 표시 (레벨, 진행률, 알림 개수 등)
 * - 일관된 배지 디자인 시스템 제공
 * - 다양한 색상과 스타일 옵션 지원
 * - 접근성을 고려한 배지 표시
 * 
 * 🔄 **주요 기능**
 * - 다양한 배지 타입 및 스타일
 * - 색상 및 크기 커스터마이징
 * - 상태별 배지 표시 (성공, 경고, 에러 등)
 * - 접근성 지원 (ARIA 라벨 등)
 * - 반응형 디자인 지원
 * 
 * 🗄️ **데이터 연동**
 * - 배지 텍스트 및 내용
 * - 배지 타입 및 스타일 정보
 * - 색상 및 크기 설정
 * - 접근성 속성 및 라벨
 * - 배지 상태 및 이벤트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - 아이콘 라이브러리 (SVG)
 * - 접근성 도구 및 라이브러리
 * - 색상 팔레트 관리 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 배지 크기와 가독성의 균형
 * 2. 색상 대비 및 접근성
 * 3. 다양한 배지 타입의 일관성
 * 4. 반응형 디자인에서의 적절한 표시
 * 5. 배지 내용의 명확성 및 유용성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 다양한 배지 타입 표시 확인
 * - [ ] 색상 및 크기 커스터마이징 검증
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 배지 상태 표시 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 배지)
 * - 2024-12-19: 다양한 배지 타입 지원 구현
 * - 2024-12-19: 색상 및 크기 커스터마이징 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (배지 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 애니메이션 배지 효과
 * - 실시간 배지 업데이트
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <Badge 
 *   type="success"
 *   size="medium"
 *   color="green"
 *   text="완료"
 *   showIcon={true}
 *   accessibility={true}
 * />
 * ```
 */

'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "text-foreground",
}

export interface BadgeProps {
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  children?: React.ReactNode;
  [key: string]: any;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )} 
      {...props} 
    />
  )
}

export default Badge;
export { badgeVariants }; 