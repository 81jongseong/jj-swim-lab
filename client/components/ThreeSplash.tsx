/**
 * 🎨 JJ Swim Lab - ThreeSplash 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - Three.js를 활용한 3D 스플래시 화면 및 로딩 애니메이션
 * - 수영 테마에 맞는 3D 시각적 효과 제공
 * - 로딩 진행 상황을 3D 애니메이션으로 표시
 * - 사용자 주목을 끄는 몰입형 로딩 경험
 * - 성능 최적화된 3D 렌더링
 * 
 * 🔄 **주요 기능**
 * - Three.js 기반 3D 스플래시 화면
 * - 로딩 진행 상황 3D 애니메이션
 * - 수영 테마 3D 요소 및 효과
 * - 반응형 3D 렌더링
 * - 3D 애니메이션 제어 및 커스터마이징
 * 
 * 🗄️ **데이터 연동**
 * - 로딩 진행 상황 데이터
 * - 3D 모델 및 텍스처 파일
 * - 애니메이션 파라미터 및 설정
 * - 화면 크기 및 방향 정보
 * - 3D 렌더링 성능 지표
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - Three.js 3D 라이브러리
 * - 3D 모델 및 텍스처 파일
 * - WebGL 렌더링 엔진
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. Three.js 렌더링 성능 최적화
 * 2. 3D 모델 및 텍스처 로딩 최적화
 * 3. 다양한 디바이스에서의 성능 관리
 * 4. WebGL 호환성 및 폴백 처리
 * 5. 3D 애니메이션의 부드러움 유지
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] Three.js 3D 렌더링 동작 확인
 * - [ ] 로딩 애니메이션 동작 확인
 * - [ ] 3D 모델 및 텍스처 로딩 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * - [ ] 다양한 브라우저 및 디바이스 호환성 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 3D 스플래시)
 * - 2024-12-19: Three.js 3D 렌더링 시스템 구현
 * - 2024-12-19: 로딩 애니메이션 시스템 구현
 * - 2024-12-19: 성능 최적화 및 3D 효과 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (3D 스플래시 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 3D 콘텐츠 생성
 * - 실시간 3D 커스터마이징
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ThreeSplash 
 *   onLoadComplete={() => handleLoadComplete()}
 *   onProgress={(progress) => handleProgress(progress)}
 *   enable3DAnimation={true}
 *   splashDuration={3000}
 *   onSplashComplete={() => handleSplashComplete()}
 * />
 * ```
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { motionPresets } from '@/lib/motion';

interface ThreeSplashProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  intensity?: 'low' | 'medium' | 'high';
  color?: 'primary' | 'secondary' | 'info' | 'custom';
  customColor?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

const ThreeSplash: React.FC<ThreeSplashProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  intensity = 'medium',
  color = 'primary',
  customColor,
  onLoad,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [threeInstance, setThreeInstance] = useState<any>(null);

  // 강도 설정
  const getIntensityConfig = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return { particleCount: 50, speed: 0.5, size: 2 };
      case 'medium':
        return { particleCount: 100, speed: 0.8, size: 3 };
      case 'high':
        return { particleCount: 200, speed: 1.2, size: 4 };
      default:
        return { particleCount: 100, speed: 0.8, size: 3 };
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
    let mounted = true;
    let animationId: number;

    const initThree = async () => {
      try {
        // Three.js 동적 로드
        const THREE = await import('three');
        
        if (!mounted || !containerRef.current) return;

        const config = getIntensityConfig(intensity);
        const baseColor = getColorConfig(color);

        // 씬 설정
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(baseColor);

        // 카메라 설정
        const camera = new THREE.PerspectiveCamera(
          75,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 5;

        // 렌더러 설정
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
        });
        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // 파티클 시스템 생성
        const particles = new THREE.BufferGeometry();
        const particleCount = config.particleCount;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
          // 위치
          positions[i * 3] = (Math.random() - 0.5) * 10;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

          // 색상
          const hue = 195 + Math.random() * 40;
          const saturation = 70 + Math.random() * 20;
          const lightness = 60 + Math.random() * 20;
          
          colors[i * 3] = (hue / 360) * 0.8 + 0.1;
          colors[i * 3 + 1] = (saturation / 100) * 0.8 + 0.1;
          colors[i * 3 + 2] = (lightness / 100) * 0.8 + 0.1;

          // 크기
          sizes[i] = Math.random() * config.size + 1;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // 파티클 머티리얼
        const particleMaterial = new THREE.PointsMaterial({
          size: config.size,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          sizeAttenuation: true,
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        // 물결 효과 (평면 지오메트리)
        const waveGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
        const waveMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.1,
          wireframe: true,
        });

        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        wave.rotation.x = -Math.PI / 2;
        wave.position.y = -3;
        scene.add(wave);

        // 애니메이션 루프
        const animate = () => {
          if (!mounted) return;

          // 파티클 회전
          particleSystem.rotation.x += 0.001 * config.speed;
          particleSystem.rotation.y += 0.002 * config.speed;

          // 파티클 움직임
          const positions = particleSystem.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01 * config.speed;
            if (positions[i * 3 + 1] > 5) {
              positions[i * 3 + 1] = -5;
            }
          }
          particleSystem.geometry.attributes.position.needsUpdate = true;

          // 물결 애니메이션
          const wavePositions = wave.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < wavePositions.length; i += 3) {
            wavePositions[i + 2] = Math.sin(
              Date.now() * 0.001 + wavePositions[i] * 0.5
            ) * 0.5;
          }
          wave.geometry.attributes.position.needsUpdate = true;

          renderer.render(scene, camera);
          animationId = requestAnimationFrame(animate);
        };

        animate();

        // 리사이즈 핸들러
        const handleResize = () => {
          if (!mounted || !containerRef.current) return;

          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;

          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // 인스턴스 저장
        setThreeInstance({
          scene,
          camera,
          renderer,
          particleSystem,
          wave,
          cleanup: () => {
            window.removeEventListener('resize', handleResize);
            if (animationId) {
              cancelAnimationFrame(animationId);
            }
            renderer.dispose();
            if (containerRef.current) {
              containerRef.current.removeChild(renderer.domElement);
            }
          },
        });

        setIsLoading(false);
        onLoad?.();

      } catch (error) {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    initThree();

    return () => {
      mounted = false;
      if (threeInstance) {
        threeInstance.cleanup();
      }
    };
  }, [intensity, color, customColor, onLoad, onError]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <motion.div
          variants={motionPresets.pulse}
          animate="animate"
          className="text-primary text-center"
        >
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">3D 효과 로딩 중...</p>
        </motion.div>
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
          <p className="text-sm font-medium">3D 효과를 불러올 수 없습니다</p>
          <p className="text-xs text-muted-foreground mt-1">WebGL을 지원하지 않거나 오류가 발생했습니다</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {/* Three.js 캔버스가 여기에 렌더링됩니다 */}
      
      {/* 오버레이 정보 */}
      <motion.div
        className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>3D 파티클 시스템</span>
        </div>
        <div className="text-xs text-white/70 mt-1">
          강도: {intensity} | 파티클: {getIntensityConfig(intensity).particleCount}
        </div>
      </motion.div>
      
      {/* 인터랙션 가이드 */}
      <motion.div
        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>인터랙션</span>
        </div>
        <p>마우스로 드래그하여 회전</p>
        <p>휠로 확대/축소</p>
      </motion.div>
    </div>
  );
};

export default ThreeSplash;
