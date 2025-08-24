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
