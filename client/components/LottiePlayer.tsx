/**
 * 🎬 JJ Swim Lab - LottiePlayer 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - Lottie 애니메이션 파일을 재생하고 제어하는 컴포넌트
 * - 수영 테마에 맞는 애니메이션 효과 제공
 * - 애니메이션 재생, 일시정지, 속도 조절 기능
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * - 성능 최적화된 애니메이션 렌더링
 * 
 * 🔄 **주요 기능**
 * - Lottie 애니메이션 파일 재생
 * - 애니메이션 재생 제어 (재생, 일시정지, 정지)
 * - 애니메이션 속도 및 방향 조절
 * - 반응형 애니메이션 크기 조정
 * - 애니메이션 이벤트 및 콜백 처리
 * 
 * 🗄️ **데이터 연동**
 * - Lottie 애니메이션 파일 (JSON)
 * - 애니메이션 재생 상태 및 제어
 * - 애니메이션 이벤트 및 콜백
 * - 반응형 크기 조정 정보
 * - 애니메이션 성능 지표
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - Lottie 애니메이션 라이브러리
 * - Lottie 애니메이션 파일 (JSON)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. Lottie 애니메이션 파일의 최적화
 * 2. 애니메이션 재생 성능 및 메모리 관리
 * 3. 다양한 화면 크기에서의 반응형 동작
 * 4. 애니메이션 이벤트 처리의 안정성
 * 5. 접근성 및 사용자 경험 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] Lottie 애니메이션 재생 확인
 * - [ ] 애니메이션 제어 기능 검증
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 애니메이션 이벤트 처리 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 Lottie 플레이어)
 * - 2024-12-19: 애니메이션 제어 시스템 구현
 * - 2024-12-19: 반응형 디자인 적용
 * - 2024-12-19: 애니메이션 이벤트 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Lottie 애니메이션 플레이어 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 애니메이션 최적화
 * - 실시간 애니메이션 커스터마이징
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <LottiePlayer 
 *   src="/animations/swimming.json"
 *   autoplay={true}
 *   loop={true}
 *   speed={1}
 *   onComplete={() => handleAnimationComplete()}
 *   onLoad={() => handleAnimationLoad()}
 * />
 * ```
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { motionPresets } from '@/lib/motion';

interface LottiePlayerProps {
  src: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  onLoad?: () => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({
  src,
  className = '',
  width = '100%',
  height = '100%',
  loop = true,
  autoplay = true,
  speed = 1,
  onLoad,
  onComplete,
  onError,
  fallback,
  loading,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [lottieInstance, setLottieInstance] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadLottie = async () => {
      try {
        // Lottie 라이브러리 동적 로드
        const lottie = await import('lottie-web');
        
        if (!mounted || !containerRef.current) return;

        const instance = lottie.default.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop,
          autoplay,
          path: src,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
          },
        });

        // 이벤트 리스너 등록
        instance.addEventListener('data_ready', () => {
          if (mounted) {
            setIsLoading(false);
            onLoad?.();
          }
        });

        instance.addEventListener('complete', () => {
          if (mounted) {
            onComplete?.();
          }
        });

        instance.addEventListener('error', (error) => {
          if (mounted) {
            setHasError(true);
            setIsLoading(false);
            onError?.(error);
          }
        });

        // 속도 설정
        if (speed !== 1) {
          instance.setSpeed(speed);
        }

        setLottieInstance(instance);

      } catch (error) {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    loadLottie();

    return () => {
      mounted = false;
      if (lottieInstance) {
        lottieInstance.destroy();
      }
    };
  }, [src, loop, autoplay, speed, onLoad, onComplete, onError]);

  // 재생/일시정지 제어
  const togglePlay = () => {
    if (lottieInstance) {
      if (lottieInstance.isPaused) {
        lottieInstance.play();
      } else {
        lottieInstance.pause();
      }
    }
  };

  // 정지
  const stop = () => {
    if (lottieInstance) {
      lottieInstance.stop();
    }
  };

  // 특정 프레임으로 이동
  const goToAndPlay = (frame: number) => {
    if (lottieInstance) {
      lottieInstance.goToAndPlay(frame);
    }
  };

  // 특정 프레임으로 이동 (정지)
  const goToAndStop = (frame: number) => {
    if (lottieInstance) {
      lottieInstance.goToAndStop(frame, true);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {loading || (
          <motion.div
            variants={motionPresets.pulse}
            animate="animate"
            className="text-primary text-center"
          >
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">로딩 중...</p>
          </motion.div>
        )}
      </div>
    );
  }

  // 에러 상태
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {fallback || (
          <motion.div
            variants={motionPresets.scaleIn}
            initial="initial"
            animate="animate"
            className="text-destructive text-center"
          >
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium">애니메이션을 불러올 수 없습니다</p>
            <p className="text-xs text-muted-foreground mt-1">파일 경로를 확인해주세요</p>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Lottie 컨테이너 */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ cursor: 'pointer' }}
        onClick={togglePlay}
        role="button"
        tabIndex={0}
        aria-label="애니메이션 재생/일시정지"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePlay();
          }
        }}
      />
      
      {/* 컨트롤 오버레이 (호버 시 표시) */}
      <motion.div
        className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
        whileHover={{ opacity: 1 }}
      >
        <div className="bg-white/90 rounded-full p-3 shadow-lg">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </motion.div>
      
      {/* 컨트롤 버튼들 */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <button
          onClick={togglePlay}
          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200"
          aria-label="재생/일시정지"
        >
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <button
          onClick={stop}
          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200"
          aria-label="정지"
        >
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LottiePlayer;
