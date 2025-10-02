const fs = require('fs');
const path = require('path');

// 모든 admin 페이지 파일 찾기
function findAllAdminPages(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findAllAdminPages(fullPath));
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// admin 페이지들 찾기
const adminPages = findAllAdminPages('client/app/admin');

console.log(`🔍 발견된 admin 페이지: ${adminPages.length}개`);

// 경로 수정 규칙들
const pathRules = [
  // useAuth import 수정
  {
    pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/hooks\/useAuth['"]/g,
    replacement: "import { useAuth } from '../../../hooks/useAuth'"
  },
  {
    pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/hooks\/useAuth['"]/g,
    replacement: "import { useAuth } from '../../../hooks/useAuth'"
  },
  {
    pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/hooks\/useAuth['"]/g,
    replacement: "import { useAuth } from '../../../hooks/useAuth'"
  },
  
  // UI 컴포넌트 import 수정 (admin 페이지는 모두 3단계 깊이)
  {
    pattern: /import\s*{\s*Card\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/card['"]/g,
    replacement: "import { Card } from '../../../components/ui/card'"
  },
  {
    pattern: /import\s*{\s*Card\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/card['"]/g,
    replacement: "import { Card } from '../../../components/ui/card'"
  },
  {
    pattern: /import\s*{\s*Card\s*}\s*from\s*['"]\.\.\/components\/ui\/card['"]/g,
    replacement: "import { Card } from '../../../components/ui/card'"
  },
  {
    pattern: /import\s*{\s*Card\s*}\s*from\s*['"]\.\/\.\.\/\.\.\/components\/ui\/card['"]/g,
    replacement: "import { Card } from '../../../components/ui/card'"
  },
  
  // Button import 수정
  {
    pattern: /import\s*{\s*Button\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/button['"]/g,
    replacement: "import { Button } from '../../../components/ui/button'"
  },
  {
    pattern: /import\s*{\s*Button\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/button['"]/g,
    replacement: "import { Button } from '../../../components/ui/button'"
  },
  {
    pattern: /import\s*{\s*Button\s*}\s*from\s*['"]\.\.\/components\/ui\/button['"]/g,
    replacement: "import { Button } from '../../../components/ui/button'"
  },
  
  // Alert import 수정
  {
    pattern: /import\s*{\s*Alert[^}]*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/alert['"]/g,
    replacement: "import { Alert, AlertDescription } from '../../../components/ui/alert'"
  },
  {
    pattern: /import\s*{\s*Alert[^}]*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/alert['"]/g,
    replacement: "import { Alert, AlertDescription } from '../../../components/ui/alert'"
  },
  {
    pattern: /import\s*{\s*Alert[^}]*}\s*from\s*['"]\.\.\/components\/ui\/alert['"]/g,
    replacement: "import { Alert, AlertDescription } from '../../../components/ui/alert'"
  },
  
  // withAuth import 수정
  {
    pattern: /import\s*withAuth\s*from\s*['"]\.\/\.\.\/\.\.\/components\/withAuth['"]/g,
    replacement: "import withAuth from '../../../components/withAuth'"
  },
  {
    pattern: /import\s*withAuth\s*from\s*['"]\.\.\/\.\.\/components\/withAuth['"]/g,
    replacement: "import withAuth from '../../../components/withAuth'"
  },
  
  // apiClient import 수정
  {
    pattern: /import\s*apiClient\s*from\s*['"]\.\/\.\.\/\.\.\/utils\/api['"]/g,
    replacement: "import apiClient from '../../../utils/api'"
  },
  {
    pattern: /import\s*apiClient\s*from\s*['"]\.\.\/\.\.\/utils\/api['"]/g,
    replacement: "import apiClient from '../../../utils/api'"
  },
  
  // 기타 UI 컴포넌트들
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
    replacement: "import { $1 } from '../../../components/ui/$2'"
  },
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
    replacement: "import { $1 } from '../../../components/ui/$2'"
  },
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/components\/ui\/([^'"]+)['"]/g,
    replacement: "import { $1 } from '../../../components/ui/$2'"
  },
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
    replacement: "import { $1 } from '../../../components/ui/$2'"
  }
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`파일이 존재하지 않습니다: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 각 규칙 적용
    pathRules.forEach(rule => {
      const newContent = content.replace(rule.pattern, rule.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`수정됨: ${path.basename(filePath)} - ${rule.pattern}`);
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
console.log('🔧 Admin 페이지 Import 경로 수정 시작...');
adminPages.forEach(fixFile);
console.log('✅ 모든 Admin 페이지 수정 완료!');

