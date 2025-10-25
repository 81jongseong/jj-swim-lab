/**
 * 인증이 포함된 예약 API 테스트
 * 연동 데이터: PersonalLesson, LaneRental 모델
 * 연동 파일: server/src/routes/center-admin.ts
 */

const axios = require('axios');

async function testBookingAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('🔐 센터 관리자 로그인 테스트...');
    
    // 1. 센터 관리자 로그인
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'center-admin@jjswimlab.com',
      password: 'admin123'
    });
    
    console.log('✅ 로그인 성공!');
    const token = loginResponse.data.token;
    console.log('🔑 토큰:', token.substring(0, 50) + '...');
    
    // 2. 예약 대시보드 데이터 조회
    console.log('\n📊 예약 대시보드 데이터 조회...');
    const dashboardResponse = await axios.get(`${baseURL}/center-admin/bookings/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 대시보드 데이터 조회 성공!');
    console.log('📊 대시보드 데이터:', JSON.stringify(dashboardResponse.data, null, 2));
    
    // 3. 예약 목록 조회
    console.log('\n📋 예약 목록 조회...');
    const bookingsResponse = await axios.get(`${baseURL}/center-admin/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 예약 목록 조회 성공!');
    console.log('📋 예약 목록:', JSON.stringify(bookingsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.response?.data || error.message);
  }
}

testBookingAPI();


