/**
 * @file 간단한 인증 테스트 스크립트
 * @description 기본적인 API 테스트 및 성능 측정
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const https = require('https');
const http = require('http');

// HTTP 요청 헬퍼 함수
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// 성능 측정 함수
function measurePerformance(func, label) {
  const start = Date.now();
  return func().then(result => {
    const duration = Date.now() - start;
    console.log(`⏱️ ${label}: ${duration}ms`);
    return { ...result, duration };
  });
}

// 기본 API 테스트
async function runBasicAPITests() {
  console.log('🔍 기본 API 테스트 시작\n');
  
  const testEndpoints = [
    { path: '/api/health', name: '헬스 체크', expectedStatus: 200 },
    { path: '/api/teaching-methods', name: '강습법 조회', expectedStatus: 200 },
    { path: '/api/youtube-videos', name: '유튜브 비디오 조회', expectedStatus: 200 },
    { path: '/api/notifications', name: '알림 조회 (인증 필요)', expectedStatus: 401 }
  ];
  
  try {
    for (const endpoint of testEndpoints) {
      console.log(`🔍 ${endpoint.name} 테스트`);
      
      const result = await measurePerformance(async () => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: endpoint.path,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        return await makeRequest(options);
      }, endpoint.name);
      
      console.log(`   상태 코드: ${result.statusCode}`);
      if (result.statusCode === endpoint.expectedStatus) {
        console.log('   ✅ 예상 상태 코드와 일치');
      } else {
        console.log(`   ⚠️ 예상 상태 코드(${endpoint.expectedStatus})와 다름`);
      }
      
      if (result.data && typeof result.data === 'object') {
        if (result.data.success !== undefined) {
          console.log(`   📊 성공 여부: ${result.data.success}`);
        }
        if (result.data.message) {
          console.log(`   💬 메시지: ${result.data.message}`);
        }
        if (result.data.data && Array.isArray(result.data.data)) {
          console.log(`   📋 데이터 개수: ${result.data.data.length}개`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ 기본 API 테스트 실행 중 오류 발생:', error.message);
  }
  
  console.log('🔍 기본 API 테스트 완료');
}

// 성능 모니터링 테스트
async function runPerformanceTests() {
  console.log('📊 성능 모니터링 테스트 시작\n');
  
  const testEndpoints = [
    { path: '/api/health', name: '헬스 체크' },
    { path: '/api/teaching-methods', name: '강습법 조회' },
    { path: '/api/youtube-videos', name: '유튜브 비디오 조회' }
  ];
  
  try {
    for (const endpoint of testEndpoints) {
      console.log(`🔍 ${endpoint.name} 성능 테스트`);
      
      // 여러 번 요청하여 평균 응답 시간 측정
      const requests = [];
      const requestCount = 5;
      
      for (let i = 0; i < requestCount; i++) {
        requests.push(measurePerformance(async () => {
          const options = {
            hostname: 'localhost',
            port: 5000,
            path: endpoint.path,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          };
          
          return await makeRequest(options);
        }, `${endpoint.name} 요청 ${i + 1}`));
      }
      
      const results = await Promise.all(requests);
      const avgDuration = results.reduce((sum, result) => sum + result.duration, 0) / results.length;
      const successCount = results.filter(result => result.statusCode === 200).length;
      
      console.log(`   📈 평균 응답 시간: ${avgDuration.toFixed(2)}ms`);
      console.log(`   ✅ 성공률: ${successCount}/${requestCount} (${(successCount/requestCount*100).toFixed(1)}%)`);
      console.log(`   📊 상태 코드 분포: ${results.map(r => r.statusCode).join(', ')}`);
      
      // 성능 평가
      if (avgDuration < 100) {
        console.log('   🚀 성능: 우수 (100ms 미만)');
      } else if (avgDuration < 500) {
        console.log('   ✅ 성능: 양호 (500ms 미만)');
      } else {
        console.log('   ⚠️ 성능: 개선 필요 (500ms 이상)');
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ 성능 테스트 실행 중 오류 발생:', error.message);
  }
  
  console.log('📊 성능 모니터링 테스트 완료');
}

// 메인 실행 함수
async function main() {
  console.log('🚀 JJ Swim Lab 기본 API 및 성능 테스트 시작\n');
  
  await runBasicAPITests();
  console.log('\n' + '='.repeat(50) + '\n');
  await runPerformanceTests();
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 스크립트 실행
main().catch(console.error);
