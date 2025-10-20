/**
 * API를 통해 센터 관리자 연결 수정
 */

async function fixCenterLink() {
  try {
    // 1. 관리자로 로그인
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@swim.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    const adminToken = loginData.data.token;
    console.log('✅ 관리자 로그인 성공\n');

    // 2. center@swim.com 사용자 정보 조회
    const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const usersData = await usersResponse.json();
    const centerAdmin = usersData.data.users.find(u => u.email === 'center@swim.com');

    if (!centerAdmin) {
      console.error('❌ center@swim.com 계정을 찾을 수 없습니다.');
      return;
    }

    console.log('👤 센터 관리자 계정:');
    console.log('   - 이메일:', centerAdmin.email);
    console.log('   - ID:', centerAdmin._id);
    console.log('   - centerId:', centerAdmin.centerId);
    console.log('   - managedCenters:', centerAdmin.centerAdminInfo?.managedCenters || []);

    // 3. 모든 센터 조회
    const centersResponse = await fetch('http://localhost:5000/api/centers', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const centersData = await centersResponse.json();
    console.log('\n📋 등록된 센터 목록:');
    centersData.data.centers.forEach((center, idx) => {
      console.log(`   ${idx + 1}. ${center.name} (ID: ${center._id})`);
    });

    // 4. JJSwim 센터 찾기
    const jjswimCenter = centersData.data.centers.find(c => 
      c.name.includes('JJ') || c.name.includes('swim') || c.name.includes('Swim')
    );

    if (!jjswimCenter) {
      console.log('\n❌ JJSwim 센터를 찾을 수 없습니다.');
      return;
    }

    console.log('\n🔗 연결할 센터:', jjswimCenter.name, '(ID:', jjswimCenter._id, ')');

    // 5. 사용자 정보 업데이트 (관리자 권한)
    const updateResponse = await fetch(`http://localhost:5000/api/admin/users/${centerAdmin._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        centerId: jjswimCenter._id,
        centerAdminInfo: {
          managedCenters: [jjswimCenter._id],
          role: 'owner',
          permissions: ['all']
        }
      })
    });

    const updateData = await updateResponse.json();
    
    if (updateData.success) {
      console.log('\n✅ 센터 연결 성공!');
      console.log('   - centerId:', jjswimCenter._id);
      console.log('   - managedCenters:', [jjswimCenter._id]);
    } else {
      console.log('\n❌ 업데이트 실패:', updateData.message);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

fixCenterLink();







