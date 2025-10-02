/**
 * ErrorToast 컴포넌트
 * 
 * 연동되는 데이터: 없음
 * 연동되는 파일: 모든 페이지의 에러 토스트 요소
 */

import * as React from "react"
import { cn } from "../../lib/utils"

interface ErrorToastProps {
  error: string;
  onRetry?: () => Promise<void>;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
  showDetails?: boolean;
  className?: string;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ 
  error, 
  onRetry,
  onDismiss,
  autoHide = true,
  duration = 5000,
  showDetails = false,
  className 
}) => {
  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg max-w-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex-1">{error}</span>
        <div className="flex items-center space-x-2 ml-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-white hover:text-gray-200 text-sm"
            >
              재시도
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorToast

