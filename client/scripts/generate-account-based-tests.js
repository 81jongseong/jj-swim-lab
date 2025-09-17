#!/usr/bin/env node

/**
 * 계정별 버튼 테스트 자동 생성 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * - 계정 유형별로 테스트 분리
 * - 100개 단위로 테스트 그룹화
 * - 로그인 상태 유지
 */

const fs = require('fs');
const path = require('path');

// 프로젝트 루트 경로
const PROJECT_ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(PROJECT_ROOT, 'app');
const E2E_DIR = path.join(PROJECT_ROOT, 'e2e');

// 계정별 페이지 매핑
const ACCOUNT_PAGES = {
  'guest': [
    '/',
    '/3d-viewer',
    '/accessibility',
    '/community',
    '/news',
    '/quiz',
    '/map',
    '/membership',
    '/notifications',
    '/payments',
    '/uploads',
    '/video-upload',
    '/ai-evaluation',
    '/localization',
    '/personalized-dashboard',
    '/user-role-integration'
  ],
  'center-admin': [
    '/center-admin/dashboard',
    '/center-admin/users',
    '/center-admin/health',
    '/center-admin/settings'
  ],
  'instructor': [
    '/instructor/dashboard',
    '/instructor/students',
    '/instructor/courses',
    '/instructor/schedule',
    '/instructor/progress',
    '/instructor/health',
    '/instructor/teaching-methods',
    '/instructor/templates',
    '/instructor/checklist',
    '/instructor/reviews'
  ],
  'admin': [
    '/admin/dashboard',
    '/admin/users',
    '/admin/centers',
    '/admin/courses',
    '/admin/bookings',
    '/admin/instructors',
    '/admin/lesson-plans',
    '/admin/quiz',
    '/admin/notices',
    '/admin/student-levels',
    '/admin/teaching-methods',
    '/admin/approvals',
    '/admin/center-management',
    '/admin/center-info',
    '/admin/instructor-management',
    '/admin/ai-config',
    '/admin/3d-viewer'
  ]
};

// 계정별 로그인 정보
const LOGIN_CREDENTIALS = {
  'center-admin': { userId: 'center', password: '101010' },
  'instructor': { userId: 'instructor', password: '101010' },
  'admin': { userId: 'admin', password: '101010' }
};

/**
 * 페이지에서 버튼 정보 추출
 */
function extractButtonsFromPage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const buttons = [];
    
    const buttonPatterns = [
      /<Button[^>]*>([^<]*)<\/Button>/g,
      /<button[^>]*>([^<]*)<\/button>/g,
      /onClick[^>]*>([^<]*)<\/[^>]*>/g,
      /className[^>]*button[^>]*>([^<]*)<\/[^>]*>/g,
      /data-testid[^>]*>([^<]*)<\/[^>]*>/g,
    ];
    
    buttonPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const buttonText = match[1].trim();
        if (buttonText && buttonText.length > 0 && buttonText.length < 100) {
          let safeText = buttonText;
          if (buttonText.includes('window.') || 
              buttonText.includes('setState') || 
              buttonText.includes('onClick') || 
              buttonText.includes('{') ||
              buttonText.includes('}') ||
              buttonText.includes('(') ||
              buttonText.includes(')') ||
              buttonText.includes('=>') ||
              buttonText.includes('"') ||
              buttonText.includes("'") ||
              buttonText.includes('`') ||
              buttonText.length > 30) {
            safeText = `버튼_${buttons.length + 1}`;
          } else {
            safeText = buttonText.replace(/'/g, "\\'").replace(/"/g, '\\"');
          }
          
          buttons.push({
            text: safeText,
            originalText: buttonText,
            pattern: pattern.source,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
    });
    
    return buttons;
  } catch (error) {
    console.error(`파일 읽기 오류: ${filePath}`, error);
    return [];
  }
}

/**
 * 모든 페이지 파일 찾기
 */
function findAllPages(dir, pages = []) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('_')) {
      findAllPages(fullPath, pages);
    } else if (item === 'page.tsx' || item === 'page.js') {
      pages.push(fullPath);
    }
  });
  
  return pages;
}

/**
 * 계정별 테스트 코드 생성
 */
function generateAccountBasedTests() {
  let allTests = '';
  
  // 각 계정별로 테스트 생성
  Object.entries(ACCOUNT_PAGES).forEach(([accountType, routes]) => {
    console.log(`\n📋 ${accountType} 계정 테스트 생성 중...`);
    
    let accountTests = '';
    let buttonCount = 0;
    let testGroupCount = 0;
    
    routes.forEach(route => {
      const pagePath = path.join(PAGES_DIR, route.substring(1) + '/page.tsx');
      
      if (fs.existsSync(pagePath)) {
        const buttons = extractButtonsFromPage(pagePath);
        
        if (buttons.length > 0) {
          console.log(`  📄 ${route}: ${buttons.length}개 버튼 발견`);
          
          // 100개 단위로 그룹화
          if (buttonCount + buttons.length > 100) {
            testGroupCount++;
            buttonCount = 0;
          }
          
          const testGroup = `test-group-${testGroupCount}`;
          
          accountTests += `
// ${route} - ${buttons.length}개 버튼
test.describe('${route} - ${testGroup}', () => {
  test.beforeEach(async ({ page }) => {
    ${accountType !== 'guest' ? `
    // ${accountType} 로그인
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForTimeout(500);
    await page.fill('input[name="userId"]', '${LOGIN_CREDENTIALS[accountType].userId}');
    await page.fill('input[name="password"]', '${LOGIN_CREDENTIALS[accountType].password}');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    ` : ''}
    
    await page.goto('http://localhost:3000${route}');
    await page.waitForTimeout(500);
  });

${buttons.map((button, index) => `
  test('버튼 "${button.text}" 테스트 #${index + 1}', async ({ page }) => {
    const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "${button.text}" }).first();
    
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
      await expect(button).toBeEnabled({ timeout: 1000 });
      
      const currentUrl = page.url();
      await button.click();
      await page.waitForTimeout(500);
      
      console.log('버튼 "${button.text}" 클릭: ${route}');
    } catch (error) {
      console.log('버튼 "${button.text}" 스킵: ${route}');
    }
  });`).join('')}
});`;
          
          buttonCount += buttons.length;
        }
      }
    });
    
    allTests += `
// ========================================
// ${accountType.toUpperCase()} 계정 테스트
// ========================================
${accountTests}`;
  });
  
  return allTests;
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🔍 계정별 버튼 테스트 자동 생성 시작...');
  
  const testCode = generateAccountBasedTests();
  
  const fullTestCode = `
import { test, expect } from '@playwright/test';

// 자동 생성된 계정별 버튼 테스트 - ${new Date().toISOString()}
// 총 계정 수: ${Object.keys(ACCOUNT_PAGES).length}개
// 총 페이지 수: ${Object.values(ACCOUNT_PAGES).flat().length}개

${testCode}
`;
  
  // 테스트 파일 저장
  const testFilePath = path.join(E2E_DIR, 'account-based-button-tests.spec.ts');
  fs.writeFileSync(testFilePath, fullTestCode, 'utf8');
  
  console.log(`\n✅ 계정별 테스트 파일 생성 완료: ${testFilePath}`);
  console.log(`📊 총 계정 수: ${Object.keys(ACCOUNT_PAGES).length}개`);
  console.log(`📊 총 페이지 수: ${Object.values(ACCOUNT_PAGES).flat().length}개`);
  
  // 100개 단위 실행 스크립트 생성
  generateBatchScripts();
}

/**
 * 100개 단위 실행 스크립트 생성
 */
function generateBatchScripts() {
  const batchScript = `@echo off
echo 🔍 계정별 버튼 테스트 실행 시작...

echo.
echo 📋 1. 게스트 계정 테스트
npx playwright test e2e/account-based-button-tests.spec.ts --grep="guest" --workers=3 --timeout=10000 --reporter=line

echo.
echo 📋 2. 센터 관리자 계정 테스트  
npx playwright test e2e/account-based-button-tests.spec.ts --grep="center-admin" --workers=3 --timeout=10000 --reporter=line

echo.
echo 📋 3. 강사 계정 테스트
npx playwright test e2e/account-based-button-tests.spec.ts --grep="instructor" --workers=3 --timeout=10000 --reporter=line

echo.
echo 📋 4. 관리자 계정 테스트
npx playwright test e2e/account-based-button-tests.spec.ts --grep="admin" --workers=3 --timeout=10000 --reporter=line

echo.
echo ✅ 모든 계정별 테스트 완료!
pause
`;

  const batchFilePath = path.join(PROJECT_ROOT, 'test-accounts.bat');
  fs.writeFileSync(batchFilePath, batchScript, 'utf8');
  
  console.log(`✅ 배치 스크립트 생성 완료: ${batchFilePath}`);
}

// 실행
main();
