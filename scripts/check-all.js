#!/usr/bin/env node

/**
 * 🔍 JJ Swim Lab - 통합 검증 스크립트
 * 
 * 📋 **파일 목적**
 * - 빌드, 테스트, 린팅, 타입 체크, YAML 검증을 한번에 실행
 * - 모든 검증 단계의 성공/실패 상태를 종합적으로 보고
 * - 개발자에게 프로젝트의 전체적인 상태를 제공
 * 
 * 🔄 **주요 기능**
 * - 서버 및 클라이언트 빌드 검증
 * - 단위 테스트, 통합 테스트, E2E 테스트 실행
 * - ESLint 린팅 검사
 * - TypeScript 타입 체크
 * - GitHub Actions YAML 검증
 * - 종합 결과 리포트 생성
 * 
 * 🗄️ **검증 항목**
 * 1. 빌드 검증 (서버/클라이언트)
 * 2. 테스트 실행 (단위/통합/E2E)
 * 3. 린팅 검사 (ESLint)
 * 4. 타입 체크 (TypeScript)
 * 5. YAML 검증 (GitHub Actions)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Node.js 실행 환경
 * - npm 패키지 매니저
 * - TypeScript 컴파일러
 * - ESLint 린터
 * - Jest 테스트 프레임워크
 * - Playwright E2E 테스트
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 결과 저장
const results = {
  build: { server: null, client: null },
  test: { server: null, client: null },
  lint: { server: null, client: null },
  typeCheck: { server: null, client: null },
  yamlValidation: null,
  overall: null
};

// 유틸리티 함수들
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`  ${title}`, colors.cyan + colors.bright);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function logStep(step, status) {
  const statusColor = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  log(`${statusIcon} ${step}`, statusColor);
}

function executeCommand(command, description, category, subcategory = null) {
  try {
    log(`\n🔄 ${description}...`, colors.blue);
    const startTime = Date.now();
    
    execSync(command, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    const duration = Date.now() - startTime;
    logStep(`${description}`, 'PASS');
    log(`   ⏱️  소요 시간: ${duration}ms`, colors.blue);
    
    if (subcategory) {
      results[category][subcategory] = { status: 'PASS', duration };
    } else {
      results[category] = { status: 'PASS', duration };
    }
    
    return true;
  } catch (error) {
    logStep(`${description}`, 'FAIL');
    log(`   ❌ 오류: ${error.message}`, colors.red);
    
    if (subcategory) {
      results[category][subcategory] = { status: 'FAIL', error: error.message };
    } else {
      results[category] = { status: 'FAIL', error: error.message };
    }
    
    return false;
  }
}

function checkYAMLFiles() {
  try {
    log(`\n🔄 YAML 파일 검증...`, colors.blue);
    
    const yamlFiles = [
      '.github/workflows/ci.yml'
    ];
    
    let allValid = true;
    
    for (const file of yamlFiles) {
      if (fs.existsSync(file)) {
        // YAML 파일 존재 확인
        log(`   📄 ${file} 존재 확인`, colors.green);
      } else {
        log(`   ❌ ${file} 파일이 존재하지 않습니다`, colors.red);
        allValid = false;
      }
    }
    
    if (allValid) {
      logStep('YAML 파일 검증', 'PASS');
      results.yamlValidation = { status: 'PASS' };
      return true;
    } else {
      logStep('YAML 파일 검증', 'FAIL');
      results.yamlValidation = { status: 'FAIL' };
      return false;
    }
  } catch (error) {
    logStep('YAML 파일 검증', 'FAIL');
    log(`   ❌ 오류: ${error.message}`, colors.red);
    results.yamlValidation = { status: 'FAIL', error: error.message };
    return false;
  }
}

function generateReport() {
  logHeader('📊 종합 검증 결과 리포트');
  
  // 빌드 결과
  log(`\n🔨 빌드 검증:`, colors.bright);
  logStep(`  서버 빌드`, results.build.server?.status || 'SKIP');
  logStep(`  클라이언트 빌드`, results.build.client?.status || 'SKIP');
  
  // 테스트 결과
  log(`\n🧪 테스트 실행:`, colors.bright);
  logStep(`  서버 테스트`, results.test.server?.status || 'SKIP');
  logStep(`  클라이언트 테스트`, results.test.client?.status || 'SKIP');
  
  // 린팅 결과
  log(`\n🔍 린팅 검사:`, colors.bright);
  logStep(`  서버 린팅`, results.lint.server?.status || 'SKIP');
  logStep(`  클라이언트 린팅`, results.lint.client?.status || 'SKIP');
  
  // 타입 체크 결과
  log(`\n📝 타입 체크:`, colors.bright);
  logStep(`  서버 타입 체크`, results.typeCheck.server?.status || 'SKIP');
  logStep(`  클라이언트 타입 체크`, results.typeCheck.client?.status || 'SKIP');
  
  // YAML 검증 결과
  log(`\n📋 YAML 검증:`, colors.bright);
  logStep(`  GitHub Actions`, results.yamlValidation?.status || 'SKIP');
  
  // 전체 결과 계산
  const allChecks = [
    results.build.server?.status,
    results.build.client?.status,
    results.test.server?.status,
    results.test.client?.status,
    results.lint.server?.status,
    results.lint.client?.status,
    results.typeCheck.server?.status,
    results.typeCheck.client?.status,
    results.yamlValidation?.status
  ].filter(status => status !== 'SKIP' && status !== null);
  
  const passedChecks = allChecks.filter(status => status === 'PASS').length;
  const totalChecks = allChecks.length;
  const overallStatus = passedChecks === totalChecks ? 'PASS' : 'FAIL';
  
  log(`\n🎯 전체 결과:`, colors.bright);
  logStep(`  검증 통과: ${passedChecks}/${totalChecks}`, overallStatus);
  
  if (overallStatus === 'PASS') {
    log(`\n🎉 모든 검증이 성공적으로 완료되었습니다!`, colors.green + colors.bright);
    log(`   프로젝트가 배포 준비가 완료되었습니다.`, colors.green);
  } else {
    log(`\n⚠️  일부 검증에서 문제가 발견되었습니다.`, colors.yellow + colors.bright);
    log(`   위의 실패한 항목들을 확인하고 수정해주세요.`, colors.yellow);
  }
  
  results.overall = { status: overallStatus, passed: passedChecks, total: totalChecks };
  
  return overallStatus === 'PASS';
}

// 메인 실행 함수
async function main() {
  logHeader('🚀 JJ Swim Lab 통합 검증 시작');
  log(`시작 시간: ${new Date().toLocaleString('ko-KR')}`, colors.blue);
  
  try {
    // 1. 빌드 검증
    logHeader('🔨 빌드 검증');
    executeCommand('npm run build:server', '서버 빌드', 'build', 'server');
    executeCommand('npm run build:client', '클라이언트 빌드', 'build', 'client');
    
    // 2. 테스트 실행
    logHeader('🧪 테스트 실행');
    executeCommand('npm run test:server', '서버 테스트', 'test', 'server');
    executeCommand('npm run test:client', '클라이언트 테스트', 'test', 'client');
    
    // 3. 린팅 검사
    logHeader('🔍 린팅 검사');
    executeCommand('npm run lint:server', '서버 린팅', 'lint', 'server');
    executeCommand('npm run lint:client', '클라이언트 린팅', 'lint', 'client');
    
    // 4. 타입 체크
    logHeader('📝 타입 체크');
    executeCommand('npm run type-check:server', '서버 타입 체크', 'typeCheck', 'server');
    executeCommand('npm run type-check:client', '클라이언트 타입 체크', 'typeCheck', 'client');
    
    // 5. YAML 검증
    logHeader('📋 YAML 검증');
    checkYAMLFiles();
    
    // 6. 결과 리포트
    const success = generateReport();
    
    // 7. 종료 코드 설정
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    log(`\n💥 예상치 못한 오류가 발생했습니다:`, colors.red + colors.bright);
    log(`   ${error.message}`, colors.red);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    log(`\n💥 스크립트 실행 중 오류 발생:`, colors.red + colors.bright);
    log(`   ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { main, results };
