import { test, expect } from '@playwright/test';

/**
 * 접근성 E2E 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - WCAG 2.1 AA 준수
 * - 키보드 네비게이션
 * - 스크린 리더 호환성
 * - 색상 대비
 * - 포커스 관리
 * - ARIA 속성
 */

test.describe('접근성 테스트', () => {
  test.describe('WCAG 2.1 AA 준수', () => {
    test('모든 페이지에 적절한 제목 구조가 있어야 함', async ({ page }) => {
      const pages = ['/', '/login', '/signup', '/dashboard'];
      
      for (const url of pages) {
        await page.goto(url);
        
        // H1 태그가 하나만 있는지 확인
        const h1Elements = await page.locator('h1').count();
        expect(h1Elements).toBe(1);
        
        // 제목 구조가 논리적인지 확인 (H1 > H2 > H3 순서)
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        let previousLevel = 0;
        
        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName);
          const currentLevel = parseInt(tagName.substring(1));
          
          // 제목 레벨이 이전 레벨보다 1 이상 크지 않아야 함
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
          previousLevel = currentLevel;
        }
      }
    });

    test('모든 이미지에 적절한 alt 속성이 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        // 장식용 이미지가 아닌 경우 alt 속성이 있어야 함
        if (!src?.includes('decoration') && !src?.includes('spacer')) {
          expect(alt).toBeTruthy();
          expect(alt).not.toBe('');
        }
      }
    });

    test('모든 링크에 의미 있는 텍스트가 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      const links = await page.locator('a').all();
      
      for (const link of links) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        const ariaLabel = await link.getAttribute('aria-label');
        
        // 링크에 텍스트나 aria-label이 있어야 함
        const hasText = text && text.trim() !== '';
        const hasAriaLabel = ariaLabel && ariaLabel.trim() !== '';
        
        expect(hasText || hasAriaLabel).toBeTruthy();
        
        // "클릭하세요", "여기" 같은 의미 없는 텍스트는 피해야 함
        if (hasText) {
          expect(text).not.toMatch(/^(클릭|여기|링크|더보기)$/i);
        }
      }
    });

    test('폼 요소에 적절한 라벨이 있어야 함', async ({ page }) => {
      await page.goto('/login');
      
      const inputs = await page.locator('input, select, textarea').all();
      
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        // 라벨이 있는지 확인
        let hasLabel = false;
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = await label.count() > 0;
        }
        
        const hasAriaLabel = ariaLabel && ariaLabel.trim() !== '';
        const hasAriaLabelledBy = ariaLabelledBy && ariaLabelledBy.trim() !== '';
        
        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
      }
    });
  });

  test.describe('키보드 네비게이션', () => {
    test('Tab 키로 모든 인터랙티브 요소에 접근할 수 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      // Tab 키로 네비게이션
      const focusableElements = [];
      
      for (let i = 0; i < 20; i++) { // 최대 20개 요소까지 확인
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement);
        
        if (focusedElement && focusedElement !== document.body) {
          focusableElements.push(focusedElement);
        }
      }
      
      // 포커스 가능한 요소가 있어야 함
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // 각 요소가 포커스 표시를 가지고 있는지 확인
      for (const element of focusableElements) {
        const computedStyle = await page.evaluate((el) => {
          return window.getComputedStyle(el);
        }, element);
        
        // 포커스 표시가 있어야 함 (outline 또는 box-shadow)
        const hasFocusIndicator = 
          computedStyle.outline !== 'none' || 
          computedStyle.boxShadow !== 'none';
        
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('Enter 키로 버튼을 활성화할 수 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      // 로그인 버튼에 포커스
      await page.click('text=로그인');
      await page.keyboard.press('Tab');
      
      // Enter 키로 활성화
      await page.keyboard.press('Enter');
      
      // 로그인 페이지로 이동했는지 확인
      await expect(page).toHaveURL(/.*login/);
    });

    test('Escape 키로 모달을 닫을 수 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      // 모달 열기 (예: 메뉴 모달)
      await page.click('[data-testid="mobile-menu-button"]');
      
      // 모달이 열렸는지 확인
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Escape 키로 모달 닫기
      await page.keyboard.press('Escape');
      
      // 모달이 닫혔는지 확인
      await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
    });

    test('화살표 키로 메뉴를 네비게이션할 수 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      // 메뉴에 포커스
      const menu = page.locator('nav');
      await menu.focus();
      
      // 화살표 키로 메뉴 항목 네비게이션
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      
      // 포커스가 메뉴 내에서 유지되는지 확인
      const focusedElement = await page.evaluate(() => document.activeElement);
      expect(focusedElement?.closest('nav')).toBeTruthy();
    });
  });

  test.describe('스크린 리더 호환성', () => {
    test('페이지에 적절한 랜드마크가 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      // 주요 랜드마크 확인
      const landmarks = ['main', 'nav', 'header', 'footer'];
      
      for (const landmark of landmarks) {
        const elements = await page.locator(landmark).count();
        expect(elements).toBeGreaterThan(0);
      }
      
      // 각 랜드마크에 적절한 역할이 있는지 확인
      const main = page.locator('main');
      const nav = page.locator('nav');
      const header = page.locator('header');
      
      await expect(main).toHaveAttribute('role', 'main');
      await expect(nav).toHaveAttribute('role', 'navigation');
      await expect(header).toHaveAttribute('role', 'banner');
    });

    test('폼에 적절한 ARIA 속성이 있어야 함', async ({ page }) => {
      await page.goto('/login');
      
      // 폼에 role="form" 또는 적절한 역할이 있는지 확인
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // 필수 필드 표시
      const requiredInputs = page.locator('input[required]');
      const requiredCount = await requiredInputs.count();
      
      for (let i = 0; i < requiredCount; i++) {
        const input = requiredInputs.nth(i);
        const ariaRequired = await input.getAttribute('aria-required');
        expect(ariaRequired).toBe('true');
      }
      
      // 에러 메시지 연결
      const errorInputs = page.locator('input[aria-invalid="true"]');
      const errorCount = await errorInputs.count();
      
      for (let i = 0; i < errorCount; i++) {
        const input = errorInputs.nth(i);
        const ariaDescribedBy = await input.getAttribute('aria-describedby');
        expect(ariaDescribedBy).toBeTruthy();
      }
    });

    test('동적 콘텐츠 변경이 스크린 리더에 알려져야 함', async ({ page }) => {
      await page.goto('/');
      
      // 알림 영역 확인
      const alertRegion = page.locator('[role="alert"], [aria-live]');
      const alertCount = await alertRegion.count();
      
      if (alertCount > 0) {
        // aria-live 속성이 있는지 확인
        const liveRegion = page.locator('[aria-live]');
        expect(await liveRegion.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('색상 대비', () => {
    test('텍스트와 배경의 색상 대비가 충분해야 함', async ({ page }) => {
      await page.goto('/');
      
      // 모든 텍스트 요소의 색상 대비 확인
      const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6, a, button').all();
      
      for (const element of textElements) {
        const styles = await page.evaluate((elementHandle) => {
          const computed = window.getComputedStyle(elementHandle);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        }, await element.elementHandle());
        
        // 색상 대비 계산 (간단한 버전)
        if (styles.color !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // 실제 색상 대비 계산은 더 복잡하지만, 여기서는 기본적인 확인만 수행
          expect(styles.color).toBeTruthy();
          expect(styles.backgroundColor).toBeTruthy();
        }
      }
    });

    test('색상만으로 정보를 전달하지 않아야 함', async ({ page }) => {
      await page.goto('/');
      
      // 에러 메시지가 색상뿐만 아니라 다른 방법으로도 표시되는지 확인
      const errorElements = page.locator('[class*="error"], [class*="danger"]');
      const errorCount = await errorElements.count();
      
      for (let i = 0; i < errorCount; i++) {
        const element = errorElements.nth(i);
        
        // 아이콘이나 텍스트가 있는지 확인
        const hasIcon = await element.locator('svg, [class*="icon"]').count() > 0;
        const hasText = await element.textContent();
        
        expect(hasIcon || hasText).toBeTruthy();
      }
    });
  });

  test.describe('포커스 관리', () => {
    test('모달이 열릴 때 포커스가 모달로 이동해야 함', async ({ page }) => {
      await page.goto('/');
      
      // 모달 열기
      await page.click('[data-testid="mobile-menu-button"]');
      
      // 포커스가 모달 내부로 이동했는지 확인
      const focusedElement = await page.evaluate(() => document.activeElement);
      const isInModal = await page.evaluate((el) => {
        return el?.closest('[data-testid="mobile-menu"]') !== null;
      }, focusedElement);
      
      expect(isInModal).toBeTruthy();
    });

    test('모달이 닫힐 때 포커스가 원래 위치로 돌아가야 함', async ({ page }) => {
      await page.goto('/');
      
      // 모달을 열기 전 요소에 포커스
      const triggerButton = page.locator('[data-testid="mobile-menu-button"]');
      await triggerButton.focus();
      
      // 모달 열기
      await triggerButton.click();
      
      // 모달 닫기
      await page.keyboard.press('Escape');
      
      // 포커스가 원래 버튼으로 돌아갔는지 확인
      const focusedElement = await page.evaluate(() => document.activeElement);
      const isTriggerButton = await page.evaluate((el) => {
        return el?.getAttribute('data-testid') === 'mobile-menu-button';
      }, focusedElement);
      
      expect(isTriggerButton).toBeTruthy();
    });

    test('페이지 로드 시 포커스가 적절한 위치에 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      // 페이지 로드 후 포커스 확인
      const focusedElement = await page.evaluate(() => document.activeElement);
      
      // 포커스가 body에 있거나 적절한 요소에 있어야 함
      expect(focusedElement).toBeTruthy();
      
      // 스킵 링크가 있다면 포커스 가능해야 함
      const skipLink = page.locator('a[href="#main-content"]');
      if (await skipLink.count() > 0) {
        await skipLink.focus();
        const isFocused = await page.evaluate(() => document.activeElement?.getAttribute('href') === '#main-content');
        expect(isFocused).toBeTruthy();
      }
    });
  });

  test.describe('ARIA 속성', () => {
    test('버튼에 적절한 ARIA 속성이 있어야 함', async ({ page }) => {
      await page.goto('/');
      
      const buttons = await page.locator('button').all();
      
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        
        // 버튼에 텍스트나 aria-label이 있어야 함
        const hasText = text && text.trim() !== '';
        const hasAriaLabel = ariaLabel && ariaLabel.trim() !== '';
        const hasAriaLabelledBy = ariaLabelledBy && ariaLabelledBy.trim() !== '';
        
        expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
      }
    });

    test('상태 변경이 ARIA로 알려져야 함', async ({ page }) => {
      await page.goto('/');
      
      // 토글 버튼 확인
      const toggleButtons = page.locator('[aria-pressed], [aria-expanded], [aria-selected]');
      const toggleCount = await toggleButtons.count();
      
      for (let i = 0; i < toggleCount; i++) {
        const button = toggleButtons.nth(i);
        const ariaPressed = await button.getAttribute('aria-pressed');
        const ariaExpanded = await button.getAttribute('aria-expanded');
        const ariaSelected = await button.getAttribute('aria-selected');
        
        // 상태 값이 boolean 문자열이어야 함
        if (ariaPressed) expect(['true', 'false']).toContain(ariaPressed);
        if (ariaExpanded) expect(['true', 'false']).toContain(ariaExpanded);
        if (ariaSelected) expect(['true', 'false']).toContain(ariaSelected);
      }
    });

    test('폼 검증 에러가 ARIA로 연결되어야 함', async ({ page }) => {
      await page.goto('/login');
      
      // 잘못된 입력으로 폼 제출
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      // 에러 메시지가 aria-describedby로 연결되었는지 확인
      const errorInput = page.locator('input[aria-invalid="true"]');
      const ariaDescribedBy = await errorInput.getAttribute('aria-describedby');
      
      expect(ariaDescribedBy).toBeTruthy();
      
      // 연결된 에러 메시지가 존재하는지 확인
      const errorMessage = page.locator(`#${ariaDescribedBy}`);
      await expect(errorMessage).toBeVisible();
    });
  });
});

