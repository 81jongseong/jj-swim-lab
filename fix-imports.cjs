/**
 * TypeScript import 오류 일괄 수정 스크립트
 * badge, input의 default import를 named import로 변경
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  // app
  'client/app/health/history/page.tsx',
  'client/app/membership/page.tsx',
  'client/app/notifications/page.tsx',
  'client/app/user-role-integration/page.tsx',
  
  // components
  'client/components/user-management/UserActivityDashboard.tsx',
  'client/components/backup/BackupManager.tsx',
  'client/components/monitoring/SystemMonitor.tsx',
  'client/components/PerformanceOptimizer.tsx',
  'client/components/performance/PerformanceDashboard.tsx',
  'client/components/guides/EvidenceFootnotes.tsx',
  'client/components/guides/ConditionCard.tsx',
  'client/components/guides/JointMatrix.tsx',
  'client/components/UserDashboard.tsx',
  'client/components/TeachingMethodDetailModal.tsx',
  'client/components/NotificationCenter.tsx',
  'client/components/LaneManager.tsx',
  'client/components/EnhancedOfflineIndicator.tsx',
  'client/components/AIConfigEditor.tsx',
  'client/components/AIDashboard.tsx',
  'client/components/TeachingMethodForm.tsx',
  'client/components/YouTubeVideoManager.tsx'
];

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일 없음: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Badge default import → named import
    if (content.includes('import Badge from')) {
      content = content.replace(/import Badge from/g, 'import { Badge } from');
      modified = true;
    }
    
    // Input default import → named import  
    if (content.includes('import Input from') && content.includes('ui/input')) {
      content = content.replace(/import Input from (.*ui\/input.*)/g, 'import { Input } from $1');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 수정 완료: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`ℹ️  변경 없음: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 오류: ${filePath}`, error.message);
    errorCount++;
  }
});

console.log(`\n\n📊 수정 결과:`);
console.log(`✅ 수정 완료: ${fixedCount}개`);
console.log(`❌ 오류 발생: ${errorCount}개`);




