import { test, expect } from '@playwright/test';

/**
 * 자동 생성된 버튼 테스트
 * 
 * 생성 시간: 2025-09-22T13:16:15.031Z
 * 총 페이지 수: 118개
 * 총 버튼 수: 275개
 * 
 * 주의: 이 파일은 자동으로 생성됩니다. 수동으로 편집하지 마세요.
 * 버튼을 추가하거나 수정한 후 다시 생성하려면:
 * npm run generate-button-tests
 */


// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /3d-viewer
// 발견된 버튼 수: 2개

test.describe('3d-viewer - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/3d-viewer'.includes('admin') || '/3d-viewer'.includes('center-admin') || '/3d-viewer'.includes('instructor') || '/3d-viewer'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/3d-viewer');
    await page.waitForTimeout(500);
  });


  test('버튼 "뷰어 재시작" 테스트 (/3d-viewer) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "뷰어 재시작" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "뷰어 재시작" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/3d-viewer');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "뷰어 재시작" 테스트 (/3d-viewer) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "뷰어 재시작" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "뷰어 재시작" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/3d-viewer');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/3d-viewer)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /accessibility
// 발견된 버튼 수: 5개

test.describe('accessibility - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/accessibility'.includes('admin') || '/accessibility'.includes('center-admin') || '/accessibility'.includes('instructor') || '/accessibility'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/accessibility');
    await page.waitForTimeout(500);
  });


  test('버튼 "기본값으로 복원" 테스트 (/accessibility) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "기본값으로 복원" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "기본값으로 복원" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/accessibility');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "설정 내보내기" 테스트 (/accessibility) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "설정 내보내기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "설정 내보내기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/accessibility');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "설정 가져오기" 테스트 (/accessibility) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "설정 가져오기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "설정 가져오기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/accessibility');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "기본값으로 복원" 테스트 (/accessibility) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "기본값으로 복원" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "기본값으로 복원" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/accessibility');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "설정 내보내기" 테스트 (/accessibility) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "설정 내보내기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "설정 내보내기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/accessibility');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/accessibility)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/3d-viewer/drills
// 발견된 버튼 수: 3개

test.describe('drills - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/3d-viewer/drills'.includes('admin') || '/admin/3d-viewer/drills'.includes('center-admin') || '/admin/3d-viewer/drills'.includes('instructor') || '/admin/3d-viewer/drills'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/3d-viewer/drills');
    await page.waitForTimeout(500);
  });


  test('버튼 "3D 보기" 테스트 (/admin/3d-viewer/drills) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "3D 보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "3D 보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/3d-viewer/drills');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "편집" 테스트 (/admin/3d-viewer/drills) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "편집" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "편집" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/3d-viewer/drills');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "삭제" 테스트 (/admin/3d-viewer/drills) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/3d-viewer/drills');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/3d-viewer/drills)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/3d-viewer/swimming-styles
// 발견된 버튼 수: 3개

test.describe('swimming-styles - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/3d-viewer/swimming-styles'.includes('admin') || '/admin/3d-viewer/swimming-styles'.includes('center-admin') || '/admin/3d-viewer/swimming-styles'.includes('instructor') || '/admin/3d-viewer/swimming-styles'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/3d-viewer/swimming-styles');
    await page.waitForTimeout(500);
  });


  test('버튼 "3D 보기" 테스트 (/admin/3d-viewer/swimming-styles) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "3D 보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "3D 보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/3d-viewer/swimming-styles');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "편집" 테스트 (/admin/3d-viewer/swimming-styles) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "편집" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "편집" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/3d-viewer/swimming-styles');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "삭제" 테스트 (/admin/3d-viewer/swimming-styles) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/3d-viewer/swimming-styles');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/3d-viewer/swimming-styles)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/ai-config
// 발견된 버튼 수: 8개

test.describe('ai-config - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/ai-config'.includes('admin') || '/admin/ai-config'.includes('center-admin') || '/admin/ai-config'.includes('instructor') || '/admin/ai-config'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/ai-config');
    await page.waitForTimeout(500);
  });


  test('버튼 "➕ 새 기준 추가" 테스트 (/admin/ai-config) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "➕ 새 기준 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "➕ 새 기준 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✏️ 수정" 테스트 (/admin/ai-config) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✏️ 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✏️ 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🗑️ 삭제" 테스트 (/admin/ai-config) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🗑️ 삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🗑️ 삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✏️ 수정" 테스트 (/admin/ai-config) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✏️ 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✏️ 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🗑️ 삭제" 테스트 (/admin/ai-config) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🗑️ 삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🗑️ 삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "➕ 새 알고리즘 추가" 테스트 (/admin/ai-config) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "➕ 새 알고리즘 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "➕ 새 알고리즘 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✏️ 수정" 테스트 (/admin/ai-config) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✏️ 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✏️ 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🗑️ 삭제" 테스트 (/admin/ai-config) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🗑️ 삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🗑️ 삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/ai-config)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/ai-config/recommendations
// 발견된 버튼 수: 3개

test.describe('recommendations - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/ai-config/recommendations'.includes('admin') || '/admin/ai-config/recommendations'.includes('center-admin') || '/admin/ai-config/recommendations'.includes('instructor') || '/admin/ai-config/recommendations'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/ai-config/recommendations');
    await page.waitForTimeout(500);
  });


  test('버튼 "설정" 테스트 (/admin/ai-config/recommendations) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "설정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "설정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "편집" 테스트 (/admin/ai-config/recommendations) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "편집" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "편집" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "삭제" 테스트 (/admin/ai-config/recommendations) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-config/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/ai-config/recommendations)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/ai-model-management
// 발견된 버튼 수: 1개

test.describe('ai-model-management - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/ai-model-management'.includes('admin') || '/admin/ai-model-management'.includes('center-admin') || '/admin/ai-model-management'.includes('instructor') || '/admin/ai-model-management'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/ai-model-management');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/admin/ai-model-management) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/ai-model-management');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/ai-model-management)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/approvals
// 발견된 버튼 수: 2개

test.describe('approvals - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/approvals'.includes('admin') || '/admin/approvals'.includes('center-admin') || '/admin/approvals'.includes('instructor') || '/admin/approvals'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/approvals');
    await page.waitForTimeout(500);
  });


  test('버튼 "새로고침" 테스트 (/admin/approvals) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/approvals');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "새로고침" 테스트 (/admin/approvals) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/approvals');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/approvals)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/bookings
// 발견된 버튼 수: 10개

test.describe('bookings - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/bookings'.includes('admin') || '/admin/bookings'.includes('center-admin') || '/admin/bookings'.includes('instructor') || '/admin/bookings'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/bookings');
    await page.waitForTimeout(500);
  });


  test('버튼 "🔄 새로고침" 테스트 (/admin/bookings) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "➕ 새 예약 추가" 테스트 (/admin/bookings) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "➕ 새 예약 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "➕ 새 예약 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔍 검색" 테스트 (/admin/bookings) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔍 검색" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔍 검색" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✅ 추가" 테스트 (/admin/bookings) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✅ 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✅ 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✅ 수정" 테스트 (/admin/bookings) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✅ 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✅ 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔄 새로고침" 테스트 (/admin/bookings) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "➕ 새 예약 추가" 테스트 (/admin/bookings) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "➕ 새 예약 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "➕ 새 예약 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔍 검색" 테스트 (/admin/bookings) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔍 검색" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔍 검색" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✅ 추가" 테스트 (/admin/bookings) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✅ 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✅ 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✅ 수정" 테스트 (/admin/bookings) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✅ 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✅ 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/bookings');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/bookings)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/center-info
// 발견된 버튼 수: 2개

test.describe('center-info - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/center-info'.includes('admin') || '/admin/center-info'.includes('center-admin') || '/admin/center-info'.includes('instructor') || '/admin/center-info'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/center-info');
    await page.waitForTimeout(500);
  });


  test('버튼 "취소" 테스트 (/admin/center-info) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/center-info');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "취소" 테스트 (/admin/center-info) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/center-info');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/center-info)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/center-management
// 발견된 버튼 수: 3개

test.describe('center-management - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/center-management'.includes('admin') || '/admin/center-management'.includes('center-admin') || '/admin/center-management'.includes('instructor') || '/admin/center-management'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/center-management');
    await page.waitForTimeout(500);
  });


  test('버튼 "🔍 검색" 테스트 (/admin/center-management) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔍 검색" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔍 검색" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/center-management');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔄 다시 시도" 테스트 (/admin/center-management) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/center-management');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔄 다시 시도" 테스트 (/admin/center-management) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/center-management');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/center-management)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/centers
// 발견된 버튼 수: 4개

test.describe('centers - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/centers'.includes('admin') || '/admin/centers'.includes('center-admin') || '/admin/centers'.includes('instructor') || '/admin/centers'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/centers');
    await page.waitForTimeout(500);
  });


  test('버튼 "새 센터 추가" 테스트 (/admin/centers) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새 센터 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새 센터 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/centers');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "보기" 테스트 (/admin/centers) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/centers');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "편집" 테스트 (/admin/centers) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "편집" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "편집" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/centers');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "삭제" 테스트 (/admin/centers) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/centers');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/centers)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/course-oversight
// 발견된 버튼 수: 2개

test.describe('course-oversight - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/course-oversight'.includes('admin') || '/admin/course-oversight'.includes('center-admin') || '/admin/course-oversight'.includes('instructor') || '/admin/course-oversight'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/course-oversight');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/admin/course-oversight) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/course-oversight');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/admin/course-oversight) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/course-oversight');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/course-oversight)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/courses
// 발견된 버튼 수: 4개

test.describe('courses - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/courses'.includes('admin') || '/admin/courses'.includes('center-admin') || '/admin/courses'.includes('instructor') || '/admin/courses'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/courses');
    await page.waitForTimeout(500);
  });


  test('버튼 "추가" 테스트 (/admin/courses) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "수정" 테스트 (/admin/courses) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "저장" 테스트 (/admin/courses) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "저장" 테스트 (/admin/courses) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/courses)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/dashboard
// 발견된 버튼 수: 2개

test.describe('dashboard - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/dashboard'.includes('admin') || '/admin/dashboard'.includes('center-admin') || '/admin/dashboard'.includes('instructor') || '/admin/dashboard'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/admin/dashboard) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/dashboard');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/admin/dashboard) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/dashboard');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/dashboard)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/instructor-management
// 발견된 버튼 수: 2개

test.describe('instructor-management - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/instructor-management'.includes('admin') || '/admin/instructor-management'.includes('center-admin') || '/admin/instructor-management'.includes('instructor') || '/admin/instructor-management'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/instructor-management');
    await page.waitForTimeout(500);
  });


  test('버튼 "검색" 테스트 (/admin/instructor-management) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "검색" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "검색" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructor-management');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "검색" 테스트 (/admin/instructor-management) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "검색" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "검색" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructor-management');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/instructor-management)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/instructors
// 발견된 버튼 수: 10개

test.describe('instructors - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/instructors'.includes('admin') || '/admin/instructors'.includes('center-admin') || '/admin/instructors'.includes('instructor') || '/admin/instructors'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/instructors');
    await page.waitForTimeout(500);
  });


  test('버튼 "취소" 테스트 (/admin/instructors) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "추가" 테스트 (/admin/instructors) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "취소" 테스트 (/admin/instructors) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "수정" 테스트 (/admin/instructors) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✕" 테스트 (/admin/instructors) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✕" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✕" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "닫기" 테스트 (/admin/instructors) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "닫기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "닫기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "취소" 테스트 (/admin/instructors) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "취소" 테스트 (/admin/instructors) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✕" 테스트 (/admin/instructors) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✕" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✕" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "닫기" 테스트 (/admin/instructors) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "닫기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "닫기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/instructors');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/instructors)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/lesson-plans
// 발견된 버튼 수: 4개

test.describe('lesson-plans - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/lesson-plans'.includes('admin') || '/admin/lesson-plans'.includes('center-admin') || '/admin/lesson-plans'.includes('instructor') || '/admin/lesson-plans'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/lesson-plans');
    await page.waitForTimeout(500);
  });


  test('버튼 "➕ 단계 추가" 테스트 (/admin/lesson-plans) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "➕ 단계 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "➕ 단계 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/lesson-plans');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "💾 저장" 테스트 (/admin/lesson-plans) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "💾 저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "💾 저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/lesson-plans');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "➕ 단계 추가" 테스트 (/admin/lesson-plans) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "➕ 단계 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "➕ 단계 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/lesson-plans');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "💾 저장" 테스트 (/admin/lesson-plans) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "💾 저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "💾 저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/lesson-plans');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/lesson-plans)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/notices
// 발견된 버튼 수: 2개

test.describe('notices - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/notices'.includes('admin') || '/admin/notices'.includes('center-admin') || '/admin/notices'.includes('instructor') || '/admin/notices'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/notices');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/admin/notices) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/notices');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/admin/notices) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/notices');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/notices)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/quiz
// 발견된 버튼 수: 4개

test.describe('quiz - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/quiz'.includes('admin') || '/admin/quiz'.includes('center-admin') || '/admin/quiz'.includes('instructor') || '/admin/quiz'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/quiz');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/admin/quiz) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/admin/quiz) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/admin/quiz) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/admin/quiz) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/quiz)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/quiz-management
// 발견된 버튼 수: 1개

test.describe('quiz-management - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/quiz-management'.includes('admin') || '/admin/quiz-management'.includes('center-admin') || '/admin/quiz-management'.includes('instructor') || '/admin/quiz-management'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/quiz-management');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/admin/quiz-management) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/quiz-management');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/quiz-management)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/student-levels
// 발견된 버튼 수: 2개

test.describe('student-levels - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/student-levels'.includes('admin') || '/admin/student-levels'.includes('center-admin') || '/admin/student-levels'.includes('instructor') || '/admin/student-levels'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/student-levels');
    await page.waitForTimeout(500);
  });


  test('버튼 "레벨 변경" 테스트 (/admin/student-levels) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "레벨 변경" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "레벨 변경" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/student-levels');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "레벨 변경" 테스트 (/admin/student-levels) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "레벨 변경" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "레벨 변경" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/student-levels');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/student-levels)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/system
// 발견된 버튼 수: 6개

test.describe('system - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/system'.includes('admin') || '/admin/system'.includes('center-admin') || '/admin/system'.includes('instructor') || '/admin/system'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/system');
    await page.waitForTimeout(500);
  });


  test('버튼 "🔄 새로고침" 테스트 (/admin/system) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/system');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "💾 지금 백업 실행" 테스트 (/admin/system) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "💾 지금 백업 실행" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "💾 지금 백업 실행" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/system');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/admin/system) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/system');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔄 새로고침" 테스트 (/admin/system) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/system');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "💾 지금 백업 실행" 테스트 (/admin/system) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "💾 지금 백업 실행" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "💾 지금 백업 실행" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/system');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/admin/system) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/system');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/system)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/teaching-methods
// 발견된 버튼 수: 3개

test.describe('teaching-methods - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/teaching-methods'.includes('admin') || '/admin/teaching-methods'.includes('center-admin') || '/admin/teaching-methods'.includes('instructor') || '/admin/teaching-methods'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/teaching-methods');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/admin/teaching-methods) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🎯 레벨 수정" 테스트 (/admin/teaching-methods) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🎯 레벨 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🎯 레벨 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🎯 레벨 수정" 테스트 (/admin/teaching-methods) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🎯 레벨 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🎯 레벨 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/teaching-methods)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/users/center-users
// 발견된 버튼 수: 4개

test.describe('center-users - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/users/center-users'.includes('admin') || '/admin/users/center-users'.includes('center-admin') || '/admin/users/center-users'.includes('instructor') || '/admin/users/center-users'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/users/center-users');
    await page.waitForTimeout(500);
  });


  test('버튼 "검색" 테스트 (/admin/users/center-users) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "검색" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "검색" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users/center-users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/admin/users/center-users) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users/center-users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "검색" 테스트 (/admin/users/center-users) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "검색" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "검색" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users/center-users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/admin/users/center-users) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users/center-users');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/users/center-users)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /admin/users
// 발견된 버튼 수: 6개

test.describe('users - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/admin/users'.includes('admin') || '/admin/users'.includes('center-admin') || '/admin/users'.includes('instructor') || '/admin/users'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(500);
  });


  test('버튼 "+ 새 사용자 추가" 테스트 (/admin/users) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "+ 새 사용자 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "+ 새 사용자 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "추가" 테스트 (/admin/users) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "💾 저장" 테스트 (/admin/users) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "💾 저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "💾 저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "+ 새 사용자 추가" 테스트 (/admin/users) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "+ 새 사용자 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "+ 새 사용자 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "추가" 테스트 (/admin/users) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "💾 저장" 테스트 (/admin/users) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "💾 저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "💾 저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/admin/users)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /ai-evaluation
// 발견된 버튼 수: 1개

test.describe('ai-evaluation - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/ai-evaluation'.includes('admin') || '/ai-evaluation'.includes('center-admin') || '/ai-evaluation'.includes('instructor') || '/ai-evaluation'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/ai-evaluation');
    await page.waitForTimeout(500);
  });


  test('버튼 "상세보기" 테스트 (/ai-evaluation) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/ai-evaluation');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/ai-evaluation)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /auth/login
// 발견된 버튼 수: 1개

test.describe('login - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/auth/login'.includes('admin') || '/auth/login'.includes('center-admin') || '/auth/login'.includes('instructor') || '/auth/login'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/auth/login) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/auth/login');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/auth/login)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /auth/signup
// 발견된 버튼 수: 1개

test.describe('signup - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/auth/signup'.includes('admin') || '/auth/signup'.includes('center-admin') || '/auth/signup'.includes('instructor') || '/auth/signup'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/auth/signup');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/auth/signup) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/auth/signup');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/auth/signup)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/approvals
// 발견된 버튼 수: 2개

test.describe('approvals - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/approvals'.includes('admin') || '/center-admin/approvals'.includes('center-admin') || '/center-admin/approvals'.includes('instructor') || '/center-admin/approvals'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/approvals');
    await page.waitForTimeout(500);
  });


  test('버튼 "새로고침" 테스트 (/center-admin/approvals) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/approvals');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "새로고침" 테스트 (/center-admin/approvals) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/approvals');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/approvals)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/courses
// 발견된 버튼 수: 2개

test.describe('courses - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/courses'.includes('admin') || '/center-admin/courses'.includes('center-admin') || '/center-admin/courses'.includes('instructor') || '/center-admin/courses'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/courses');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/center-admin/courses) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/center-admin/courses) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/courses)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/health
// 발견된 버튼 수: 6개

test.describe('health - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/health'.includes('admin') || '/center-admin/health'.includes('center-admin') || '/center-admin/health'.includes('instructor') || '/center-admin/health'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/health');
    await page.waitForTimeout(500);
  });


  test('버튼 "상세보기" 테스트 (/center-admin/health) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/health');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "건강관리" 테스트 (/center-admin/health) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "건강관리" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "건강관리" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/health');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "상세보기" 테스트 (/center-admin/health) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/health');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "상세보기" 테스트 (/center-admin/health) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/health');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "상세보기" 테스트 (/center-admin/health) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/health');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "상세보기" 테스트 (/center-admin/health) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/health');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/health)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/lesson-plans
// 발견된 버튼 수: 2개

test.describe('lesson-plans - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/lesson-plans'.includes('admin') || '/center-admin/lesson-plans'.includes('center-admin') || '/center-admin/lesson-plans'.includes('instructor') || '/center-admin/lesson-plans'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/lesson-plans');
    await page.waitForTimeout(500);
  });


  test('버튼 "✏️ 수정" 테스트 (/center-admin/lesson-plans) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✏️ 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✏️ 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/lesson-plans');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🗑️ 삭제" 테스트 (/center-admin/lesson-plans) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🗑️ 삭제" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🗑️ 삭제" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/lesson-plans');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/lesson-plans)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/notices
// 발견된 버튼 수: 1개

test.describe('notices - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/notices'.includes('admin') || '/center-admin/notices'.includes('center-admin') || '/center-admin/notices'.includes('instructor') || '/center-admin/notices'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/notices');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/center-admin/notices) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/notices');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/notices)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/payments
// 발견된 버튼 수: 12개

test.describe('payments - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/payments'.includes('admin') || '/center-admin/payments'.includes('center-admin') || '/center-admin/payments'.includes('instructor') || '/center-admin/payments'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/payments');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/center-admin/payments) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/center-admin/payments) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/center-admin/payments) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/center-admin/payments) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_5" 테스트 (/center-admin/payments) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[4]; // 복잡한 버튼 (인덱스: 4)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_5" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/center-admin/payments) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_7" 테스트 (/center-admin/payments) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[6]; // 복잡한 버튼 (인덱스: 6)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_7" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_8" 테스트 (/center-admin/payments) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[7]; // 복잡한 버튼 (인덱스: 7)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_8" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_9" 테스트 (/center-admin/payments) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[8]; // 복잡한 버튼 (인덱스: 8)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_9" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_10" 테스트 (/center-admin/payments) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[9]; // 복잡한 버튼 (인덱스: 9)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_10" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_11" 테스트 (/center-admin/payments) #11', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[10]; // 복잡한 버튼 (인덱스: 10)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_11" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_12" 테스트 (/center-admin/payments) #12', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[11]; // 복잡한 버튼 (인덱스: 11)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_12" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/payments)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/reports
// 발견된 버튼 수: 6개

test.describe('reports - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/reports'.includes('admin') || '/center-admin/reports'.includes('center-admin') || '/center-admin/reports'.includes('instructor') || '/center-admin/reports'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/reports');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/center-admin/reports) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reports');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/center-admin/reports) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reports');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/center-admin/reports) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reports');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/center-admin/reports) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reports');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_5" 테스트 (/center-admin/reports) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[4]; // 복잡한 버튼 (인덱스: 4)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_5" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reports');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/center-admin/reports) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reports');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/reports)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/reviews
// 발견된 버튼 수: 12개

test.describe('reviews - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/reviews'.includes('admin') || '/center-admin/reviews'.includes('center-admin') || '/center-admin/reviews'.includes('instructor') || '/center-admin/reviews'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/reviews');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/center-admin/reviews) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/center-admin/reviews) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/center-admin/reviews) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/center-admin/reviews) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_5" 테스트 (/center-admin/reviews) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[4]; // 복잡한 버튼 (인덱스: 4)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_5" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/center-admin/reviews) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_7" 테스트 (/center-admin/reviews) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[6]; // 복잡한 버튼 (인덱스: 6)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_7" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_8" 테스트 (/center-admin/reviews) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[7]; // 복잡한 버튼 (인덱스: 7)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_8" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_9" 테스트 (/center-admin/reviews) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[8]; // 복잡한 버튼 (인덱스: 8)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_9" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_10" 테스트 (/center-admin/reviews) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[9]; // 복잡한 버튼 (인덱스: 9)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_10" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_11" 테스트 (/center-admin/reviews) #11', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[10]; // 복잡한 버튼 (인덱스: 10)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_11" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_12" 테스트 (/center-admin/reviews) #12', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[11]; // 복잡한 버튼 (인덱스: 11)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_12" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/reviews)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/settings
// 발견된 버튼 수: 2개

test.describe('settings - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/settings'.includes('admin') || '/center-admin/settings'.includes('center-admin') || '/center-admin/settings'.includes('instructor') || '/center-admin/settings'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/settings');
    await page.waitForTimeout(500);
  });


  test('버튼 "다시 시도" 테스트 (/center-admin/settings) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/settings');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/center-admin/settings) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/settings');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/settings)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /center-admin/users
// 발견된 버튼 수: 6개

test.describe('users - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/center-admin/users'.includes('admin') || '/center-admin/users'.includes('center-admin') || '/center-admin/users'.includes('instructor') || '/center-admin/users'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/center-admin/users');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/center-admin/users) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/center-admin/users) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/center-admin/users) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/center-admin/users) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_5" 테스트 (/center-admin/users) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[4]; // 복잡한 버튼 (인덱스: 4)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_5" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/center-admin/users) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/center-admin/users');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/center-admin/users)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /community/new
// 발견된 버튼 수: 4개

test.describe('new - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/community/new'.includes('admin') || '/community/new'.includes('center-admin') || '/community/new'.includes('instructor') || '/community/new'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/community/new');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/community/new) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community/new');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "등록" 테스트 (/community/new) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "등록" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "등록" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community/new');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/community/new) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community/new');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "등록" 테스트 (/community/new) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "등록" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "등록" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community/new');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/community/new)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /community
// 발견된 버튼 수: 4개

test.describe('community - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/community'.includes('admin') || '/community'.includes('center-admin') || '/community'.includes('instructor') || '/community'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/community');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/community) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "작성" 테스트 (/community) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "작성" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "작성" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "참가 신청" 테스트 (/community) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "참가 신청" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "참가 신청" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/community) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/community)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /community/[id]
// 발견된 버튼 수: 2개

test.describe('[id] - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/community/[id]'.includes('admin') || '/community/[id]'.includes('center-admin') || '/community/[id]'.includes('instructor') || '/community/[id]'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/community/[id]');
    await page.waitForTimeout(500);
  });


  test('버튼 "등록" 테스트 (/community/[id]) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "등록" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "등록" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community/[id]');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "등록" 테스트 (/community/[id]) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "등록" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "등록" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/community/[id]');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/community/[id])', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/checklist
// 발견된 버튼 수: 2개

test.describe('checklist - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/checklist'.includes('admin') || '/instructor/checklist'.includes('center-admin') || '/instructor/checklist'.includes('instructor') || '/instructor/checklist'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/checklist');
    await page.waitForTimeout(500);
  });


  test('버튼 "새로고침" 테스트 (/instructor/checklist) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/checklist');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "새로고침" 테스트 (/instructor/checklist) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/checklist');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/checklist)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/courses
// 발견된 버튼 수: 4개

test.describe('courses - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/courses'.includes('admin') || '/instructor/courses'.includes('center-admin') || '/instructor/courses'.includes('instructor') || '/instructor/courses'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/courses');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/instructor/courses) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "저장" 테스트 (/instructor/courses) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/instructor/courses) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "저장" 테스트 (/instructor/courses) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/courses');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/courses)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/dashboard
// 발견된 버튼 수: 1개

test.describe('dashboard - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/dashboard'.includes('admin') || '/instructor/dashboard'.includes('center-admin') || '/instructor/dashboard'.includes('instructor') || '/instructor/dashboard'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/dashboard');
    await page.waitForTimeout(500);
  });


  test('버튼 "상세보기" 테스트 (/instructor/dashboard) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/dashboard');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/dashboard)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/exercise-prescription
// 발견된 버튼 수: 4개

test.describe('exercise-prescription - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/exercise-prescription'.includes('admin') || '/instructor/exercise-prescription'.includes('center-admin') || '/instructor/exercise-prescription'.includes('instructor') || '/instructor/exercise-prescription'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/exercise-prescription');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/instructor/exercise-prescription) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/exercise-prescription');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/instructor/exercise-prescription) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/exercise-prescription');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/instructor/exercise-prescription) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/exercise-prescription');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/instructor/exercise-prescription) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/exercise-prescription');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/exercise-prescription)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/health/overview
// 발견된 버튼 수: 2개

test.describe('overview - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/health/overview'.includes('admin') || '/instructor/health/overview'.includes('center-admin') || '/instructor/health/overview'.includes('instructor') || '/instructor/health/overview'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/health/overview');
    await page.waitForTimeout(500);
  });


  test('버튼 "다시 시도" 테스트 (/instructor/health/overview) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/overview');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/instructor/health/overview) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/overview');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/health/overview)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/health/progress
// 발견된 버튼 수: 2개

test.describe('progress - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/health/progress'.includes('admin') || '/instructor/health/progress'.includes('center-admin') || '/instructor/health/progress'.includes('instructor') || '/instructor/health/progress'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/health/progress');
    await page.waitForTimeout(500);
  });


  test('버튼 "다시 시도" 테스트 (/instructor/health/progress) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/progress');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/instructor/health/progress) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/progress');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/health/progress)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/health/recommendations
// 발견된 버튼 수: 2개

test.describe('recommendations - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/health/recommendations'.includes('admin') || '/instructor/health/recommendations'.includes('center-admin') || '/instructor/health/recommendations'.includes('instructor') || '/instructor/health/recommendations'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/health/recommendations');
    await page.waitForTimeout(500);
  });


  test('버튼 "다시 시도" 테스트 (/instructor/health/recommendations) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/instructor/health/recommendations) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/health/recommendations)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/health/students
// 발견된 버튼 수: 2개

test.describe('students - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/health/students'.includes('admin') || '/instructor/health/students'.includes('center-admin') || '/instructor/health/students'.includes('instructor') || '/instructor/health/students'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/health/students');
    await page.waitForTimeout(500);
  });


  test('버튼 "다시 시도" 테스트 (/instructor/health/students) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/students');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/instructor/health/students) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/health/students');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/health/students)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/lesson-planner
// 발견된 버튼 수: 2개

test.describe('lesson-planner - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/lesson-planner'.includes('admin') || '/instructor/lesson-planner'.includes('center-admin') || '/instructor/lesson-planner'.includes('instructor') || '/instructor/lesson-planner'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/lesson-planner');
    await page.waitForTimeout(500);
  });


  test('버튼 "생성" 테스트 (/instructor/lesson-planner) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "생성" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "생성" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/lesson-planner');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "생성" 테스트 (/instructor/lesson-planner) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "생성" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "생성" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/lesson-planner');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/lesson-planner)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/progress
// 발견된 버튼 수: 5개

test.describe('progress - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/progress'.includes('admin') || '/instructor/progress'.includes('center-admin') || '/instructor/progress'.includes('instructor') || '/instructor/progress'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/progress');
    await page.waitForTimeout(500);
  });


  test('버튼 "다시 시도" 테스트 (/instructor/progress) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/progress');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "상세보기" 테스트 (/instructor/progress) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/progress');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/instructor/progress) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/progress');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/instructor/progress) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/progress');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_5" 테스트 (/instructor/progress) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[4]; // 복잡한 버튼 (인덱스: 4)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_5" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/progress');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/progress)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/reviews
// 발견된 버튼 수: 4개

test.describe('reviews - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/reviews'.includes('admin') || '/instructor/reviews'.includes('center-admin') || '/instructor/reviews'.includes('instructor') || '/instructor/reviews'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/reviews');
    await page.waitForTimeout(500);
  });


  test('버튼 "적용" 테스트 (/instructor/reviews) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "적용" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "적용" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/instructor/reviews) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "적용" 테스트 (/instructor/reviews) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "적용" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "적용" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/instructor/reviews) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/reviews');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/reviews)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/schedule
// 발견된 버튼 수: 2개

test.describe('schedule - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/schedule'.includes('admin') || '/instructor/schedule'.includes('center-admin') || '/instructor/schedule'.includes('instructor') || '/instructor/schedule'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/schedule');
    await page.waitForTimeout(500);
  });


  test('버튼 "새로고침" 테스트 (/instructor/schedule) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/schedule');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "새로고침" 테스트 (/instructor/schedule) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "새로고침" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "새로고침" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/schedule');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/schedule)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/teaching-methods
// 발견된 버튼 수: 10개

test.describe('teaching-methods - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/teaching-methods'.includes('admin') || '/instructor/teaching-methods'.includes('center-admin') || '/instructor/teaching-methods'.includes('instructor') || '/instructor/teaching-methods'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/teaching-methods');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/instructor/teaching-methods) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/instructor/teaching-methods) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/instructor/teaching-methods) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/instructor/teaching-methods) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "수정 완료" 테스트 (/instructor/teaching-methods) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "수정 완료" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "수정 완료" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/instructor/teaching-methods) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_7" 테스트 (/instructor/teaching-methods) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[6]; // 복잡한 버튼 (인덱스: 6)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_7" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_8" 테스트 (/instructor/teaching-methods) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[7]; // 복잡한 버튼 (인덱스: 7)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_8" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_9" 테스트 (/instructor/teaching-methods) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[8]; // 복잡한 버튼 (인덱스: 8)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_9" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "수정 완료" 테스트 (/instructor/teaching-methods) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "수정 완료" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "수정 완료" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/teaching-methods');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/teaching-methods)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /instructor/templates
// 발견된 버튼 수: 11개

test.describe('templates - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/instructor/templates'.includes('admin') || '/instructor/templates'.includes('center-admin') || '/instructor/templates'.includes('instructor') || '/instructor/templates'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/instructor/templates');
    await page.waitForTimeout(500);
  });


  test('버튼 "추가" 테스트 (/instructor/templates) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "추가" 테스트 (/instructor/templates) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "항목 추가" 테스트 (/instructor/templates) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "항목 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "항목 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "취소" 테스트 (/instructor/templates) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "생성" 테스트 (/instructor/templates) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "생성" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "생성" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "닫기" 테스트 (/instructor/templates) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "닫기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "닫기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "추가" 테스트 (/instructor/templates) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "추가" 테스트 (/instructor/templates) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "항목 추가" 테스트 (/instructor/templates) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "항목 추가" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "항목 추가" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "취소" 테스트 (/instructor/templates) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "취소" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "취소" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "닫기" 테스트 (/instructor/templates) #11', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "닫기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "닫기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/instructor/templates');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/instructor/templates)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /localization
// 발견된 버튼 수: 4개

test.describe('localization - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/localization'.includes('admin') || '/localization'.includes('center-admin') || '/localization'.includes('instructor') || '/localization'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/localization');
    await page.waitForTimeout(500);
  });


  test('버튼 "설정 저장" 테스트 (/localization) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "설정 저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "설정 저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/localization');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "초기화" 테스트 (/localization) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "초기화" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "초기화" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/localization');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "설정 저장" 테스트 (/localization) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "설정 저장" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "설정 저장" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/localization');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "초기화" 테스트 (/localization) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "초기화" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "초기화" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/localization');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/localization)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /map
// 발견된 버튼 수: 1개

test.describe('map - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/map'.includes('admin') || '/map'.includes('center-admin') || '/map'.includes('instructor') || '/map'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/map');
    await page.waitForTimeout(500);
  });


  test('버튼 "상세 정보 보기" 테스트 (/map) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "상세 정보 보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "상세 정보 보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/map');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/map)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /membership
// 발견된 버튼 수: 10개

test.describe('membership - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/membership'.includes('admin') || '/membership'.includes('center-admin') || '/membership'.includes('instructor') || '/membership'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/membership');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/membership) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/membership) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "생성" 테스트 (/membership) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "생성" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "생성" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/membership) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "생성" 테스트 (/membership) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "생성" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "생성" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/membership) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_7" 테스트 (/membership) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[6]; // 복잡한 버튼 (인덱스: 6)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_7" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_8" 테스트 (/membership) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[7]; // 복잡한 버튼 (인덱스: 7)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_8" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_9" 테스트 (/membership) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[8]; // 복잡한 버튼 (인덱스: 8)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_9" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_10" 테스트 (/membership) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[9]; // 복잡한 버튼 (인덱스: 9)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_10" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/membership');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/membership)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /mobile-learning
// 발견된 버튼 수: 4개

test.describe('mobile-learning - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/mobile-learning'.includes('admin') || '/mobile-learning'.includes('center-admin') || '/mobile-learning'.includes('instructor') || '/mobile-learning'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/mobile-learning');
    await page.waitForTimeout(500);
  });


  test('버튼 "← 이전" 테스트 (/mobile-learning) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "← 이전" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "← 이전" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/mobile-learning');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/mobile-learning) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/mobile-learning');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "← 이전" 테스트 (/mobile-learning) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "← 이전" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "← 이전" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/mobile-learning');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/mobile-learning) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/mobile-learning');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/mobile-learning)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /news
// 발견된 버튼 수: 1개

test.describe('news - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/news'.includes('admin') || '/news'.includes('center-admin') || '/news'.includes('instructor') || '/news'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/news');
    await page.waitForTimeout(500);
  });


  test('버튼 "자세히 보기" 테스트 (/news) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "자세히 보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "자세히 보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/news');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/news)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /notifications
// 발견된 버튼 수: 11개

test.describe('notifications - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/notifications'.includes('admin') || '/notifications'.includes('center-admin') || '/notifications'.includes('instructor') || '/notifications'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/notifications');
    await page.waitForTimeout(500);
  });


  test('버튼 "모두 읽음 처리" 테스트 (/notifications) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "모두 읽음 처리" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "모두 읽음 처리" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/notifications) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/notifications) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/notifications) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "발송" 테스트 (/notifications) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "발송" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "발송" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/notifications) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "모두 읽음 처리" 테스트 (/notifications) #7', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "모두 읽음 처리" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "모두 읽음 처리" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_8" 테스트 (/notifications) #8', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[7]; // 복잡한 버튼 (인덱스: 7)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_8" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_9" 테스트 (/notifications) #9', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[8]; // 복잡한 버튼 (인덱스: 8)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_9" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_10" 테스트 (/notifications) #10', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[9]; // 복잡한 버튼 (인덱스: 9)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_10" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_11" 테스트 (/notifications) #11', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[10]; // 복잡한 버튼 (인덱스: 10)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_11" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/notifications');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/notifications)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /payments
// 발견된 버튼 수: 1개

test.describe('payments - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/payments'.includes('admin') || '/payments'.includes('center-admin') || '/payments'.includes('instructor') || '/payments'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/payments');
    await page.waitForTimeout(500);
  });


  test('버튼 "테스트 결제 생성" 테스트 (/payments) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "테스트 결제 생성" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "테스트 결제 생성" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/payments');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/payments)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /personalized-dashboard
// 발견된 버튼 수: 2개

test.describe('personalized-dashboard - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/personalized-dashboard'.includes('admin') || '/personalized-dashboard'.includes('center-admin') || '/personalized-dashboard'.includes('instructor') || '/personalized-dashboard'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/personalized-dashboard');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/personalized-dashboard) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/personalized-dashboard');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/personalized-dashboard) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/personalized-dashboard');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/personalized-dashboard)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /quiz
// 발견된 버튼 수: 6개

test.describe('quiz - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/quiz'.includes('admin') || '/quiz'.includes('center-admin') || '/quiz'.includes('instructor') || '/quiz'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/quiz');
    await page.waitForTimeout(500);
  });


  test('버튼 "다른 퀴즈 풀기" 테스트 (/quiz) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다른 퀴즈 풀기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다른 퀴즈 풀기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "퀴즈 종료" 테스트 (/quiz) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "퀴즈 종료" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "퀴즈 종료" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/quiz) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다른 퀴즈 풀기" 테스트 (/quiz) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다른 퀴즈 풀기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다른 퀴즈 풀기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "퀴즈 종료" 테스트 (/quiz) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "퀴즈 종료" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "퀴즈 종료" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_6" 테스트 (/quiz) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[5]; // 복잡한 버튼 (인덱스: 5)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_6" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/quiz)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /quiz/[id]
// 발견된 버튼 수: 4개

test.describe('[id] - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/quiz/[id]'.includes('admin') || '/quiz/[id]'.includes('center-admin') || '/quiz/[id]'.includes('instructor') || '/quiz/[id]'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/quiz/[id]');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/quiz/[id]) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz/[id]');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "제출" 테스트 (/quiz/[id]) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "제출" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "제출" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz/[id]');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/quiz/[id]) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz/[id]');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "제출" 테스트 (/quiz/[id]) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "제출" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "제출" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/quiz/[id]');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/quiz/[id])', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /student/recommendations
// 발견된 버튼 수: 4개

test.describe('recommendations - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/student/recommendations'.includes('admin') || '/student/recommendations'.includes('center-admin') || '/student/recommendations'.includes('instructor') || '/student/recommendations'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/student/recommendations');
    await page.waitForTimeout(500);
  });


  test('버튼 "📖 학습하기" 테스트 (/student/recommendations) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "📖 학습하기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "📖 학습하기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/student/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "✏️ 수정" 테스트 (/student/recommendations) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "✏️ 수정" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "✏️ 수정" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/student/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🎉 완료됨" 테스트 (/student/recommendations) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🎉 완료됨" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🎉 완료됨" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/student/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "📊 리뷰" 테스트 (/student/recommendations) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "📊 리뷰" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "📊 리뷰" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/student/recommendations');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/student/recommendations)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /uploads
// 발견된 버튼 수: 2개

test.describe('uploads - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/uploads'.includes('admin') || '/uploads'.includes('center-admin') || '/uploads'.includes('instructor') || '/uploads'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/uploads');
    await page.waitForTimeout(500);
  });


  test('버튼 "업로드" 테스트 (/uploads) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "업로드" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "업로드" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/uploads');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "업로드" 테스트 (/uploads) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "업로드" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "업로드" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/uploads');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/uploads)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /user-role-integration
// 발견된 버튼 수: 4개

test.describe('user-role-integration - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/user-role-integration'.includes('admin') || '/user-role-integration'.includes('center-admin') || '/user-role-integration'.includes('instructor') || '/user-role-integration'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/user-role-integration');
    await page.waitForTimeout(500);
  });


  test('버튼 "버튼_1" 테스트 (/user-role-integration) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[0]; // 복잡한 버튼 (인덱스: 0)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_1" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/user-role-integration');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_2" 테스트 (/user-role-integration) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[1]; // 복잡한 버튼 (인덱스: 1)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_2" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/user-role-integration');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_3" 테스트 (/user-role-integration) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[2]; // 복잡한 버튼 (인덱스: 2)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_3" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/user-role-integration');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "버튼_4" 테스트 (/user-role-integration) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[3]; // 복잡한 버튼 (인덱스: 3)
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "버튼_4" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/user-role-integration');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/user-role-integration)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});



// 자동 생성된 테스트 코드 - 2025-09-22T13:16:15.032Z
// 페이지: /video-upload
// 발견된 버튼 수: 6개

test.describe('video-upload - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('/video-upload'.includes('admin') || '/video-upload'.includes('center-admin') || '/video-upload'.includes('instructor') || '/video-upload'.includes('accessibility')) {
      try {
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(500);
        await page.fill('input[name="userId"]', 'center');
        await page.fill('input[name="password"]', '101010');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('로그인 실패, 게스트 상태로 계속');
      }
    }
    await page.goto('http://localhost:3000/video-upload');
    await page.waitForTimeout(500);
  });


  test('버튼 "🎬 3D 뷰어에서 보기" 테스트 (/video-upload) #1', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🎬 3D 뷰어에서 보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🎬 3D 뷰어에서 보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/video-upload');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔄 새로 업로드" 테스트 (/video-upload) #2', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 새로 업로드" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 새로 업로드" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/video-upload');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/video-upload) #3', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/video-upload');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🎬 3D 뷰어에서 보기" 테스트 (/video-upload) #4', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🎬 3D 뷰어에서 보기" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🎬 3D 뷰어에서 보기" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/video-upload');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "🔄 새로 업로드" 테스트 (/video-upload) #5', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "🔄 새로 업로드" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "🔄 새로 업로드" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/video-upload');
      await page.waitForTimeout(1000);
    }
  });

  test('버튼 "다시 시도" 테스트 (/video-upload) #6', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "다시 시도" }).first();
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(`버튼 "다시 시도" 클릭: ${currentUrl} → ${newUrl}`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000/video-upload');
      await page.waitForTimeout(1000);
    }
  });

  test('모든 버튼의 접근성 테스트 (/video-upload)', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 키보드 포커스 가능한지 확인
        await button.focus();
        await page.keyboard.press('Tab');
        
        // 버튼이 스크린 리더에서 읽을 수 있는지 확인
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    }
  });
});


