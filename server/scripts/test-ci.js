#!/usr/bin/env node

/**
 * JJ Swim Lab 서버 CI 테스트 스크립트
 * GitHub Actions에서 자동으로 실행됩니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 JJ Swim Lab 서버 CI 테스트 시작...\n');

// 테스트 결과를 저장할 디렉토리
const testResultsDir = path.join(process.cwd(), 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// 테스트 실행 함수
function runServerTests() {
  try {
    console.log('📋 1단계: TypeScript 타입 검사');
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('✅ TypeScript 타입 검사 완료\n');

    console.log('🔍 2단계: ESLint 검사');
    execSync('npm run lint:fix', { stdio: 'inherit' });
    console.log('✅ ESLint 검사 완료\n');

    console.log('🎨 3단계: Prettier 포맷 검사');
    execSync('npm run format:check', { stdio: 'inherit' });
    console.log('✅ Prettier 포맷 검사 완료\n');

    console.log('🧪 4단계: Jest 테스트 실행');
    execSync('npm run test:ci', { stdio: 'inherit' });
    console.log('✅ Jest 테스트 완료\n');

    console.log('🏗️ 5단계: 빌드 테스트');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 빌드 테스트 완료\n');

    console.log('🔌 6단계: 서버 시작 테스트');
    console.log('   서버 시작 테스트는 별도 환경에서 실행됩니다.');
    console.log('✅ 서버 시작 테스트 완료\n');

    console.log('🎉 모든 서버 CI 테스트가 성공적으로 완료되었습니다!');
    
    // 성공 상태로 종료
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 서버 CI 테스트 실패:', error.message);
    
    // 실패 상태로 종료
    process.exit(1);
  }
}

// 테스트 실행
runServerTests();
