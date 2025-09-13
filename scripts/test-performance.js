#!/usr/bin/env node

/**
 * 테스트 성능 최적화 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * - 테스트 실행 시간 측정
 * - 병렬 테스트 실행
 * - 캐시 최적화
 * - 불필요한 테스트 제거
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

// 성능 측정 함수
const measureTime = (fn, label) => {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  const duration = end - start;
  
  log.performance(`${label}: ${duration}ms`);
  return { result, duration };
};

// 병렬 실행 함수
const runParallel = async (tasks) => {
  const start = Date.now();
  
  try {
    const results = await Promise.all(tasks.map(task => task()));
    const end = Date.now();
    const duration = end - start;
    
    log.performance(`병렬 실행 완료: ${duration}ms`);
    return results;
  } catch (error) {
    log.error(`병렬 실행 실패: ${error.message}`);
    throw error;
  }
};

// 서버 테스트 최적화
const optimizeServerTests = async () => {
  log.step('서버 테스트 최적화 중...');
  
  const serverPath = path.join(__dirname, '../server');
  
  // Jest 캐시 정리
  await new Promise((resolve, reject) => {
    exec('npm run test -- --clearCache', { cwd: serverPath }, (error, stdout, stderr) => {
      if (error) {
        log.warning('캐시 정리 실패 (무시 가능)');
      } else {
        log.success('Jest 캐시 정리 완료');
      }
      resolve();
    });
  });
  
  // 병렬 테스트 실행
  const testTasks = [
    () => runCommand('npm test -- --testPathPattern="routes" --maxWorkers=2', serverPath),
    () => runCommand('npm test -- --testPathPattern="models" --maxWorkers=2', serverPath),
    () => runCommand('npm test -- --testPathPattern="middleware" --maxWorkers=2', serverPath)
  ];
  
  try {
    await runParallel(testTasks);
    log.success('서버 테스트 최적화 완료');
  } catch (error) {
    log.error(`서버 테스트 최적화 실패: ${error.message}`);
  }
};

// 클라이언트 테스트 최적화
const optimizeClientTests = async () => {
  log.step('클라이언트 테스트 최적화 중...');
  
  const clientPath = path.join(__dirname, '../client');
  
  // Next.js 캐시 정리
  await new Promise((resolve, reject) => {
    exec('npm run clean', { cwd: clientPath }, (error, stdout, stderr) => {
      if (error) {
        log.warning('Next.js 캐시 정리 실패 (무시 가능)');
      } else {
        log.success('Next.js 캐시 정리 완료');
      }
      resolve();
    });
  });
  
  // 병렬 테스트 실행
  const testTasks = [
    () => runCommand('npm test -- --testPathPattern="components" --maxWorkers=2', clientPath),
    () => runCommand('npm test -- --testPathPattern="utils" --maxWorkers=2', clientPath),
    () => runCommand('npm test -- --testPathPattern="hooks" --maxWorkers=2', clientPath)
  ];
  
  try {
    await runParallel(testTasks);
    log.success('클라이언트 테스트 최적화 완료');
  } catch (error) {
    log.error(`클라이언트 테스트 최적화 실패: ${error.message}`);
  }
};

// 명령어 실행 함수
const runCommand = (command, cwd) => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

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

// 테스트 성능 분석
const analyzePerformance = async () => {
  log.step('테스트 성능 분석 중...');
  
  const results = {
    server: { duration: 0, tests: 0, coverage: 0 },
    client: { duration: 0, tests: 0, coverage: 0 }
  };
  
  // 서버 테스트 분석
  try {
    const serverStart = Date.now();
    const serverResult = await runCommand('npm test -- --coverage --silent', path.join(__dirname, '../server'));
    const serverEnd = Date.now();
    
    results.server.duration = serverEnd - serverStart;
    
    // 테스트 수 파싱
    const testMatch = serverResult.output.match(/(\d+) passed/);
    results.server.tests = testMatch ? parseInt(testMatch[1]) : 0;
    
    // 커버리지 파싱
    const coverageMatch = serverResult.output.match(/(\d+\.?\d*)%/);
    results.server.coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
    
  } catch (error) {
    log.warning(`서버 테스트 분석 실패: ${error.message}`);
  }
  
  // 클라이언트 테스트 분석
  try {
    const clientStart = Date.now();
    const clientResult = await runCommand('npm test -- --coverage --silent', path.join(__dirname, '../client'));
    const clientEnd = Date.now();
    
    results.client.duration = clientEnd - clientStart;
    
    // 테스트 수 파싱
    const testMatch = clientResult.output.match(/(\d+) passed/);
    results.client.tests = testMatch ? parseInt(testMatch[1]) : 0;
    
    // 커버리지 파싱
    const coverageMatch = clientResult.output.match(/(\d+\.?\d*)%/);
    results.client.coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
    
  } catch (error) {
    log.warning(`클라이언트 테스트 분석 실패: ${error.message}`);
  }
  
  // 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}테스트 성능 분석 결과${colors.reset}`);
  console.log('='.repeat(60));
  
  console.log(`서버 테스트:`);
  console.log(`  실행 시간: ${results.server.duration}ms`);
  console.log(`  테스트 수: ${results.server.tests}개`);
  console.log(`  커버리지: ${results.server.coverage}%`);
  
  console.log(`클라이언트 테스트:`);
  console.log(`  실행 시간: ${results.client.duration}ms`);
  console.log(`  테스트 수: ${results.client.tests}개`);
  console.log(`  커버리지: ${results.client.coverage}%`);
  
  const totalDuration = results.server.duration + results.client.duration;
  const totalTests = results.server.tests + results.client.tests;
  const avgCoverage = (results.server.coverage + results.client.coverage) / 2;
  
  console.log('-'.repeat(60));
  console.log(`전체 실행 시간: ${totalDuration}ms`);
  console.log(`전체 테스트 수: ${totalTests}개`);
  console.log(`평균 커버리지: ${avgCoverage.toFixed(2)}%`);
  
  // 성능 권장사항
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}성능 최적화 권장사항${colors.reset}`);
  console.log('='.repeat(60));
  
  if (totalDuration > 30000) {
    log.warning('테스트 실행 시간이 30초를 초과합니다. 병렬 실행을 고려하세요.');
  }
  
  if (avgCoverage < 80) {
    log.warning('테스트 커버리지가 80% 미만입니다. 더 많은 테스트를 추가하세요.');
  }
  
  if (totalTests < 100) {
    log.warning('전체 테스트 수가 100개 미만입니다. 테스트 케이스를 늘리세요.');
  }
  
  // 최적화 제안
  console.log('\n최적화 제안:');
  console.log('1. 병렬 테스트 실행: --maxWorkers 옵션 사용');
  console.log('2. 테스트 캐시 활용: --cache 옵션 사용');
  console.log('3. 불필요한 테스트 제거: --testPathPattern 옵션 사용');
  console.log('4. 테스트 데이터 최적화: beforeEach/afterEach 최소화');
  
  return results;
};

// 메인 실행 함수
const main = async () => {
  console.log(`${colors.bright}${colors.cyan}JJ Swim Lab 테스트 성능 최적화${colors.reset}\n`);
  
  try {
    // 1. 성능 분석
    await analyzePerformance();
    
    // 2. 서버 테스트 최적화
    await optimizeServerTests();
    
    // 3. 클라이언트 테스트 최적화
    await optimizeClientTests();
    
    // 4. 최종 성능 분석
    log.step('최적화 후 성능 재측정 중...');
    await analyzePerformance();
    
    console.log(`\n${colors.bright}${colors.green}🎉 테스트 성능 최적화 완료!${colors.reset}`);
    
  } catch (error) {
    log.error(`성능 최적화 중 오류 발생: ${error.message}`);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, analyzePerformance, optimizeServerTests, optimizeClientTests };

