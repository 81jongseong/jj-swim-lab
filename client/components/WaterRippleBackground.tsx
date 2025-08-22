'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaterRippleBackgroundProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  color?: 'primary' | 'secondary' | 'info' | 'custom';
  customColor?: string;
}

const WaterRippleBackground: React.FC<WaterRippleBackgroundProps> = ({
  children,
  className = '',
  intensity = 'medium',
  color = 'primary',
  customColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // 물결 효과 설정
  const getIntensityConfig = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return { amplitude: 10, frequency: 0.02, speed: 0.5 };
      case 'medium':
        return { amplitude: 20, frequency: 0.03, speed: 0.8 };
      case 'high':
        return { amplitude: 30, frequency: 0.04, speed: 1.2 };
      default:
        return { amplitude: 20, frequency: 0.03, speed: 0.8 };
    }
  };

  // 색상 설정
  const getColorConfig = (color: string) => {
    switch (color) {
      case 'primary':
        return 'hsl(205, 80%, 22%)';
      case 'secondary':
        return 'hsl(174, 70%, 45%)';
      case 'info':
        return 'hsl(195, 80%, 45%)';
      case 'custom':
        return customColor || 'hsl(205, 80%, 22%)';
      default:
        return 'hsl(205, 80%, 22%)';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 물결 애니메이션 변수
    let time = 0;
    const config = getIntensityConfig(intensity);
    const baseColor = getColorConfig(color);

    // 물결 그리기 함수
    const drawWave = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // 그라데이션 배경
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.5, baseColor.replace(')', ', 0.5)').replace('hsl(', 'hsla('));
      gradient.addColorStop(1, baseColor.replace(')', ', 0.25)').replace('hsl(', 'hsla('));

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 물결 패턴 그리기
      ctx.beginPath();
      ctx.moveTo(0, height);

      // 여러 레이어의 물결
      for (let layer = 0; layer < 3; layer++) {
        const layerConfig = {
          amplitude: config.amplitude * (1 - layer * 0.2),
          frequency: config.frequency * (1 + layer * 0.1),
          speed: config.speed * (1 + layer * 0.2),
          opacity: 0.3 - layer * 0.1,
        };

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 2) {
          const y = height * 0.5 + 
                   Math.sin(x * layerConfig.frequency + time * layerConfig.speed) * layerConfig.amplitude +
                   Math.sin(x * layerConfig.frequency * 0.5 + time * layerConfig.speed * 0.7) * layerConfig.amplitude * 0.5;
          
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // 물결 채우기
        ctx.fillStyle = `rgba(255, 255, 255, ${layerConfig.opacity})`;
        ctx.fill();
      }

      // 시간 업데이트
      time += 0.02;

      // 애니메이션 루프
      animationRef.current = requestAnimationFrame(drawWave);
    };

    // 애니메이션 시작
    drawWave();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [intensity, color, customColor]);

  return (
    <div className={`relative ${className}`}>
      {/* 물결 배경 캔버스 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      
      {/* 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 추가 물결 효과 (CSS 기반) */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${getColorConfig(color).replace(')', ', 0.125)').replace('hsl(', 'hsla(')} 100%)`,
          }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* 물방울 효과 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${80 + i * 5}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WaterRippleBackground;
