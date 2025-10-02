/**
 * API를 통해 회원 데이터 확인
 */

import fetch from 'node-fetch';

async function checkAPI() {
  try {
    // 먼저 로그인 (테스트 계정)
    console.log('🔐 로그인 시도...\n');
    
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      console.log('❌ 로그인 실패:', loginData);
      console.log('\n💡 테스트 계정이 없을 수 있습니다.');
      console.log('   → server/scripts/에서 샘플 데이터 생성 스크립트를 실행해보세요\n');
      return;
    }
    
    console.log('✅ 로그인 성공:', loginData.user.email, '/', loginData.user.userType);
    const token = loginData.token;
    
    // 회원 목록 조회
    console.log('\n📋 회원 목록 조회...\n');
    
    const usersRes = await fetch('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const usersData = await usersRes.json();
    
    if (!usersData.success) {
      console.log('❌ 회원 조회 실패:', usersData);
      return;
    }
    
    const users = usersData.users || [];
    console.log(`✅ 총 ${users.length}명의 회원\n`);
    
    if (users.length === 0) {
      console.log('⚠️  DB에 회원 데이터가 없습니다!');
      console.log('💡 샘플 데이터를 생성해야 합니다.\n');
      return;
    }
    
    // 건강정보 통계
    const withHealth = users.filter(u => u.healthProfile).length;
    console.log(`📊 건강정보 통계:`);
    console.log(`   - 건강정보 있음: ${withHealth}명`);
    console.log(`   - 건강정보 없음: ${users.length - withHealth}명`);
    console.log(`   - 등록률: ${((withHealth / users.length) * 100).toFixed(1)}%\n`);
    
    // 샘플 출력
    console.log('📋 샘플 회원 (최대 3명):');
    users.slice(0, 3).forEach((u, i) => {
      console.log(`\n${i + 1}. ${u.name} (${u.email})`);
      console.log(`   타입: ${u.userType}`);
      console.log(`   healthProfile:`, u.healthProfile ? '✅ 있음' : '❌ 없음');
      if (u.healthProfile) {
        console.log(`     - 나이: ${u.healthProfile.age || '-'}`);
        console.log(`     - 키/몸무게: ${u.healthProfile.height || '-'}cm / ${u.healthProfile.weight || '-'}kg`);
      }
    });
    
  } catch (error) {
    console.error('❌ API 오류:', error.message);
  }
}

checkAPI();

