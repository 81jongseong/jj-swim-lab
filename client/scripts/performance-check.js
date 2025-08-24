#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 JJ Swim Lab 성능 체크 시작...\n');

// 번들 크기 분석
function analyzeBundleSize() {
  console.log('📊 번들 크기 분석 중...');
  
  const nextDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(nextDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log('❌ .next/static 디렉토리를 찾을 수 없습니다. 먼저 빌드를 실행해주세요.');
    return;
  }
  
  let totalSize = 0;
  let fileCount = 0;
  
  function calculateDirSize(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        calculateDirSize(filePath);
      } else {
        totalSize += stat.size;
        fileCount++;
        
        // 큰 파일들 표시
        if (stat.size > 100 * 1024) { // 100KB 이상
          const sizeKB = (stat.size / 1024).toFixed(2);
          console.log(`  📁 ${file}: ${sizeKB} KB`);
        }
      }
    });
  }
  
  calculateDirSize(staticDir);
  
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n📈 총 번들 크기: ${totalSizeMB} MB (${fileCount}개 파일)`);
  
  // 성능 권장사항
  if (totalSize > 2 * 1024 * 1024) { // 2MB 이상
    console.log('⚠️  번들 크기가 큽니다. 다음 최적화를 고려해보세요:');
    console.log('   • 코드 스플리팅 적용');
    console.log('   • Tree Shaking 강화');
    console.log('   • 불필요한 의존성 제거');
  } else if (totalSize > 1 * 1024 * 1024) { // 1MB 이상
    console.log('📝 번들 크기가 적당합니다. 추가 최적화를 고려해보세요.');
  } else {
    console.log('✅ 번들 크기가 최적화되어 있습니다!');
  }
}

// 의존성 분석
function analyzeDependencies() {
  console.log('\n📦 의존성 분석 중...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json을 찾을 수 없습니다.');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const { dependencies, devDependencies } = packageJson;
  
  console.log(`📊 프로덕션 의존성: ${Object.keys(dependencies).length}개`);
  console.log(`📊 개발 의존성: ${Object.keys(devDependencies).length}개`);
  
  // 큰 패키지들 확인
  const largePackages = [
    '@tensorflow/tfjs',
    'three',
    'framer-motion',
    'lucide-react'
  ];
  
  console.log('\n🔍 주요 패키지 상태:');
  largePackages.forEach(pkg => {
    if (dependencies[pkg]) {
      console.log(`  ✅ ${pkg}: 설치됨`);
    } else if (devDependencies[pkg]) {
      console.log(`  ⚠️  ${pkg}: 개발 의존성 (프로덕션에서 제거 고려)`);
    } else {
      console.log(`  ❌ ${pkg}: 설치되지 않음`);
    }
  });
}

// 성능 권장사항
function generateRecommendations() {
  console.log('\n💡 성능 최적화 권장사항:');
  console.log('1. 🖼️  이미지 최적화:');
  console.log('   • WebP/AVIF 포맷 사용');
  console.log('   • 적절한 이미지 크기 설정');
  console.log('   • 지연 로딩 적용');
  
  console.log('\n2. 📦 번들 최적화:');
  console.log('   • 코드 스플리팅 구현');
  console.log('   • Tree Shaking 강화');
  console.log('   • 동적 import 사용');
  
  console.log('\n3. 🚀 런타임 최적화:');
  console.log('   • React.memo 사용');
  console.log('   • useCallback/useMemo 최적화');
  console.log('   • 가상화 적용 (대용량 리스트)');
  
  console.log('\n4. 📱 PWA 최적화:');
  console.log('   • Service Worker 구현');
  console.log('   • 오프라인 지원');
  console.log('   • 앱 설치 가능');
}

// 메인 실행
try {
  analyzeBundleSize();
  analyzeDependencies();
  generateRecommendations();
  
  console.log('\n✅ 성능 체크 완료!');
} catch (error) {
  console.error('❌ 성능 체크 중 오류 발생:', error.message);
  process.exit(1);
}

