/**
 * @file 실제 기능 테스트 스크립트
 * @description 페이지 존재 여부, API 연결, 데이터베이스 연결 등을 실제로 테스트합니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeHttpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testPageExists(pagePath) {
  const fullPath = path.join(__dirname, '..', 'client', 'app', pagePath, 'page.tsx');
  return fs.existsSync(fullPath);
}

async function testApiEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await makeHttpRequest(`http://localhost:5000${endpoint}`, options);
    return {
      success: response.statusCode < 400,
      statusCode: response.statusCode,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testDatabaseConnection() {
  try {
    const response = await testApiEndpoint('/health');
    return response.success;
  } catch (error) {
    return false;
  }
}

async function runFunctionalTests() {
  log('🔍 실제 기능 테스트 시작', colors.cyan);
  log('');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // 1. 페이지 존재 여부 테스트
  log('📄 페이지 존재 여부 테스트', colors.blue);
  const requiredPages = [
    'center-admin/dashboard',
    'center-admin/reviews',
    'center-admin/notices',
    'center-admin/payments',
    'center-admin/users',
    'center-admin/instructors',
    'center-admin/settings',
    'center-admin/info',
    'center-admin/introduction',
    'center-admin/health',
    'admin/dashboard',
    'admin/users',
    'admin/centers',
    'admin/courses',
    'admin/instructors',
    'instructor/dashboard',
    'instructor/students',
    'instructor/courses',
    'student/dashboard',
  ];
  
  for (const page of requiredPages) {
    totalTests++;
    const exists = await testPageExists(page);
    if (exists) {
      log(`  ✅ ${page}`, colors.green);
      passedTests++;
    } else {
      log(`  ❌ ${page} - 페이지가 존재하지 않습니다`, colors.red);
    }
  }
  
  log('');
  
  // 2. API 엔드포인트 테스트
  log('🔌 API 엔드포인트 테스트', colors.blue);
  const requiredApis = [
    { endpoint: '/health', method: 'GET' },
    { endpoint: '/verify', method: 'GET' },
    { endpoint: '/dashboard-stats', method: 'GET' },
    { endpoint: '/api/auth/login', method: 'POST', body: { userId: 'test', password: 'test' } },
  ];
  
  for (const api of requiredApis) {
    totalTests++;
    const result = await testApiEndpoint(api.endpoint, api.method, api.body);
    if (result.success) {
      log(`  ✅ ${api.method} ${api.endpoint}`, colors.green);
      passedTests++;
    } else {
      log(`  ❌ ${api.method} ${api.endpoint} - ${result.error || `HTTP ${result.statusCode}`}`, colors.red);
    }
  }
  
  log('');
  
  // 3. 데이터베이스 연결 테스트
  log('🗄️ 데이터베이스 연결 테스트', colors.blue);
  totalTests++;
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    log(`  ✅ 데이터베이스 연결 성공`, colors.green);
    passedTests++;
  } else {
    log(`  ❌ 데이터베이스 연결 실패`, colors.red);
  }
  
  log('');
  
  // 4. 서버 상태 테스트
  log('🖥️ 서버 상태 테스트', colors.blue);
  totalTests++;
  try {
    const response = await makeHttpRequest('http://localhost:5000/health');
    if (response.statusCode === 200) {
      log(`  ✅ 서버 정상 실행 중`, colors.green);
      passedTests++;
    } else {
      log(`  ❌ 서버 응답 오류: HTTP ${response.statusCode}`, colors.red);
    }
  } catch (error) {
    log(`  ❌ 서버 연결 실패: ${error.message}`, colors.red);
  }
  
  log('');
  
  // 5. 클라이언트 빌드 테스트
  log('🏗️ 클라이언트 빌드 테스트', colors.blue);
  totalTests++;
  const buildPath = path.join(__dirname, '..', 'client', '.next');
  if (fs.existsSync(buildPath)) {
    log(`  ✅ 클라이언트 빌드 파일 존재`, colors.green);
    passedTests++;
  } else {
    log(`  ❌ 클라이언트 빌드 파일 없음 - npm run build 필요`, colors.red);
  }
  
  log('');
  
  // 결과 출력
  const percentage = Math.round((passedTests / totalTests) * 100);
  log('📊 실제 기능 테스트 결과', colors.magenta);
  log(`완료율: ${passedTests}/${totalTests} (${percentage}%)`, colors.cyan);
  
  if (passedTests === totalTests) {
    log('🎉 모든 기능 테스트가 성공했습니다!', colors.green);
    process.exit(0);
  } else {
    log('⚠️ 일부 기능 테스트가 실패했습니다.', colors.yellow);
    log('위의 오류를 확인하고 수정해주세요.', colors.yellow);
    process.exit(1);
  }
}

// 테스트 실행
runFunctionalTests().catch(error => {
  log(`❌ 테스트 실행 중 오류 발생: ${error.message}`, colors.red);
  process.exit(1);
});
