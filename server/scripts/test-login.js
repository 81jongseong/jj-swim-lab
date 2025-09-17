/**
 * 🔐 로그인 테스트 스크립트
 */

const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('🔐 센터 관리자 로그인 테스트');
    console.log('============================');
    
    // 테스트할 계정 정보
    const testAccount = {
      userId: 'center',
      password: '101010'
    };
    
    console.log(`📋 테스트 계정: ${testAccount.userId}`);
    console.log(`🔑 테스트 비밀번호: ${testAccount.password}`);
    
    // 비밀번호 해싱 테스트
    const hashedPassword = await bcrypt.hash('101010', 12);
    console.log(`🔐 해싱된 비밀번호: ${hashedPassword.substring(0, 20)}...`);
    
    // 비밀번호 검증 테스트
    const isValidPassword = await bcrypt.compare('101010', hashedPassword);
    console.log(`✅ 비밀번호 검증 결과: ${isValidPassword}`);
    
    // 다른 비밀번호로 테스트
    const isInvalidPassword = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log(`❌ 잘못된 비밀번호 검증 결과: ${isInvalidPassword}`);
    
    console.log('\n📝 로그인 테스트 완료');
    
  } catch (error) {
    console.error('❌ 로그인 테스트 오류:', error);
  }
}

testLogin();