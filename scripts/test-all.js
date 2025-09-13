#!/usr/bin/env node

/**
 * 통합 테스트 실행 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * - 서버와 클라이언트를 동시에 시작
 * - 모든 테스트를 순차적으로 실행
 * - 테스트 결과를 통합하여 보고
 * - 테스트 환경 정리
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// 로그 함수
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
};

// 설정
const config = {
  serverPort: 5000,
  clientPort: 3000,
  timeout: 30000, // 30초
  testTimeout: 300000 // 5분
};

// 프로세스 관리
let serverProcess = null;
let clientProcess = null;
let testResults = {
  server: { passed: 0, failed: 0, total: 0 },
  client: { passed: 0, failed: 0, total: 0 },
  e2e: { passed: 0, failed: 0, total: 0 },
  integration: { passed: 0, failed: 0, total: 0 }
};

// 유틸리티 함수들
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForServer = async (url, timeout = config.timeout) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // 서버가 아직 시작되지 않음
    }
    await sleep(1000);
  }
  
  return false;
};

const runCommand = (command, cwd, options = {}) => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd,
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options
    });

    let output = '';
    let errorOutput = '';

    if (options.silent) {
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ output, errorOutput });
      } else {
        reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
      }
    });

    child.on('error', reject);
  });
};

// 서버 시작
const startServer = async () => {
  log.step('서버 시작 중...');
  
  try {
    // 서버 빌드
    await runCommand('npm run build', path.join(__dirname, '../server'));
    
    // 서버 시작
    serverProcess = spawn('npm', ['run', 'start:test'], {
      cwd: path.join(__dirname, '../server'),
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: config.serverPort,
        MONGODB_URI: 'mongodb://localhost:27017/jj-swim-lab-test',
        JWT_SECRET: 'test-jwt-secret-key',
        REDIS_URL: 'redis://localhost:6379/1'
      }
    });

    // 서버 로그 출력
    serverProcess.stdout?.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`${colors.magenta}[SERVER]${colors.reset} ${message}`);
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`${colors.red}[SERVER ERROR]${colors.reset} ${message}`);
      }
    });

    // 서버 시작 대기
    const serverReady = await waitForServer(`http://localhost:${config.serverPort}/api/health`);
    if (serverReady) {
      log.success('서버가 성공적으로 시작되었습니다');
      return true;
    } else {
      log.error('서버 시작 실패');
      return false;
    }
  } catch (error) {
    log.error(`서버 시작 오류: ${error.message}`);
    return false;
  }
};

// 클라이언트 시작
const startClient = async () => {
  log.step('클라이언트 시작 중...');
  
  try {
    // 클라이언트 빌드
    await runCommand('npm run build', path.join(__dirname, '../client'));
    
    // 클라이언트 시작
    clientProcess = spawn('npm', ['run', 'start:test'], {
      cwd: path.join(__dirname, '../client'),
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: config.clientPort,
        NEXT_PUBLIC_API_URL: `http://localhost:${config.serverPort}`
      }
    });

    // 클라이언트 로그 출력
    clientProcess.stdout?.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`${colors.cyan}[CLIENT]${colors.reset} ${message}`);
      }
    });

    clientProcess.stderr?.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`${colors.red}[CLIENT ERROR]${colors.reset} ${message}`);
      }
    });

    // 클라이언트 시작 대기
    const clientReady = await waitForServer(`http://localhost:${config.clientPort}`);
    if (clientReady) {
      log.success('클라이언트가 성공적으로 시작되었습니다');
      return true;
    } else {
      log.error('클라이언트 시작 실패');
      return false;
    }
  } catch (error) {
    log.error(`클라이언트 시작 오류: ${error.message}`);
    return false;
  }
};

// 서버 테스트 실행
const runServerTests = async () => {
  log.step('서버 테스트 실행 중...');
  
  try {
    const result = await runCommand('npm test', path.join(__dirname, '../server'), { silent: true });
    
    // Jest 결과 파싱 (간단한 버전)
    const output = result.output;
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    testResults.server.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    testResults.server.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    testResults.server.total = testResults.server.passed + testResults.server.failed;
    
    if (testResults.server.failed === 0) {
      log.success(`서버 테스트 통과: ${testResults.server.passed}개`);
    } else {
      log.error(`서버 테스트 실패: ${testResults.server.failed}개 실패`);
    }
    
    return testResults.server.failed === 0;
  } catch (error) {
    log.error(`서버 테스트 실행 오류: ${error.message}`);
    return false;
  }
};

// 클라이언트 테스트 실행
const runClientTests = async () => {
  log.step('클라이언트 테스트 실행 중...');
  
  try {
    const result = await runCommand('npm test -- --watchAll=false', path.join(__dirname, '../client'), { silent: true });
    
    // Jest 결과 파싱
    const output = result.output;
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    testResults.client.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    testResults.client.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    testResults.client.total = testResults.client.passed + testResults.client.failed;
    
    if (testResults.client.failed === 0) {
      log.success(`클라이언트 테스트 통과: ${testResults.client.passed}개`);
    } else {
      log.error(`클라이언트 테스트 실패: ${testResults.client.failed}개 실패`);
    }
    
    return testResults.client.failed === 0;
  } catch (error) {
    log.error(`클라이언트 테스트 실행 오류: ${error.message}`);
    return false;
  }
};

// E2E 테스트 실행
const runE2ETests = async () => {
  log.step('E2E 테스트 실행 중...');
  
  try {
    const result = await runCommand('npm run test:e2e', path.join(__dirname, '../client'), { silent: true });
    
    // Playwright 결과 파싱
    const output = result.output;
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    testResults.e2e.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    testResults.e2e.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    testResults.e2e.total = testResults.e2e.passed + testResults.e2e.failed;
    
    if (testResults.e2e.failed === 0) {
      log.success(`E2E 테스트 통과: ${testResults.e2e.passed}개`);
    } else {
      log.error(`E2E 테스트 실패: ${testResults.e2e.failed}개 실패`);
    }
    
    return testResults.e2e.failed === 0;
  } catch (error) {
    log.error(`E2E 테스트 실행 오류: ${error.message}`);
    return false;
  }
};

// 통합 테스트 실행
const runIntegrationTests = async () => {
  log.step('통합 테스트 실행 중...');
  
  try {
    const result = await runCommand('npm run test:integration', path.join(__dirname, '../client'), { silent: true });
    
    // Playwright 결과 파싱
    const output = result.output;
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    testResults.integration.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    testResults.integration.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    testResults.integration.total = testResults.integration.passed + testResults.integration.failed;
    
    if (testResults.integration.failed === 0) {
      log.success(`통합 테스트 통과: ${testResults.integration.passed}개`);
    } else {
      log.error(`통합 테스트 실패: ${testResults.integration.failed}개 실패`);
    }
    
    return testResults.integration.failed === 0;
  } catch (error) {
    log.error(`통합 테스트 실행 오류: ${error.message}`);
    return false;
  }
};

// 프로세스 정리
const cleanup = async () => {
  log.step('프로세스 정리 중...');
  
  if (serverProcess) {
    serverProcess.kill();
    log.info('서버 프로세스 종료');
  }
  
  if (clientProcess) {
    clientProcess.kill();
    log.info('클라이언트 프로세스 종료');
  }
  
  // 프로세스 완전 종료 대기
  await sleep(2000);
};

// 결과 보고
const reportResults = () => {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}테스트 결과 요약${colors.reset}`);
  console.log('='.repeat(60));
  
  const totalPassed = testResults.server.passed + testResults.client.passed + 
                     testResults.e2e.passed + testResults.integration.passed;
  const totalFailed = testResults.server.failed + testResults.client.failed + 
                     testResults.e2e.failed + testResults.integration.failed;
  const totalTests = totalPassed + totalFailed;
  
  console.log(`서버 테스트:     ${colors.green}${testResults.server.passed}${colors.reset}/${colors.red}${testResults.server.failed}${colors.reset} (총 ${testResults.server.total})`);
  console.log(`클라이언트 테스트: ${colors.green}${testResults.client.passed}${colors.reset}/${colors.red}${testResults.client.failed}${colors.reset} (총 ${testResults.client.total})`);
  console.log(`E2E 테스트:       ${colors.green}${testResults.e2e.passed}${colors.reset}/${colors.red}${testResults.e2e.failed}${colors.reset} (총 ${testResults.e2e.total})`);
  console.log(`통합 테스트:      ${colors.green}${testResults.integration.passed}${colors.reset}/${colors.red}${testResults.integration.failed}${colors.reset} (총 ${testResults.integration.total})`);
  console.log('-'.repeat(60));
  console.log(`전체 결과:        ${colors.green}${totalPassed}${colors.reset}/${colors.red}${totalFailed}${colors.reset} (총 ${totalTests})`);
  
  if (totalFailed === 0) {
    console.log(`\n${colors.bright}${colors.green}🎉 모든 테스트가 통과했습니다!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bright}${colors.red}❌ ${totalFailed}개의 테스트가 실패했습니다.${colors.reset}`);
    process.exit(1);
  }
};

// 메인 실행 함수
const main = async () => {
  console.log(`${colors.bright}${colors.cyan}JJ Swim Lab 통합 테스트 시작${colors.reset}\n`);
  
  try {
    // 1. 서버 시작
    const serverStarted = await startServer();
    if (!serverStarted) {
      throw new Error('서버 시작 실패');
    }
    
    // 2. 클라이언트 시작
    const clientStarted = await startClient();
    if (!clientStarted) {
      throw new Error('클라이언트 시작 실패');
    }
    
    // 3. 서버 테스트 실행
    await runServerTests();
    
    // 4. 클라이언트 테스트 실행
    await runClientTests();
    
    // 5. E2E 테스트 실행
    await runE2ETests();
    
    // 6. 통합 테스트 실행
    await runIntegrationTests();
    
  } catch (error) {
    log.error(`테스트 실행 중 오류 발생: ${error.message}`);
    process.exit(1);
  } finally {
    // 7. 정리
    await cleanup();
    
    // 8. 결과 보고
    reportResults();
  }
};

// 신호 처리
process.on('SIGINT', async () => {
  log.warning('테스트가 중단되었습니다. 정리 중...');
  await cleanup();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  log.warning('테스트가 종료되었습니다. 정리 중...');
  await cleanup();
  process.exit(1);
});

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, config, testResults };

