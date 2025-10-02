/**
 * @file 모든 계정별 페이지의 UI 컴포넌트를 HTML 요소로 교체하는 스크립트
 * @description Card, Button, Badge 등 UI 컴포넌트를 HTML 요소로 교체
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const fs = require('fs');
const path = require('path');

// 수정할 파일 목록 (UI 컴포넌트를 사용하는 파일들)
const filesToFix = [
  'client/app/admin/revenue/page.tsx',
  'client/app/student/recommendations/page.tsx',
  'client/app/student/learning-progress/page.tsx',
  'client/app/student/progress/page.tsx',
  'client/app/student/bookings/page.tsx',
  'client/app/student/courses/page.tsx',
  'client/app/instructor/templates/page.tsx',
  'client/app/instructor/teaching-methods/page.tsx',
  'client/app/instructor/students/page.tsx',
  'client/app/instructor/lesson-planner/page.tsx',
  'client/app/instructor/health/recommendations/page.tsx',
  'client/app/instructor/exercise-prescription/page.tsx',
  'client/app/instructor/bookings/page.tsx',
  'client/app/center-admin/users/page.tsx',
  'client/app/center-admin/settings/page.tsx',
  'client/app/center-admin/reviews/page.tsx',
  'client/app/center-admin/reports/page.tsx',
  'client/app/center-admin/payments/page.tsx',
  'client/app/center-admin/notices/page.tsx',
  'client/app/center-admin/instructors/page.tsx',
  'client/app/center-admin/health/programs/page.tsx',
  'client/app/center-admin/health/members/page.tsx',
  'client/app/center-admin/courses/page.tsx',
  'client/app/center-admin/algorithm-performance/page.tsx',
  'client/app/admin/instructors/page.tsx',
  'client/app/admin/center-users/page.tsx',
  'client/app/admin/center-info/page.tsx',
  'client/app/admin/student-levels/page.tsx',
  'client/app/instructor/progress/page.tsx',
  'client/app/instructor/courses/page.tsx'
];

// UI 컴포넌트를 HTML 요소로 교체하는 함수
function replaceUIComponents(content) {
  let modifiedContent = content;
  
  // Card 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<Card([^>]*)>/g, '<div$1 className="bg-white rounded-lg shadow">');
  modifiedContent = modifiedContent.replace(/<\/Card>/g, '</div>');
  
  // CardHeader 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<CardHeader([^>]*)>/g, '<div$1 className="p-6 border-b border-gray-200">');
  modifiedContent = modifiedContent.replace(/<\/CardHeader>/g, '</div>');
  
  // CardTitle 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<CardTitle([^>]*)>/g, '<h3$1 className="text-lg font-semibold text-gray-900">');
  modifiedContent = modifiedContent.replace(/<\/CardTitle>/g, '</h3>');
  
  // CardContent 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<CardContent([^>]*)>/g, '<div$1 className="p-6">');
  modifiedContent = modifiedContent.replace(/<\/CardContent>/g, '</div>');
  
  // CardDescription 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<CardDescription([^>]*)>/g, '<p$1 className="text-sm text-gray-600">');
  modifiedContent = modifiedContent.replace(/<\/CardDescription>/g, '</p>');
  
  // Button 컴포넌트 교체 (기본 스타일)
  modifiedContent = modifiedContent.replace(/<Button([^>]*)>/g, '<button$1 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">');
  modifiedContent = modifiedContent.replace(/<\/Button>/g, '</button>');
  
  // Badge 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<Badge([^>]*)>/g, '<div$1 className="px-2 py-1 rounded-full text-sm">');
  modifiedContent = modifiedContent.replace(/<\/Badge>/g, '</div>');
  
  // LoadingSpinner 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<LoadingSpinner([^>]*)>/g, '<div$1 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>');
  modifiedContent = modifiedContent.replace(/<\/LoadingSpinner>/g, '</div>');
  
  // Input 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<Input([^>]*)>/g, '<input$1 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">');
  modifiedContent = modifiedContent.replace(/<\/Input>/g, '</input>');
  
  // Label 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<Label([^>]*)>/g, '<label$1 className="block text-sm font-medium text-gray-700">');
  modifiedContent = modifiedContent.replace(/<\/Label>/g, '</label>');
  
  // Textarea 컴포넌트 교체
  modifiedContent = modifiedContent.replace(/<Textarea([^>]*)>/g, '<textarea$1 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">');
  modifiedContent = modifiedContent.replace(/<\/Textarea>/g, '</textarea>');
  
  return modifiedContent;
}

// import 문을 제거하는 함수
function removeUIComponentImports(content) {
  let modifiedContent = content;
  
  // UI 컴포넌트 import 제거
  const importPatterns = [
    /import\s*{\s*Card[^}]*}\s*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*{\s*Button[^}]*}\s*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*{\s*Badge[^}]*}\s*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*{\s*LoadingSpinner[^}]*}\s*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*{\s*Input[^}]*}\s*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*{\s*Label[^}]*}\s*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*{\s*Textarea[^}]*}\s*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*Card[^;]*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*Button[^;]*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g,
    /import\s*Badge[^;]*from\s*['"][^'"]*components\/ui[^'"]*['"];?\s*\n/g
  ];
  
  importPatterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern, '');
  });
  
  return modifiedContent;
}

// 파일을 수정하는 함수
function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 파일이 존재하지 않습니다: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // UI 컴포넌트 import 제거
    let modifiedContent = removeUIComponentImports(content);
    
    // UI 컴포넌트를 HTML 요소로 교체
    modifiedContent = replaceUIComponents(modifiedContent);
    
    // 파일 저장
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log(`✅ 수정 완료: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 파일 수정 실패: ${filePath}`, error.message);
    return false;
  }
}

// 메인 실행 함수
function main() {
  console.log('🚀 모든 계정별 페이지의 UI 컴포넌트를 HTML 요소로 교체 시작...');
  
  let successCount = 0;
  let totalCount = filesToFix.length;
  
  filesToFix.forEach(filePath => {
    if (fixFile(filePath)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 결과: ${successCount}/${totalCount} 파일 수정 완료`);
  
  if (successCount === totalCount) {
    console.log('🎉 모든 파일이 성공적으로 수정되었습니다!');
  } else {
    console.log('⚠️ 일부 파일 수정에 실패했습니다.');
  }
}

// 스크립트 실행
main();

