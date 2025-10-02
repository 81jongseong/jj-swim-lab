const fs = require('fs');
const path = require('path');

// 모든 page.tsx 파일 찾기
function findAllPages(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findAllPages(fullPath));
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 모든 page.tsx 파일들 찾기
const allPages = findAllPages('client/app');

console.log(`🔍 발견된 페이지: ${allPages.length}개`);

// 파일 깊이에 따른 경로 수정 규칙들
function getCorrectPath(filePath, targetPath) {
  const relativePath = path.relative(path.dirname(filePath), 'client');
  const depth = relativePath.split(path.sep).length - 1;
  
  // 깊이에 따른 상대 경로 생성
  const upLevels = '../'.repeat(depth);
  return `${upLevels}${targetPath}`;
}

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`파일이 존재하지 않습니다: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 파일 깊이 계산
    const relativePath = path.relative(path.dirname(filePath), 'client');
    const depth = relativePath.split(path.sep).length - 1;
    const upLevels = '../'.repeat(depth);
    
    // useAuth import 수정
    const useAuthPatterns = [
      /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\/useAuth['"]/g,
      /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/hooks\/useAuth['"]/g,
      /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/hooks\/useAuth['"]/g,
      /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/hooks\/useAuth['"]/g,
      /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\/\.\.\/\.\.\/hooks\/useAuth['"]/g,
      /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\/\.\.\/hooks\/useAuth['"]/g,
      /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\/hooks\/useAuth['"]/g
    ];
    
    useAuthPatterns.forEach(pattern => {
      const newContent = content.replace(pattern, `import { useAuth } from '${upLevels}hooks/useAuth'`);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`수정됨: ${path.basename(filePath)} - useAuth`);
      }
    });
    
    // UI 컴포넌트 import 수정
    const uiPatterns = [
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/components\/ui\/([^'"]+)['"]/g,
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\/components\/ui\/([^'"]+)['"]/g
    ];
    
    uiPatterns.forEach(pattern => {
      const newContent = content.replace(pattern, `import { $1 } from '${upLevels}components/ui/$2'`);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`수정됨: ${path.basename(filePath)} - UI components`);
      }
    });
    
    // withAuth import 수정
    const withAuthPatterns = [
      /import\s*withAuth\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/withAuth['"]/g,
      /import\s*withAuth\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/withAuth['"]/g,
      /import\s*withAuth\s*from\s*['"]\.\.\/\.\.\/components\/withAuth['"]/g,
      /import\s*withAuth\s*from\s*['"]\.\.\/components\/withAuth['"]/g,
      /import\s*withAuth\s*from\s*['"]\.\/\.\.\/\.\.\/components\/withAuth['"]/g,
      /import\s*withAuth\s*from\s*['"]\.\/\.\.\/components\/withAuth['"]/g,
      /import\s*withAuth\s*from\s*['"]\.\/components\/withAuth['"]/g
    ];
    
    withAuthPatterns.forEach(pattern => {
      const newContent = content.replace(pattern, `import withAuth from '${upLevels}components/withAuth'`);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`수정됨: ${path.basename(filePath)} - withAuth`);
      }
    });
    
    // apiClient import 수정
    const apiPatterns = [
      /import\s*apiClient\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\/api['"]/g,
      /import\s*apiClient\s*from\s*['"]\.\.\/\.\.\/\.\.\/utils\/api['"]/g,
      /import\s*apiClient\s*from\s*['"]\.\.\/\.\.\/utils\/api['"]/g,
      /import\s*apiClient\s*from\s*['"]\.\.\/utils\/api['"]/g,
      /import\s*apiClient\s*from\s*['"]\.\/\.\.\/\.\.\/utils\/api['"]/g,
      /import\s*apiClient\s*from\s*['"]\.\/\.\.\/utils\/api['"]/g,
      /import\s*apiClient\s*from\s*['"]\.\/utils\/api['"]/g
    ];
    
    apiPatterns.forEach(pattern => {
      const newContent = content.replace(pattern, `import apiClient from '${upLevels}utils/api'`);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`수정됨: ${path.basename(filePath)} - apiClient`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 파일 수정 완료: ${path.basename(filePath)}`);
    } else {
      console.log(`변경사항 없음: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ 파일 수정 실패: ${filePath}`, error.message);
  }
}

// 모든 파일 수정 실행
console.log('🔧 모든 페이지 Import 경로 수정 시작...');
allPages.forEach(fixFile);
console.log('✅ 모든 페이지 수정 완료!');

