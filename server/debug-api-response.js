const fetch = require('node-fetch');
require('dotenv').config({ path: './.env' });

const API_BASE_URL = 'http://localhost:5000/api';

async function debugApiResponse() {
  console.log('🧪 API 응답 디버깅');
  console.log('==================================================\n');

  // 1️⃣ 로그인
  console.log('1️⃣ 로그인 테스트...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'center-admin@jjswimlab.com',
      password: 'admin123'
    })
  });

  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✅ 로그인 성공:', loginData.user?.name);

  // 2️⃣ 회원 목록 API 호출
  console.log('\n2️⃣ 회원 목록 API 호출...\n');
  const response = await fetch(`${API_BASE_URL}/center-admin/members`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log('📊 API 응답 전체:', JSON.stringify(data, null, 2));
}

debugApiResponse();


