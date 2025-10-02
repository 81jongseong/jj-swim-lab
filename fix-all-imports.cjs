const fs = require('fs');
const path = require('path');

// 수정할 파일들과 올바른 경로들
const filesToFix = [
  'client/app/admin/ai-config/recommendations/page.tsx',
  'client/app/admin/algorithm-analytics/page.tsx', 
  'client/app/admin/backup/page.tsx'
];

// 경로 수정 규칙들
const pathRules = [
  // useAuth import 수정
  {
    pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/hooks\/useAuth['"]/g,
    replacement: "import { useAuth } from '../../../../hooks/useAuth'"
  },
  {
    pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/hooks\/useAuth['"]/g,
    replacement: "import { useAuth } from '../../../hooks/useAuth'"
  },
  {
    pattern: /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/hooks\/useAuth['"]/g,
    replacement: "import { useAuth } from '../../hooks/useAuth'"
  },
  
  // UI 컴포넌트 import 수정
  {
    pattern: /import\s*{\s*Card\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/card['"]/g,
    replacement: "import { Card } from '../../../components/ui/card'"
  },
  {
    pattern: /import\s*{\s*Card\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/card['"]/g,
    replacement: "import { Card } from '../../../../components/ui/card'"
  },
  {
    pattern: /import\s*{\s*Card\s*}\s*from\s*['"]\.\.\/components\/ui\/card['"]/g,
    replacement: "import { Card } from '../../components/ui/card'"
  },
  
  // LoadingSpinner import 수정
  {
    pattern: /import\s*{\s*LoadingSpinner\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/LoadingSpinner['"]/g,
    replacement: "import { LoadingSpinner } from '../../../components/ui/loadingSpinner'"
  },
  {
    pattern: /import\s*{\s*LoadingSpinner\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/LoadingSpinner['"]/g,
    replacement: "import { LoadingSpinner } from '../../../../components/ui/loadingSpinner'"
  },
  
  // RefreshButton import 수정
  {
    pattern: /import\s*{\s*RefreshButton\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/components\/ui\/RefreshButton['"]/g,
    replacement: "import { RefreshButton } from '../../../../components/ui/refreshButton'"
  },
  {
    pattern: /import\s*{\s*RefreshButton\s*}\s*from\s*['"]\.\.\/\.\.\/components\/ui\/RefreshButton['"]/g,
    replacement: "import { RefreshButton } from '../../../components/ui/refreshButton'"
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
        console.log(`수정됨: ${filePath} - ${rule.pattern}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 파일 수정 완료: ${filePath}`);
    } else {
      console.log(`변경사항 없음: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 파일 수정 실패: ${filePath}`, error.message);
  }
}

// 모든 파일 수정 실행
console.log('🔧 Import 경로 수정 시작...');
filesToFix.forEach(fixFile);
console.log('✅ 모든 파일 수정 완료!');

