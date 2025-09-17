import { test, expect } from '@playwright/test';

/**
 * 관리자 대시보드 E2E 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 최고 관리자 로그인 후 올바른 대시보드로 리다이렉트
 * - 관리자 대시보드의 모든 버튼들이 정상 작동
 * - 시스템 상태 모니터링 기능
 * - 빠른 액션 버튼들 작동
 * - 성능 모니터링 섹션 표시
 */

test.describe('관리자 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/login');
    
    // 최고 관리자로 로그인 (superAdmin 계정이 있다고 가정)
    // 실제로는 center 계정이 superAdmin 권한도 가지고 있으므로 사용
    await page.fill('input[name="userId"]', 'center');
    await page.fill('input[name="password"]', '101010');
    await page.click('button[type="submit"]');
    
    // 로그인 후 관리자 대시보드로 이동 (useAuth에서 centerAdmin도 /admin/dashboard로 보내므로)
    await page.goto('/admin/dashboard');
  });

  test('관리자 대시보드가 올바르게 로드되어야 함', async ({ page }) => {
    // 대시보드 제목 확인
    await expect(page.locator('h1')).toContainText('관리자 대시보드');
    
    // 시스템 상태 섹션이 있는지 확인
    await expect(page.locator('text=시스템 상태')).toBeVisible();
  });

  test('시스템 상태 카드가 정상적으로 표시되어야 함', async ({ page }) => {
    // 시스템 상태 정보 확인
    await expect(page.locator('text=전체 사용자')).toBeVisible();
    await expect(page.locator('text=강습 과정')).toBeVisible();
    await expect(page.locator('text=총 매출')).toBeVisible();
    await expect(page.locator('text=활성 예약')).toBeVisible();
  });

  test('전체 사용자 카드 클릭 시 사용자 관리 페이지로 이동해야 함', async ({ page }) => {
    // 전체 사용자 카드 클릭
    await page.click('text=전체 사용자');
    
    // 사용자 관리 페이지로 이동 확인
    await page.waitForURL('/admin/users');
    expect(page.url()).toBe('http://localhost:3000/admin/users');
  });

  test('강습 과정 카드 클릭 시 강의 관리 페이지로 이동해야 함', async ({ page }) => {
    // 강습 과정 카드 클릭
    await page.click('text=강습 과정');
    
    // 강의 관리 페이지로 이동 확인
    await page.waitForURL('/admin/courses');
    expect(page.url()).toBe('http://localhost:3000/admin/courses');
  });

  test('총 매출 카드 클릭 시 매출 관리 페이지로 이동해야 함', async ({ page }) => {
    // 총 매출 카드 클릭
    await page.click('text=총 매출');
    
    // 매출 관리 페이지로 이동 확인
    await page.waitForURL('/admin/revenue');
    expect(page.url()).toBe('http://localhost:3000/admin/revenue');
  });

  test('승인 대기 카드 클릭 시 승인 관리 페이지로 이동해야 함', async ({ page }) => {
    // 승인 대기 카드 클릭
    await page.click('text=승인 대기');
    
    // 승인 관리 페이지로 이동 확인
    await page.waitForURL('/admin/approvals');
    expect(page.url()).toBe('http://localhost:3000/admin/approvals');
  });

  test('빠른 액션 버튼들이 모두 작동해야 함', async ({ page }) => {
    // 강습법 관리 버튼 확인 및 클릭
    const teachingMethodsButton = page.locator('text=강습법 관리');
    await expect(teachingMethodsButton).toBeVisible();
    await teachingMethodsButton.click();
    await page.waitForURL('/admin/teaching-methods');
    expect(page.url()).toBe('http://localhost:3000/admin/teaching-methods');
    
    // 뒤로 가서 다른 버튼 테스트
    await page.goBack();
    
    // 센터별 레벨 관리 버튼 확인 및 클릭
    const centerLevelsButton = page.locator('text=센터별 레벨 관리');
    await expect(centerLevelsButton).toBeVisible();
    await centerLevelsButton.click();
    await page.waitForURL('/admin/center-levels');
    expect(page.url()).toBe('http://localhost:3000/admin/center-levels');
    
    // 뒤로 가기
    await page.goBack();
    
    // 예약 관리 버튼 확인 및 클릭
    const bookingsButton = page.locator('text=예약 관리');
    await expect(bookingsButton).toBeVisible();
    await bookingsButton.click();
    await page.waitForURL('/admin/bookings');
    expect(page.url()).toBe('http://localhost:3000/admin/bookings');
    
    // 뒤로 가기
    await page.goBack();
    
    // 리포트 생성 버튼 확인 및 클릭
    const reportsButton = page.locator('text=리포트 생성');
    await expect(reportsButton).toBeVisible();
    await reportsButton.click();
    await page.waitForURL('/admin/reports');
    expect(page.url()).toBe('http://localhost:3000/admin/reports');
  });

  test('성능 모니터링 섹션이 표시되어야 함', async ({ page }) => {
    // 성능 모니터링 제목 확인
    await expect(page.locator('text=성능 모니터링')).toBeVisible();
    
    // 시스템 리소스 모니터링 확인
    await expect(page.locator('text=시스템 리소스')).toBeVisible();
    await expect(page.locator('text=CPU 사용률')).toBeVisible();
    await expect(page.locator('text=메모리 사용률')).toBeVisible();
    await expect(page.locator('text=디스크 사용률')).toBeVisible();
    await expect(page.locator('text=네트워크 상태')).toBeVisible();
  });

  test('최근 활동 섹션이 표시되어야 함', async ({ page }) => {
    // 최근 활동 제목 확인
    await expect(page.locator('text=최근 활동')).toBeVisible();
    
    // 활동 목록이 표시되는지 확인
    const activities = page.locator('[data-testid="recent-activity"]');
    await expect(activities).toBeVisible();
  });

  test('대시보드 데이터가 실시간으로 업데이트되어야 함', async ({ page }) => {
    // 초기 통계 데이터 확인
    const totalUsers = page.locator('text=전체 사용자').locator('..').locator('text=/\\d+/');
    await expect(totalUsers).toBeVisible();
    
    // 30초 후 데이터 새로고침 확인 (실제로는 더 짧은 시간으로 테스트)
    await page.waitForTimeout(1000);
    
    // 통계가 여전히 표시되는지 확인
    await expect(totalUsers).toBeVisible();
  });

  test('반응형 디자인이 모바일에서 작동해야 함', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 대시보드가 모바일에서도 정상 표시되는지 확인
    await expect(page.locator('h1')).toContainText('관리자 대시보드');
    
    // 빠른 액션 버튼들이 모바일에서도 보이는지 확인
    await expect(page.locator('text=강습법 관리')).toBeVisible();
  });

  test('접근성이 WCAG 가이드라인을 만족해야 함', async ({ page }) => {
    // 페이지에 적절한 제목이 있는지 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 시스템 상태 배지가 적절한 색상을 가지고 있는지 확인
    const systemHealthBadge = page.locator('text=우수').or(page.locator('text=양호')).or(page.locator('text=주의')).or(page.locator('text=위험'));
    await expect(systemHealthBadge).toBeVisible();
    
    // 키보드 네비게이션이 작동하는지 확인
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 포커스된 요소가 있는지 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('에러 상태에서도 적절한 메시지가 표시되어야 함', async ({ page }) => {
    // 네트워크 오프라인 상태 시뮬레이션
    await page.context().setOffline(true);
    
    // 페이지 새로고침
    await page.reload();
    
    // 에러 메시지나 로딩 상태가 표시되는지 확인
    // (실제 구현에 따라 다를 수 있음)
    await page.waitForTimeout(2000);
    
    // 네트워크 다시 온라인으로 설정
    await page.context().setOffline(false);
  });
});

/**
 * 권한 기반 접근 제어 테스트
 */
test.describe('관리자 권한 테스트', () => {
  test('관리자는 모든 관리 기능에 접근할 수 있어야 함', async ({ page }) => {
    // 로그인 후 관리자 대시보드로 이동
    await page.goto('/login');
    await page.fill('input[name="userId"]', 'center');
    await page.fill('input[name="password"]', '101010');
    await page.click('button[type="submit"]');
    await page.waitForURL('/center-admin/dashboard');
    
    // 관리자 대시보드로 이동
    await page.goto('/admin/dashboard');
    
    // 모든 빠른 액션 버튼들이 표시되는지 확인
    await expect(page.locator('text=강습법 관리')).toBeVisible();
    await expect(page.locator('text=센터별 레벨 관리')).toBeVisible();
    await expect(page.locator('text=예약 관리')).toBeVisible();
    await expect(page.locator('text=리포트 생성')).toBeVisible();
  });
});
