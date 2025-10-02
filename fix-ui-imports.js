/**
 * UI 컴포넌트들의 @/lib/utils import를 상대 경로로 변경하는 스크립트
 */

const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'client', 'components', 'ui');

// UI 디렉토리의 모든 .tsx 파일 찾기
const files = fs.readdirSync(uiDir).filter(file => file.endsWith('.tsx'));

console.log('🔍 UI 컴포넌트 파일들:', files);

files.forEach(file => {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // @/lib/utils를 상대 경로로 변경
  if (content.includes('@/lib/utils')) {
    content = content.replace(/import { cn } from "@\/lib\/utils"/g, 'import { cn } from "../../lib/utils"');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file} 수정 완료`);
  } else {
    console.log(`⏭️  ${file} - 수정 불필요`);
  }
});

console.log('🎉 모든 UI 컴포넌트 import 수정 완료!');

