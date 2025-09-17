// 고급 성능 최적화 유틸리티
import { useCallback, useMemo, useRef, useEffect } from 'react';

// 디바운스 함수 (고급 TypeScript 패턴)
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// 쓰로틀 함수
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 메모이제이션 헬퍼
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 지연 로딩 훅
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadFn, loading]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { data, loading, error, load };
}

// 가상 스크롤링 훅
export function useVirtualScroll(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const virtualizedData = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      itemCount - 1
    );

    return {
      startIndex,
      endIndex,
      visibleCount: endIndex - startIndex + 1,
      offsetY: startIndex * itemHeight,
      totalHeight: itemCount * itemHeight
    };
  }, [itemCount, itemHeight, containerHeight, overscan, scrollTop]);

  const scrollToIndex = useCallback((index: number) => {
    setScrollTop(index * itemHeight);
  }, [itemHeight]);

  return {
    ...virtualizedData,
    scrollTop,
    setScrollTop,
    scrollToIndex
  };
}

// 이미지 최적화 훅
export function useImageOptimization(src: string, options: {
  lazy?: boolean;
  placeholder?: string;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    // 이미지 최적화 URL 생성 (예: Cloudinary, ImageKit 등)
    const params = new URLSearchParams();
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    return `${src}?${params.toString()}`;
  }, [src, options]);

  useEffect(() => {
    if (!options.lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options.lazy]);

  return {
    src: optimizedSrc,
    loaded: options.lazy ? loaded : true,
    error,
    imgRef,
    setError
  };
}

// 번들 분석 유틸리티
export function analyzeBundle() {
  if (typeof window === 'undefined') return null;

  const performance = window.performance;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
    cumulativeLayoutShift: performance.getEntriesByName('cumulative-layout-shift')[0]?.value || 0
  };
}

// 메모리 사용량 모니터링
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = React.useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).performance?.memory) {
      return;
    }

    const updateMemoryInfo = () => {
      const memory = (window as any).performance.memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      });
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// 코드 스플리팅 헬퍼
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(importFn);
}

// 프리페칭 훅
export function usePrefetch<T>(
  prefetchFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [prefetched, setPrefetched] = React.useState(false);
  const [data, setData] = React.useState<T | null>(null);

  const prefetch = useCallback(async () => {
    if (prefetched) return data;
    
    try {
      const result = await prefetchFn();
      setData(result);
      setPrefetched(true);
      return result;
    } catch (error) {
      console.error('Prefetch failed:', error);
      return null;
    }
  }, [prefetchFn, prefetched, data]);

  useEffect(() => {
    prefetch();
  }, deps);

  return { prefetch, data, prefetched };
}

// 성능 측정 훅
export function usePerformanceMeasure(name: string) {
  const startTime = useRef<number>(0);

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    if (typeof window !== 'undefined' && (window as any).performance?.mark) {
      (window as any).performance.mark(`${name}-end`);
      (window as any).performance.measure(name, `${name}-start`, `${name}-end`);
    }
    
    return duration;
  }, [name]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).performance?.mark) {
      (window as any).performance.mark(`${name}-start`);
    }
  }, [name]);

  return { start, end };
}

// 캐시 관리 유틸리티
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl = 300000) { // 5분 기본 TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string) {
    return this.get(key) !== null;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const cacheManager = new CacheManager();

// 웹 워커 헬퍼
export function createWorker(workerFn: () => void) {
  const blob = new Blob([`(${workerFn.toString()})()`], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

// 스트리밍 데이터 훅
export function useStreamingData<T>(
  streamFn: () => ReadableStream<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData([]);

    const stream = streamFn();
    const reader = stream.getReader();

    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          setData(prev => [...prev, value]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    readStream();

    return () => {
      reader.cancel();
    };
  }, deps);

  return { data, loading, error };
}

export default {
  debounce,
  throttle,
  memoize,
  useLazyLoad,
  useVirtualScroll,
  useImageOptimization,
  analyzeBundle,
  useMemoryMonitor,
  createLazyComponent,
  usePrefetch,
  usePerformanceMeasure,
  CacheManager,
  cacheManager,
  createWorker,
  useStreamingData
};
