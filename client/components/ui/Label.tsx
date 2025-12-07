/**
 * 📦 JJ Swim Lab - Label UI 컴포넌트
 * 
 * 📋 **파일 목적**
 * - shadcn/ui 스타일의 Label 컴포넌트
 * - 폼 요소 라벨링 제공
 * 
 * 🔄 **연동되는 파일**
 * - components/ui/index.ts (export)
 * - 모든 페이지의 라벨 요소
 * 
 * 🗄️ **데이터 연동**
 * - htmlFor: 연결된 input의 id
 * - className: 추가 스타일 클래스
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
