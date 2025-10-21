const fs = require('fs');
const path = require('path');

// badge 오류 파일들
const badgeFiles = [
  'app/accessibility/page.tsx',
  'app/health/history/page.tsx',
  'app/membership/page.tsx',
  'app/notifications/page.tsx',
  'app/user-role-integration/page.tsx',
  'components/AIConfigEditor.tsx',
  'components/AIDashboard.tsx',
  'components/backup/BackupManager.tsx',
  'components/ConditionSelector.tsx',
  'components/dashboard/PerformanceMonitor.tsx',
  'components/EnhancedOfflineIndicator.tsx',
  'components/guides/ConditionCard.tsx',
  'components/guides/EvidenceFootnotes.tsx',
  'components/LaneManager.tsx',
  'components/monitoring/SystemMonitor.tsx',
  'components/NotificationCenter.tsx',
  'components/performance/PerformanceDashboard.tsx',
  'components/PerformanceOptimizer.tsx',
  'components/TeachingMethodDetailModal.tsx',
  'components/ui/index.ts',
  'components/UserDashboard.tsx',
  'components/user-management/UserActivityDashboard.tsx',
  'components/YouTubeVideoManager.tsx'
];

// input 오류 파일들
const inputFiles = [
  'app/accessibility/page.tsx',
  'app/membership/page.tsx',
  'app/notifications/page.tsx',
  'components/AIConfigEditor.tsx',
  'components/QuizForm.tsx',
  'components/TeachingMethodForm.tsx',
  'components/ui/index.ts',
  'components/YouTubeVideoManager.tsx'
];

let fixedCount = 0;

// Badge import 수정
badgeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 다양한 badge import 패턴 수정
    content = content.replace(/import\s+Badge\s+from\s+['"]([^'"]*badge)['"]/g, "import { Badge } from '$1'");
    content = content.replace(/import\s+\{\s*Badge\s+as\s+BadgeDefault\s*\}\s+from\s+['"]([^'"]*badge)['"]/g, "import { Badge } from '$1'");
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed Badge import: ${file}`);
      fixedCount++;
    }
  }
});

// Input import 수정
inputFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 다양한 input import 패턴 수정
    content = content.replace(/import\s+Input\s+from\s+['"]([^'"]*input)['"]/g, "import { Input } from '$1'");
    content = content.replace(/import\s+\{\s*Input\s+as\s+InputDefault\s*\}\s+from\s+['"]([^'"]*input)['"]/g, "import { Input } from '$1'");
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed Input import: ${file}`);
      fixedCount++;
    }
  }
});

console.log(`\n✅ Total fixed: ${fixedCount} files`);










