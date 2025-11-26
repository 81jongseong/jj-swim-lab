/**
 * 📦 JJ Swim Lab - Textarea UI 컴포넌트
 * 
 * 📋 **파일 목적**
 * - shadcn/ui 스타일의 Textarea 컴포넌트
 * - 다중 라인 텍스트 입력 필드 제공
 * 
 * 🔄 **연동되는 파일**
 * - components/ui/index.ts (export)
 * - 모든 페이지의 텍스트 영역 요소
 * 
 * 🗄️ **데이터 연동**
 * - value: 입력값
 * - onChange: 변경 핸들러
 * - className: 추가 스타일 클래스
 */

import * as React from "react"

import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export default Textarea
