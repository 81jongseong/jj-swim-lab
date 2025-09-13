import { test, expect } from './test-setup';
import { TEST_CONFIG, TEST_USERS, TestAPIHelper } from './test-setup';

/**
 * 통합 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 서버와 클라이언트 간의 실제 API 통신
 * - 데이터베이스 연동
 * - 인증 토큰 기반 API 호출
 * - 에러 처리 및 응답 구조
 * - 실시간 데이터 동기화
 */

test.describe('통합 테스트', () => {
  test.describe('API 통신', () => {
    test('서버 상태 확인', async ({ page }) => {
      // 서버 헬스 체크
      const response = await page.request.get('http://localhost:5000/api/health');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
    });

    test('인증 없는 API 호출 시 401 에러', async ({ page }) => {
      // 보호된 엔드포인트에 인증 없이 접근
      const response = await page.request.get('http://localhost:5000/api/users');
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('잘못된 엔드포인트 호출 시 404 에러', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/api/nonexistent');
      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  test.describe('인증 API 통합', () => {
    test('로그인 API 통합 테스트', async ({ page }) => {
      // 로그인 요청
      const loginResponse = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      expect(loginResponse.status()).toBe(200);
      
      const loginData = await loginResponse.json();
      expect(loginData).toHaveProperty('success', true);
      expect(loginData).toHaveProperty('data');
      expect(loginData.data).toHaveProperty('user');
      expect(loginData.data).toHaveProperty('token');
      
      // 토큰으로 보호된 엔드포인트 호출
      const profileResponse = await page.request.get('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`
        }
      });

      expect(profileResponse.status()).toBe(200);
      
      const profileData = await profileResponse.json();
      expect(profileData).toHaveProperty('success', true);
      expect(profileData.data.user).toHaveProperty('email', 'test@example.com');
    });

    test('회원가입 API 통합 테스트', async ({ page }) => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      
      const signupResponse = await page.request.post('http://localhost:5000/api/auth/signup', {
        data: {
          name: '통합 테스트 사용자',
          email: uniqueEmail,
          password: 'password123',
          userType: 'student'
        }
      });

      expect(signupResponse.status()).toBe(201);
      
      const signupData = await signupResponse.json();
      expect(signupData).toHaveProperty('success', true);
      expect(signupData.data.user).toHaveProperty('email', uniqueEmail);
      
      // 새로 생성된 사용자로 로그인 테스트
      const loginResponse = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: uniqueEmail,
          password: 'password123'
        }
      });

      expect(loginResponse.status()).toBe(200);
    });
  });

  test.describe('사용자 관리 API 통합', () => {
    let authToken: string;

    test.beforeEach(async ({ page }) => {
      // 관리자로 로그인하여 토큰 획득
      const loginResponse = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'password123'
        }
      });

      const loginData = await loginResponse.json();
      authToken = loginData.data.token;
    });

    test('사용자 목록 조회 API 통합', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('users');
      expect(Array.isArray(data.data.users)).toBe(true);
    });

    test('사용자 생성 API 통합', async ({ page }) => {
      const userData = {
        name: 'API 테스트 사용자',
        email: `api-test-${Date.now()}@example.com`,
        userType: 'student',
        password: 'password123'
      };

      const response = await page.request.post('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: userData
      });

      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data.user).toHaveProperty('email', userData.email);
    });

    test('사용자 수정 API 통합', async ({ page }) => {
      // 먼저 사용자 생성
      const createResponse = await page.request.post('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: '수정 테스트 사용자',
          email: `update-test-${Date.now()}@example.com`,
          userType: 'student',
          password: 'password123'
        }
      });

      const createData = await createResponse.json();
      const userId = createData.data.user._id;

      // 사용자 수정
      const updateResponse = await page.request.put(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: '수정된 사용자명'
        }
      });

      expect(updateResponse.status()).toBe(200);
      
      const updateData = await updateResponse.json();
      expect(updateData.data.user.name).toBe('수정된 사용자명');
    });
  });

  test.describe('센터 관리 API 통합', () => {
    let authToken: string;

    test.beforeEach(async ({ page }) => {
      // 센터 관리자로 로그인
      const loginResponse = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'centeradmin@example.com',
          password: 'password123'
        }
      });

      const loginData = await loginResponse.json();
      authToken = loginData.data.token;
    });

    test('센터 정보 조회 API 통합', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/api/centers/my-center', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('center');
    });

    test('센터 통계 조회 API 통합', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/api/centers/my-center/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('totalStudents');
      expect(data.data).toHaveProperty('totalInstructors');
      expect(data.data).toHaveProperty('totalCourses');
    });
  });

  test.describe('예약 시스템 API 통합', () => {
    let authToken: string;

    test.beforeEach(async ({ page }) => {
      // 학생으로 로그인
      const loginResponse = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'student@example.com',
          password: 'password123'
        }
      });

      const loginData = await loginResponse.json();
      authToken = loginData.data.token;
    });

    test('예약 생성 API 통합', async ({ page }) => {
      const bookingData = {
        date: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00',
        laneNumber: 1,
        purpose: 'practice',
        notes: '통합 테스트 예약'
      };

      const response = await page.request.post('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: bookingData
      });

      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data.booking).toHaveProperty('date', bookingData.date);
    });

    test('예약 목록 조회 API 통합', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('bookings');
      expect(Array.isArray(data.data.bookings)).toBe(true);
    });
  });

  test.describe('결제 시스템 API 통합', () => {
    let authToken: string;

    test.beforeEach(async ({ page }) => {
      // 학생으로 로그인
      const loginResponse = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'student@example.com',
          password: 'password123'
        }
      });

      const loginData = await loginResponse.json();
      authToken = loginData.data.token;
    });

    test('결제 생성 API 통합', async ({ page }) => {
      const paymentData = {
        amount: 100000,
        paymentMethod: 'card',
        purpose: 'course',
        notes: '통합 테스트 결제'
      };

      const response = await page.request.post('http://localhost:5000/api/payments', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: paymentData
      });

      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data.payment).toHaveProperty('amount', paymentData.amount);
    });

    test('결제 통계 조회 API 통합', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/api/payments/stats/summary', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('totalPayments');
      expect(data.data).toHaveProperty('totalAmount');
    });
  });

  test.describe('에러 처리 통합', () => {
    test('잘못된 데이터로 API 호출 시 적절한 에러 응답', async ({ page }) => {
      const response = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'invalid-email',
          password: 'short'
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('서버 에러 시 적절한 에러 응답', async ({ page }) => {
      // 존재하지 않는 사용자로 로그인 시도
      const response = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  test.describe('데이터 일관성 통합', () => {
    test('사용자 생성 후 즉시 조회 가능', async ({ page }) => {
      // 관리자로 로그인
      const loginResponse = await page.request.post('http://localhost:5000/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'password123'
        }
      });

      const loginData = await loginResponse.json();
      const authToken = loginData.data.token;

      // 사용자 생성
      const uniqueEmail = `consistency-test-${Date.now()}@example.com`;
      const createResponse = await page.request.post('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: '일관성 테스트 사용자',
          email: uniqueEmail,
          userType: 'student',
          password: 'password123'
        }
      });

      expect(createResponse.status()).toBe(201);
      const createData = await createResponse.json();
      const userId = createData.data.user._id;

      // 즉시 조회
      const getResponse = await page.request.get(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(getResponse.status()).toBe(200);
      const getData = await getResponse.json();
      expect(getData.data.user.email).toBe(uniqueEmail);
    });
  });
});
