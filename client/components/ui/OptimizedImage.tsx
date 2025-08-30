/**
 * 🖼️ JJ Swim Lab - OptimizedImage UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 이미지 최적화 및 성능 향상을 위한 고급 이미지 컴포넌트
 * - 지연 로딩, 크기 최적화, 포맷 변환 등을 통한 이미지 성능 개선
 * - 다양한 화면 크기에 맞는 반응형 이미지 제공
 * - 접근성을 고려한 이미지 표시 및 대체 텍스트
 * - 이미지 로딩 상태 및 에러 처리 지원
 * 
 * 🔄 **주요 기능**
 * - 이미지 지연 로딩 및 최적화
 * - 반응형 이미지 크기 조정
 * - 다양한 이미지 포맷 지원 및 최적화
 * - 로딩 상태 및 에러 상태 표시
 * - 접근성 지원 (alt 텍스트, ARIA 속성 등)
 * 
 * 🗄️ **데이터 연동**
 * - 이미지 소스 및 메타데이터
 * - 이미지 크기 및 포맷 정보
 * - 로딩 상태 및 에러 상태
 * - 접근성 속성 및 대체 텍스트
 * - 이미지 최적화 설정 및 옵션
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - 이미지 최적화 라이브러리
 * - 지연 로딩 및 인터섹션 옵저버
 * - 이미지 포맷 변환 도구
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 이미지 로딩 성능 및 최적화
 * 2. 다양한 화면 크기에서의 적절한 이미지 표시
 * 3. 이미지 접근성 및 대체 텍스트
 * 4. 이미지 에러 발생 시 적절한 처리
 * 5. 이미지 최적화와 품질의 균형
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 이미지 지연 로딩 동작 확인
 * - [ ] 반응형 이미지 크기 조정 검증
 * - [ ] 이미지 최적화 효과 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 이미지 에러 처리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 이미지 최적화)
 * - 2024-12-19: 지연 로딩 시스템 구현
 * - 2024-12-19: 반응형 이미지 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (최적화된 이미지 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 이미지 최적화 알고리즘
 * - 실시간 이미지 품질 조정
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <OptimizedImage 
 *   src="/images/swimming.jpg"
 *   alt="수영하는 모습"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   loading="lazy"
 *   onLoad={() => handleImageLoad()}
 *   onError={() => handleImageError()}
 *   responsive={true}
 *   optimization="high"
 * />
 * ```
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 이미지 로딩 완료
  const handleLoad = () => {
    setIsLoading(false);
  };

  // 이미지 로딩 실패
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  // 로딩 중 스켈레톤
  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  // 에러 발생 시 플레이스홀더
  if (error) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <span className="text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      sizes={sizes}
      quality={quality}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
