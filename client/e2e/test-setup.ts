import { test as base, expect } from '@playwright/test';

// expect를 export
export { expect };

/**
 * 테스트 설정 및 헬퍼 함수
 * 
 * 이 파일은 다음을 제공합니다:
 * - 테스트 데이터베이스 연결
 * - 테스트 데이터 시드
 * - 테스트 환경 설정
 * - 공통 헬퍼 함수들
 */

// 테스트 환경 설정
export const TEST_CONFIG = {
  SERVER_URL: process.env.TEST_SERVER_URL || 'http://localhost:5000',
  CLIENT_URL: process.env.TEST_CLIENT_URL || 'http://localhost:3000',
  TEST_DB_URI: process.env.TEST_DB_URI || 'mongodb://localhost:27017/jj-swim-lab-test',
  JWT_SECRET: process.env.TEST_JWT_SECRET || 'test-jwt-secret-key',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000'),
  API_RETRY_COUNT: parseInt(process.env.API_RETRY_COUNT || '3'),
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
  NODE_ENV: process.env.NODE_ENV || 'test'
};

// 테스트 사용자 데이터
export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'password123',
    name: '관리자',
    userType: 'superAdmin'
  },
  centerAdmin: {
    email: 'centeradmin@example.com',
    password: 'password123',
    name: '센터 관리자',
    userType: 'centerAdmin'
  },
  instructor: {
    email: 'instructor@example.com',
    password: 'password123',
    name: '강사',
    userType: 'instructor'
  },
  student: {
    email: 'student@example.com',
    password: 'password123',
    name: '학생',
    userType: 'student'
  }
};

// 테스트 센터 데이터
export const TEST_CENTERS = {
  main: {
    name: 'JJ 수영장',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    email: 'info@jjswim.com',
    facilities: ['수영장', '샤워실', '락커룸'],
    operatingHours: {
      weekdays: '06:00-22:00',
      weekends: '08:00-20:00'
    }
  }
};

// 테스트 강습 데이터
export const TEST_COURSES = {
  beginner: {
    name: '기초 수영',
    description: '수영을 처음 배우는 분들을 위한 기초 강습',
    level: 'beginner',
    duration: 60,
    price: 100000,
    maxStudents: 10
  },
  intermediate: {
    name: '중급 수영',
    description: '기본기를 익힌 분들을 위한 중급 강습',
    level: 'intermediate',
    duration: 60,
    price: 120000,
    maxStudents: 8
  }
};

// 테스트 예약 데이터
export const TEST_BOOKINGS = {
  practice: {
    date: '2024-12-25',
    startTime: '10:00',
    endTime: '11:00',
    laneNumber: 1,
    purpose: 'practice',
    notes: '개인 연습'
  },
  lesson: {
    date: '2024-12-26',
    startTime: '14:00',
    endTime: '15:00',
    laneNumber: 2,
    purpose: 'lesson',
    notes: '강습 예약'
  }
};

// 테스트 결제 데이터
export const TEST_PAYMENTS = {
  course: {
    amount: 100000,
    paymentMethod: 'card',
    purpose: 'course',
    notes: '강습료 결제'
  },
  booking: {
    amount: 50000,
    paymentMethod: 'transfer',
    purpose: 'booking',
    notes: '예약료 결제'
  }
};

// API 헬퍼 함수들
export class TestAPIHelper {
  constructor(private page: any) {}

  async login(user: typeof TEST_USERS.admin) {
    const response = await this.page.request.post(`${TEST_CONFIG.SERVER_URL}/api/auth/login`, {
      data: {
        email: user.email,
        password: user.password
      }
    });

    if (response.status() !== 200) {
      throw new Error(`로그인 실패: ${response.status()}`);
    }

    const data = await response.json();
    return data.data.token;
  }

  async createUser(userData: any, authToken: string) {
    const response = await this.page.request.post(`${TEST_CONFIG.SERVER_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: userData
    });

    if (response.status() !== 201) {
      throw new Error(`사용자 생성 실패: ${response.status()}`);
    }

    return response.json();
  }

  async createCenter(centerData: any, authToken: string) {
    const response = await this.page.request.post(`${TEST_CONFIG.SERVER_URL}/api/centers`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: centerData
    });

    if (response.status() !== 201) {
      throw new Error(`센터 생성 실패: ${response.status()}`);
    }

    return response.json();
  }

  async createCourse(courseData: any, authToken: string) {
    const response = await this.page.request.post(`${TEST_CONFIG.SERVER_URL}/api/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: courseData
    });

    if (response.status() !== 201) {
      throw new Error(`강습 생성 실패: ${response.status()}`);
    }

    return response.json();
  }

  async createBooking(bookingData: any, authToken: string) {
    const response = await this.page.request.post(`${TEST_CONFIG.SERVER_URL}/api/bookings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: bookingData
    });

    if (response.status() !== 201) {
      throw new Error(`예약 생성 실패: ${response.status()}`);
    }

    return response.json();
  }

  async createPayment(paymentData: any, authToken: string) {
    const response = await this.page.request.post(`${TEST_CONFIG.SERVER_URL}/api/payments`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: paymentData
    });

    if (response.status() !== 201) {
      throw new Error(`결제 생성 실패: ${response.status()}`);
    }

    return response.json();
  }

  async cleanupTestData(authToken: string) {
    // 테스트 데이터 정리 (필요한 경우)
    try {
      // 테스트용 사용자들 삭제
      const usersResponse = await this.page.request.get(`${TEST_CONFIG.SERVER_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (usersResponse.status() === 200) {
        const usersData = await usersResponse.json();
        const testUsers = usersData.data.users.filter((user: any) => 
          user.email.includes('test') || user.email.includes('api-test')
        );

        for (const user of testUsers) {
          await this.page.request.delete(`${TEST_CONFIG.SERVER_URL}/api/users/${user._id}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
        }
      }
    } catch (error) {
      console.warn('테스트 데이터 정리 중 오류:', error);
    }
  }
}

// 테스트 확장
export const test = base.extend<{
  apiHelper: TestAPIHelper;
}>({
  apiHelper: async ({ page }, use) => {
    const helper = new TestAPIHelper(page);
    await use(helper);
  }
});

// 전역 테스트 설정
export const setupTestEnvironment = async () => {
  // 테스트 환경 설정
  console.log('테스트 환경 설정 중...');
  console.log(`서버 URL: ${TEST_CONFIG.SERVER_URL}`);
  console.log(`클라이언트 URL: ${TEST_CONFIG.CLIENT_URL}`);
  console.log(`테스트 DB: ${TEST_CONFIG.TEST_DB_URI}`);
};

// 테스트 데이터 시드
export const seedTestData = async (apiHelper: TestAPIHelper) => {
  console.log('테스트 데이터 시드 중...');
  
  try {
    // 관리자로 로그인
    const adminToken = await apiHelper.login(TEST_USERS.admin);
    
    // 기본 테스트 데이터 생성
    // (실제 구현에서는 필요한 테스트 데이터를 생성)
    
    console.log('테스트 데이터 시드 완료');
  } catch (error) {
    console.error('테스트 데이터 시드 실패:', error);
    throw error;
  }
};
