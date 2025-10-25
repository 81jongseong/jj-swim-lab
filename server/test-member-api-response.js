const fetch = require('node-fetch');

async function testMemberListAPI() {
  try {
    console.log('🧪 회원 목록 API 테스트');
    console.log('='.repeat(50));

    // 1. 로그인하여 토큰 획득
    console.log('\n1️⃣ 로그인 테스트...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'center-admin@jjswimlab.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ 로그인 실패:', loginResponse.status, loginResponse.statusText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ 로그인 성공:', loginData.user.name);
    const token = loginData.token;

    // 2. 회원 목록 API 테스트
    console.log('\n2️⃣ 회원 목록 API 테스트...');
    
    const response = await fetch('http://localhost:5000/api/center-admin/members', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`\n📊 응답 상태: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 회원 목록 조회 성공');
      
      // 각 회원의 레벨 정보 확인
      console.log('\n👥 회원별 레벨 정보:');
      data.data.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.name} (${member.email}):`);
        console.log(`   - currentLevel: ${member.currentLevel}`);
        console.log(`   - studentInfo.level: ${member.studentInfo?.level}`);
        console.log(`   - studentInfo 전체:`, JSON.stringify(member.studentInfo, null, 2));
      });
    } else {
      const errorData = await response.json();
      console.log('❌ 회원 목록 조회 실패:', errorData);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

testMemberListAPI();

