/**
 * 👥 현재 사용자 목록 확인 스크립트
 */

const fetch = require('node-fetch');

async function checkUsers() {
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

    if (!loginResponse.ok) {
      throw new Error(`로그인 실패: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ 로그인 성공');

    // 사용자 목록 조회
    console.log('👥 사용자 목록 조회 중...');
    const usersResponse = await fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ 사용자 목록 조회 성공');
      console.log(`👥 총 사용자: ${usersData.users?.length || 0}명`);
      
      if (usersData.users) {
        console.log('\n📋 사용자 목록:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('| 순번 | 이름 | 이메일 | 타입 | 활성 |');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        usersData.users.forEach((user, index) => {
          const name = user.name || '???';
          const email = user.email || '???';
          const userType = user.userType || '???';
          const isActive = user.isActive ? '✅' : '❌';
          
          console.log(`| ${(index + 1).toString().padEnd(4)} | ${name.padEnd(8)} | ${email.padEnd(20)} | ${userType.padEnd(12)} | ${isActive} |`);
          
          if (name.includes('???') || email.includes('???') || userType.includes('???')) {
            console.log(`⚠️  문제 사용자 발견: ID ${user._id}`);
          }
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    } else {
      console.log('❌ 사용자 목록 조회 실패:', usersResponse.status);
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 스크립트 실행
checkUsers();
