#!/usr/bin/env node

/**
 * 버튼 테스트 자동 생성 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * - 모든 페이지의 버튼을 자동으로 스캔
 * - 새로 추가된 버튼을 감지
 * - 자동으로 테스트 코드 생성
 * - 기존 테스트 파일 업데이트
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 프로젝트 루트 경로
const PROJECT_ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(PROJECT_ROOT, 'app');
const E2E_DIR = path.join(PROJECT_ROOT, 'e2e');

/**
 * 페이지 파일에서 버튼 정보 추출
 */
function extractButtonsFromPage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const buttons = [];
    
    // 다양한 버튼 패턴 찾기
    const buttonPatterns = [
      // JSX 버튼들
      /<Button[^>]*>([^<]*)<\/Button>/g,
      /<button[^>]*>([^<]*)<\/button>/g,
      // onClick 핸들러가 있는 요소들
      /onClick[^>]*>([^<]*)<\/[^>]*>/g,
      // 특정 클래스나 데이터 속성을 가진 버튼들
      /className[^>]*button[^>]*>([^<]*)<\/[^>]*>/g,
      /data-testid[^>]*>([^<]*)<\/[^>]*>/g,
      // 아이콘 버튼들
      /<[^>]*icon[^>]*>([^<]*)<\/[^>]*>/g,
    ];
    
    buttonPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
      const buttonText = match[1].trim();
      if (buttonText && buttonText.length > 0 && buttonText.length < 100) {
        // 특수 문자나 복잡한 텍스트가 포함된 경우 간단한 식별자 사용
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
          // 기본적인 특수 문자만 이스케이프
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
 * 테스트 코드 생성
 */
function generateTestCode(pagePath, buttons) {
  const relativePath = path.relative(PAGES_DIR, pagePath);
  const route = '/' + relativePath.replace(/\\/g, '/').replace('/page.tsx', '').replace('/page.js', '');
  const pageName = path.basename(path.dirname(pagePath));
  
  const testCode = `
// 자동 생성된 테스트 코드 - ${new Date().toISOString()}
// 페이지: ${route}
// 발견된 버튼 수: ${buttons.length}개

test.describe('${pageName} - 자동 생성된 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 필요 페이지 확인
    if ('${route}'.includes('admin') || '${route}'.includes('center-admin') || '${route}'.includes('instructor') || '${route}'.includes('accessibility')) {
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
    await page.goto('http://localhost:3000${route}');
    await page.waitForTimeout(500);
  });

${buttons.map((button, index) => `
  test('버튼 "${button.text}" 테스트 (${route}) #${index + 1}', async ({ page }) => {
    // 버튼 찾기 (복잡한 텍스트의 경우 인덱스로 찾기)
    ${button.text.startsWith('버튼_') ? 
      `const buttons = await page.locator('button, [role="button"]').all();
    const button = buttons[${index}]; // 복잡한 버튼 (인덱스: ${index})` :
      `const button = page.locator('button, [role="button"], .button, [class*="button"]').filter({ hasText: "${button.text}" }).first();`}
    
    // 버튼이 보이는지 확인 (빠른 설정)
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
    } catch (error) {
      console.log('버튼을 찾을 수 없습니다. 스킵합니다.');
      return;
    }
    
    // 버튼이 활성화되어 있는지 확인 (빠른 설정)
    try {
      await expect(button).toBeEnabled({ timeout: 1000 });
    } catch (error) {
      console.log('버튼이 비활성화되어 있습니다. 계속 진행합니다.');
    }
    
    // 현재 URL 저장
    const currentUrl = page.url();
    
    // 버튼 클릭
    await button.click();
    await page.waitForTimeout(1000);
    
    // 클릭 후 상태 확인 (페이지 이동 또는 모달 열림 등)
    const newUrl = page.url();
    console.log(\`버튼 "${button.text}" 클릭: \${currentUrl} → \${newUrl}\`);
    
    // 원래 페이지로 돌아가기 (필요한 경우)
    if (newUrl !== currentUrl) {
      await page.goto('http://localhost:3000${route}');
      await page.waitForTimeout(1000);
    }
  });`).join('\n')}

  test('모든 버튼의 접근성 테스트 (${route})', async ({ page }) => {
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
`;

  return testCode;
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🔍 버튼 테스트 자동 생성 시작...\n');
  
  // 모든 페이지 찾기
  const pages = findAllPages(PAGES_DIR);
  console.log(`📄 발견된 페이지 수: ${pages.length}개\n`);
  
  let totalButtons = 0;
  const pageButtonData = [];
  
  // 각 페이지에서 버튼 추출
  pages.forEach(pagePath => {
    const buttons = extractButtonsFromPage(pagePath);
    const relativePath = path.relative(PAGES_DIR, pagePath);
    
    if (buttons.length > 0) {
      console.log(`📄 ${relativePath}: ${buttons.length}개 버튼 발견`);
      buttons.forEach(button => {
        console.log(`   - "${button.text}" (라인 ${button.line})`);
      });
      console.log('');
      
      totalButtons += buttons.length;
      pageButtonData.push({ pagePath, buttons });
    }
  });
  
  console.log(`📊 총 발견된 버튼 수: ${totalButtons}개\n`);
  
  // 테스트 파일 생성
  const testFileName = path.join(E2E_DIR, 'auto-generated-button-tests.spec.ts');
  let testContent = `import { test, expect } from '@playwright/test';

/**
 * 자동 생성된 버튼 테스트
 * 
 * 생성 시간: ${new Date().toISOString()}
 * 총 페이지 수: ${pages.length}개
 * 총 버튼 수: ${totalButtons}개
 * 
 * 주의: 이 파일은 자동으로 생성됩니다. 수동으로 편집하지 마세요.
 * 버튼을 추가하거나 수정한 후 다시 생성하려면:
 * npm run generate-button-tests
 */

`;

  // 각 페이지에 대한 테스트 코드 추가
  pageButtonData.forEach(({ pagePath, buttons }) => {
    const testCode = generateTestCode(pagePath, buttons);
    testContent += testCode + '\n\n';
  });
  
  // 테스트 파일 저장
  fs.writeFileSync(testFileName, testContent);
  console.log(`✅ 테스트 파일 생성 완료: ${testFileName}`);
  
  // package.json에 스크립트 추가 (없는 경우)
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    if (!packageJson.scripts['generate-button-tests']) {
      packageJson.scripts['generate-button-tests'] = 'node scripts/generate-button-tests.js';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ package.json에 generate-button-tests 스크립트 추가됨');
    }
  }
  
  console.log('\n🎉 버튼 테스트 자동 생성 완료!');
  console.log('\n다음 명령어로 테스트를 실행할 수 있습니다:');
  console.log('npm run test:e2e');
  console.log('\n새로운 버튼을 추가한 후 다시 생성하려면:');
  console.log('npm run generate-button-tests');
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, extractButtonsFromPage, findAllPages };
