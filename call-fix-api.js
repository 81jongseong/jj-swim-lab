/**
 * 센터 관리자 연결 수정 API 호출
 */

async function callFixAPI() {
  try {
    // 1. 최고관리자로 로그인
    console.log('1️⃣ 최고관리자 로그인 중...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@swim.com',
        password: 'admin123'
      })
    });

    if (!loginRes.ok) {
      const errorText = await loginRes.text();
      console.error('❌ 로그인 실패:', loginRes.status, errorText);
      return;
    }

    const loginData = await loginRes.json();
    console.log('📊 로그인 응답:', loginData);
    const token = loginData.token || loginData.data?.token;
    
    if (!token) {
      console.error('❌ 토큰을 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ 로그인 성공\n');

    // 2. 모든 센터 조회
    console.log('2️⃣ 센터 목록 조회 중...');
    const centersRes = await fetch('http://localhost:5000/api/centers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const centersData = await centersRes.json();
    console.log('📋 등록된 센터:');
    centersData.data.centers.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c._id})`);
    });

    const jjswimCenter = centersData.data.centers.find(c => 
      c.name && (c.name.toLowerCase().includes('jj') || c.name.toLowerCase().includes('swim'))
    );

    if (!jjswimCenter) {
      console.log('\n❌ JJSwim 센터를 찾을 수 없습니다.');
      return;
    }

    console.log(`\n✅ 대상 센터: ${jjswimCenter.name} (${jjswimCenter._id})\n`);

    // 3. 센터 관리자 연결 수정
    console.log('3️⃣ 센터 관리자 연결 수정 중...');
    const fixRes = await fetch('http://localhost:5000/api/centers/fix-center-admin-link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        centerAdminEmail: 'center@swim.com',
        centerId: jjswimCenter._id
      })
    });

    const fixData = await fixRes.json();
    
    if (fixData.success) {
      console.log('✅ 센터 관리자 연결 수정 완료!');
      console.log('   - 센터:', fixData.data.centerName);
      console.log('   - 관리자:', fixData.data.centerAdminEmail);
      console.log('   - managedCenters:', fixData.data.managedCenters);
      console.log('\n🎉 이제 center@swim.com 계정으로 로그인하여 센터 정보를 확인할 수 있습니다!');
    } else {
      console.log('❌ 수정 실패:', fixData.message);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

callFixAPI();

