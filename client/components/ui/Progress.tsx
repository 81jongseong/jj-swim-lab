/**
 * 📦 JJ Swim Lab - Progress UI 컴포넌트
 * 
 * 📋 **파일 목적**
 * - 진행률 표시 컴포넌트
 * - 로딩 상태나 작업 진행도 시각화
 * 
 * 🔄 **연동되는 파일**
 * - components/ui/index.ts (export)
 */

import * as React from "react"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number
    max?: number
    indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
        const percentage = Math.min(Math.max(0, (value || 0) / (max || 100) * 100), 100);

        return (
            <div
                ref={ref}
                className={cn(
                    "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
                    className
                )}
                {...props}
            >
                <div
                    className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
                    style={{ transform: `translateX(-${100 - percentage}%)` }}
                />
            </div>
        )
    }
)
Progress.displayName = "Progress"

export { Progress }
