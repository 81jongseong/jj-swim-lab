import { Variants, Transition } from 'framer-motion';

// 수영 특화 애니메이션 프리셋
export const motionPresets = {
  // 기본 등장 애니메이션
  appear: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  // 위에서 아래로 슬라이드
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
  
  // 아래에서 위로 슬라이드
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  
  // 왼쪽에서 오른쪽으로 슬라이드
  slideLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  
  // 오른쪽에서 왼쪽으로 슬라이드
  slideRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },
  
  // 스케일 인/아웃
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  
  // 수영 특화 파도 애니메이션
  wave: {
    initial: { opacity: 0, y: 0, rotate: 0 },
    animate: { 
      opacity: [0, 1, 1, 0],
      y: [0, -10, 0, -5],
      rotate: [0, 2, 0, -1],
    },
    exit: { opacity: 0, y: 0, rotate: 0 },
  },
  
  // 수영 특화 떠오름 애니메이션
  float: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1,
      y: [20, -10, 20],
    },
    exit: { opacity: 0, y: 20 },
  },
  
  // 수영 특화 수영 애니메이션
  swim: {
    initial: { opacity: 0, x: -100 },
    animate: { 
      opacity: 1,
      x: [0, 50, 0],
    },
    exit: { opacity: 0, x: 100 },
  },
  
  // 수영 특화 물결 애니메이션
  ripple: {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: [0, 1, 0],
      scale: [0, 1, 2],
    },
    exit: { opacity: 0, scale: 0 },
  },
  
  // 수영 특화 파티클 애니메이션
  particle: {
    initial: { opacity: 0, y: 0, rotate: 0 },
    animate: { 
      opacity: [0, 1, 0],
      y: [0, -100],
      rotate: [0, 360],
    },
    exit: { opacity: 0, y: 0, rotate: 0 },
  },
  
  // 수영 특화 잠수 애니메이션
  dive: {
    initial: { opacity: 0, y: -50, scale: 0.8 },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: { opacity: 0, y: 50, scale: 0.8 },
  },
  
  // 수영 특화 부상 애니메이션
  surface: {
    initial: { opacity: 0, y: 50, scale: 0.8 },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: { opacity: 0, y: -50, scale: 0.8 },
  },
};

// 기본 전환 설정 (200-250ms)
export const defaultTransition: Transition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};

// 빠른 전환 (150ms)
export const fastTransition: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

// 느린 전환 (400ms)
export const slowTransition: Transition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1],
};

// 탄성 전환
export const bouncyTransition: Transition = {
  duration: 0.6,
  ease: [0.68, -0.55, 0.265, 1.55],
};

// 수영 특화 전환
export const swimTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// 물결 전환
export const waveTransition: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};

// 스태거 애니메이션을 위한 유틸리티
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerSlow: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

// 수영 특화 스태거
export const swimStagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// 페이지 전환 애니메이션
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// 모달 애니메이션
export const modalAnimation: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

// 카드 호버 애니메이션
export const cardHover: Variants = {
  initial: { y: 0, scale: 1 },
  hover: { y: -8, scale: 1.02 },
};

// 버튼 클릭 애니메이션
export const buttonTap: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
};

// 로딩 스피너 애니메이션
export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// 펄스 애니메이션
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// 수영 특화 물방울 애니메이션
export const waterDrop: Variants = {
  initial: { opacity: 0, scale: 0, y: -20 },
  animate: { 
    opacity: [0, 1, 0],
    scale: [0, 1, 0.8],
    y: [-20, 0, 20],
  },
  exit: { opacity: 0, scale: 0, y: 20 },
};

// 수영 특화 물고기 애니메이션
export const fishSwim: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { 
    opacity: 1,
    x: [0, 50, 0, -50, 0],
    y: [0, -10, 0, 10, 0],
  },
  exit: { opacity: 0, x: 100 },
};

// 접근성을 위한 모션 감소 설정 대응
export const getReducedMotion = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
};

// 수영 특화 애니메이션 조합
export const createSwimAnimation = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 30, rotate: -5 },
  animate: { 
    opacity: 1, 
    y: 0, 
    rotate: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: { 
    opacity: 0, 
    y: -30, 
    rotate: 5,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
});

// 수영 특화 물결 애니메이션 조합
export const createWaveAnimation = (delay: number = 0): Variants => ({
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { 
    opacity: [0, 1, 1, 0],
    scale: [0.8, 1, 1.1, 0.9],
    y: [20, 0, -10, 0],
    transition: {
      delay,
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20,
  },
});

// 수영 특화 파티클 애니메이션 조합
export const createParticleAnimation = (delay: number = 0): Variants => ({
  initial: { opacity: 0, scale: 0, rotate: 0 },
  animate: { 
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    rotate: [0, 180, 360],
    y: [0, -100, -200],
    x: [0, 20, -20],
    transition: {
      delay,
      duration: 3,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0, 
    rotate: 0,
  },
});

// 수영 특화 히어로 애니메이션
export const heroAnimation: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: { 
    opacity: 0, 
    y: -50,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// 수영 특화 카드 그리드 애니메이션
export const cardGridAnimation: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: { 
    opacity: 0, 
    y: 30,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// 수영 특화 네비게이션 애니메이션
export const navigationAnimation: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
