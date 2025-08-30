/**
 * 🎭 JJ Swim Lab - EmptyState 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 데이터가 없거나 로딩 중일 때 표시되는 빈 상태 UI
 * - 사용자에게 현재 상태를 명확하게 안내
 * - 적절한 액션 버튼 및 가이드 제공
 * - 일관된 빈 상태 디자인 시스템
 * - 다양한 상황별 맞춤형 메시지 표시
 * 
 * 🔄 **주요 기능**
 * - 상황별 맞춤형 빈 상태 메시지
 * - 적절한 액션 버튼 및 가이드
 * - 일관된 빈 상태 디자인
 * - 애니메이션 및 시각적 효과
 * - 반응형 디자인 지원
 * 
 * 🗄️ **데이터 연동**
 * - 빈 상태 메시지 및 설명
 * - 액션 버튼 이벤트 핸들러
 * - 상황별 맞춤 콘텐츠
 * - 사용자 인터랙션 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * - 아이콘 라이브러리 (SVG)
 * - 애니메이션 라이브러리 (선택사항)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 상황별 적절한 메시지 선택
 * 2. 액션 버튼의 명확한 목적성
 * 3. 일관된 디자인 시스템 유지
 * 4. 접근성 및 키보드 네비게이션
 * 5. 반응형 디자인 및 모바일 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 상황별 메시지 적절성 확인
 * - [ ] 액션 버튼 동작 검증
 * - [ ] 디자인 일관성 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 빈 상태)
 * - 2024-12-19: 상황별 맞춤 메시지 시스템 구현
 * - 2024-12-19: 액션 버튼 및 가이드 시스템 구현
 * - 2024-12-19: 일관된 디자인 시스템 적용
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (빈 상태 UI 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 맞춤 메시지 생성
 * - 애니메이션 효과 고도화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <EmptyState 
 *   type="no-data"
 *   title="데이터가 없습니다"
 *   description="새로운 데이터를 추가해보세요"
 *   actionButton={{
 *     text: "데이터 추가",
 *     onClick: () => handleAddData()
 *   }}
 * />
 * ```
 */

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
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  size = 'md',
  className = '',
  children,
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
        
        {/* children 렌더링 */}
        {children}
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

      {/* children 렌더링 */}
      {children}

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
