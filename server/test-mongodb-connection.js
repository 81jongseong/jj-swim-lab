const fetch = require('node-fetch');

async function testMongoDBConnection() {
  try {
    console.log('🔗 MongoDB Atlas 연결 테스트 시작...');
    
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

    // 2. 센터 정보 조회
    const centerResponse = await fetch('http://localhost:5000/api/centers/my-center', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (centerResponse.ok) {
      const centerData = await centerResponse.json();
      console.log('✅ 센터 정보 조회 성공:', centerData.data?.name);
    } else {
      console.log('❌ 센터 정보 조회 실패:', centerResponse.status);
    }

    // 3. 강사 목록 조회
    const instructorsResponse = await fetch('http://localhost:5000/api/center-admin/instructors', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (instructorsResponse.ok) {
      const instructorsData = await instructorsResponse.json();
      console.log('👨‍🏫 강사 목록:', instructorsData.data?.instructors?.length || 0, '명');
      if (instructorsData.data?.instructors?.length > 0) {
        console.log('강사 이름들:', instructorsData.data.instructors.map(i => i.name));
      }
    } else {
      console.log('❌ 강사 목록 조회 실패:', instructorsResponse.status);
    }

    // 4. 강습 과정 목록 조회
    const coursesResponse = await fetch('http://localhost:5000/api/center-admin/courses', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (coursesResponse.ok) {
      const coursesData = await coursesResponse.json();
      console.log('📚 강습 과정 목록:', coursesData.data?.length || 0, '개');
      if (coursesData.data?.length > 0) {
        console.log('강습 과정 이름들:', coursesData.data.map(c => c.name));
      }
    } else {
      console.log('❌ 강습 과정 목록 조회 실패:', coursesResponse.status);
    }

    // 5. 회원 목록 조회
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
      }
    } else {
      console.log('❌ 회원 목록 조회 실패:', membersResponse.status);
    }

    console.log('✅ MongoDB Atlas 연결 테스트 완료');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 서버가 시작될 때까지 잠시 대기
setTimeout(testMongoDBConnection, 2000);



