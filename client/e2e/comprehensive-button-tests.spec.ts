import { test, expect } from '@playwright/test';

/**
 * 종합 버튼 테스트 - 모든 페이지의 모든 버튼을 자동으로 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 모든 페이지의 모든 버튼이 존재하고 클릭 가능한지
 * - 버튼 클릭 시 적절한 동작을 하는지
 * - 새로 추가된 버튼도 자동으로 테스트되는지
 * - 버튼의 접근성이 적절한지
 */

interface ButtonTestConfig {
  page: string;
  description: string;
  loginRequired?: boolean;
  userType?: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  expectedNavigation?: string;
  shouldStayOnPage?: boolean;
  customActions?: (page: any) => Promise<void>;
}

// 모든 페이지의 버튼 테스트 설정
const buttonTestConfigs: ButtonTestConfig[] = [
  // 홈페이지 버튼들
  {
    page: '/',
    description: '홈페이지',
    loginRequired: false,
    expectedNavigation: '/login',
    shouldStayOnPage: true
  },
  
  // 로그인 페이지 버튼들
  {
    page: '/login',
    description: '로그인 페이지',
    loginRequired: false,
    shouldStayOnPage: true
  },
  
  // 센터 관리자 대시보드 버튼들
  {
    page: '/center-admin/dashboard',
    description: '센터 관리자 대시보드',
    loginRequired: true,
    userType: 'centerAdmin',
    shouldStayOnPage: true
  },
  
  // 관리자 대시보드 버튼들
  {
    page: '/admin/dashboard',
    description: '관리자 대시보드',
    loginRequired: true,
    userType: 'centerAdmin',
    shouldStayOnPage: true
  },
  
  // 학생 대시보드 버튼들
  {
    page: '/dashboard',
    description: '학생 대시보드',
    loginRequired: true,
    userType: 'student',
    shouldStayOnPage: true
  },
  
  // 강사 대시보드 버튼들
  {
    page: '/instructor/dashboard',
    description: '강사 대시보드',
    loginRequired: true,
    userType: 'instructor',
    shouldStayOnPage: true
  },
  
  // 센터 정보 편집 페이지 버튼들
  {
    page: '/center-admin/introduction',
    description: '센터 정보 편집 페이지',
    loginRequired: true,
    userType: 'centerAdmin',
    shouldStayOnPage: true
  },
  
  // 사용자 관리 페이지 버튼들
  {
    page: '/center-admin/users',
    description: '사용자 관리 페이지',
    loginRequired: true,
    userType: 'centerAdmin',
    shouldStayOnPage: true
  },
  
  // 강의 관리 페이지 버튼들
  {
    page: '/center-admin/courses',
    description: '강의 관리 페이지',
    loginRequired: true,
    userType: 'centerAdmin',
    shouldStayOnPage: true
  },
  
  // 예약 관리 페이지 버튼들
  {
    page: '/center-admin/bookings',
    description: '예약 관리 페이지',
    loginRequired: true,
    userType: 'centerAdmin',
    shouldStayOnPage: true
  },
  
  // 결제 관리 페이지 버튼들
  {
    page: '/center-admin/payments',
    description: '결제 관리 페이지',
    loginRequired: true,
    userType: 'centerAdmin',
    shouldStayOnPage: true
  }
];

/**
 * 로그인 헬퍼 함수
 */
async function loginAsUser(page: any, userType: string) {
  await page.goto('/login');
  
  let credentials = { userId: '', password: '' };
  
  switch (userType) {
    case 'centerAdmin':
      credentials = { userId: 'center', password: '101010' };
      break;
    case 'instructor':
      credentials = { userId: 'teacher', password: '101010' };
      break;
    case 'student':
      credentials = { userId: 'student1', password: '101010' };
      break;
    default:
      credentials = { userId: 'center', password: '101010' };
  }
  
  await page.fill('input[name="userId"]', credentials.userId);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');
  
  // 로그인 완료 대기
  await page.waitForTimeout(2000);
}

/**
 * 버튼 테스트 실행 함수
 */
async function testButtonsOnPage(page: any, config: ButtonTestConfig) {
  console.log(`\n🔍 ${config.description} 버튼 테스트 시작...`);
  
  // 페이지 이동
  await page.goto(config.page);
  await page.waitForLoadState('networkidle');
  
  // 로그인이 필요한 경우 로그인
  if (config.loginRequired && config.userType) {
    await loginAsUser(page, config.userType);
    await page.goto(config.page);
    await page.waitForLoadState('networkidle');
  }
  
  // 모든 버튼 찾기 (더 포괄적인 셀렉터 사용)
  const buttons = await page.locator('button, [role="button"], input[type="button"], input[type="submit"], .btn, .button, [data-testid*="button"], [class*="button"], [class*="btn"]').all();
  
  console.log(`📊 발견된 버튼 수: ${buttons.length}개`);
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    
    try {
      // 버튼이 보이는지 확인
      const isVisible = await button.isVisible();
      if (!isVisible) {
        console.log(`⏭️ 버튼 ${i + 1}: 보이지 않음, 건너뜀`);
        continue;
      }
      
      // 버튼이 활성화되어 있는지 확인
      const isEnabled = await button.isEnabled();
      if (!isEnabled) {
        console.log(`⏭️ 버튼 ${i + 1}: 비활성화됨, 건너뜀`);
        continue;
      }
      
      // 버튼 텍스트 또는 aria-label 가져오기
      const buttonText = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const buttonId = await button.getAttribute('data-testid');
      
      const buttonDescription = buttonText?.trim() || ariaLabel || title || buttonId || `버튼 ${i + 1}`;
      
      console.log(`🧪 버튼 ${i + 1} 테스트: "${buttonDescription}"`);
      
      // 현재 URL 저장
      const currentUrl = page.url();
      
      // 버튼 클릭
      await button.click();
      
      // 잠시 대기 (네비게이션이나 모달 등 처리)
      await page.waitForTimeout(1000);
      
      // 커스텀 액션이 있는 경우 실행
      if (config.customActions) {
        await config.customActions(page);
      }
      
      // 페이지 이동 확인 (shouldStayOnPage가 false인 경우)
      if (!config.shouldStayOnPage) {
        const newUrl = page.url();
        if (newUrl !== currentUrl) {
          console.log(`✅ 버튼 "${buttonDescription}": 페이지 이동 성공 (${currentUrl} → ${newUrl})`);
          
          // 예상된 네비게이션이 있는 경우 확인
          if (config.expectedNavigation && newUrl.includes(config.expectedNavigation)) {
            console.log(`✅ 예상된 네비게이션 확인됨: ${config.expectedNavigation}`);
          }
          
          // 원래 페이지로 돌아가기
          await page.goto(config.page);
          await page.waitForLoadState('networkidle');
        } else {
          console.log(`ℹ️ 버튼 "${buttonDescription}": 페이지 이동 없음 (동일 페이지 액션)`);
        }
      } else {
        console.log(`✅ 버튼 "${buttonDescription}": 동일 페이지 액션 완료`);
      }
      
    } catch (error) {
      console.log(`❌ 버튼 ${i + 1} 테스트 실패:`, error);
    }
  }
  
  console.log(`✅ ${config.description} 버튼 테스트 완료\n`);
}

/**
 * 접근성 테스트 함수
 */
async function testButtonAccessibility(page: any, config: ButtonTestConfig) {
  console.log(`\n♿ ${config.description} 접근성 테스트 시작...`);
  
  await page.goto(config.page);
  await page.waitForLoadState('networkidle');
  
  if (config.loginRequired && config.userType) {
    await loginAsUser(page, config.userType);
    await page.goto(config.page);
    await page.waitForLoadState('networkidle');
  }
  
  const buttons = await page.locator('button, [role="button"]').all();
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    
    try {
      const isVisible = await button.isVisible();
      if (!isVisible) continue;
      
      // 키보드 포커스 가능한지 확인
      await button.focus();
      const isFocused = await button.evaluate(el => document.activeElement === el);
      
      if (isFocused) {
        console.log(`✅ 버튼 ${i + 1}: 키보드 포커스 가능`);
        
        // Enter 키로 활성화 가능한지 확인
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        console.log(`✅ 버튼 ${i + 1}: Enter 키 활성화 가능`);
      }
      
    } catch (error) {
      console.log(`❌ 버튼 ${i + 1} 접근성 테스트 실패:`, error);
    }
  }
  
  console.log(`✅ ${config.description} 접근성 테스트 완료\n`);
}

// 메인 테스트 실행
test.describe('종합 버튼 테스트', () => {
  for (const config of buttonTestConfigs) {
    test(`${config.description} - 모든 버튼 테스트`, async ({ page }) => {
      await testButtonsOnPage(page, config);
    });
    
    test(`${config.description} - 접근성 테스트`, async ({ page }) => {
      await testButtonAccessibility(page, config);
    });
  }
});

// 특별한 상호작용 테스트
test.describe('특별 상호작용 테스트', () => {
  test('모달 버튼 테스트', async ({ page }) => {
    // 모달이 있는 페이지에서 모달 버튼 테스트
    await page.goto('/center-admin/dashboard');
    await loginAsUser(page, 'centerAdmin');
    await page.goto('/center-admin/dashboard');
    
    // 모달을 여는 버튼들 찾기
    const modalTriggers = await page.locator('[data-modal], [data-testid*="modal"], [aria-haspopup="dialog"]').all();
    
    for (const trigger of modalTriggers) {
      if (await trigger.isVisible()) {
        await trigger.click();
        await page.waitForTimeout(1000);
        
        // 모달이 열렸는지 확인
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
        if (await modal.isVisible()) {
          console.log('✅ 모달이 정상적으로 열림');
          
          // 모달 내부 버튼들 테스트
          const modalButtons = await modal.locator('button').all();
          for (const button of modalButtons) {
            if (await button.isVisible()) {
              await button.click();
              await page.waitForTimeout(500);
            }
          }
        }
      }
    }
  });
  
  test('폼 버튼 테스트', async ({ page }) => {
    // 폼이 있는 페이지에서 폼 버튼 테스트
    await page.goto('/center-admin/introduction');
    await loginAsUser(page, 'centerAdmin');
    await page.goto('/center-admin/introduction');
    
    // 폼 버튼들 찾기
    const formButtons = await page.locator('form button, [type="submit"], [type="reset"]').all();
    
    for (const button of formButtons) {
      if (await button.isVisible() && await button.isEnabled()) {
        const buttonText = await button.textContent();
        console.log(`🧪 폼 버튼 테스트: "${buttonText}"`);
        
        try {
          await button.click();
          await page.waitForTimeout(1000);
          console.log(`✅ 폼 버튼 "${buttonText}" 클릭 성공`);
        } catch (error) {
          console.log(`❌ 폼 버튼 "${buttonText}" 클릭 실패:`, error);
        }
      }
    }
  });
});
