/**
 * 🏊‍♂️ JJ Swim Lab - 예약 API 엔드포인트 테스트 스크립트
 * 
 * 실제 HTTP 요청으로 예약 관리 API를 테스트합니다.
 */

const https = require('https');
const http = require('http');

async function testBookingEndpoints() {
  try {
    console.log('🔗 예약 API 엔드포인트 테스트 시작...');

    // 테스트할 엔드포인트들
    const endpoints = [
      {
        name: '예약 대시보드',
        url: 'http://localhost:5000/api/center-admin/bookings/dashboard',
        method: 'GET'
      },
      {
        name: '예약 목록',
        url: 'http://localhost:5000/api/center-admin/bookings',
        method: 'GET'
      }
    ];

    // 각 엔드포인트 테스트
    for (const endpoint of endpoints) {
      console.log(`\n📡 ${endpoint.name} 테스트 중...`);
      console.log(`   URL: ${endpoint.url}`);
      
      try {
        const response = await makeRequest(endpoint.url, endpoint.method);
        console.log(`   ✅ 응답 상태: ${response.status}`);
        console.log(`   📊 응답 데이터:`, JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log(`   ❌ 오류: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ API 엔드포인트 테스트 오류:', error);
  }
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // 테스트용 토큰
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 스크립트 실행
testBookingEndpoints();


