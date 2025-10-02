/**
 * @file useAuth import 경로 수정 스크립트
 * @description 모든 페이지에서 useAuth import 경로를 올바르게 수정
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const fs = require('fs');
const path = require('path');

// 수정할 파일들의 경로와 올바른 import 경로 매핑
const fileMappings = [
  // admin 폴더 (2단계 깊이)
  { file: 'client/app/admin/quiz/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/users/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/user-activities/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/revenue/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/performance/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/monitoring/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/course-oversight/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/centers/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/center-management/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/bookings/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/backup/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/admin/approvals/page.tsx', correctPath: '../../../hooks/useAuth' },
  
  // student 폴더 (2단계 깊이)
  { file: 'client/app/student/bookings/page.tsx', correctPath: '../../../hooks/useAuth' },
  
  // instructor 폴더 (2단계 깊이)
  { file: 'client/app/instructor/dashboard/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/instructor/bookings/page.tsx', correctPath: '../../../hooks/useAuth' },
  
  // center-admin 폴더 (2단계 깊이)
  { file: 'client/app/center-admin/users/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/reviews/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/payments/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/reports/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/lesson-plans/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/notices/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/instructors/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/dashboard/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/courses/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/bookings/page.tsx', correctPath: '../../../hooks/useAuth' },
  { file: 'client/app/center-admin/approvals/page.tsx', correctPath: '../../../hooks/useAuth' },
  
  // auth 폴더 (2단계 깊이)
  { file: 'client/app/auth/login/page.tsx', correctPath: '../../../hooks/useAuth' },
  
  // 루트 레벨 폴더들 (1단계 깊이)
  { file: 'client/app/shop/page.tsx', correctPath: '../../hooks/useAuth' },
  { file: 'client/app/quiz/page.tsx', correctPath: '../../hooks/useAuth' },
  { file: 'client/app/mobile-learning/page.tsx', correctPath: '../../hooks/useAuth' },
  { file: 'client/app/community/page.tsx', correctPath: '../../hooks/useAuth' },
  { file: 'client/app/ai-evaluation/page.tsx', correctPath: '../../hooks/useAuth' },
  { file: 'client/app/ai-config/page.tsx', correctPath: '../../hooks/useAuth' },
  { file: 'client/app/ai-analysis/page.tsx', correctPath: '../../hooks/useAuth' },
  { file: 'client/app/about/page.tsx', correctPath: '../../hooks/useAuth' }
];

function fixUseAuthImports() {
  console.log('🔧 useAuth import 경로 수정 시작...');
  
  let fixedCount = 0;
  
  fileMappings.forEach(({ file, correctPath }) => {
    try {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 기존 잘못된 import 경로를 찾아서 수정
        const oldPattern = /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/hooks\/useAuth['"];?/g;
        const newImport = `import { useAuth } from '${correctPath}';`;
        
        if (oldPattern.test(content)) {
          content = content.replace(oldPattern, newImport);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ ${file} 수정 완료`);
          fixedCount++;
        } else {
          console.log(`ℹ️ ${file}: 수정할 내용 없음`);
        }
      } else {
        console.log(`❌ ${file}: 파일을 찾을 수 없음`);
      }
    } catch (error) {
      console.error(`❌ ${file} 수정 오류:`, error.message);
    }
  });
  
  console.log(`\n🎉 useAuth import 경로 수정 완료! ${fixedCount}개 파일 수정됨`);
}

// 스크립트 실행
fixUseAuthImports();

