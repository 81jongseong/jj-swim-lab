import { test, expect } from '@playwright/test';

/**
 * 홈페이지 E2E 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 홈페이지가 올바르게 로드되는지
 * - 주요 네비게이션 요소들이 존재하는지
 * - 반응형 디자인이 작동하는지
 * - 접근성 요구사항을 만족하는지
 */

test.describe('홈페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');
  });

  test('홈페이지가 올바르게 로드되어야 함', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/JJ Swim Lab/);
    
    // 메인 콘텐츠가 로드되었는지 확인
    await expect(page.locator('main')).toBeVisible();
    
    // 로딩 스피너가 사라졌는지 확인
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();
  });

  test('주요 네비게이션 요소들이 존재해야 함', async ({ page }) => {
    // 헤더 네비게이션 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // 로고 확인
    await expect(header.locator('[data-testid="logo"]')).toBeVisible();
    
    // 메인 네비게이션 메뉴 확인
    const nav = header.locator('nav');
    await expect(nav).toBeVisible();
    
    // 주요 메뉴 항목들 확인
    const menuItems = ['홈', '강습', '센터', '예약', '로그인'];
    for (const item of menuItems) {
      await expect(nav.locator(`text=${item}`)).toBeVisible();
    }
  });

  test('로그인 버튼이 작동해야 함', async ({ page }) => {
    // 로그인 버튼 클릭
    await page.click('text=로그인');
    
    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/.*login/);
    
    // 로그인 폼이 표시되는지 확인
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('반응형 디자인이 작동해야 함', async ({ page }) => {
    // 데스크톱 뷰포트에서 테스트
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('header')).toBeVisible();
    
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 모바일 메뉴 버튼이 표시되는지 확인
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // 모바일 메뉴 버튼 클릭
    await mobileMenuButton.click();
    
    // 모바일 메뉴가 열리는지 확인
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('접근성 요구사항을 만족해야 함', async ({ page }) => {
    // 스킵 링크 확인
    await expect(page.locator('a[href="#main-content"]')).toBeVisible();
    
    // 메인 콘텐츠에 적절한 랜드마크가 있는지 확인
    await expect(page.locator('main')).toBeVisible();
    
    // 헤딩 구조 확인
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // 이미지에 alt 속성이 있는지 확인
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('성능 지표가 양호해야 함', async ({ page }) => {
    // 페이지 로드 시간 측정
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 로드 시간이 3초 이내여야 함
    expect(loadTime).toBeLessThan(3000);
    
    // Core Web Vitals 확인
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          entries.forEach((entry) => {
            vitals[entry.name] = (entry as any).value || 0;
          });
          resolve(vitals);
        }).observe({ entryTypes: ['measure', 'navigation'] });
      });
    });
    
    console.log('Performance metrics:', metrics);
  });
});

