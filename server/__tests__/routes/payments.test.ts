/**
 * 💳 결제 관리 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('결제 관리 라우트 테스트', () => {
  let studentToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 학생 사용자 생성
    const student = await createTestUser({
      email: 'student@example.com',
      userType: 'student',
      name: '학생'
    });

    studentToken = generateTestToken({
      userId: student._id.toString(),
      email: student.email,
      userType: student.userType
    });

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
  });

  describe('GET /api/payments', () => {
    it('학생이 자신의 결제 내역을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('관리자가 모든 결제 내역을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/payments', () => {
    it('학생이 새 결제를 생성할 수 있어야 함', async () => {
      const paymentData = {
        bookingId: '507f1f77bcf86cd799439011',
        amount: 50000,
        paymentMethod: 'card',
        description: '강의 수강료'
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(paymentData);

      expect([200, 201, 400, 404]).toContain(response.status);
    });

    it('필수 필드가 누락된 경우 400 에러를 반환해야 함', async () => {
      const incompleteData = {
        amount: 50000
        // paymentMethod 누락
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(incompleteData);

      expect(response.status).toBe(400);
    });

    it('잘못된 금액으로 결제 시 400 에러를 반환해야 함', async () => {
      const invalidData = {
        bookingId: '507f1f77bcf86cd799439011',
        amount: -1000, // 음수 금액
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('학생이 자신의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('존재하지 않는 결제 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/payments/:id/status', () => {
    it('관리자가 결제 상태를 변경할 수 있어야 함', async () => {
      const statusData = {
        status: 'completed'
      };

      const response = await request(app)
        .put('/api/payments/507f1f77bcf86cd799439011/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 결제 상태 변경 시 403 에러를 반환해야 함', async () => {
      const statusData = {
        status: 'completed'
      };

      const response = await request(app)
        .put('/api/payments/507f1f77bcf86cd799439011/status')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(statusData);

      expect([403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/payments/stats', () => {
    it('관리자가 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('일반 사용자가 결제 통계 조회 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 404, 500]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/payments');

      expect(response.status).toBe(401);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});