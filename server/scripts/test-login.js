// 테스트할 계정들
const testAccounts = [
  {
    userId: 'admin',
    password: '101010',
    name: '최고 관리자'
  },
  {
    userId: 'center',
    password: '101010',
    name: '센터 관리자'
  },
  {
    userId: 'teacher',
    password: '101010',
    name: '김강사'
  },
  {
    userId: 'member',
    password: '101010',
    name: '이학생'
  }
];

async function testLogin(account) {
  try {
    console.log(`\n🔍 ${account.name} 로그인 테스트 시작...`);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: account.userId,
        password: account.password
      }),
    });

    console.log(`📡 응답 상태: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 로그인 성공: ${account.name}`);
      console.log(`   - 사용자 타입: ${data.user.userType}`);
      console.log(`   - 사용자 ID: ${data.user.userId}`);
      console.log(`   - 토큰 길이: ${data.token.length}자`);
      
      // 토큰 검증 테스트
      const verifyResponse = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (verifyResponse.ok) {
        console.log(`✅ 토큰 검증 성공: ${account.name}`);
      } else {
        console.log(`❌ 토큰 검증 실패: ${account.name}`);
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ 로그인 실패: ${account.name}`);
      console.log(`   - 오류: ${errorData.error || '알 수 없는 오류'}`);
    }
  } catch (error) {
    console.log(`❌ 네트워크 오류: ${account.name} - ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 로그인 테스트 시작...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const account of testAccounts) {
    await testLogin(account);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 테스트 완료!');
  console.log('\n📋 로그인 정보 요약:');
  console.log('• 최고 관리자: admin / 101010');
  console.log('• 센터 관리자: center / 101010');
  console.log('• 강사: teacher / 101010');
  console.log('• 학생: member / 101010');
}

// 테스트 실행
runTests();
