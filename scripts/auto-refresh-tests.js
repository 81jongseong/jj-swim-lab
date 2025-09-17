#!/usr/bin/env node

/**
 * 자동 테스트 갱신 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * - 파일 변경 감지
 * - 변경된 파일에 따라 테스트 자동 갱신
 * - 새로운 버튼이나 컴포넌트 자동 감지
 * - 테스트 실행 전 자동 정리
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 프로젝트 루트 경로
const PROJECT_ROOT = path.join(__dirname, '..');
const CLIENT_DIR = path.join(PROJECT_ROOT, 'client');
const SERVER_DIR = path.join(PROJECT_ROOT, 'server');

/**
 * 파일 변경 감지
 */
function detectFileChanges() {
  console.log('🔍 파일 변경 감지 중...');
  
  const changes = {
    client: [],
    server: [],
    pages: [],
    components: [],
    buttons: []
  };
  
  try {
    // Git을 사용하여 변경된 파일 감지
    const gitStatus = execSync('git status --porcelain', { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf8' 
    });
    
    const changedFiles = gitStatus.split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3)); // 상태 코드 제거
    
    changedFiles.forEach(file => {
      if (file.startsWith('client/')) {
        changes.client.push(file);
        
        // 페이지 파일 변경 감지
        if (file.includes('/page.tsx') || file.includes('/page.js')) {
          changes.pages.push(file);
        }
        
        // 컴포넌트 파일 변경 감지
        if (file.includes('/components/') || file.includes('/components/')) {
          changes.components.push(file);
        }
        
        // 버튼 관련 파일 변경 감지
        if (file.includes('Button') || file.includes('button')) {
          changes.buttons.push(file);
        }
      } else if (file.startsWith('server/')) {
        changes.server.push(file);
      }
    });
    
    console.log(`📊 변경 감지 결과:`);
    console.log(`   - 클라이언트 파일: ${changes.client.length}개`);
    console.log(`   - 서버 파일: ${changes.server.length}개`);
    console.log(`   - 페이지 파일: ${changes.pages.length}개`);
    console.log(`   - 컴포넌트 파일: ${changes.components.length}개`);
    console.log(`   - 버튼 관련 파일: ${changes.buttons.length}개`);
    
  } catch (error) {
    console.log('⚠️ Git 상태 확인 실패, 전체 테스트를 실행합니다.');
    // Git이 없거나 에러가 발생한 경우 전체 테스트 실행
    return { forceFullTest: true };
  }
  
  return changes;
}

/**
 * 테스트 자동 갱신
 */
function refreshTests(changes) {
  console.log('\n🔄 테스트 자동 갱신 중...');
  
  // 페이지나 컴포넌트가 변경된 경우 버튼 테스트 갱신
  if (changes.pages.length > 0 || changes.components.length > 0 || changes.buttons.length > 0) {
    console.log('📄 페이지/컴포넌트 변경 감지 → 버튼 테스트 갱신');
    try {
      execSync('npm run generate-button-tests', { 
        cwd: CLIENT_DIR, 
        stdio: 'inherit' 
      });
      console.log('✅ 버튼 테스트 갱신 완료');
    } catch (error) {
      console.log('❌ 버튼 테스트 갱신 실패:', error.message);
    }
  }
  
  // 클라이언트 파일이 변경된 경우 Jest 테스트 갱신
  if (changes.client.length > 0) {
    console.log('🧪 클라이언트 파일 변경 감지 → Jest 테스트 갱신');
    try {
      // Jest 테스트 캐시 클리어
      execSync('npm test -- --clearCache', { 
        cwd: CLIENT_DIR, 
        stdio: 'inherit' 
      });
      console.log('✅ 클라이언트 Jest 테스트 갱신 완료');
    } catch (error) {
      console.log('❌ 클라이언트 Jest 테스트 갱신 실패:', error.message);
    }
  }
  
  // 서버 파일이 변경된 경우 Jest 테스트 갱신
  if (changes.server.length > 0) {
    console.log('🧪 서버 파일 변경 감지 → Jest 테스트 갱신');
    try {
      // Jest 테스트 캐시 클리어
      execSync('npm test -- --clearCache', { 
        cwd: SERVER_DIR, 
        stdio: 'inherit' 
      });
      console.log('✅ 서버 Jest 테스트 갱신 완료');
    } catch (error) {
      console.log('❌ 서버 Jest 테스트 갱신 실패:', error.message);
    }
  }
}

/**
 * 테스트 실행 전 정리
 */
function cleanupBeforeTests() {
  console.log('\n🧹 테스트 실행 전 정리 중...');
  
  try {
    // Playwright 테스트 결과 정리
    const testResultsDir = path.join(CLIENT_DIR, 'test-results');
    if (fs.existsSync(testResultsDir)) {
      fs.rmSync(testResultsDir, { recursive: true, force: true });
      console.log('✅ Playwright 테스트 결과 정리 완료');
    }
    
    // Jest 테스트 결과 정리
    const jestResultsDir = path.join(CLIENT_DIR, 'coverage');
    if (fs.existsSync(jestResultsDir)) {
      fs.rmSync(jestResultsDir, { recursive: true, force: true });
      console.log('✅ Jest 테스트 결과 정리 완료');
    }
    
    const serverJestResultsDir = path.join(SERVER_DIR, 'coverage');
    if (fs.existsSync(serverJestResultsDir)) {
      fs.rmSync(serverJestResultsDir, { recursive: true, force: true });
      console.log('✅ 서버 Jest 테스트 결과 정리 완료');
    }
    
  } catch (error) {
    console.log('⚠️ 테스트 정리 중 오류:', error.message);
  }
}

/**
 * 새로운 버튼 감지
 */
function detectNewButtons() {
  console.log('\n🔍 새로운 버튼 감지 중...');
  
  try {
    const result = execSync('npm run generate-button-tests', { 
      cwd: CLIENT_DIR, 
      encoding: 'utf8' 
    });
    
    // 결과에서 새로운 버튼 정보 추출
    const lines = result.split('\n');
    let newButtons = 0;
    let totalButtons = 0;
    
    lines.forEach(line => {
      if (line.includes('개 버튼 발견')) {
        const match = line.match(/(\d+)개 버튼 발견/);
        if (match) {
          totalButtons += parseInt(match[1]);
        }
      }
      if (line.includes('총 발견된 버튼 수')) {
        const match = line.match(/총 발견된 버튼 수: (\d+)개/);
        if (match) {
          totalButtons = parseInt(match[1]);
        }
      }
    });
    
    console.log(`📊 현재 총 버튼 수: ${totalButtons}개`);
    
    if (totalButtons > 0) {
      console.log('✅ 새로운 버튼 감지 완료');
      return { hasNewButtons: true, totalButtons };
    }
    
  } catch (error) {
    console.log('❌ 새로운 버튼 감지 실패:', error.message);
  }
  
  return { hasNewButtons: false, totalButtons: 0 };
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🚀 자동 테스트 갱신 시작...\n');
  
  // 1. 파일 변경 감지
  const changes = detectFileChanges();
  
  // 2. 테스트 실행 전 정리
  cleanupBeforeTests();
  
  // 3. 테스트 자동 갱신
  if (!changes.forceFullTest) {
    refreshTests(changes);
  } else {
    console.log('🔄 전체 테스트 갱신 실행');
    try {
      execSync('npm run generate-button-tests', { 
        cwd: CLIENT_DIR, 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.log('❌ 전체 테스트 갱신 실패:', error.message);
    }
  }
  
  // 4. 새로운 버튼 감지
  const buttonInfo = detectNewButtons();
  
  console.log('\n🎉 자동 테스트 갱신 완료!');
  console.log(`📊 총 ${buttonInfo.totalButtons}개의 버튼이 감지되었습니다.`);
  
  if (buttonInfo.hasNewButtons) {
    console.log('🆕 새로운 버튼이 발견되어 테스트가 갱신되었습니다.');
  }
  
  return {
    success: true,
    changes: changes,
    buttonInfo: buttonInfo
  };
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, detectFileChanges, refreshTests, cleanupBeforeTests, detectNewButtons };
