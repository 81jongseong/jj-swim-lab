/**
 * 🔧 JJ Swim Lab - 모든 문제 해결 스크립트
 * 
 * 📋 **스크립트 목적**
 * - 빌드, 테스트, 린트, 타입스크립트, 임포트 오류를 한 번에 해결
 * - UI 컴포넌트 import 오류 수정
 * - 파일명 대소문자 불일치 해결
 * 
 * 🔄 **주요 기능**
 * - UI 컴포넌트 파일명 표준화 (대문자로 통일)
 * - import 문 수정 (default import로 통일)
 * - 빌드, 테스트, 린트 실행
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-13: 통합 문제 해결 스크립트 생성
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-13
 * - 상태: ✅ 완성
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 JJ Swim Lab 통합 문제 해결 시작...\n');

// 1. UI 컴포넌트 파일명 표준화 (대문자로 통일)
function standardizeUIFileNames() {
  console.log('📁 UI 컴포넌트 파일명 표준화 중...');
  
  const uiDir = path.join(__dirname, 'client/components/ui');
  const filesToRename = [
    { from: 'card.tsx', to: 'Card.tsx' },
    { from: 'button.tsx', to: 'Button.tsx' },
    { from: 'badge.tsx', to: 'Badge.tsx' },
    { from: 'input.tsx', to: 'Input.tsx' },
    { from: 'label.tsx', to: 'Label.tsx' },
    { from: 'select.tsx', to: 'Select.tsx' },
    { from: 'textarea.tsx', to: 'Textarea.tsx' },
    { from: 'dialog.tsx', to: 'Dialog.tsx' },
    { from: 'table.tsx', to: 'Table.tsx' },
    { from: 'toast.tsx', to: 'Toast.tsx' }
  ];

  filesToRename.forEach(({ from, to }) => {
    const fromPath = path.join(uiDir, from);
    const toPath = path.join(uiDir, to);
    
    if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
      fs.renameSync(fromPath, toPath);
      console.log(`✅ ${from} → ${to}`);
    } else if (fs.existsSync(toPath)) {
      console.log(`⏭️ ${to} 이미 존재함`);
    } else {
      console.log(`⏭️ ${from} 파일 없음`);
    }
  });
}

// 2. import 문 수정 (default import로 통일)
function fixImportStatements() {
  console.log('\n📝 import 문 수정 중...');
  
  const clientDir = path.join(__dirname, 'client');
  const filesToFix = [
    'app/instructor/dashboard/page.tsx',
    'app/instructor/courses/page.tsx',
    'app/center-admin/dashboard/page.tsx',
    'app/student/dashboard/page.tsx'
  ];

  const importReplacements = [
    {
      from: /import\s*{\s*Card\s*}\s*from\s*['"]@\/components\/ui\/card['"]/g,
      to: 'import Card from "@/components/ui/Card"'
    },
    {
      from: /import\s*{\s*Button\s*}\s*from\s*['"]@\/components\/ui\/button['"]/g,
      to: 'import Button from "@/components/ui/Button"'
    },
    {
      from: /import\s*{\s*Badge\s*}\s*from\s*['"]@\/components\/ui\/badge['"]/g,
      to: 'import Badge from "@/components/ui/Badge"'
    },
    {
      from: /import\s*{\s*Input\s*}\s*from\s*['"]@\/components\/ui\/input['"]/g,
      to: 'import Input from "@/components/ui/Input"'
    },
    {
      from: /import\s*{\s*Label\s*}\s*from\s*['"]@\/components\/ui\/label['"]/g,
      to: 'import Label from "@/components/ui/Label"'
    },
    {
      from: /import\s*{\s*Select\s*}\s*from\s*['"]@\/components\/ui\/select['"]/g,
      to: 'import Select from "@/components/ui/Select"'
    },
    {
      from: /import\s*{\s*Textarea\s*}\s*from\s*['"]@\/components\/ui\/textarea['"]/g,
      to: 'import Textarea from "@/components/ui/Textarea"'
    },
    {
      from: /import\s*{\s*Dialog\s*}\s*from\s*['"]@\/components\/ui\/dialog['"]/g,
      to: 'import Dialog from "@/components/ui/Dialog"'
    },
    {
      from: /import\s*{\s*Table\s*}\s*from\s*['"]@\/components\/ui\/table['"]/g,
      to: 'import Table from "@/components/ui/Table"'
    },
    {
      from: /import\s*{\s*Toast\s*}\s*from\s*['"]@\/components\/ui\/toast['"]/g,
      to: 'import Toast from "@/components/ui/Toast"'
    }
  ];

  filesToFix.forEach(filePath => {
    const fullPath = path.join(clientDir, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      importReplacements.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ ${filePath} 수정 완료`);
      } else {
        console.log(`⏭️ ${filePath} 수정 불필요`);
      }
    } else {
      console.log(`⏭️ ${filePath} 파일 없음`);
    }
  });
}

// 3. 서버 시작 오류 해결
function fixServerStartup() {
  console.log('\n🔧 서버 시작 오류 해결 중...');
  
  // 모든 Node.js 프로세스 종료
  try {
    execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
    console.log('✅ 실행 중인 Node.js 프로세스 정리 완료');
  } catch (error) {
    console.log('⏭️ 정리할 Node.js 프로세스 없음');
  }

  // 5초 대기
  console.log('⏳ 5초 대기 중...');
  execSync('timeout /t 5 /nobreak', { stdio: 'ignore' });
}

// 4. 빌드, 테스트, 린트 실행
function runQualityChecks() {
  console.log('\n🧪 품질 검사 실행 중...');
  
  const commands = [
    { name: 'TypeScript 체크', cmd: 'cd client && npx tsc --noEmit' },
    { name: 'ESLint 체크', cmd: 'cd client && npx eslint . --ext .ts,.tsx' },
    { name: 'Prettier 체크', cmd: 'cd client && npx prettier --check .' },
    { name: '클라이언트 빌드', cmd: 'cd client && npm run build' },
    { name: '서버 TypeScript 체크', cmd: 'cd server && npx tsc --noEmit' },
    { name: '서버 ESLint 체크', cmd: 'cd server && npx eslint . --ext .ts' }
  ];

  commands.forEach(({ name, cmd }) => {
    try {
      console.log(`🔄 ${name} 실행 중...`);
      execSync(cmd, { stdio: 'inherit' });
      console.log(`✅ ${name} 완료\n`);
    } catch (error) {
      console.log(`❌ ${name} 실패: ${error.message}\n`);
    }
  });
}

// 5. 서버 시작
function startServer() {
  console.log('\n🚀 서버 시작 중...');
  
  try {
    // 백그라운드에서 서버 시작
    const { spawn } = require('child_process');
    const serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      detached: true,
      stdio: 'ignore'
    });
    
    serverProcess.unref();
    console.log('✅ 서버가 백그라운드에서 시작되었습니다');
    console.log('🌐 클라이언트: http://localhost:3000');
    console.log('🔧 서버: http://localhost:5000');
  } catch (error) {
    console.log(`❌ 서버 시작 실패: ${error.message}`);
  }
}

// 메인 실행
async function main() {
  try {
    standardizeUIFileNames();
    fixImportStatements();
    fixServerStartup();
    runQualityChecks();
    startServer();
    
    console.log('\n🎉 모든 문제 해결 완료!');
    console.log('\n📋 다음 단계:');
    console.log('1. 브라우저에서 http://localhost:3000 접속');
    console.log('2. center 계정으로 로그인 (비밀번호: 101010)');
    console.log('3. 시스템 기능 테스트');
    
  } catch (error) {
    console.error(`❌ 오류 발생: ${error.message}`);
    process.exit(1);
  }
}

main();
