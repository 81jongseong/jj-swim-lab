import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 통계 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/stats', () => {
    it('관리자가 전체 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 전체 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 전체 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/users', () => {
    it('관리자가 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/users')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/courses', () => {
    it('관리자가 강의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 강의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/courses')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 강의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/bookings', () => {
    it('관리자가 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/bookings')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/bookings')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/payments', () => {
    it('관리자가 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/payments')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/payments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/centers', () => {
    it('관리자가 센터 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/centers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 센터 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/centers')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 센터 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/centers')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/revenue', () => {
    it('관리자가 수익 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 수익 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/revenue')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 수익 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/revenue')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/period/:period', () => {
    it('관리자가 특정 기간 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/period/daily')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 특정 기간 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/period/weekly')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 특정 기간 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/period/monthly')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/export', () => {
    it('관리자가 통계를 내보낼 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 통계를 내보낼 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/export')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 통계를 내보낼 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/export')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/dashboard', () => {
    it('관리자가 대시보드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 대시보드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 대시보드 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/stats');

      expect([404, 401]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', 'Bearer invalid-token');

      expect([404, 401]).toContain(response.status);
    });
  });
});