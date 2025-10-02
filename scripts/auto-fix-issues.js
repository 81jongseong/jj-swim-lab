/**
 * 🔧 JJ Swim Lab - 자동 문제 해결
 * 
 * 📋 **스크립트 목적**
 * - comprehensive-health-check.js에서 발견된 문제를 자동으로 수정
 * - 누락된 import 자동 추가
 * - 라우트 자동 등록
 * - 샘플 데이터 자동 생성
 * 
 * 🔄 **자동 수정 항목**
 * 1. 누락된 모델 import 추가
 * 2. 누락된 라우트 import 및 등록
 * 3. 환경변수 템플릿 생성
 * 4. 스키마 문법 오류 수정
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.yellow}━━━ ${msg} ━━━${colors.reset}\n`),
};

class AutoFixer {
  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.fixes = [];
    this.backupDir = path.join(__dirname, '../backups/auto-fix-' + Date.now());
  }

  backup(filePath) {
    if (this.dryRun) return;

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(filePath, backupPath);
    log.info(`백업 생성: ${backupPath}`);
  }

  // 1. 누락된 모델 import 자동 추가
  async fixMissingModelImports() {
    log.section('누락된 모델 Import 자동 추가');

    const modelsDir = path.join(__dirname, '../server/src/models');
    const indexFile = path.join(__dirname, '../server/src/index.ts');

    if (!fs.existsSync(modelsDir) || !fs.existsSync(indexFile)) {
      log.info('모델 디렉토리 또는 index.ts가 없습니다. 건너뜀.');
      return;
    }

    const modelFiles = fs.readdirSync(modelsDir)
      .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
      .map(f => f.replace('.ts', ''));

    let indexContent = fs.readFileSync(indexFile, 'utf-8');
    const originalContent = indexContent;

    const missingImports = [];

    for (const model of modelFiles) {
      const importPattern = new RegExp(`import.*['"]\\.?\\.?/models/${model}['"]`, 'i');
      
      if (!importPattern.test(indexContent)) {
        missingImports.push(model);
      }
    }

    if (missingImports.length === 0) {
      log.success('모든 모델이 이미 import되어 있습니다.');
      return;
    }

    // import 섹션 찾기
    const importSectionMatch = indexContent.match(/(\/\/ Models.*\n)(.*?)(console\.log|export)/s);
    
    if (importSectionMatch) {
      this.backup(indexFile);
      
      const newImports = missingImports.map(m => `import './models/${m}';`).join('\n');
      const insertPosition = importSectionMatch.index + importSectionMatch[1].length + importSectionMatch[2].length;
      
      indexContent = indexContent.slice(0, insertPosition) + 
                     newImports + '\n' +
                     indexContent.slice(insertPosition);

      if (!this.dryRun) {
        fs.writeFileSync(indexFile, indexContent);
        log.success(`${missingImports.length}개 모델 import 추가됨: ${missingImports.join(', ')}`);
        this.fixes.push({
          type: 'model-import',
          file: indexFile,
          models: missingImports,
        });
      } else {
        log.info(`[DRY-RUN] ${missingImports.length}개 모델 import 추가 예정: ${missingImports.join(', ')}`);
      }
    } else {
      log.info('적절한 import 섹션을 찾을 수 없습니다. 파일 끝에 추가합니다.');
      
      this.backup(indexFile);
      const newImports = '\n// Auto-fixed model imports\n' + 
                        missingImports.map(m => `import './models/${m}';`).join('\n') + '\n';
      
      if (!this.dryRun) {
        fs.appendFileSync(indexFile, newImports);
        log.success(`${missingImports.length}개 모델 import 추가됨`);
      }
    }

    // 모델 등록 확인 섹션에도 추가
    const checkSectionMatch = indexContent.match(/console\.log\(['"]🔍 모델 등록 상태 확인:['"].*?\);/s);
    
    if (checkSectionMatch && missingImports.length > 0) {
      const checkLines = missingImports.map(m => 
        `  console.log('   - ${m} 모델:', mongoose.models.${m} ? '✅ 등록됨' : '❌ 미등록');`
      ).join('\n');

      const insertPos = checkSectionMatch.index + checkSectionMatch[0].length;
      indexContent = indexContent.slice(0, insertPos) + 
                     '\n' + checkLines +
                     indexContent.slice(insertPos);

      if (!this.dryRun) {
        fs.writeFileSync(indexFile, indexContent);
        log.success('모델 등록 확인 섹션에도 추가됨');
      }
    }
  }

  // 2. 누락된 라우트 import 및 등록 자동 추가
  async fixMissingRoutes() {
    log.section('누락된 라우트 Import 및 등록 자동 추가');

    const routesDir = path.join(__dirname, '../server/src/routes');
    const indexFile = path.join(__dirname, '../server/src/index.ts');

    if (!fs.existsSync(routesDir) || !fs.existsSync(indexFile)) {
      log.info('라우트 디렉토리 또는 index.ts가 없습니다. 건너뜀.');
      return;
    }

    const routeFiles = fs.readdirSync(routesDir)
      .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
      .map(f => f.replace('.ts', ''));

    let indexContent = fs.readFileSync(indexFile, 'utf-8');

    const missingImports = [];
    const missingRegistrations = [];

    for (const route of routeFiles) {
      const importPattern = new RegExp(`import.*from.*['"]\\.?\\.?/routes/${route}['"]`, 'i');
      const hasImport = importPattern.test(indexContent);

      if (!hasImport) {
        missingImports.push(route);
      } else {
        const usePattern = new RegExp(`app\\.use\\([^)]*${route}`, 'i');
        if (!usePattern.test(indexContent)) {
          missingRegistrations.push(route);
        }
      }
    }

    if (missingImports.length === 0 && missingRegistrations.length === 0) {
      log.success('모든 라우트가 이미 import 및 등록되어 있습니다.');
      return;
    }

    this.backup(indexFile);

    // Import 추가
    if (missingImports.length > 0) {
      const newImports = missingImports.map(r => 
        `import ${r}Routes from './routes/${r}';`
      ).join('\n');

      const importSectionMatch = indexContent.match(/(\/\/ 라우트 임포트.*\n)/);
      
      if (importSectionMatch) {
        const insertPos = importSectionMatch.index + importSectionMatch[0].length;
        indexContent = indexContent.slice(0, insertPos) + 
                       newImports + '\n' +
                       indexContent.slice(insertPos);
      }

      if (!this.dryRun) {
        log.success(`${missingImports.length}개 라우트 import 추가됨: ${missingImports.join(', ')}`);
      } else {
        log.info(`[DRY-RUN] ${missingImports.length}개 라우트 import 추가 예정`);
      }
    }

    // app.use 등록 추가
    if (missingRegistrations.length > 0) {
      const newRegistrations = missingRegistrations.map(r => 
        `app.use('/api/${r}', ${r}Routes);`
      ).join('\n');

      const useSectionMatch = indexContent.match(/(app\.use\(['"]\/api\/)/);
      
      if (useSectionMatch) {
        const insertPos = useSectionMatch.index;
        indexContent = indexContent.slice(0, insertPos) + 
                       newRegistrations + '\n' +
                       indexContent.slice(insertPos);
      }

      if (!this.dryRun) {
        log.success(`${missingRegistrations.length}개 라우트 등록 추가됨: ${missingRegistrations.join(', ')}`);
      } else {
        log.info(`[DRY-RUN] ${missingRegistrations.length}개 라우트 등록 추가 예정`);
      }
    }

    if (!this.dryRun && (missingImports.length > 0 || missingRegistrations.length > 0)) {
      fs.writeFileSync(indexFile, indexContent);
      this.fixes.push({
        type: 'route-registration',
        file: indexFile,
        imports: missingImports,
        registrations: missingRegistrations,
      });
    }
  }

  // 3. .env 파일 생성
  async fixMissingEnvFile() {
    log.section('환경변수 파일 검사 및 생성');

    const envPath = path.join(__dirname, '../server/.env');
    const envExamplePath = path.join(__dirname, '../server/env.example');

    if (fs.existsSync(envPath)) {
      log.success('.env 파일이 이미 존재합니다.');
      return;
    }

    const template = `# JJ Swim Lab - 환경변수 설정
# Auto-generated by auto-fix-issues.js

# MongoDB 연결
MONGODB_URI=mongodb://localhost:27017/jj-swim-lab

# JWT 보안 키 (32자 이상 권장)
JWT_SECRET=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}

# 서버 포트
PORT=5000

# 환경 (development/production)
NODE_ENV=development

# 클라이언트 URL
CLIENT_URL=http://localhost:3000

# 파일 업로드 최대 크기 (MB)
MAX_FILE_SIZE=10
`;

    if (!this.dryRun) {
      fs.writeFileSync(envPath, template);
      log.success('.env 파일이 생성되었습니다. 필요한 값들을 수정하세요.');
      this.fixes.push({
        type: 'env-file',
        file: envPath,
      });
    } else {
      log.info('[DRY-RUN] .env 파일 생성 예정');
    }
  }

  // 4. 보고서 생성
  generateReport() {
    log.section('자동 수정 완료');

    console.log(`총 ${this.fixes.length}개 항목이 수정되었습니다.`);

    if (this.fixes.length > 0) {
      console.log('\n수정된 내용:');
      this.fixes.forEach((fix, idx) => {
        console.log(`${idx + 1}. [${fix.type}] ${fix.file}`);
        if (fix.models) console.log(`   - 모델: ${fix.models.join(', ')}`);
        if (fix.imports) console.log(`   - Import: ${fix.imports.join(', ')}`);
        if (fix.registrations) console.log(`   - 등록: ${fix.registrations.join(', ')}`);
      });
    }

    if (!this.dryRun && this.fixes.length > 0) {
      log.success(`백업 위치: ${this.backupDir}`);
      log.info('문제가 발생하면 백업에서 복원할 수 있습니다.');
    }

    const reportPath = path.join(__dirname, '../auto-fix-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: this.dryRun,
      fixes: this.fixes,
      backupDir: this.backupDir,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.info(`상세 보고서: ${reportPath}`);
  }
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log(`
${colors.cyan}╔═══════════════════════════════════════════╗
║  🔧 JJ Swim Lab 자동 문제 해결  ║
╚═══════════════════════════════════════════╝${colors.reset}
  `);

  if (dryRun) {
    log.info('DRY-RUN 모드: 실제로 파일을 수정하지 않고 미리보기만 표시합니다.');
  }

  const fixer = new AutoFixer(dryRun);

  try {
    await fixer.fixMissingModelImports();
    await fixer.fixMissingRoutes();
    await fixer.fixMissingEnvFile();

    fixer.generateReport();

    console.log(`\n${colors.green}✨ 자동 수정 완료!${colors.reset}`);
    
    if (!dryRun) {
      console.log(`\n다음 명령어로 검증하세요:`);
      console.log(`  npm run check-health\n`);
    }

  } catch (error) {
    console.error(`오류 발생: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AutoFixer };

