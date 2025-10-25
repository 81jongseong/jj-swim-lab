// 회원 관리 API 테스트
const fetch = require('node-fetch');

async function testMembersAPI() {
  try {
    console.log('🔗 회원 관리 API 테스트 시작...');
    
    // 1. 로그인
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'center@swim.com',
        password: '101010'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ 로그인 실패:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ 로그인 성공');

    // 2. 회원 목록 API 테스트
    console.log('\n👥 회원 목록 API 테스트...');
    const membersResponse = await fetch('http://localhost:5000/api/center-admin/members', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('회원 목록 응답 상태:', membersResponse.status);
    if (membersResponse.ok) {
      const membersData = await membersResponse.json();
      console.log('회원 목록 응답 데이터:', JSON.stringify(membersData, null, 2));
    } else {
      const errorText = await membersResponse.text();
      console.log('회원 목록 오류:', errorText);
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 서버가 시작될 때까지 잠시 대기
setTimeout(testMembersAPI, 3000);



