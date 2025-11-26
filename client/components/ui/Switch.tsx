/**
 * 📦 JJ Swim Lab - Switch UI 컴포넌트
 * 
 * 📋 **파일 목적**
 * - shadcn/ui 스타일의 Switch 컴포넌트
 * - ON/OFF 토글 스위치 제공
 * 
 * 🔄 **연동되는 파일**
 * - components/ui/index.ts (export)
 * - 모든 페이지의 토글 스위치 요소
 * 
 * 🗄️ **데이터 연동**
 * - checked: 체크 상태
 * - onCheckedChange: 체크 변경 핸들러
 * - className: 추가 스타일 클래스
 * 
 * ⚠️ **주의사항**
 * - @radix-ui/react-switch 패키지가 필요합니다
 * - 없을 경우 기본 HTML checkbox로 구현
 */

"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600",
            className
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export default Switch
