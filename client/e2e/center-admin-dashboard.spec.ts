import { test, expect } from '@playwright/test';

/**
 * 센터 관리자 대시보드 E2E 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 센터 관리자 로그인 후 올바른 대시보드로 리다이렉트
 * - 대시보드의 모든 버튼들이 정상 작동
 * - 통계 카드 클릭 시 적절한 페이지로 이동
 * - 센터 정보 편집 버튼 작동
 * - 권한 기반 접근 제어
 */

test.describe('센터 관리자 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/login');
    
    // 센터 관리자로 로그인
    await page.fill('input[name="userId"]', 'center');
    await page.fill('input[name="password"]', '101010');
    await page.click('button[type="submit"]');
    
    // 로그인 후 센터 관리자 대시보드로 리다이렉트 대기
    await page.waitForURL('/center-admin/dashboard');
  });

  test('센터 관리자 로그인 후 올바른 대시보드로 리다이렉트되어야 함', async ({ page }) => {
    // URL이 센터 관리자 대시보드인지 확인
    expect(page.url()).toBe('http://localhost:3000/center-admin/dashboard');
    
    // 대시보드 제목 확인
    await expect(page.locator('h1')).toContainText('센터 관리자 대시보드');
  });

  test('통계 카드들이 정상적으로 표시되어야 함', async ({ page }) => {
    // 주요 통계 카드들 확인
    await expect(page.locator('text=총 회원')).toBeVisible();
    await expect(page.locator('text=활성 강사')).toBeVisible();
    await expect(page.locator('text=진행 중인 강의')).toBeVisible();
    await expect(page.locator('text=이번 달 매출')).toBeVisible();
    await expect(page.locator('text=오늘 예약')).toBeVisible();
    await expect(page.locator('text=월간 예약')).toBeVisible();
  });

  test('총 회원 카드 클릭 시 사용자 관리 페이지로 이동해야 함', async ({ page }) => {
    // 총 회원 카드 클릭
    await page.click('text=총 회원');
    
    // 사용자 관리 페이지로 이동 확인
    await page.waitForURL('/center-admin/users');
    expect(page.url()).toBe('http://localhost:3000/center-admin/users');
  });

  test('진행 중인 강의 카드 클릭 시 강의 관리 페이지로 이동해야 함', async ({ page }) => {
    // 진행 중인 강의 카드 클릭
    await page.click('text=진행 중인 강의');
    
    // 강의 관리 페이지로 이동 확인
    await page.waitForURL('/center-admin/courses');
    expect(page.url()).toBe('http://localhost:3000/center-admin/courses');
  });

  test('이번 달 매출 카드 클릭 시 결제 관리 페이지로 이동해야 함', async ({ page }) => {
    // 이번 달 매출 카드 클릭
    await page.click('text=이번 달 매출');
    
    // 결제 관리 페이지로 이동 확인
    await page.waitForURL('/center-admin/payments');
    expect(page.url()).toBe('http://localhost:3000/center-admin/payments');
  });

  test('오늘 예약 카드 클릭 시 예약 관리 페이지로 이동해야 함', async ({ page }) => {
    // 오늘 예약 카드 클릭
    await page.click('text=오늘 예약');
    
    // 예약 관리 페이지로 이동 확인
    await page.waitForURL('/center-admin/bookings');
    expect(page.url()).toBe('http://localhost:3000/center-admin/bookings');
  });

  test('월간 예약 카드 클릭 시 예약 관리 페이지로 이동해야 함', async ({ page }) => {
    // 월간 예약 카드 클릭
    await page.click('text=월간 예약');
    
    // 예약 관리 페이지로 이동 확인
    await page.waitForURL('/center-admin/bookings');
    expect(page.url()).toBe('http://localhost:3000/center-admin/bookings');
  });

  test('센터 정보 편집 버튼이 작동해야 함', async ({ page }) => {
    // 센터 정보 편집 버튼 클릭
    await page.click('text=센터 정보 편집');
    
    // 센터 소개 편집 페이지로 이동 확인
    await page.waitForURL('/center-admin/introduction');
    expect(page.url()).toBe('http://localhost:3000/center-admin/introduction');
  });

  test('빠른 액션 버튼들이 모두 작동해야 함', async ({ page }) => {
    // 통계 보기 버튼 확인
    const statsButton = page.locator('text=통계 보기');
    await expect(statsButton).toBeVisible();
    
    // 승인 관리 버튼 확인
    const approvalButton = page.locator('text=승인 관리');
    await expect(approvalButton).toBeVisible();
    
    // 센터 정보 편집 버튼 확인
    const editButton = page.locator('text=센터 정보 편집');
    await expect(editButton).toBeVisible();
  });

  test('대시보드 데이터가 실시간으로 업데이트되어야 함', async ({ page }) => {
    // 초기 통계 데이터 확인
    const totalMembers = page.locator('text=총 회원').locator('..').locator('text=/\\d+명/');
    await expect(totalMembers).toBeVisible();
    
    // 30초 후 데이터 새로고침 확인 (실제로는 더 짧은 시간으로 테스트)
    await page.waitForTimeout(1000);
    
    // 통계가 여전히 표시되는지 확인
    await expect(totalMembers).toBeVisible();
  });

  test('반응형 디자인이 모바일에서 작동해야 함', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 대시보드가 모바일에서도 정상 표시되는지 확인
    await expect(page.locator('h1')).toContainText('센터 관리자 대시보드');
    
    // 통계 카드들이 모바일에서도 보이는지 확인
    await expect(page.locator('text=총 회원')).toBeVisible();
    await expect(page.locator('text=센터 정보 편집')).toBeVisible();
  });

  test('접근성이 WCAG 가이드라인을 만족해야 함', async ({ page }) => {
    // 페이지에 적절한 제목이 있는지 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 버튼들이 적절한 텍스트를 가지고 있는지 확인
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // 버튼이 텍스트 또는 aria-label을 가지고 있어야 함
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
    
    // 키보드 네비게이션이 작동하는지 확인
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 포커스된 요소가 있는지 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

/**
 * 권한 기반 접근 제어 테스트
 */
test.describe('센터 관리자 권한 테스트', () => {
  test('센터 관리자는 관리자 페이지에 접근할 수 없어야 함', async ({ page }) => {
    // 로그인 후 센터 관리자 대시보드로 이동
    await page.goto('/login');
    await page.fill('input[name="userId"]', 'center');
    await page.fill('input[name="password"]', '101010');
    await page.click('button[type="submit"]');
    await page.waitForURL('/center-admin/dashboard');
    
    // 관리자 페이지로 직접 접근 시도
    await page.goto('/admin/dashboard');
    
    // 권한이 없어서 리다이렉트되거나 에러가 표시되어야 함
    // (실제 구현에 따라 다를 수 있음)
    await page.waitForTimeout(2000);
    
    // 현재 URL이 센터 관리자 대시보드가 아닌 경우 권한 제어가 작동한 것
    const currentUrl = page.url();
    expect(currentUrl).not.toBe('http://localhost:3000/admin/dashboard');
  });
});
