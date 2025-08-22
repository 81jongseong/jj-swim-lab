#!/usr/bin/env node

/**
 * JJ Swim Lab 성능 모니터링 스크립트
 * 번들 크기, 로딩 시간, 성능 메트릭을 분석합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 JJ Swim Lab 성능 모니터링 시작...\n');

// 1. 번들 크기 분석
function analyzeBundleSize() {
  console.log('📊 1단계: 번들 크기 분석');
  
  try {
    // .next 디렉토리 확인
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      console.log('   ❌ .next 디렉토리가 없습니다. 먼저 빌드를 실행하세요.');
      return;
    }

    // bundle-report.html 확인
    const bundleReport = path.join(nextDir, 'bundle-report.html');
    if (fs.existsSync(bundleReport)) {
      const stats = fs.statSync(bundleReport);
      console.log(`   ✅ 번들 분석 보고서: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log('   ⚠️  번들 분석 보고서가 없습니다.');
    }

    // static 디렉토리 크기 분석
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      const staticSize = getDirectorySize(staticDir);
      console.log(`   📁 정적 파일 크기: ${(staticSize / 1024 / 1024).toFixed(2)} MB`);
    }

  } catch (error) {
    console.log(`   ❌ 번들 크기 분석 실패: ${error.message}`);
  }
}

// 2. 의존성 분석
function analyzeDependencies() {
  console.log('\n📦 2단계: 의존성 분석');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const { dependencies, devDependencies } = packageJson;
    
    console.log(`   📋 프로덕션 의존성: ${Object.keys(dependencies).length}개`);
    console.log(`   🛠️  개발 의존성: ${Object.keys(devDependencies).length}개`);
    
    // 큰 의존성 확인
    const largeDeps = Object.entries(dependencies)
      .filter(([name]) => ['@tensorflow', 'three', 'framer-motion'].includes(name))
      .map(([name]) => name);
    
    if (largeDeps.length > 0) {
      console.log(`   ⚠️  큰 의존성: ${largeDeps.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`   ❌ 의존성 분석 실패: ${error.message}`);
  }
}

// 3. 빌드 성능 체크
function checkBuildPerformance() {
  console.log('\n⚡ 3단계: 빌드 성능 체크');
  
  try {
    console.log('   🔄 빌드 시작...');
    const startTime = Date.now();
    
    execSync('npm run build', { stdio: 'pipe' });
    
    const buildTime = (Date.now() - startTime) / 1000;
    console.log(`   ✅ 빌드 완료: ${buildTime.toFixed(2)}초`);
    
    if (buildTime < 30) {
      console.log('   🟢 빌드 성능: 우수');
    } else if (buildTime < 60) {
      console.log('   🟡 빌드 성능: 양호');
    } else {
      console.log('   🔴 빌드 성능: 개선 필요');
    }
    
  } catch (error) {
    console.log(`   ❌ 빌드 실패: ${error.message}`);
  }
}

// 4. 성능 권장사항
function showRecommendations() {
  console.log('\n💡 4단계: 성능 권장사항');
  
  const recommendations = [
    '🎯 코드 스플리팅: React.lazy()와 Suspense 사용',
    '🖼️  이미지 최적화: Next.js Image 컴포넌트 활용',
    '📦 번들 분할: 웹팩 splitChunks 최적화',
    '🌳 Tree Shaking: 사용하지 않는 코드 제거',
    '💾 캐싱 전략: 정적 자산 캐싱 최적화',
    '🔍 번들 분석: webpack-bundle-analyzer 활용'
  ];
  
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
}

// 유틸리티 함수
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  }
  
  return totalSize;
}

// 메인 실행
function main() {
  analyzeBundleSize();
  analyzeDependencies();
  checkBuildPerformance();
  showRecommendations();
  
  console.log('\n🎉 성능 모니터링 완료!');
  console.log('📈 지속적인 모니터링으로 성능을 개선하세요.');
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundleSize,
  analyzeDependencies,
  checkBuildPerformance,
  showRecommendations
};

