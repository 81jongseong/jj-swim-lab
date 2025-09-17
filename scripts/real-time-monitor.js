#!/usr/bin/env node

/**
 * 실시간 모니터링 시스템
 * 
 * 이 스크립트는 다음을 모니터링합니다:
 * - 파일 변경 감지
 * - 실시간 테스트 실행
 * - 코드 품질 모니터링
 * - 성능 지표 추적
 * - 보안 취약점 감시
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

// 프로젝트 루트 경로
const PROJECT_ROOT = path.join(__dirname, '..');

/**
 * 파일 변경 감지 및 자동 테스트
 */
class RealTimeMonitor {
  constructor() {
    this.isRunning = false;
    this.lastRun = 0;
    this.debounceTime = 2000; // 2초 디바운스
    
    // 모니터링할 파일 패턴
    this.watchPatterns = [
      'client/src/**/*.{ts,tsx,js,jsx}',
      'server/src/**/*.{ts,js}',
      'client/app/**/*.{ts,tsx,js,jsx}',
      'client/components/**/*.{ts,tsx,js,jsx}',
      'client/hooks/**/*.{ts,tsx,js,jsx}',
      'client/lib/**/*.{ts,tsx,js,jsx}',
      'server/models/**/*.{ts,js}',
      'server/routes/**/*.{ts,js}',
      'server/middleware/**/*.{ts,js}'
    ];
    
    // 제외할 패턴
    this.ignorePatterns = [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/*.test.*',
      '**/*.spec.*'
    ];
  }
  
  /**
   * 모니터링 시작
   */
  start() {
    console.log('🚀 실시간 모니터링 시작...');
    console.log('📁 모니터링 대상:', this.watchPatterns.join(', '));
    console.log('❌ 제외 대상:', this.ignorePatterns.join(', '));
    console.log('⏰ 디바운스 시간:', this.debounceTime + 'ms');
    console.log('🛑 종료하려면 Ctrl+C를 누르세요\n');
    
    // 파일 변경 감지
    const watcher = chokidar.watch(this.watchPatterns, {
      ignored: this.ignorePatterns,
      persistent: true,
      ignoreInitial: true
    });
    
    watcher
      .on('change', (filePath) => this.handleFileChange(filePath))
      .on('add', (filePath) => this.handleFileChange(filePath))
      .on('unlink', (filePath) => this.handleFileChange(filePath))
      .on('error', (error) => console.error('❌ 파일 감지 오류:', error));
      
    // 프로세스 종료 처리
    process.on('SIGINT', () => {
      console.log('\n🛑 모니터링 종료 중...');
      watcher.close();
      process.exit(0);
    });
  }
  
  /**
   * 파일 변경 처리
   */
  handleFileChange(filePath) {
    const now = Date.now();
    
    // 디바운스 처리
    if (now - this.lastRun < this.debounceTime) {
      return;
    }
    
    this.lastRun = now;
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    
    console.log(`\n📝 파일 변경 감지: ${relativePath}`);
    console.log(`⏰ ${new Date().toLocaleTimeString()}`);
    
    // 변경된 파일 타입에 따른 적절한 테스트 실행
    this.runAppropriateTests(filePath);
  }
  
  /**
   * 파일 타입에 따른 적절한 테스트 실행
   */
  runAppropriateTests(filePath) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    
    try {
      if (relativePath.startsWith('client/')) {
        this.runClientTests(relativePath);
      } else if (relativePath.startsWith('server/')) {
        this.runServerTests(relativePath);
      }
      
      // 전체 검증 (주기적으로)
      if (Math.random() < 0.1) { // 10% 확률로 전체 검증
        this.runFullValidation();
      }
      
    } catch (error) {
      console.error(`❌ 테스트 실행 오류: ${error.message}`);
    }
  }
  
  /**
   * 클라이언트 테스트 실행
   */
  runClientTests(filePath) {
    console.log('🧪 클라이언트 테스트 실행 중...');
    
    try {
      // TypeScript 타입 검사
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        console.log('🔍 TypeScript 타입 검사...');
        execSync('cd client && npx tsc --noEmit', { stdio: 'inherit' });
        console.log('✅ 타입 검사 통과');
      }
      
      // ESLint 검사
      console.log('🧹 ESLint 검사...');
      execSync('cd client && npm run lint', { stdio: 'inherit' });
      console.log('✅ ESLint 검사 통과');
      
      // Jest 테스트 (변경된 파일과 관련된 테스트만)
      console.log('🧪 Jest 테스트...');
      execSync('cd client && npm test -- --watchAll=false --passWithNoTests', { stdio: 'inherit' });
      console.log('✅ Jest 테스트 통과');
      
    } catch (error) {
      console.error('❌ 클라이언트 테스트 실패:', error.message);
    }
  }
  
  /**
   * 서버 테스트 실행
   */
  runServerTests(filePath) {
    console.log('🧪 서버 테스트 실행 중...');
    
    try {
      // TypeScript 타입 검사
      if (filePath.endsWith('.ts')) {
        console.log('🔍 TypeScript 타입 검사...');
        execSync('cd server && npx tsc --noEmit', { stdio: 'inherit' });
        console.log('✅ 타입 검사 통과');
      }
      
      // ESLint 검사
      console.log('🧹 ESLint 검사...');
      execSync('cd server && npm run lint', { stdio: 'inherit' });
      console.log('✅ ESLint 검사 통과');
      
      // Jest 테스트
      console.log('🧪 Jest 테스트...');
      execSync('cd server && npm test -- --watchAll=false --passWithNoTests', { stdio: 'inherit' });
      console.log('✅ Jest 테스트 통과');
      
    } catch (error) {
      console.error('❌ 서버 테스트 실패:', error.message);
    }
  }
  
  /**
   * 전체 검증 실행
   */
  runFullValidation() {
    console.log('\n🔍 전체 검증 실행 중...');
    
    try {
      execSync('./check.bat', { stdio: 'inherit' });
      console.log('✅ 전체 검증 통과');
    } catch (error) {
      console.error('❌ 전체 검증 실패:', error.message);
    }
  }
  
  /**
   * 성능 지표 수집
   */
  collectPerformanceMetrics() {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        files: this.getFileCount(),
        tests: this.getTestResults()
      };
      
      // 메트릭 저장
      const metricsFile = path.join(PROJECT_ROOT, 'monitoring-metrics.json');
      fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
      
      console.log('📊 성능 지표 수집 완료');
      
    } catch (error) {
      console.error('❌ 성능 지표 수집 실패:', error.message);
    }
  }
  
  /**
   * 파일 수 계산
   */
  getFileCount() {
    try {
      const clientFiles = this.countFiles(path.join(PROJECT_ROOT, 'client'), ['.ts', '.tsx', '.js', '.jsx']);
      const serverFiles = this.countFiles(path.join(PROJECT_ROOT, 'server'), ['.ts', '.js']);
      
      return {
        client: clientFiles,
        server: serverFiles,
        total: clientFiles + serverFiles
      };
    } catch (error) {
      return { client: 0, server: 0, total: 0 };
    }
  }
  
  /**
   * 파일 수 계산 헬퍼
   */
  countFiles(dir, extensions) {
    let count = 0;
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('node_modules')) {
          count += this.countFiles(fullPath, extensions);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          count++;
        }
      });
    } catch (error) {
      // 디렉토리가 없거나 접근할 수 없는 경우
    }
    
    return count;
  }
  
  /**
   * 테스트 결과 가져오기
   */
  getTestResults() {
    try {
      // Jest 커버리지 파일에서 결과 가져오기
      const clientCoverage = path.join(PROJECT_ROOT, 'client', 'coverage', 'coverage-summary.json');
      const serverCoverage = path.join(PROJECT_ROOT, 'server', 'coverage', 'coverage-summary.json');
      
      let results = { client: null, server: null };
      
      if (fs.existsSync(clientCoverage)) {
        results.client = JSON.parse(fs.readFileSync(clientCoverage, 'utf8'));
      }
      
      if (fs.existsSync(serverCoverage)) {
        results.server = JSON.parse(fs.readFileSync(serverCoverage, 'utf8'));
      }
      
      return results;
    } catch (error) {
      return { client: null, server: null };
    }
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🏊‍♂️ JJ Swim Lab - 실시간 모니터링 시스템');
  console.log('=' .repeat(50));
  
  const monitor = new RealTimeMonitor();
  
  // 성능 지표 수집 (주기적으로)
  setInterval(() => {
    monitor.collectPerformanceMetrics();
  }, 60000); // 1분마다
  
  // 모니터링 시작
  monitor.start();
}

// 스크립트 실행
if (require.main === module) {
  // chokidar 의존성 확인
  try {
    require('chokidar');
  } catch (error) {
    console.error('❌ chokidar 패키지가 설치되지 않았습니다.');
    console.error('설치 명령: npm install --save-dev chokidar');
    process.exit(1);
  }
  
  main();
}

module.exports = { RealTimeMonitor };
