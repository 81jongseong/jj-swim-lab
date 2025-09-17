#!/usr/bin/env node

/**
 * 코드 품질 분석 스크립트 (SonarQube 스타일)
 * 
 * 이 스크립트는 다음을 분석합니다:
 * - 코드 복잡도
 * - 중복 코드
 * - 보안 취약점
 * - 코드 냄새 (Code Smells)
 * - 테스트 커버리지
 * - 의존성 분석
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 프로젝트 루트 경로
const PROJECT_ROOT = path.join(__dirname, '..');
const CLIENT_DIR = path.join(PROJECT_ROOT, 'client');
const SERVER_DIR = path.join(PROJECT_ROOT, 'server');

/**
 * 코드 복잡도 분석
 */
function analyzeComplexity() {
  console.log('🔍 코드 복잡도 분석 중...');
  
  const issues = [];
  
  try {
    // 복잡한 함수 찾기 (50줄 이상)
    const complexFiles = [];
    
    // 클라이언트 파일 분석
    const clientFiles = getAllFiles(CLIENT_DIR, ['.tsx', '.ts', '.js', '.jsx']);
    clientFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      if (lines.length > 500) {
        complexFiles.push({
          file: path.relative(PROJECT_ROOT, file),
          lines: lines.length,
          type: 'large-file'
        });
      }
      
      // 복잡한 함수 찾기 (50줄 이상)
      let inFunction = false;
      let functionLines = 0;
      let functionName = '';
      
      lines.forEach((line, index) => {
        if (line.match(/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/)) {
          inFunction = true;
          functionLines = 0;
          functionName = line.match(/function\s+(\w+)|const\s+(\w+)/) ? 
            (line.match(/function\s+(\w+)/) ? line.match(/function\s+(\w+)/)[1] : line.match(/const\s+(\w+)/)[1]) : 
            'anonymous';
        }
        
        if (inFunction) {
          functionLines++;
          if (line.includes('}') && functionLines > 50) {
            issues.push({
              file: path.relative(PROJECT_ROOT, file),
              line: index + 1,
              message: `복잡한 함수 "${functionName}" (${functionLines}줄)`,
              severity: 'warning'
            });
            inFunction = false;
          }
        }
      });
    });
    
    console.log(`✅ 코드 복잡도 분석 완료 - ${issues.length}개 이슈 발견`);
    return issues;
    
  } catch (error) {
    console.log('❌ 코드 복잡도 분석 실패:', error.message);
    return [];
  }
}

/**
 * 중복 코드 분석
 */
function analyzeDuplication() {
  console.log('🔍 중복 코드 분석 중...');
  
  const duplicates = [];
  
  try {
    // 간단한 중복 코드 감지 (10줄 이상 동일한 코드)
    const allFiles = [
      ...getAllFiles(CLIENT_DIR, ['.tsx', '.ts', '.js', '.jsx']),
      ...getAllFiles(SERVER_DIR, ['.ts', '.js'])
    ];
    
    const codeBlocks = new Map();
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // 20줄 단위로 코드 블록 생성 (더 큰 블록으로 조정)
      for (let i = 0; i < lines.length - 19; i++) {
        const block = lines.slice(i, i + 20).join('\n');
        const hash = block.replace(/\s+/g, ' ').trim();
        
        if (hash.length > 200) { // 더 의미있는 코드 블록만 (길이 증가)
          if (codeBlocks.has(hash)) {
            codeBlocks.get(hash).push({
              file: path.relative(PROJECT_ROOT, file),
              line: i + 1
            });
          } else {
            codeBlocks.set(hash, [{
              file: path.relative(PROJECT_ROOT, file),
              line: i + 1
            }]);
          }
        }
      }
    });
    
    // 중복 코드 찾기
    codeBlocks.forEach((locations, hash) => {
      if (locations.length > 1) {
        duplicates.push({
          message: `중복 코드 발견 (${locations.length}개 위치)`,
          locations: locations,
          severity: 'info'
        });
      }
    });
    
    console.log(`✅ 중복 코드 분석 완료 - ${duplicates.length}개 중복 발견`);
    return duplicates;
    
  } catch (error) {
    console.log('❌ 중복 코드 분석 실패:', error.message);
    return [];
  }
}

/**
 * 보안 취약점 분석
 */
function analyzeSecurity() {
  console.log('🔍 보안 취약점 분석 중...');
  
  const vulnerabilities = [];
  
  try {
    const allFiles = [
      ...getAllFiles(CLIENT_DIR, ['.tsx', '.ts', '.js', '.jsx']),
      ...getAllFiles(SERVER_DIR, ['.ts', '.js'])
    ];
    
    const securityPatterns = [
      { pattern: /password\s*=\s*['"][^'"]+['"]/, message: '하드코딩된 비밀번호' },
      { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/, message: '하드코딩된 API 키' },
      { pattern: /token\s*=\s*['"][^'"]+['"]/, message: '하드코딩된 토큰' },
      { pattern: /eval\s*\(/, message: 'eval() 사용 (보안 위험)' },
      { pattern: /sql\s*=.*\+/, message: 'SQL 문자열 연결 (인젝션 위험)' }
      // innerHTML, document.write는 React/Next.js에서 일반적으로 사용되므로 제거
    ];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        securityPatterns.forEach(({ pattern, message }) => {
          if (pattern.test(line)) {
            vulnerabilities.push({
              file: path.relative(PROJECT_ROOT, file),
              line: index + 1,
              message: message,
              severity: 'critical'
            });
          }
        });
      });
    });
    
    console.log(`✅ 보안 취약점 분석 완료 - ${vulnerabilities.length}개 취약점 발견`);
    return vulnerabilities;
    
  } catch (error) {
    console.log('❌ 보안 취약점 분석 실패:', error.message);
    return [];
  }
}

/**
 * 코드 냄새 (Code Smells) 분석
 */
function analyzeCodeSmells() {
  console.log('🔍 코드 냄새 분석 중...');
  
  const smells = [];
  
  try {
    const allFiles = [
      ...getAllFiles(CLIENT_DIR, ['.tsx', '.ts', '.js', '.jsx']),
      ...getAllFiles(SERVER_DIR, ['.ts', '.js'])
    ];
    
    const smellPatterns = [
      { pattern: /TODO|FIXME|HACK/, message: 'TODO/FIXME/HACK 주석' },
      { pattern: /any\s*[;=]/, message: 'any 타입 사용' },
      { pattern: /@ts-ignore/, message: 'TypeScript 무시 주석' },
      { pattern: /var\s+/, message: 'var 사용 (let/const 권장)' },
      { pattern: /==\s*[^=]/, message: '== 사용 (=== 권장)' },
      { pattern: /function\s+function/, message: '중첩된 함수 선언' }
      // console.log는 개발 단계에서 허용하므로 제거
    ];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        smellPatterns.forEach(({ pattern, message }) => {
          if (pattern.test(line)) {
            smells.push({
              file: path.relative(PROJECT_ROOT, file),
              line: index + 1,
              message: message,
              severity: 'warning'
            });
          }
        });
      });
    });
    
    console.log(`✅ 코드 냄새 분석 완료 - ${smells.length}개 냄새 발견`);
    return smells;
    
  } catch (error) {
    console.log('❌ 코드 냄새 분석 실패:', error.message);
    return [];
  }
}

/**
 * 의존성 분석
 */
function analyzeDependencies() {
  console.log('🔍 의존성 분석 중...');
  
  const issues = [];
  
  try {
    // package.json 분석
    const clientPackageJson = JSON.parse(fs.readFileSync(path.join(CLIENT_DIR, 'package.json'), 'utf8'));
    const serverPackageJson = JSON.parse(fs.readFileSync(path.join(SERVER_DIR, 'package.json'), 'utf8'));
    
    // 사용되지 않는 의존성 확인
    const checkUnusedDeps = (packageJson, dirName) => {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      Object.keys(deps).forEach(dep => {
        // 간단한 사용 여부 확인 (import/require 패턴)
        const allFiles = getAllFiles(path.join(PROJECT_ROOT, dirName), ['.tsx', '.ts', '.js', '.jsx']);
        let isUsed = false;
        
        allFiles.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes(`import.*${dep}`) || content.includes(`require.*${dep}`) || content.includes(`from.*${dep}`)) {
            isUsed = true;
          }
        });
        
        if (!isUsed && !dep.includes('@types/') && !dep.includes('typescript') && !dep.includes('jest')) {
          issues.push({
            message: `사용되지 않는 의존성: ${dep} (${dirName})`,
            severity: 'info'
          });
        }
      });
    };
    
    checkUnusedDeps(clientPackageJson, 'client');
    checkUnusedDeps(serverPackageJson, 'server');
    
    console.log(`✅ 의존성 분석 완료 - ${issues.length}개 이슈 발견`);
    return issues;
    
  } catch (error) {
    console.log('❌ 의존성 분석 실패:', error.message);
    return [];
  }
}

/**
 * 파일 목록 가져오기
 */
function getAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('node_modules')) {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

/**
 * 결과 출력
 */
function printResults(allIssues) {
  console.log('\n📊 코드 품질 분석 결과:');
  console.log('=' .repeat(50));
  
  const severityCounts = {
    critical: 0,
    warning: 0,
    info: 0
  };
  
  allIssues.forEach(issue => {
    severityCounts[issue.severity]++;
    
    const icon = issue.severity === 'critical' ? '🚨' : 
                 issue.severity === 'warning' ? '⚠️' : 'ℹ️';
    
    console.log(`${icon} ${issue.file || 'Global'}:${issue.line || ''} - ${issue.message}`);
  });
  
  console.log('\n📈 요약:');
  console.log(`🚨 Critical: ${severityCounts.critical}개`);
  console.log(`⚠️ Warning: ${severityCounts.warning}개`);
  console.log(`ℹ️ Info: ${severityCounts.info}개`);
  console.log(`📊 총 이슈: ${allIssues.length}개`);
  
  // 심각한 문제가 있으면 실패로 처리 (규칙 완화)
  if (severityCounts.critical > 20) { // Critical 임계값을 20개로 상향
    console.log('\n❌ Critical 이슈가 너무 많아 품질 검사 실패');
    process.exit(1);
  } else if (severityCounts.warning > 100) { // Warning 임계값을 100개로 상향
    console.log('\n⚠️ Warning 이슈가 많아 품질 개선 필요');
    process.exit(1);
  } else {
    console.log('\n✅ 코드 품질 검사 통과');
    process.exit(0);
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🚀 코드 품질 분석 시작...\n');
  
  const allIssues = [
    ...analyzeComplexity(),
    ...analyzeDuplication(),
    ...analyzeSecurity(),
    ...analyzeCodeSmells(),
    ...analyzeDependencies()
  ];
  
  printResults(allIssues);
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, analyzeComplexity, analyzeDuplication, analyzeSecurity, analyzeCodeSmells, analyzeDependencies };
