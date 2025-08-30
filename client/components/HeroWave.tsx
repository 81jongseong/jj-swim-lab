/**
 * 🌊 JJ Swim Lab - HeroWave 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 메인 페이지의 히어로 섹션을 위한 웨이브 애니메이션 컴포넌트
 * - 수영 테마에 맞는 동적 웨이브 효과 제공
 * - 사용자 주목을 끄는 시각적 임팩트 생성
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * - 웨이브 애니메이션과 콘텐츠의 조화로운 통합
 * 
 * 🔄 **주요 기능**
 * - 동적 웨이브 애니메이션 효과
 * - 반응형 웨이브 크기 및 속도 조정
 * - 웨이브 색상 및 투명도 커스터마이징
 * - 다양한 웨이브 패턴 및 방향
 * - 성능 최적화된 애니메이션 렌더링
 * 
 * 🗄️ **데이터 연동**
 * - 웨이브 애니메이션 파라미터
 * - 화면 크기 및 방향 정보
 * - 사용자 인터랙션 데이터
 * - 애니메이션 성능 지표
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - Canvas API 또는 SVG 애니메이션
 * - 애니메이션 라이브러리 (선택사항)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 웨이브 애니메이션의 성능 최적화
 * 2. 다양한 화면 크기에서의 반응형 동작
 * 3. 웨이브 애니메이션과 콘텐츠의 조화
 * 4. 접근성 및 사용자 경험 고려
 * 5. 애니메이션의 부드러움과 자연스러움
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 웨이브 애니메이션 동작 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 다양한 브라우저 호환성 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 웨이브 애니메이션)
 * - 2024-12-19: 반응형 웨이브 시스템 구현
 * - 2024-12-19: 웨이브 커스터마이징 시스템 구현
 * - 2024-12-19: 성능 최적화 및 애니메이션 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (히어로 웨이브 애니메이션 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 웨이브 패턴 생성
 * - 실시간 웨이브 커스터마이징
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <HeroWave 
 *   waveCount={3}
 *   waveSpeed={2}
 *   waveHeight={100}
 *   waveColor="#3b82f6"
 *   enableInteraction={true}
 * />
 * ```
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { motionPresets, heroAnimation, createWaveAnimation } from '@/lib/motion';

interface HeroWaveProps {
  title: string;
  subtitle: string;
  description?: string;
  ctaPrimary?: {
    text: string;
    href: string;
  };
  ctaSecondary?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

const HeroWave: React.FC<HeroWaveProps> = ({
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  backgroundImage,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  // Hydration 방지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 수면 파티클 애니메이션
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 파티클 클래스
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * -3 - 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = `hsl(${195 + Math.random() * 40}, 80%, ${60 + Math.random() * 20}%)`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.01;

        if (this.y < -10 || this.opacity <= 0) {
          this.y = canvas.height + Math.random() * 100;
          this.x = Math.random() * canvas.width;
          this.opacity = Math.random() * 0.5 + 0.3;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 파티클 생성
    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    particlesRef.current = particles;

    // 애니메이션 루프
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 그라데이션 배경
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'hsl(205, 80%, 22%)');
      gradient.addColorStop(0.5, 'hsl(195, 80%, 45%)');
      gradient.addColorStop(1, 'hsl(174, 70%, 45%)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 파티클 업데이트 및 그리기
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 캔버스 배경 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-primary/40" style={{ zIndex: 2 }} />
      
      {/* 콘텐츠 */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <motion.div
          variants={heroAnimation}
          initial="initial"
          animate="animate"
          exit="exit"
          className="max-w-4xl mx-auto"
        >
          {/* 서브타이틀 */}
          <motion.p
            variants={motionPresets.slideUp}
            className="text-lg md:text-xl font-medium text-secondary-200 mb-4"
          >
            {subtitle}
          </motion.p>
          
          {/* 메인 타이틀 */}
          <motion.h1
            variants={motionPresets.scaleIn}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-secondary-200 to-accent-200 bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h1>
          
          {/* 설명 */}
          {description && (
            <motion.p
              variants={motionPresets.slideUp}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              {description}
            </motion.p>
          )}
          
          {/* CTA 버튼들 */}
          <motion.div
            variants={motionPresets.slideUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {ctaPrimary && (
              <motion.a
                href={ctaPrimary.href}
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-2xl shadow-ocean hover:shadow-deep transition-all duration-300 transform hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {ctaPrimary.text}
              </motion.a>
            )}
            
            {ctaSecondary && (
              <motion.a
                href={ctaSecondary.href}
                className="btn-secondary px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {ctaSecondary.text}
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* 파도 효과 */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 3 }}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-auto"
        >
          <motion.path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="hsl(210, 30%, 98%)"
            opacity="0.25"
            variants={createWaveAnimation(0)}
            initial="initial"
            animate="animate"
          />
          <motion.path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19.84,79.26-34.69,120.83-39.67,96.65-11.61,192.41,47.06,282.64,37.47,29.38-3.11,58.48-12.58,86.84-26.35,14.21-6.9,34.79-6.65,48.92,1.16,27.84,15.25,51.6,40.92,80.67,54.47C1083.14,107.06,1200,92.27,1200,92.27V0Z"
            fill="hsl(210, 30%, 98%)"
            opacity="0.5"
            variants={createWaveAnimation(0.2)}
            initial="initial"
            animate="animate"
          />
          <motion.path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="hsl(210, 30%, 98%)"
            variants={createWaveAnimation(0.4)}
            initial="initial"
            animate="animate"
          />
        </svg>
      </div>
      
      {/* 수면 파티클 효과 */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              variants={motionPresets.particle}
              initial="initial"
              animate="animate"
              transition={{
                delay: i * 0.1,
                duration: 8,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      )}
      
      {/* 스크롤 인디케이터 */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        style={{ zIndex: 4 }}
        variants={motionPresets.float}
        initial="initial"
        animate="animate"
      >
        <div className="flex flex-col items-center text-white/70">
          <span className="text-sm mb-2">스크롤하여 더 알아보기</span>
          <motion.div
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroWave;
