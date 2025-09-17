'use client';

import React, { Suspense, ReactNode, ComponentType, ErrorBoundary } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 고급 TypeScript 패턴: Conditional Types와 Template Literal Types
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type LoadingProps<T extends LoadingState> = T extends 'loading' 
  ? { state: T; message?: string }
  : T extends 'error'
  ? { state: T; error: Error; retry?: () => void }
  : { state: T };

// 로딩 컴포넌트 타입
interface LoadingComponentProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse';
}

// 스켈레톤 로더 컴포넌트
const SkeletonLoader: React.FC<LoadingComponentProps> = ({ 
  size = 'md', 
  variant = 'skeleton' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-16',
    md: 'h-6 w-32',
    lg: 'h-8 w-48'
  };

  const animationVariants = {
    skeleton: {
      initial: { opacity: 0.6 },
      animate: { 
        opacity: [0.6, 1, 0.6],
        transition: { duration: 1.5, repeat: Infinity }
      }
    },
    pulse: {
      initial: { scale: 1 },
      animate: { 
        scale: [1, 1.05, 1],
        transition: { duration: 1, repeat: Infinity }
      }
    }
  };

  return (
    <motion.div
      className={`bg-gray-200 rounded ${sizeClasses[size]}`}
      variants={animationVariants[variant]}
      initial="initial"
      animate="animate"
    />
  );
};

// 스피너 로더 컴포넌트
const SpinnerLoader: React.FC<LoadingComponentProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.p
        className="text-gray-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

// 에러 바운더리 컴포넌트
interface ErrorFallbackProps {
  error: Error;
  retry?: () => void;
  resetError?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  retry, 
  resetError 
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="text-red-600 mb-4">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h3>
      <p className="text-red-600 text-sm text-center mb-4 max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      <div className="flex space-x-3">
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
        {resetError && (
          <button
            onClick={resetError}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </motion.div>
  );
};

// 고급 에러 바운더리 클래스
class AdvancedErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ComponentType<ErrorFallbackProps> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ComponentType<ErrorFallbackProps> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 에러 로깅 (Sentry, LogRocket 등)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          retry={() => this.setState({ hasError: false, error: null })}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// 메인 SuspenseBoundary 컴포넌트
interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ComponentType<ErrorFallbackProps>;
  loadingProps?: LoadingComponentProps;
  enableAnimation?: boolean;
}

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback,
  errorFallback,
  loadingProps = {},
  enableAnimation = true
}) => {
  const defaultFallback = (
    <SpinnerLoader 
      message={loadingProps.message}
      size={loadingProps.size}
      variant={loadingProps.variant}
    />
  );

  const content = (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );

  if (enableAnimation) {
    return (
      <AdvancedErrorBoundary fallback={errorFallback}>
        <AnimatePresence mode="wait">
          {content}
        </AnimatePresence>
      </AdvancedErrorBoundary>
    );
  }

  return (
    <AdvancedErrorBoundary fallback={errorFallback}>
      {content}
    </AdvancedErrorBoundary>
  );
};

// 특화된 Suspense 컴포넌트들
export const DataSuspense: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SuspenseBoundary
    loadingProps={{ 
      message: 'Loading data...', 
      variant: 'skeleton' 
    }}
  >
    {children}
  </SuspenseBoundary>
);

export const ImageSuspense: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SuspenseBoundary
    loadingProps={{ 
      message: 'Loading image...', 
      variant: 'pulse' 
    }}
  >
    {children}
  </SuspenseBoundary>
);

export const RouteSuspense: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SuspenseBoundary
    loadingProps={{ 
      message: 'Loading page...', 
      size: 'lg' 
    }}
  >
    {children}
  </SuspenseBoundary>
);

// 고급 로딩 상태 훅
export const useLoadingState = <T extends LoadingState>(
  initialState: T = 'idle' as T
) => {
  const [state, setState] = React.useState<T>(initialState);
  const [error, setError] = React.useState<Error | null>(null);

  const setLoading = React.useCallback(() => {
    setState('loading' as T);
    setError(null);
  }, []);

  const setSuccess = React.useCallback(() => {
    setState('success' as T);
    setError(null);
  }, []);

  const setErrorState = React.useCallback((err: Error) => {
    setState('error' as T);
    setError(err);
  }, []);

  const reset = React.useCallback(() => {
    setState('idle' as T);
    setError(null);
  }, []);

  return {
    state,
    error,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle',
    setLoading,
    setSuccess,
    setError: setErrorState,
    reset,
  };
};

export default SuspenseBoundary;
