// 서버가 실행 중이므로 API를 통해 데이터 생성
const fetch = require('node-fetch');

async function createDataViaServer() {
  try {
    console.log('🚀 서버를 통해 데이터 생성 시작...');
    
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

    // 2. 강사 생성 (직접 데이터베이스에 생성하는 API가 없으므로 다른 방법 사용)
    console.log('👨‍🏫 강사 생성 - 서버의 데이터베이스에 직접 생성해야 함');
    
    // 3. 강습 과정 생성 (강습 과정 생성 API 사용)
    console.log('📚 강습 과정 생성 중...');
    
    const courses = [
      {
        name: '초급 자유형 기초반',
        description: '자유형 기초를 배우는 초급자 대상 반',
        level: 'beginner',
        maxStudents: 8,
        price: 80000,
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        schedule: {
          days: ['월', '수', '금'],
          time: '19:00-20:00'
        },
        lanes: [1, 2],
        poolType: 'mainPool'
      },
      {
        name: '중급 배영 완성반',
        description: '배영을 완성하는 중급자 대상 반',
        level: 'intermediate',
        maxStudents: 6,
        price: 90000,
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        schedule: {
          days: ['화', '목'],
          time: '20:00-21:00'
        },
        lanes: [3, 4],
        poolType: 'mainPool'
      },
      {
        name: '고급 접영 마스터반',
        description: '접영을 마스터하는 고급자 대상 반',
        level: 'advanced',
        maxStudents: 4,
        price: 100000,
        isPersonalLesson: false,
        courseType: 'group',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        schedule: {
          days: ['월', '수', '금'],
          time: '21:00-22:00'
        },
        lanes: [5, 6],
        poolType: 'mainPool'
      }
    ];

    for (const course of courses) {
      const courseResponse = await fetch('http://localhost:5000/api/center-admin/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(course)
      });

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        console.log(`✅ 강습 과정 생성: ${course.name}`);
      } else {
        console.log(`❌ 강습 과정 생성 실패: ${course.name}`, courseResponse.status);
      }
    }

    // 4. 결과 확인
    console.log('\n📊 생성 결과 확인:');
    
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
        coursesData.data.forEach(course => {
          console.log(`- ${course.name}: 강사 ${course.instructorName || '미배정'}, 회원 ${course.currentStudents || 0}명`);
        });
      }
    }

    const instructorsResponse = await fetch('http://localhost:5000/api/center-admin/instructors', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (instructorsResponse.ok) {
      const instructorsData = await instructorsResponse.json();
      console.log('👨‍🏫 강사 목록:', instructorsData.data?.instructors?.length || 0, '명');
    }

    const membersResponse = await fetch('http://localhost:5000/api/center-admin/members', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (membersResponse.ok) {
      const membersData = await membersResponse.json();
      console.log('👥 회원 목록:', membersData.data?.length || 0, '명');
    }

    console.log('✅ 데이터 생성 완료');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 서버가 시작될 때까지 잠시 대기
setTimeout(createDataViaServer, 2000);



