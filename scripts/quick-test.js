#!/usr/bin/env node

/**
 * 빠른 테스트 실행 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * - 서버와 클라이언트 테스트를 순차적으로 실행
 * - 환경 설정 없이 빠른 테스트 실행
 * - 간단한 결과 보고
 */

const { spawn } = require('child_process');
const path = require('path');

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

// 로그 함수
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
  performance: (msg) => console.log(`${colors.magenta}⚡${colors.reset} ${msg}`)
};

// 명령어 실행 함수
const runCommand = (command, cwd) => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
};

// 메인 실행 함수
const main = async () => {
  console.log(`${colors.bright}${colors.cyan}JJ Swim Lab 빠른 테스트 시작${colors.reset}\n`);
  
  const startTime = Date.now();
  const results = { server: { passed: 0, failed: 0 }, client: { passed: 0, failed: 0 } };
  
  try {
    // 1. 서버 테스트
    log.step('서버 테스트 실행 중...');
    const serverStart = Date.now();
    
    try {
      await runCommand('npm test', path.join(__dirname, '../server'));
      log.success('서버 테스트 완료');
      results.server.passed = 1;
    } catch (error) {
      log.warning(`서버 테스트 일부 실패: ${error.message}`);
      results.server.failed = 1;
    }
    
    const serverDuration = Date.now() - serverStart;
    log.performance(`서버 테스트 실행 시간: ${serverDuration}ms`);
    
    // 2. 클라이언트 테스트
    log.step('클라이언트 테스트 실행 중...');
    const clientStart = Date.now();
    
    try {
      await runCommand('npm test -- --watchAll=false', path.join(__dirname, '../client'));
      log.success('클라이언트 테스트 완료');
      results.client.passed = 1;
    } catch (error) {
      log.warning(`클라이언트 테스트 일부 실패: ${error.message}`);
      results.client.failed = 1;
    }
    
    const clientDuration = Date.now() - clientStart;
    log.performance(`클라이언트 테스트 실행 시간: ${clientDuration}ms`);
    
    // 결과 요약
    const totalDuration = Date.now() - startTime;
    const totalPassed = results.server.passed + results.client.passed;
    const totalFailed = results.server.failed + results.client.failed;
    
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.bright}테스트 결과 요약${colors.reset}`);
    console.log('='.repeat(50));
    console.log(`서버 테스트: ${colors.green}${results.server.passed}${colors.reset}/${colors.red}${results.server.failed}${colors.reset}`);
    console.log(`클라이언트 테스트: ${colors.green}${results.client.passed}${colors.reset}/${colors.red}${results.client.failed}${colors.reset}`);
    console.log(`전체 실행 시간: ${totalDuration}ms`);
    console.log('-'.repeat(50));
    
    if (totalFailed === 0) {
      console.log(`\n${colors.bright}${colors.green}🎉 모든 테스트가 성공적으로 완료되었습니다!${colors.reset}`);
    } else {
      console.log(`\n${colors.bright}${colors.yellow}⚠️ 일부 테스트가 실패했지만 계속 진행됩니다.${colors.reset}`);
      console.log(`${colors.cyan}💡 자세한 내용은 위의 로그를 확인하세요.${colors.reset}`);
    }
    
  } catch (error) {
    log.error(`테스트 실행 중 치명적 오류 발생: ${error.message}`);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main };
