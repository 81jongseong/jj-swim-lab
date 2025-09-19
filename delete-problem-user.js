/**
 * 🗑️ 문제 사용자 삭제 스크립트
 */

const fetch = require('node-fetch');

async function deleteProblemUser() {
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

    // 문제 사용자 삭제
    const problemUserId = '68ca1cad1a08b64e555e1cae';
    console.log(`🗑️ 문제 사용자 삭제 중... ID: ${problemUserId}`);
    
    const deleteResponse = await fetch(`http://localhost:5000/api/users/${problemUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ 문제 사용자 삭제 성공');
      console.log('📊 삭제 결과:', deleteData);
    } else {
      console.log('❌ 사용자 삭제 실패:', deleteResponse.status);
      const errorData = await deleteResponse.json().catch(() => ({}));
      console.log('❌ 오류 상세:', errorData);
    }

    // 삭제 후 사용자 목록 재확인
    console.log('\n👥 삭제 후 사용자 목록 재확인...');
    const usersResponse = await fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`👥 현재 사용자: ${usersData.users?.length || 0}명`);
      
      if (usersData.users) {
        usersData.users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.userType}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 삭제 실패:', error.message);
  }
}

// 스크립트 실행
deleteProblemUser();
