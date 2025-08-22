'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { motionPresets } from '@/lib/motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string | React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'search' | 'error' | 'success' | 'loading';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  // 기본 아이콘 설정
  const getDefaultIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'search':
        return '🔍';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'loading':
        return '⏳';
      default:
        return '📭';
    }
  };

  // 크기별 스타일
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-8 px-6';
      case 'md':
        return 'py-12 px-8';
      case 'lg':
        return 'py-16 px-12';
      default:
        return 'py-12 px-8';
    }
  };

  // 변형별 스타일
  const getVariantStyles = () => {
    switch (variant) {
      case 'search':
        return 'bg-info/5 border-info/20 text-info-foreground';
      case 'error':
        return 'bg-destructive/5 border-destructive/20 text-destructive-foreground';
      case 'success':
        return 'bg-success/5 border-success/20 text-success-foreground';
      case 'loading':
        return 'bg-warning/5 border-warning/20 text-warning-foreground';
      default:
        return 'bg-muted/50 border-muted text-muted-foreground';
    }
  };

  // 로딩 애니메이션
  if (variant === 'loading') {
    return (
      <motion.div
        variants={motionPresets.scaleIn}
        initial="initial"
        animate="animate"
        className={`text-center ${getSizeStyles()} ${className}`}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full border-4 border-muted border-t-primary rounded-full" />
        </motion.div>
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        
        {action && <div className="mt-6">{action}</div>}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={motionPresets.scaleIn}
      initial="initial"
      animate="animate"
      className={`text-center ${getSizeStyles()} ${className}`}
    >
      {/* 아이콘 */}
      <motion.div
        className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-4xl"
        variants={motionPresets.float}
        initial="initial"
        animate="animate"
      >
        {getDefaultIcon()}
      </motion.div>

      {/* 제목 */}
      <motion.h3
        variants={motionPresets.slideUp}
        className="text-xl font-semibold mb-3 text-foreground"
      >
        {title}
      </motion.h3>

      {/* 설명 */}
      {description && (
        <motion.p
          variants={motionPresets.slideUp}
          className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {/* 액션 버튼 */}
      {action && (
        <motion.div
          variants={motionPresets.slideUp}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}

      {/* 추가 시각적 요소 */}
      <motion.div
        className="mt-8 flex justify-center"
        variants={motionPresets.slideUp}
      >
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-muted rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// 특화된 빈 상태 컴포넌트들
export const SearchEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState
    {...props}
    variant="search"
    title={props.title || "검색 결과가 없습니다"}
    description={props.description || "다른 키워드로 검색해보세요"}
  />
);

export const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'variant'> & { error?: string }> = ({ error, ...props }) => (
  <EmptyState
    {...props}
    variant="error"
    title={props.title || "오류가 발생했습니다"}
    description={error || props.description || "잠시 후 다시 시도해주세요"}
  />
);

export const SuccessEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState
    {...props}
    variant="success"
    title={props.title || "완료되었습니다"}
    description={props.description || "모든 작업이 성공적으로 완료되었습니다"}
  />
);

export const LoadingState: React.FC<Omit<EmptyStateProps, 'variant'> & { progress?: number }> = ({ progress, ...props }) => (
  <EmptyState
    {...props}
    variant="loading"
    title={props.title || "로딩 중입니다"}
    description={props.description || "잠시만 기다려주세요"}
  >
    {progress !== undefined && (
      <div className="mt-4">
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{progress}% 완료</p>
      </div>
    )}
  </EmptyState>
);

export default EmptyState;
