/**
 * 🌐 API 로그인 테스트 스크립트
 */

const axios = require('axios');

async function testApiLogin() {
  try {
    console.log('🌐 API 로그인 테스트');
    console.log('====================');
    
    const baseURL = 'http://localhost:5000';
    
    // 센터 관리자 로그인 테스트
    console.log('📋 센터 관리자 로그인 테스트...');
    
    const loginData = {
      userId: 'center',
      password: '101010'
    };
    
    console.log(`📤 요청 데이터:`, loginData);
    
    const response = await axios.post(`${baseURL}/api/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ 로그인 성공!');
    console.log(`📊 응답 상태: ${response.status}`);
    console.log(`📋 응답 데이터:`, {
      success: response.data.success,
      message: response.data.message,
      token: response.data.token ? `${response.data.token.substring(0, 20)}...` : '없음',
      user: response.data.user ? {
        userId: response.data.user.userId,
        name: response.data.user.name,
        userType: response.data.user.userType
      } : '없음'
    });
    
  } catch (error) {
    console.error('❌ API 로그인 테스트 실패:');
    
    if (error.response) {
      console.error(`📊 응답 상태: ${error.response.status}`);
      console.error(`📋 응답 데이터:`, error.response.data);
    } else if (error.request) {
      console.error('🌐 서버 연결 실패 - 서버가 실행 중인지 확인해주세요');
    } else {
      console.error('❌ 오류:', error.message);
    }
  }
}

testApiLogin();
