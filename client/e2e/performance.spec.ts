import { test, expect } from '@playwright/test';

/**
 * 성능 E2E 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 페이지 로드 성능
 * - Core Web Vitals 지표
 * - 메모리 사용량
 * - 네트워크 성능
 * - 렌더링 성능
 */

test.describe('성능 테스트', () => {
  test.describe('페이지 로드 성능', () => {
    test('홈페이지 로드 시간이 허용 범위 내여야 함', async ({ page }) => {
      // 성능 측정 시작
      const startTime = Date.now();
      
      // 홈페이지 로드
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 로드 시간 계산
      const loadTime = Date.now() - startTime;
      
      // 로드 시간이 3초 이내여야 함
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`홈페이지 로드 시간: ${loadTime}ms`);
    });

    test('로그인 페이지 로드 시간이 허용 범위 내여야 함', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
      
      console.log(`로그인 페이지 로드 시간: ${loadTime}ms`);
    });

    test('대시보드 로드 시간이 허용 범위 내여야 함', async ({ page }) => {
      // 먼저 로그인
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      const startTime = Date.now();
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(4000);
      
      console.log(`대시보드 로드 시간: ${loadTime}ms`);
    });
  });

  test.describe('Core Web Vitals', () => {
    test('LCP (Largest Contentful Paint)가 허용 범위 내여야 함', async ({ page }) => {
      await page.goto('/');
      
      // LCP 측정
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });
      
      // LCP가 2.5초 이내여야 함
      expect(lcp).toBeLessThan(2500);
      
      console.log(`LCP: ${lcp}ms`);
    });

    test('FID (First Input Delay)가 허용 범위 내여야 함', async ({ page }) => {
      await page.goto('/');
      
      // 첫 번째 상호작용 시뮬레이션
      const startTime = Date.now();
      await page.click('text=로그인');
      const endTime = Date.now();
      
      const fid = endTime - startTime;
      
      // FID가 100ms 이내여야 함
      expect(fid).toBeLessThan(100);
      
      console.log(`FID: ${fid}ms`);
    });

    test('CLS (Cumulative Layout Shift)가 허용 범위 내여야 함', async ({ page }) => {
      await page.goto('/');
      
      // CLS 측정
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
        });
      });
      
      // CLS가 0.1 이내여야 함
      expect(cls).toBeLessThan(0.1);
      
      console.log(`CLS: ${cls}`);
    });
  });

  test.describe('메모리 사용량', () => {
    test('페이지 로드 후 메모리 사용량이 허용 범위 내여야 함', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 메모리 사용량 측정
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });
      
      if (memoryInfo) {
        // 사용된 메모리가 50MB 이내여야 함
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
        
        console.log(`메모리 사용량: ${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`);
      }
    });

    test('페이지 간 이동 시 메모리 누수가 없어야 함', async ({ page }) => {
      // 초기 메모리 측정
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // 여러 페이지 간 이동
      await page.goto('/');
      await page.goto('/login');
      await page.goto('/');
      await page.goto('/signup');
      await page.goto('/');
      
      // 최종 메모리 측정
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // 메모리 증가량이 10MB 이내여야 함
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      
      console.log(`메모리 증가량: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    });
  });

  test.describe('네트워크 성능', () => {
    test('API 응답 시간이 허용 범위 내여야 함', async ({ page }) => {
      // 네트워크 요청 모니터링 시작
      const requests: any[] = [];
      page.on('request', (request) => {
        requests.push({
          url: request.url(),
          method: request.method(),
          startTime: Date.now()
        });
      });
      
      page.on('response', (response) => {
        const request = requests.find(r => r.url === response.url());
        if (request) {
          request.endTime = Date.now();
          request.duration = request.endTime - request.startTime;
        }
      });
      
      // API 요청이 있는 페이지 로드
      await page.goto('/dashboard');
      
      // API 요청들의 응답 시간 확인
      const apiRequests = requests.filter(r => r.url.includes('/api/'));
      for (const request of apiRequests) {
        expect(request.duration).toBeLessThan(2000);
        console.log(`API ${request.method} ${request.url}: ${request.duration}ms`);
      }
    });

    test('이미지 로드 시간이 허용 범위 내여야 함', async ({ page }) => {
      const imageLoadTimes: number[] = [];
      
      page.on('response', async (response) => {
        if (response.url().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          const startTime = Date.now();
          await response.finished();
          const loadTime = Date.now() - startTime;
          imageLoadTimes.push(loadTime);
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 이미지 로드 시간이 1초 이내여야 함
      for (const loadTime of imageLoadTimes) {
        expect(loadTime).toBeLessThan(1000);
        console.log(`이미지 로드 시간: ${loadTime}ms`);
      }
    });
  });

  test.describe('렌더링 성능', () => {
    test('컴포넌트 렌더링 시간이 허용 범위 내여야 함', async ({ page }) => {
      await page.goto('/');
      
      // 렌더링 시간 측정
      const renderTime = await page.evaluate(() => {
        const startTime = performance.now();
        
        // DOM 조작 시뮬레이션
        const element = document.createElement('div');
        element.innerHTML = 'Test content';
        document.body.appendChild(element);
        
        const endTime = performance.now();
        return endTime - startTime;
      });
      
      // 렌더링 시간이 16ms 이내여야 함 (60fps)
      expect(renderTime).toBeLessThan(16);
      
      console.log(`렌더링 시간: ${renderTime}ms`);
    });

    test('스크롤 성능이 부드러워야 함', async ({ page }) => {
      await page.goto('/');
      
      // 스크롤 성능 측정
      const scrollPerformance = await page.evaluate(() => {
        const startTime = performance.now();
        
        // 스크롤 시뮬레이션
        window.scrollTo(0, 1000);
        window.scrollTo(0, 0);
        
        const endTime = performance.now();
        return endTime - startTime;
      });
      
      // 스크롤이 100ms 이내에 완료되어야 함
      expect(scrollPerformance).toBeLessThan(100);
      
      console.log(`스크롤 성능: ${scrollPerformance}ms`);
    });
  });

  test.describe('모바일 성능', () => {
    test('모바일 환경에서 성능이 허용 범위 내여야 함', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // 모바일에서도 로드 시간이 4초 이내여야 함
      expect(loadTime).toBeLessThan(4000);
      
      console.log(`모바일 로드 시간: ${loadTime}ms`);
    });

    test('터치 이벤트 응답 시간이 허용 범위 내여야 함', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // 터치 이벤트 응답 시간 측정
      const touchResponseTime = await page.evaluate(() => {
        const startTime = performance.now();
        
        // 터치 이벤트 시뮬레이션
        const touchEvent = new TouchEvent('touchstart', {
          touches: [new Touch({
            identifier: 1,
            target: document.body,
            clientX: 100,
            clientY: 100
          })]
        });
        document.body.dispatchEvent(touchEvent);
        
        const endTime = performance.now();
        return endTime - startTime;
      });
      
      // 터치 응답 시간이 50ms 이내여야 함
      expect(touchResponseTime).toBeLessThan(50);
      
      console.log(`터치 응답 시간: ${touchResponseTime}ms`);
    });
  });
});

