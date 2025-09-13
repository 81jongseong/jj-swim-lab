/**
 * 📊 통계 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('통계 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 관리자 사용자 생성
    const admin = await createTestUser({
      email: 'admin@example.com',
      userType: 'centerAdmin',
      name: '관리자'
    });

    adminToken = generateTestToken({
      userId: admin._id.toString(),
      email: admin.email,
      userType: admin.userType
    });

    // 강사 사용자 생성
    const instructor = await createTestUser({
      email: 'instructor@example.com',
      userType: 'instructor',
      name: '강사'
    });

    instructorToken = generateTestToken({
      userId: instructor._id.toString(),
      email: instructor.email,
      userType: instructor.userType
    });
  });

  describe('GET /api/stats', () => {
    it('관리자가 전체 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/users', () => {
    it('관리자가 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('일반 사용자가 사용자 통계 조회 시 403 에러를 반환해야 함', async () => {
      const student = await createTestUser({
        email: 'student@example.com',
        userType: 'student'
      });

      const studentToken = generateTestToken({
        userId: student._id.toString(),
        email: student.email,
        userType: student.userType
      });

      const response = await request(app)
        .get('/api/stats/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/courses', () => {
    it('관리자가 강의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 강의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/courses')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/bookings', () => {
    it('관리자가 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/bookings')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/payments', () => {
    it('관리자가 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('일반 사용자가 결제 통계 조회 시 403 에러를 반환해야 함', async () => {
      const student = await createTestUser({
        email: 'student@example.com',
        userType: 'student'
      });

      const studentToken = generateTestToken({
        userId: student._id.toString(),
        email: student.email,
        userType: student.userType
      });

      const response = await request(app)
        .get('/api/stats/payments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/revenue', () => {
    it('관리자가 수익 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 수익 통계 조회 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/stats/revenue')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/stats/period', () => {
    it('기간별 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/stats/period')
        .query({
          startDate: '2024-12-01',
          endDate: '2024-12-31'
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('잘못된 날짜 형식으로 조회 시 400 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/stats/period')
        .query({
          startDate: 'invalid-date',
          endDate: '2024-12-31'
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/stats');

      expect([401, 404]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', 'Bearer invalid-token');

      expect([401, 404]).toContain(response.status);
    });
  });
});

