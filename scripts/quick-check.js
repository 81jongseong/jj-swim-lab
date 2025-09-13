#!/usr/bin/env node

/**
 * ⚡ JJ Swim Lab - 빠른 검증 스크립트
 * 
 * 📋 **파일 목적**
 * - 개발 중 빠른 검증을 위한 간소화된 체크 스크립트
 * - 빌드와 타입 체크만 실행하여 빠른 피드백 제공
 * - CI/CD 파이프라인에서 사용할 수 있는 경량 버전
 */

const { execSync } = require('child_process');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function executeQuickCheck() {
  log(`\n⚡ 빠른 검증 시작...`, colors.cyan + colors.bright);
  
  const checks = [
    { name: '빌드 검증', command: 'npm run build' },
    { name: '타입 체크', command: 'npm run type-check' },
    { name: '린팅 검사', command: 'npm run lint' }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  for (const check of checks) {
    try {
      log(`\n🔄 ${check.name}...`, colors.blue);
      execSync(check.command, { stdio: 'pipe' });
      log(`✅ ${check.name} 완료`, colors.green);
      passed++;
    } catch (error) {
      log(`❌ ${check.name} 실패`, colors.red);
      log(`   오류: ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 결과: ${passed}/${total} 통과`, colors.bright);
  
  if (passed === total) {
    log(`🎉 모든 빠른 검증이 완료되었습니다!`, colors.green + colors.bright);
    return true;
  } else {
    log(`⚠️  일부 검증에서 문제가 발견되었습니다.`, colors.yellow + colors.bright);
    return false;
  }
}

// 실행
if (require.main === module) {
  const success = executeQuickCheck();
  process.exit(success ? 0 : 1);
}

module.exports = { executeQuickCheck };

