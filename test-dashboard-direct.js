/**
 * 📊 대시보드 API 직접 테스트
 */

const fetch = require('node-fetch');

async function testDashboard() {
  try {
    console.log('🔐 로그인 중...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'admin',
        password: '101010'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ 로그인 성공');

    // 다양한 대시보드 엔드포인트 테스트
    const endpoints = [
      '/api/dashboard/stats',
      '/api/stats',
      '/api/system/stats',
      '/api/admin/stats'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🧪 테스트 중: ${endpoint}`);
      try {
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`📡 응답 상태: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 응답 성공');
          console.log('📊 데이터:', JSON.stringify(data, null, 2));
        } else {
          console.log('❌ 응답 실패');
        }
      } catch (err) {
        console.log('❌ 요청 실패:', err.message);
      }
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testDashboard();
