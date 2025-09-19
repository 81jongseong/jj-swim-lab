/**
 * 📋 승인 API 테스트 및 데이터 생성 스크립트
 */

const fetch = require('node-fetch');

async function testApprovalAPI() {
  try {
    console.log('🧪 승인 API 테스트 시작...');
    
    // 1. 로그인하여 토큰 획득
    console.log('🔐 로그인 중...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'admin',
        password: '101010'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`로그인 실패: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ 로그인 성공');

    // 2. 승인 목록 조회
    console.log('📋 승인 목록 조회 중...');
    const approvalsResponse = await fetch('http://localhost:5000/api/approvals', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (approvalsResponse.ok) {
      const approvalsData = await approvalsResponse.json();
      console.log('✅ 승인 목록 조회 성공');
      console.log(`📊 현재 승인 요청: ${approvalsData.data?.approvals?.length || 0}개`);
      
      if (approvalsData.data?.approvals) {
        approvalsData.data.approvals.forEach((approval, index) => {
          console.log(`${index + 1}. ${approval.title} - ${approval.status}`);
        });
      }
    } else {
      console.log('⚠️ 승인 목록 API 응답:', approvalsResponse.status);
    }

    // 3. 대시보드 통계 조회
    console.log('\n📊 대시보드 통계 조회 중...');
    const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ 대시보드 통계 조회 성공');
      console.log('📊 통계 데이터:', {
        totalUsers: statsData.data?.totalUsers || 0,
        activeCourses: statsData.data?.activeCourses || 0,
        totalRevenue: statsData.data?.totalRevenue || 0,
        activeBookings: statsData.data?.activeBookings || 0,
        pendingApprovals: statsData.data?.pendingApprovals || 0
      });
    } else {
      console.log('⚠️ 대시보드 통계 API 응답:', statsResponse.status);
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 스크립트 실행
testApprovalAPI();
