/**
 * 📦 JJ Swim Lab - Input UI 컴포넌트
 * 
 * 📋 **파일 목적**
 * - shadcn/ui 스타일의 Input 컴포넌트
 * - 텍스트 입력 필드 제공
 * 
 * 🔄 **연동되는 파일**
 * - components/ui/index.ts (export)
 * - 모든 페이지의 입력 필드 요소
 * 
 * 🗄️ **데이터 연동**
 * - value: 입력 값
 * - onChange: 값 변경 핸들러
 * - type: 입력 타입 (text, number, email, password 등)
 * - className: 추가 스타일 클래스
 */

import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
