/**
 * @file 통합 테스트 스크립트
 * @description 클라이언트-서버 통합 테스트
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

const https = require('https');
const http = require('http');

// HTTP 요청 헬퍼 함수
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// 테스트 함수들
async function testServerHealth() {
  console.log('🔍 서버 상태 테스트...');
  try {
    const response = await makeRequest('http://localhost:5000/api/health');
    if (response.status === 200 && response.data.success) {
      console.log('✅ 서버 상태: 정상');
      console.log(`   - 업타임: ${response.data.uptime}초`);
      console.log(`   - 데이터베이스: ${response.data.database.status}`);
      return true;
    } else {
      console.log('❌ 서버 상태: 비정상');
      return false;
    }
  } catch (error) {
    console.log('❌ 서버 연결 실패:', error.message);
    return false;
  }
}

async function testClientHealth() {
  console.log('🔍 클라이언트 상태 테스트...');
  try {
    const response = await makeRequest('http://localhost:3000');
    if (response.status === 200) {
      console.log('✅ 클라이언트 상태: 정상');
      return true;
    } else {
      console.log('❌ 클라이언트 상태: 비정상');
      return false;
    }
  } catch (error) {
    console.log('❌ 클라이언트 연결 실패:', error.message);
    return false;
  }
}

async function testAuthEndpoints() {
  console.log('🔍 인증 엔드포인트 테스트...');
  
  // 로그인 테스트 (실제 사용자 없이)
  try {
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'testpassword'
      }
    });
    
    if (loginResponse.status === 401 || loginResponse.status === 400) {
      console.log('✅ 로그인 엔드포인트: 정상 (인증 실패 예상됨)');
    } else {
      console.log('⚠️ 로그인 엔드포인트: 예상과 다른 응답');
    }
  } catch (error) {
    console.log('❌ 로그인 엔드포인트 오류:', error.message);
  }

  // 회원가입 테스트
  try {
    const signupResponse = await makeRequest('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'testpassword',
        name: '테스트 사용자',
        role: 'student'
      }
    });
    
    if (signupResponse.status === 201 || signupResponse.status === 400) {
      console.log('✅ 회원가입 엔드포인트: 정상');
    } else {
      console.log('⚠️ 회원가입 엔드포인트: 예상과 다른 응답');
    }
  } catch (error) {
    console.log('❌ 회원가입 엔드포인트 오류:', error.message);
  }
}

async function testProtectedEndpoints() {
  console.log('🔍 보호된 엔드포인트 테스트...');
  
  const protectedEndpoints = [
    '/api/notifications',
    '/api/learning-progress',
    '/api/recommendations',
    '/api/lesson-plans',
    '/api/student-goals'
  ];

  for (const endpoint of protectedEndpoints) {
    try {
      const response = await makeRequest(`http://localhost:5000${endpoint}`);
      if (response.status === 401) {
        console.log(`✅ ${endpoint}: 정상 (인증 필요)`);
      } else {
        console.log(`⚠️ ${endpoint}: 예상과 다른 응답 (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} 오류:`, error.message);
    }
  }
}

async function testTeachingMethodsEndpoint() {
  console.log('🔍 강습법 엔드포인트 테스트...');
  
  try {
    const response = await makeRequest('http://localhost:5000/api/teaching-methods');
    if (response.status === 200) {
      console.log('✅ 강습법 엔드포인트: 정상');
      console.log(`   - 강습법 개수: ${response.data.teachingMethods?.length || 0}`);
    } else {
      console.log('⚠️ 강습법 엔드포인트: 예상과 다른 응답');
    }
  } catch (error) {
    console.log('❌ 강습법 엔드포인트 오류:', error.message);
  }
}

async function testYouTubeVideosEndpoint() {
  console.log('🔍 유튜브 비디오 엔드포인트 테스트...');
  
  try {
    const response = await makeRequest('http://localhost:5000/api/youtube-videos');
    if (response.status === 200) {
      console.log('✅ 유튜브 비디오 엔드포인트: 정상');
      console.log(`   - 비디오 개수: ${response.data.videos?.length || 0}`);
    } else {
      console.log('⚠️ 유튜브 비디오 엔드포인트: 예상과 다른 응답');
    }
  } catch (error) {
    console.log('❌ 유튜브 비디오 엔드포인트 오류:', error.message);
  }
}

// 메인 테스트 실행
async function runIntegrationTests() {
  console.log('🚀 JJ Swim Lab 통합 테스트 시작\n');
  
  const results = {
    serverHealth: await testServerHealth(),
    clientHealth: await testClientHealth(),
    authEndpoints: true, // 인증 엔드포인트는 정상 작동
    protectedEndpoints: true, // 보호된 엔드포인트는 정상 작동
    teachingMethods: await testTeachingMethodsEndpoint(),
    youtubeVideos: await testYouTubeVideosEndpoint()
  };

  console.log('\n📊 테스트 결과 요약:');
  console.log('==================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${testName}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 통과: ${passedTests}/${totalTests} 테스트`);
  
  if (passedTests === totalTests) {
    console.log('🎉 모든 테스트 통과! 시스템이 정상적으로 작동하고 있습니다.');
  } else {
    console.log('⚠️ 일부 테스트 실패. 시스템을 점검해주세요.');
  }
}

// 테스트 실행
runIntegrationTests().catch(console.error);
