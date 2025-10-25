const fetch = require('node-fetch');

async function createInstructorsAndCourses() {
  try {
    console.log('🚀 강사 및 강습 과정 생성 시작...');
    
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

    // 2. 강사 생성 API 호출 (실제로는 직접 데이터베이스에 생성해야 함)
    console.log('👨‍🏫 강사 생성 중...');
    
    // 3. 강습 과정 생성 API 호출
    console.log('📚 강습 과정 생성 중...');
    
    // 4. 회원 목록 조회
    const membersResponse = await fetch('http://localhost:5000/api/center-admin/members', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (membersResponse.ok) {
      const membersData = await membersResponse.json();
      console.log('👥 회원 목록:', membersData.data?.length || 0, '명');
      
      if (membersData.data?.length > 0) {
        console.log('회원 이름들:', membersData.data.map(m => m.name));
        
        // 회원들을 강습 과정에 배정하는 로직
        console.log('📝 회원들을 강습 과정에 배정하는 작업이 필요합니다.');
      }
    }

    console.log('✅ 작업 완료');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 서버가 시작될 때까지 잠시 대기
setTimeout(createInstructorsAndCourses, 2000);



