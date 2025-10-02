const fs = require('fs');
const path = require('path');

// 모든 TypeScript/JavaScript 파일 찾기
function findAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findAllTsFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 모든 파일들 찾기
const allFiles = findAllTsFiles('client');

console.log(`🔍 발견된 파일: ${allFiles.length}개`);

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
    
    // 모든 잘못된 import 패턴들을 수정
    const patterns = [
      // useAuth
      {
        pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/hooks\/useAuth['"]/g,
        replacement: `import { useAuth } from '${upLevels}hooks/useAuth'`
      },
      {
        pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/hooks\/useAuth['"]/g,
        replacement: `import { useAuth } from '${upLevels}hooks/useAuth'`
      },
      {
        pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/hooks\/useAuth['"]/g,
        replacement: `import { useAuth } from '${upLevels}hooks/useAuth'`
      },
      {
        pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\/useAuth['"]/g,
        replacement: `import { useAuth } from '${upLevels}hooks/useAuth'`
      },
      
      // UI 컴포넌트들
      {
        pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/components\/ui\/([^'"]+)['"]/g,
        replacement: `import { $1 } from '${upLevels}components/ui/$2'`
      },
      {
        pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
        replacement: `import { $1 } from '${upLevels}components/ui/$2'`
      },
      {
        pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
        replacement: `import { $1 } from '${upLevels}components/ui/$2'`
      },
      {
        pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
        replacement: `import { $1 } from '${upLevels}components/ui/$2'`
      },
      
      // withAuth
      {
        pattern: /import\s*withAuth\s*from\s*['"]\.\.\/components\/withAuth['"]/g,
        replacement: `import withAuth from '${upLevels}components/withAuth'`
      },
      {
        pattern: /import\s*withAuth\s*from\s*['"]\.\.\/\.\.\/components\/withAuth['"]/g,
        replacement: `import withAuth from '${upLevels}components/withAuth'`
      },
      {
        pattern: /import\s*withAuth\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/withAuth['"]/g,
        replacement: `import withAuth from '${upLevels}components/withAuth'`
      },
      {
        pattern: /import\s*withAuth\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/withAuth['"]/g,
        replacement: `import withAuth from '${upLevels}components/withAuth'`
      },
      
      // apiClient
      {
        pattern: /import\s*apiClient\s*from\s*['"]\.\.\/utils\/api['"]/g,
        replacement: `import apiClient from '${upLevels}utils/api'`
      },
      {
        pattern: /import\s*apiClient\s*from\s*['"]\.\.\/\.\.\/utils\/api['"]/g,
        replacement: `import apiClient from '${upLevels}utils/api'`
      },
      {
        pattern: /import\s*apiClient\s*from\s*['"]\.\.\/\.\.\/\.\.\/utils\/api['"]/g,
        replacement: `import apiClient from '${upLevels}utils/api'`
      },
      {
        pattern: /import\s*apiClient\s*from\s*['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\/api['"]/g,
        replacement: `import apiClient from '${upLevels}utils/api'`
      }
    ];
    
    patterns.forEach(rule => {
      const newContent = content.replace(rule.pattern, rule.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 파일 수정 완료: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ 파일 수정 실패: ${filePath}`, error.message);
  }
}

// 모든 파일 수정 실행
console.log('🔧 모든 파일 Import 경로 수정 시작...');
allFiles.forEach(fixFile);
console.log('✅ 모든 파일 수정 완료!');

