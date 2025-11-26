/**
 * 📦 JJ Swim Lab - Slider UI 컴포넌트
 * 
 * 📋 **파일 목적**
 * - shadcn/ui 스타일의 Slider 컴포넌트
 * - 범위 값 선택 슬라이더 제공
 * 
 * 🔄 **연동되는 파일**
 * - components/ui/index.ts (export)
 * - 모든 페이지의 슬라이더 요소
 * 
 * 🗄️ **데이터 연동**
 * - value: 현재 값 배열
 * - onValueChange: 값 변경 핸들러
 * - className: 추가 스타일 클래스
 * 
 * ⚠️ **주의사항**
 * - @radix-ui/react-slider 패키지가 필요합니다
 * - 없을 경우 기본 HTML range input으로 구현
 */

"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)]
      onValueChange?.(newValue)
    }

    const currentValue = Array.isArray(value) ? value[0] ?? 0 : value

    return (
      <input
        type="range"
        className={cn(
          "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          className
        )}
        ref={ref}
        value={currentValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentValue - Number(min)) / (Number(max) - Number(min))) * 100}%, #e5e7eb ${((currentValue - Number(min)) / (Number(max) - Number(min))) * 100}%, #e5e7eb 100%)`
        }}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export default Slider
