/**
 * @file 사용자 인증 테스트 스크립트
 * @description 회원가입, 로그인, 토큰 검증 테스트
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

// 테스트 데이터
const testUser = {
  userId: 'testuser123',
  name: '테스트 사용자',
  email: 'test@example.com',
  password: 'password123',
  userType: 'student'
};

const loginData = {
  userId: 'testuser123',
  password: 'password123'
};

// 성능 측정 함수
function measurePerformance(func, label) {
  const start = Date.now();
  return func().then(result => {
    const duration = Date.now() - start;
    console.log(`⏱️ ${label}: ${duration}ms`);
    return { ...result, duration };
  });
}

// 인증 테스트 실행
async function runAuthenticationTests() {
  console.log('🔐 사용자 인증 테스트 시작\n');
  
  const baseUrl = 'http://localhost:5000';
  let authToken = null;
  
  try {
    // 1. 회원가입 테스트
    console.log('📝 1. 회원가입 테스트');
    const signupResult = await measurePerformance(async () => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/signup',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify(testUser).length
        }
      };
      
      return await makeRequest(options, JSON.stringify(testUser));
    }, '회원가입');
    
    console.log(`   상태 코드: ${signupResult.statusCode}`);
    if (signupResult.statusCode === 201) {
      console.log('   ✅ 회원가입 성공');
      authToken = signupResult.data.token;
      console.log(`   🔑 토큰 발급: ${authToken ? '성공' : '실패'}`);
    } else {
      console.log(`   ❌ 회원가입 실패: ${signupResult.data.error || signupResult.data.message}`);
    }
    console.log('');
    
    // 2. 로그인 테스트
    console.log('🔑 2. 로그인 테스트');
    const loginResult = await measurePerformance(async () => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify(loginData).length
        }
      };
      
      return await makeRequest(options, JSON.stringify(loginData));
    }, '로그인');
    
    console.log(`   상태 코드: ${loginResult.statusCode}`);
    if (loginResult.statusCode === 200) {
      console.log('   ✅ 로그인 성공');
      authToken = loginResult.data.token;
      console.log(`   🔑 토큰 발급: ${authToken ? '성공' : '실패'}`);
      console.log(`   👤 사용자 정보: ${loginResult.data.user.name} (${loginResult.data.user.userType})`);
    } else {
      console.log(`   ❌ 로그인 실패: ${loginResult.data.error || loginResult.data.message}`);
    }
    console.log('');
    
    // 3. 토큰 검증 테스트
    if (authToken) {
      console.log('🔍 3. 토큰 검증 테스트');
      const verifyResult = await measurePerformance(async () => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/verify',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        };
        
        return await makeRequest(options);
      }, '토큰 검증');
      
      console.log(`   상태 코드: ${verifyResult.statusCode}`);
      if (verifyResult.statusCode === 200) {
        console.log('   ✅ 토큰 검증 성공');
        console.log(`   👤 사용자 정보: ${verifyResult.data.user.name} (${verifyResult.data.user.userType})`);
      } else {
        console.log(`   ❌ 토큰 검증 실패: ${verifyResult.data.error || verifyResult.data.message}`);
      }
      console.log('');
      
      // 4. 보호된 엔드포인트 테스트
      console.log('🛡️ 4. 보호된 엔드포인트 테스트');
      const protectedResult = await measurePerformance(async () => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/users/profile',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        };
        
        return await makeRequest(options);
      }, '보호된 엔드포인트');
      
      console.log(`   상태 코드: ${protectedResult.statusCode}`);
      if (protectedResult.statusCode === 200) {
        console.log('   ✅ 보호된 엔드포인트 접근 성공');
      } else {
        console.log(`   ❌ 보호된 엔드포인트 접근 실패: ${protectedResult.data.error || protectedResult.data.message}`);
      }
      console.log('');
    }
    
    // 5. 잘못된 토큰 테스트
    console.log('❌ 5. 잘못된 토큰 테스트');
    const invalidTokenResult = await measurePerformance(async () => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/verify',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token-12345',
          'Content-Type': 'application/json'
        }
      };
      
      return await makeRequest(options);
    }, '잘못된 토큰');
    
    console.log(`   상태 코드: ${invalidTokenResult.statusCode}`);
    if (invalidTokenResult.statusCode === 401) {
      console.log('   ✅ 잘못된 토큰 적절히 거부됨');
    } else {
      console.log(`   ❌ 잘못된 토큰 처리 실패: ${invalidTokenResult.data.error || invalidTokenResult.data.message}`);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
  }
  
  console.log('🔐 사용자 인증 테스트 완료');
}

// 성능 모니터링 테스트
async function runPerformanceTests() {
  console.log('📊 성능 모니터링 테스트 시작\n');
  
  const baseUrl = 'http://localhost:5000';
  const testEndpoints = [
    { path: '/api/health', name: '헬스 체크' },
    { path: '/api/teaching-methods', name: '강습법 조회' },
    { path: '/api/youtube-videos', name: '유튜브 비디오 조회' },
    { path: '/api/notifications', name: '알림 조회 (인증 필요)' }
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
      const successCount = results.filter(result => result.statusCode === 200 || result.statusCode === 401).length;
      
      console.log(`   📈 평균 응답 시간: ${avgDuration.toFixed(2)}ms`);
      console.log(`   ✅ 성공률: ${successCount}/${requestCount} (${(successCount/requestCount*100).toFixed(1)}%)`);
      console.log(`   📊 상태 코드 분포: ${results.map(r => r.statusCode).join(', ')}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ 성능 테스트 실행 중 오류 발생:', error.message);
  }
  
  console.log('📊 성능 모니터링 테스트 완료');
}

// 메인 실행 함수
async function main() {
  console.log('🚀 JJ Swim Lab 인증 및 성능 테스트 시작\n');
  
  await runAuthenticationTests();
  console.log('\n' + '='.repeat(50) + '\n');
  await runPerformanceTests();
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 스크립트 실행
main().catch(console.error);
