'use client';
import { useState, useEffect, useRef } from 'react';

interface AnimationState {
  isPlaying: boolean;
  currentAnimation: string;
  speed: number;
  showGuides: boolean;
}

const AnimationLab = () => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentAnimation: 'freestyle',
    speed: 1,
    showGuides: true
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const frameCount = useRef(0);

  const animations = {
    freestyle: {
      name: '자유형',
      description: '가장 기본적인 수영 자세의 애니메이션',
      color: '#3B82F6'
    },
    breaststroke: {
      name: '평영',
      description: '가슴을 사용하는 수영 자세의 애니메이션',
      color: '#10B981'
    },
    backstroke: {
      name: '배영',
      description: '등을 사용하는 수영 자세의 애니메이션',
      color: '#F59E0B'
    },
    butterfly: {
      name: '접영',
      description: '가장 역동적인 수영 자세의 애니메이션',
      color: '#EF4444'
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기 설정
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 400;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (animationState.isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [animationState.isPlaying, animationState.currentAnimation, animationState.speed]);

  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      frameCount.current++;
      drawAnimation(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawAnimation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Canvas 클리어
    ctx.clearRect(0, 0, width, height);

    const time = frameCount.current * 0.02 * animationState.speed;
    const centerX = width / 2;
    const centerY = height / 2;

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#E0F2FE');
    gradient.addColorStop(1, '#BAE6FD');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 물결 효과
    drawWaterWaves(ctx, width, height, time);

    // 수영 자세 애니메이션
    switch (animationState.currentAnimation) {
      case 'freestyle':
        drawFreestyle(ctx, centerX, centerY, time);
        break;
      case 'breaststroke':
        drawBreaststroke(ctx, centerX, centerY, time);
        break;
      case 'backstroke':
        drawBackstroke(ctx, centerX, centerY, time);
        break;
      case 'butterfly':
        drawButterfly(ctx, centerX, centerY, time);
        break;
    }

    // 가이드라인
    if (animationState.showGuides) {
      drawGuides(ctx, width, height);
    }
  };

  const drawWaterWaves = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = 0; x < width; x += 5) {
        const y = height * 0.7 + Math.sin((x + time * 50 + i * 100) * 0.01) * 20;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  };

  const drawFreestyle = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const armAngle = Math.sin(time) * 0.5;
    const legAngle = Math.sin(time + Math.PI) * 0.3;

    // 몸통
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(centerX - 15, centerY - 40, 30, 80);

    // 머리
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 20, 0, Math.PI * 2);
    ctx.fill();

    // 팔
    ctx.fillStyle = '#F59E0B';
    // 왼쪽 팔
    ctx.save();
    ctx.translate(centerX - 25, centerY - 20);
    ctx.rotate(armAngle);
    ctx.fillRect(-5, 0, 10, 30);
    ctx.restore();

    // 오른쪽 팔
    ctx.save();
    ctx.translate(centerX + 25, centerY - 20);
    ctx.rotate(-armAngle);
    ctx.fillRect(-5, 0, 10, 30);
    ctx.restore();

    // 다리
    ctx.fillStyle = '#D97706';
    // 왼쪽 다리
    ctx.save();
    ctx.translate(centerX - 10, centerY + 40);
    ctx.rotate(legAngle);
    ctx.fillRect(-5, 0, 10, 25);
    ctx.restore();

    // 오른쪽 다리
    ctx.save();
    ctx.translate(centerX + 10, centerY + 40);
    ctx.rotate(-legAngle);
    ctx.fillRect(-5, 0, 10, 25);
    ctx.restore();
  };

  const drawBreaststroke = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const armAngle = Math.sin(time) * 0.8;
    const legAngle = Math.sin(time + Math.PI) * 0.6;

    // 몸통
    ctx.fillStyle = '#34D399';
    ctx.fillRect(centerX - 15, centerY - 40, 30, 80);

    // 머리
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 20, 0, Math.PI * 2);
    ctx.fill();

    // 팔 (가슴을 사용하는 동작)
    ctx.fillStyle = '#10B981';
    ctx.save();
    ctx.translate(centerX, centerY - 15);
    ctx.rotate(armAngle);
    ctx.fillRect(-20, -5, 40, 10);
    ctx.restore();

    // 다리 (개구리 다리)
    ctx.fillStyle = '#059669';
    ctx.save();
    ctx.translate(centerX, centerY + 40);
    ctx.rotate(legAngle);
    ctx.fillRect(-25, -5, 50, 10);
    ctx.restore();
  };

  const drawBackstroke = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const armAngle = Math.sin(time) * 0.5;
    const legAngle = Math.sin(time + Math.PI) * 0.3;

    // 몸통
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(centerX - 15, centerY - 40, 30, 80);

    // 머리
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 20, 0, Math.PI * 2);
    ctx.fill();

    // 팔 (뒤로 젓는 동작)
    ctx.fillStyle = '#D97706';
    ctx.save();
    ctx.translate(centerX - 25, centerY - 20);
    ctx.rotate(-armAngle);
    ctx.fillRect(-5, 0, 10, 30);
    ctx.restore();

    ctx.save();
    ctx.translate(centerX + 25, centerY - 20);
    ctx.rotate(armAngle);
    ctx.fillRect(-5, 0, 10, 30);
    ctx.restore();

    // 다리
    ctx.fillStyle = '#B45309';
    ctx.save();
    ctx.translate(centerX - 10, centerY + 40);
    ctx.rotate(legAngle);
    ctx.fillRect(-5, 0, 10, 25);
    ctx.restore();

    ctx.save();
    ctx.translate(centerX + 10, centerY + 40);
    ctx.rotate(-legAngle);
    ctx.fillRect(-5, 0, 10, 25);
    ctx.restore();
  };

  const drawButterfly = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const armAngle = Math.sin(time) * 1.2;
    const bodyWave = Math.sin(time * 2) * 10;

    // 몸통 (물결 모양)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY - 40);
    ctx.quadraticCurveTo(centerX + bodyWave, centerY - 20, centerX - 15, centerY);
    ctx.quadraticCurveTo(centerX + bodyWave, centerY + 20, centerX - 15, centerY + 40);
    ctx.lineTo(centerX + 15, centerY + 40);
    ctx.quadraticCurveTo(centerX - bodyWave, centerY + 20, centerX + 15, centerY);
    ctx.quadraticCurveTo(centerX - bodyWave, centerY - 20, centerX + 15, centerY - 40);
    ctx.closePath();
    ctx.fill();

    // 머리
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 20, 0, Math.PI * 2);
    ctx.fill();

    // 팔 (나비 날개 모양)
    ctx.fillStyle = '#DC2626';
    ctx.save();
    ctx.translate(centerX, centerY - 15);
    ctx.rotate(armAngle);
    ctx.fillRect(-30, -8, 60, 16);
    ctx.restore();

    // 다리 (함께 움직임)
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(centerX - 20, centerY + 40, 40, 8);
  };

  const drawGuides = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // 수직 가이드라인
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 수평 가이드라인
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const handleAnimationChange = (animation: string) => {
    setAnimationState(prev => ({
      ...prev,
      currentAnimation: animation,
      isPlaying: false
    }));
    frameCount.current = 0;
  };

  const toggleAnimation = () => {
    setAnimationState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setAnimationState(prev => ({
      ...prev,
      speed
    }));
  };

  const toggleGuides = () => {
    setAnimationState(prev => ({
      ...prev,
      showGuides: !prev.showGuides
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">수영 애니메이션 연구실</h2>
        <p className="text-gray-600">
          다양한 수영 자세를 애니메이션으로 학습하고 분석할 수 있습니다.
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 애니메이션 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수영 자세
            </label>
            <select
              value={animationState.currentAnimation}
              onChange={(e) => handleAnimationChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(animations).map(([key, animation]) => (
                <option key={key} value={key}>
                  {animation.name}
                </option>
              ))}
            </select>
          </div>

          {/* 재생/정지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              재생 제어
            </label>
            <button
              onClick={toggleAnimation}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                animationState.isPlaying
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {animationState.isPlaying ? '정지' : '재생'}
            </button>
          </div>

          {/* 속도 조절 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              재생 속도: {animationState.speed}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationState.speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 가이드라인 토글 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가이드라인
            </label>
            <button
              onClick={toggleGuides}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                animationState.showGuides
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {animationState.showGuides ? '숨기기' : '보이기'}
            </button>
          </div>
        </div>
      </div>

      {/* 애니메이션 캔버스 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {animations[animationState.currentAnimation as keyof typeof animations].name}
          </h3>
          <p className="text-gray-600">
            {animations[animationState.currentAnimation as keyof typeof animations].description}
          </p>
        </div>
        
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-gradient-to-b from-blue-50 to-blue-100"
          />
        </div>
      </div>

      {/* 애니메이션 설명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">애니메이션 특징</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">실시간 물결 효과</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">정확한 자세 표현</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">가이드라인 지원</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">속도 조절 가능</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">학습 팁</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 애니메이션을 천천히 재생하여 각 동작을 자세히 관찰하세요</p>
            <p>• 가이드라인을 활용하여 자세의 정확성을 확인하세요</p>
            <p>• 여러 수영 자세를 비교하여 차이점을 파악하세요</p>
            <p>• 실제 수영할 때 이 애니메이션을 참고하여 연습하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationLab;

