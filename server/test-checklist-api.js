const fetch = require('node-fetch');

async function testChecklistAPI() {
  try {
    console.log('🧪 체크리스트 API 테스트 시작...');
    
    const baseURL = 'http://localhost:5000';
    const studentId = '507f1f77bcf86cd799439012';
    const courseId = '507f1f77bcf86cd799439011';
    
    // 1. 체크리스트 조회 API 테스트
    console.log(`\n🔍 체크리스트 조회 테스트: GET /api/checklist/student/${studentId}/course/${courseId}`);
    
    const response = await fetch(`${baseURL}/api/checklist/student/${studentId}/course/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 응답 상태: ${response.status}`);
    console.log(`📊 응답 헤더:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 성공:', data);
    } else {
      const errorData = await response.json();
      console.log('❌ 오류:', errorData);
    }
    
    // 2. 모든 체크리스트 조회 API 테스트
    console.log(`\n🔍 모든 체크리스트 조회 테스트: GET /api/checklist`);
    
    const allResponse = await fetch(`${baseURL}/api/checklist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 응답 상태: ${allResponse.status}`);
    
    if (allResponse.ok) {
      const allData = await allResponse.json();
      console.log('✅ 성공:', allData);
    } else {
      const allErrorData = await allResponse.json();
      console.log('❌ 오류:', allErrorData);
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

testChecklistAPI();
