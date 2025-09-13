/**
 * TypeScript 오류 수정 스크립트
 * req.user 속성 오류를 일괄 수정
 */

const fs = require('fs');
const path = require('path');

// 수정할 파일 목록
const filesToFix = [
  'src/routes/checklist.ts',
  'src/routes/checklist-template.ts',
  'src/middleware/cache.ts',
  'src/routes/center-level.ts',
  'src/routes/teaching-method.ts',
  'src/routes/course.ts',
  'src/routes/booking.ts',
  'src/routes/user.ts',
  'src/routes/auth.ts',
  'src/routes/payment.ts',
  'src/routes/notification.ts',
  'src/routes/quiz.ts',
  'src/routes/video.ts',
  'src/routes/progress.ts',
  'src/routes/report.ts',
  'src/routes/center.ts',
  'src/routes/community.ts',
  'src/routes/instructor.ts',
  'src/routes/center-admin.ts',
  'src/routes/student.ts'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️ 파일 없음: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // req.user 패턴들을 (req as any).user로 변경
    const patterns = [
      { from: /req\.user\?\./g, to: '(req as any).user?.' },
      { from: /req\.user\./g, to: '(req as any).user.' },
      { from: /req\.user/g, to: '(req as any).user' }
    ];

    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 수정 완료: ${filePath}`);
    } else {
      console.log(`⏭️ 수정 불필요: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 오류 발생: ${filePath}`, error.message);
  }
}

console.log('🔧 TypeScript 오류 수정 시작...');

filesToFix.forEach(fixFile);

console.log('🎉 TypeScript 오류 수정 완료!');
