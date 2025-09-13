import { test, expect } from '@playwright/test';

/**
 * 인증 E2E 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 로그인 프로세스
 * - 회원가입 프로세스
 * - 로그아웃 프로세스
 * - 인증 상태 관리
 * - 권한 기반 접근 제어
 */

test.describe('인증 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('/');
  });

  test.describe('로그인', () => {
    test('유효한 자격 증명으로 로그인할 수 있어야 함', async ({ page }) => {
      // 로그인 페이지로 이동
      await page.click('text=로그인');
      await expect(page).toHaveURL(/.*login/);
      
      // 로그인 폼 작성
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      // 로그인 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 로그인 성공 후 리다이렉션 확인
      await expect(page).toHaveURL('/dashboard');
      
      // 사용자 정보가 표시되는지 확인
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible();
      
      // 로그아웃 버튼이 표시되는지 확인
      await expect(page.locator('text=로그아웃')).toBeVisible();
    });

    test('잘못된 자격 증명으로 로그인 시 에러 메시지가 표시되어야 함', async ({ page }) => {
      // 로그인 페이지로 이동
      await page.click('text=로그인');
      
      // 잘못된 자격 증명 입력
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // 로그인 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('로그인에 실패했습니다');
      
      // 로그인 페이지에 머물러 있는지 확인
      await expect(page).toHaveURL(/.*login/);
    });

    test('빈 필드로 로그인 시 유효성 검사 에러가 표시되어야 함', async ({ page }) => {
      // 로그인 페이지로 이동
      await page.click('text=로그인');
      
      // 빈 필드로 로그인 시도
      await page.click('button[type="submit"]');
      
      // 유효성 검사 에러 확인
      await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible();
      await expect(page.locator('text=비밀번호를 입력해주세요')).toBeVisible();
    });
  });

  test.describe('회원가입', () => {
    test('새 사용자로 회원가입할 수 있어야 함', async ({ page }) => {
      // 회원가입 페이지로 이동
      await page.click('text=회원가입');
      await expect(page).toHaveURL(/.*signup/);
      
      // 회원가입 폼 작성
      await page.fill('input[name="name"]', '새 사용자');
      await page.fill('input[name="email"]', 'newuser@example.com');
      await page.fill('input[name="password"]', 'newpassword123');
      await page.fill('input[name="confirmPassword"]', 'newpassword123');
      await page.selectOption('select[name="userType"]', 'student');
      
      // 회원가입 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 회원가입 성공 후 리다이렉션 확인
      await expect(page).toHaveURL('/login');
      
      // 성공 메시지 확인
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('회원가입이 완료되었습니다');
    });

    test('비밀번호 불일치 시 에러가 표시되어야 함', async ({ page }) => {
      // 회원가입 페이지로 이동
      await page.click('text=회원가입');
      
      // 비밀번호 불일치로 회원가입 시도
      await page.fill('input[name="name"]', '새 사용자');
      await page.fill('input[name="email"]', 'newuser@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'differentpassword');
      
      // 회원가입 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('text=비밀번호가 일치하지 않습니다')).toBeVisible();
    });

    test('중복 이메일로 회원가입 시 에러가 표시되어야 함', async ({ page }) => {
      // 회원가입 페이지로 이동
      await page.click('text=회원가입');
      
      // 중복 이메일로 회원가입 시도
      await page.fill('input[name="name"]', '중복 사용자');
      await page.fill('input[name="email"]', 'test@example.com'); // 이미 존재하는 이메일
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'password123');
      
      // 회원가입 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('이미 사용 중인 이메일입니다');
    });
  });

  test.describe('로그아웃', () => {
    test('로그인된 사용자가 로그아웃할 수 있어야 함', async ({ page }) => {
      // 먼저 로그인
      await page.click('text=로그인');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 대시보드로 이동했는지 확인
      await expect(page).toHaveURL('/dashboard');
      
      // 로그아웃 버튼 클릭
      await page.click('text=로그아웃');
      
      // 홈페이지로 리다이렉션 확인
      await expect(page).toHaveURL('/');
      
      // 로그인 버튼이 다시 표시되는지 확인
      await expect(page.locator('text=로그인')).toBeVisible();
      
      // 사용자 정보가 사라졌는지 확인
      await expect(page.locator('[data-testid="user-info"]')).not.toBeVisible();
    });
  });

  test.describe('권한 기반 접근 제어', () => {
    test('인증되지 않은 사용자는 보호된 페이지에 접근할 수 없어야 함', async ({ page }) => {
      // 보호된 페이지로 직접 이동 시도
      await page.goto('/dashboard');
      
      // 로그인 페이지로 리다이렉션 확인
      await expect(page).toHaveURL(/.*login/);
      
      // 접근 거부 메시지 확인
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    });

    test('학생 사용자는 관리자 페이지에 접근할 수 없어야 함', async ({ page }) => {
      // 학생으로 로그인
      await page.click('text=로그인');
      await page.fill('input[type="email"]', 'student@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 관리자 페이지로 이동 시도
      await page.goto('/admin');
      
      // 접근 거부 또는 권한 없음 메시지 확인
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    });

    test('관리자는 모든 페이지에 접근할 수 있어야 함', async ({ page }) => {
      // 관리자로 로그인
      await page.click('text=로그인');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 관리자 페이지로 이동
      await page.goto('/admin');
      
      // 관리자 페이지가 로드되는지 확인
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
      
      // 관리자 메뉴 항목들이 표시되는지 확인
      const adminMenuItems = ['사용자 관리', '센터 관리', '통계'];
      for (const item of adminMenuItems) {
        await expect(page.locator(`text=${item}`)).toBeVisible();
      }
    });
  });

  test.describe('세션 관리', () => {
    test('페이지 새로고침 후에도 로그인 상태가 유지되어야 함', async ({ page }) => {
      // 로그인
      await page.click('text=로그인');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 페이지 새로고침
      await page.reload();
      
      // 로그인 상태가 유지되는지 확인
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible();
      await expect(page.locator('text=로그아웃')).toBeVisible();
    });

    test('토큰 만료 시 자동으로 로그아웃되어야 함', async ({ page }) => {
      // 로그인
      await page.click('text=로그인');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 토큰 만료 시뮬레이션 (localStorage에서 토큰 제거)
      await page.evaluate(() => {
        localStorage.removeItem('token');
      });
      
      // 페이지 새로고침
      await page.reload();
      
      // 로그인 페이지로 리다이렉션 확인
      await expect(page).toHaveURL(/.*login/);
    });
  });
});



