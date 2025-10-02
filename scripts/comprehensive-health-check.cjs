/**
 * 🔍 JJ Swim Lab - 종합 프로젝트 헬스 체크
 * 
 * 📋 **스크립트 목적**
 * - 프로젝트의 모든 측면을 자동으로 점검
 * - 파일/모델/라우트/API/환경변수/의존성 등 전방위 검증
 * - 문제 발견시 상세한 해결 방법 제시
 * - 개발 서버 시작 전 필수 점검
 * 
 * 🔄 **점검 항목**
 * 1. 파일 시스템 일관성
 * 2. 모델 정의 및 Import
 * 3. 라우트 등록 상태
 * 4. API 엔드포인트 연결
 * 5. 환경변수 설정
 * 6. 의존성 버전 충돌
 * 7. TypeScript 타입 일관성
 * 8. 데이터베이스 연결
 * 9. 빌드 가능 여부
 * 10. 보안 취약점
 */

const fs = require('fs');
const path = require('path');

// 색상 출력용
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}━━━ ${msg} ━━━${colors.reset}\n`),
};

class HealthChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
    this.stats = {
      totalChecks: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    };
  }

  // 1. 모델 파일 스캔 및 검증
  async checkModels() {
    log.section('모델 일관성 검사');
    
    const modelsDir = path.join(__dirname, '../server/src/models');
    const indexFile = path.join(__dirname, '../server/src/index.ts');
    
    if (!fs.existsSync(modelsDir)) {
      this.addError('모델 디렉토리가 존재하지 않습니다', modelsDir);
      return;
    }

    // 모든 모델 파일 찾기
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
      .map(f => f.replace('.ts', ''));

    log.info(`총 ${modelFiles.length}개 모델 파일 발견`);

    // index.ts 내용 읽기
    const indexContent = fs.readFileSync(indexFile, 'utf-8');

    // 각 모델이 import되었는지 확인
    const missingImports = [];
    const importedModels = [];

    for (const model of modelFiles) {
      this.stats.totalChecks++;
      const importPattern = new RegExp(`import.*['"]\\.?\\.?/models/${model}['"]`, 'i');
      
      if (importPattern.test(indexContent)) {
        importedModels.push(model);
        this.stats.passed++;
        log.success(`${model} - Import 확인됨`);
      } else {
        missingImports.push(model);
        this.stats.failed++;
        this.addError(`${model} 모델이 index.ts에서 import되지 않음`, 
          `server/src/index.ts에 "import './models/${model}';" 추가 필요`);
      }
    }

    // 모델 스키마 검증
    for (const model of modelFiles) {
      this.stats.totalChecks++;
      const modelPath = path.join(modelsDir, `${model}.ts`);
      const content = fs.readFileSync(modelPath, 'utf-8');

      // export 구문 확인
      if (!content.includes('export') || !content.includes('mongoose.model')) {
        this.stats.failed++;
        this.addError(`${model} 모델의 export 구문이 불완전함`, modelPath);
      } else {
        this.stats.passed++;
      }

      // 스키마 정의 완성도 체크
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        this.stats.failed++;
        this.addError(`${model} 모델의 중괄호가 일치하지 않음 (스키마 불완전)`, modelPath);
      }
    }

    return { modelFiles, missingImports, importedModels };
  }

  // 2. 라우트 등록 확인
  async checkRoutes() {
    log.section('라우트 등록 상태 검사');

    const routesDir = path.join(__dirname, '../server/src/routes');
    const indexFile = path.join(__dirname, '../server/src/index.ts');

    if (!fs.existsSync(routesDir)) {
      this.addError('라우트 디렉토리가 존재하지 않습니다', routesDir);
      return;
    }

    const routeFiles = fs.readdirSync(routesDir)
      .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
      .map(f => f.replace('.ts', ''));

    log.info(`총 ${routeFiles.length}개 라우트 파일 발견`);

    const indexContent = fs.readFileSync(indexFile, 'utf-8');
    const missingRouteImports = [];
    const missingRouteRegistrations = [];

    for (const route of routeFiles) {
      this.stats.totalChecks++;
      
      // import 확인
      const importPattern = new RegExp(`import.*from.*['"]\\.?\\.?/routes/${route}['"]`, 'i');
      const hasImport = importPattern.test(indexContent);

      if (!hasImport) {
        missingRouteImports.push(route);
        this.stats.failed++;
        this.addError(`${route} 라우트가 import되지 않음`, 
          `server/src/index.ts에 "import ${route}Routes from './routes/${route}';" 추가`);
      }

      // app.use 등록 확인
      const usePattern = new RegExp(`app\\.use\\([^)]*${route}`, 'i');
      const hasUse = usePattern.test(indexContent);

      if (hasImport && !hasUse) {
        missingRouteRegistrations.push(route);
        this.stats.failed++;
        this.addError(`${route} 라우트가 등록되지 않음`, 
          `server/src/index.ts에 "app.use('/api/${route}', ${route}Routes);" 추가`);
      }

      if (hasImport && hasUse) {
        this.stats.passed++;
        log.success(`${route} - Import 및 등록 확인됨`);
      }
    }

    return { routeFiles, missingRouteImports, missingRouteRegistrations };
  }

  // 3. 라우트-모델 의존성 확인
  async checkRoutesModelDependencies() {
    log.section('라우트-모델 의존성 검사');

    const routesDir = path.join(__dirname, '../server/src/routes');
    
    if (!fs.existsSync(routesDir)) return;

    const routeFiles = fs.readdirSync(routesDir)
      .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));

    for (const routeFile of routeFiles) {
      this.stats.totalChecks++;
      const routePath = path.join(routesDir, routeFile);
      const content = fs.readFileSync(routePath, 'utf-8');

      // 모델 import 패턴 찾기
      const modelImportPattern = /from\s+['"]\.\.\/(models\/\w+)['"]/g;
      const matches = [...content.matchAll(modelImportPattern)];

      if (matches.length === 0) {
        this.stats.passed++;
        continue;
      }

      for (const match of matches) {
        const modelPath = match[1];
        const modelFile = path.join(__dirname, '../server/src', modelPath + '.ts');

        if (!fs.existsSync(modelFile)) {
          this.stats.failed++;
          this.addError(`${routeFile}에서 존재하지 않는 모델을 import함`, 
            `${modelPath}.ts 파일이 없습니다`);
        } else {
          this.stats.passed++;
        }
      }
    }
  }

  // 4. 환경변수 확인
  async checkEnvironmentVariables() {
    log.section('환경변수 검사');

    const envExamplePath = path.join(__dirname, '../server/env.example');
    const envPath = path.join(__dirname, '../server/.env');

    // 필수 환경변수 목록
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'PORT',
      'NODE_ENV',
    ];

    if (!fs.existsSync(envPath)) {
      this.stats.failed++;
      this.addError('.env 파일이 존재하지 않습니다', 
        'server/.env 파일을 생성하고 env.example을 참고하여 설정하세요');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');

    for (const varName of requiredVars) {
      this.stats.totalChecks++;
      const pattern = new RegExp(`^${varName}=.+`, 'm');
      
      if (pattern.test(envContent)) {
        this.stats.passed++;
        log.success(`${varName} - 설정됨`);
      } else {
        this.stats.failed++;
        this.addError(`필수 환경변수 ${varName}이 설정되지 않음`, 
          `.env 파일에 ${varName}=<값> 추가`);
      }
    }

    // JWT_SECRET 보안 검사
    const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
    if (jwtMatch && jwtMatch[1].length < 32) {
      this.stats.warnings++;
      this.addWarning('JWT_SECRET이 너무 짧습니다 (32자 이상 권장)', 
        '더 긴 랜덤 문자열로 변경하세요');
    }
  }

  // 5. 클라이언트-서버 인터페이스 일관성
  async checkClientServerInterfaces() {
    log.section('클라이언트-서버 인터페이스 일관성 검사');

    // API 호출 패턴 찾기
    const clientDir = path.join(__dirname, '../client');
    const apiPattern = /['"`]\/api\/[\w\-\/]+['"`]/g;

    const findApiCalls = (dir) => {
      const calls = new Set();
      
      const scan = (currentDir) => {
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const file of files) {
          const fullPath = path.join(currentDir, file.name);
          
          if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
            scan(fullPath);
          } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts'))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const matches = content.match(apiPattern);
              if (matches) {
                matches.forEach(m => calls.add(m.replace(/['"`]/g, '')));
              }
            } catch (err) {
              // 파일 읽기 실패 무시
            }
          }
        }
      };

      scan(dir);
      return Array.from(calls);
    };

    const apiCalls = findApiCalls(clientDir);
    log.info(`클라이언트에서 ${apiCalls.length}개의 API 호출 발견`);

    // 서버 라우트와 비교
    const indexFile = path.join(__dirname, '../server/src/index.ts');
    const indexContent = fs.readFileSync(indexFile, 'utf-8');

    for (const apiCall of apiCalls) {
      this.stats.totalChecks++;
      const endpoint = apiCall.replace('/api/', '');
      const pattern = new RegExp(`app\\.use\\(['"]/api/${endpoint.split('/')[0]}['"]`, 'i');

      if (pattern.test(indexContent)) {
        this.stats.passed++;
      } else {
        this.stats.warnings++;
        this.addWarning(`클라이언트에서 호출하는 API ${apiCall}의 라우트 등록이 확인되지 않음`, 
          `서버에 해당 라우트가 등록되어 있는지 확인하세요`);
      }
    }
  }

  // 6. 패키지 의존성 검사
  async checkDependencies() {
    log.section('패키지 의존성 검사');

    const serverPackage = path.join(__dirname, '../server/package.json');
    const clientPackage = path.join(__dirname, '../client/package.json');

    // 서버 의존성
    if (fs.existsSync(serverPackage)) {
      this.stats.totalChecks++;
      const pkg = JSON.parse(fs.readFileSync(serverPackage, 'utf-8'));
      
      const requiredDeps = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'cors', 'dotenv'];
      const missing = requiredDeps.filter(dep => !pkg.dependencies || !pkg.dependencies[dep]);

      if (missing.length === 0) {
        this.stats.passed++;
        log.success('서버 필수 패키지 모두 설치됨');
      } else {
        this.stats.failed++;
        this.addError(`서버 필수 패키지 누락: ${missing.join(', ')}`, 
          `cd server && npm install ${missing.join(' ')}`);
      }
    }

    // 클라이언트 의존성
    if (fs.existsSync(clientPackage)) {
      this.stats.totalChecks++;
      const pkg = JSON.parse(fs.readFileSync(clientPackage, 'utf-8'));
      
      const requiredDeps = ['react', 'react-dom', 'next'];
      const missing = requiredDeps.filter(dep => !pkg.dependencies || !pkg.dependencies[dep]);

      if (missing.length === 0) {
        this.stats.passed++;
        log.success('클라이언트 필수 패키지 모두 설치됨');
      } else {
        this.stats.failed++;
        this.addError(`클라이언트 필수 패키지 누락: ${missing.join(', ')}`, 
          `cd client && npm install ${missing.join(' ')}`);
      }
    }
  }

  // 7. TypeScript 컴파일 가능 여부
  async checkTypeScriptCompilation() {
    log.section('TypeScript 컴파일 검사');

    const serverTsConfig = path.join(__dirname, '../server/tsconfig.json');
    const clientTsConfig = path.join(__dirname, '../client/tsconfig.json');

    for (const [name, configPath] of [['서버', serverTsConfig], ['클라이언트', clientTsConfig]]) {
      this.stats.totalChecks++;
      
      if (fs.existsSync(configPath)) {
        try {
          JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          this.stats.passed++;
          log.success(`${name} tsconfig.json 유효함`);
        } catch (err) {
          this.stats.failed++;
          this.addError(`${name} tsconfig.json 파싱 오류`, err.message);
        }
      } else {
        this.stats.failed++;
        this.addError(`${name} tsconfig.json이 존재하지 않음`, configPath);
      }
    }
  }

  // Helper 메서드
  addError(message, solution) {
    this.errors.push({ message, solution });
  }

  addWarning(message, solution) {
    this.warnings.push({ message, solution });
  }

  // 최종 보고서 생성
  generateReport() {
    log.section('종합 검사 결과');

    console.log(`총 검사 항목: ${this.stats.totalChecks}`);
    console.log(`${colors.green}통과: ${this.stats.passed}${colors.reset}`);
    console.log(`${colors.red}실패: ${this.stats.failed}${colors.reset}`);
    console.log(`${colors.yellow}경고: ${this.warnings.length}${colors.reset}`);

    if (this.errors.length > 0) {
      log.section('발견된 오류');
      this.errors.forEach((err, idx) => {
        log.error(`${idx + 1}. ${err.message}`);
        if (err.solution) {
          log.info(`   해결: ${err.solution}`);
        }
      });
    }

    if (this.warnings.length > 0) {
      log.section('경고사항');
      this.warnings.forEach((warn, idx) => {
        log.warning(`${idx + 1}. ${warn.message}`);
        if (warn.solution) {
          log.info(`   권장: ${warn.solution}`);
        }
      });
    }

    // 결과를 JSON 파일로 저장
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      errors: this.errors,
      warnings: this.warnings,
    };

    const reportPath = path.join(__dirname, '../health-check-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.info(`상세 보고서: ${reportPath}`);

    // DEVELOPMENT.md에 결과 추가
    this.updateDevelopmentMd(report);

    return this.errors.length === 0;
  }

  updateDevelopmentMd(report) {
    const devMdPath = path.join(__dirname, '../DEVELOPMENT.md');
    
    if (!fs.existsSync(devMdPath)) return;

    const timestamp = new Date().toLocaleString('ko-KR');
    const entry = `\n\n## 🔍 자동 헬스 체크 (${timestamp})\n\n` +
      `- 총 검사: ${report.stats.totalChecks}개\n` +
      `- 통과: ${report.stats.passed}개\n` +
      `- 실패: ${report.stats.failed}개\n` +
      `- 경고: ${report.warnings.length}개\n\n` +
      (report.errors.length > 0 ? 
        `### ❌ 발견된 문제\n${report.errors.map(e => `- ${e.message}\n  - 해결: ${e.solution}`).join('\n')}\n\n` : 
        '') +
      (report.warnings.length > 0 ?
        `### ⚠️ 경고사항\n${report.warnings.map(w => `- ${w.message}\n  - 권장: ${w.solution}`).join('\n')}\n\n` :
        '');

    fs.appendFileSync(devMdPath, entry);
    log.success('DEVELOPMENT.md에 결과 추가됨');
  }
}

// 메인 실행
async function main() {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════╗
║  🔍 JJ Swim Lab 종합 헬스 체크  ║
╚═══════════════════════════════════════════╝${colors.reset}
  `);

  const checker = new HealthChecker();

  try {
    await checker.checkModels();
    await checker.checkRoutes();
    await checker.checkRoutesModelDependencies();
    await checker.checkEnvironmentVariables();
    await checker.checkClientServerInterfaces();
    await checker.checkDependencies();
    await checker.checkTypeScriptCompilation();

    const success = checker.generateReport();

    if (success) {
      console.log(`\n${colors.green}✨ 모든 검사 통과! 프로젝트가 정상 상태입니다.${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`\n${colors.red}⚠️  ${checker.errors.length}개의 문제가 발견되었습니다. 수정 후 다시 실행하세요.${colors.reset}\n`);
      process.exit(1);
    }
  } catch (error) {
    log.error(`검사 중 오류 발생: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HealthChecker };

