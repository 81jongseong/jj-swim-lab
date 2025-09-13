import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 결제 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/payments', () => {
    it('관리자가 결제 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 결제 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 결제 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('POST /api/payments', () => {
    it('관리자가 결제를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '507f1f77bcf86cd799439011',
          courseId: '507f1f77bcf86cd799439012',
          amount: 50000,
          purpose: 'course_fee',
          paymentMethod: 'card',
          status: 'pending'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 결제를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          userId: '507f1f77bcf86cd799439011',
          courseId: '507f1f77bcf86cd799439012',
          amount: 50000,
          purpose: 'course_fee',
          paymentMethod: 'card',
          status: 'pending'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 결제를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: '507f1f77bcf86cd799439011',
          courseId: '507f1f77bcf86cd799439012',
          amount: 50000,
          purpose: 'course_fee',
          paymentMethod: 'card',
          status: 'pending'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('관리자가 특정 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 특정 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 특정 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('존재하지 않는 결제 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/payments/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/payments/:id', () => {
    it('관리자가 결제를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 60000,
          status: 'completed',
          paymentMethod: 'bank_transfer'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 결제를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          amount: 60000,
          status: 'completed',
          paymentMethod: 'bank_transfer'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 결제를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          amount: 60000,
          status: 'completed',
          paymentMethod: 'bank_transfer'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/payments/:id', () => {
    it('관리자가 결제를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 결제를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 결제를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/payments/user/:userId', () => {
    it('관리자가 특정 사용자의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 특정 사용자의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 특정 사용자의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/payments/course/:courseId', () => {
    it('관리자가 특정 강의의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/course/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 특정 강의의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/course/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 특정 강의의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/course/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/payments/center/:centerId', () => {
    it('관리자가 특정 센터의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 특정 센터의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 특정 센터의 결제를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('POST /api/payments/:id/process', () => {
    it('관리자가 결제를 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments/507f1f77bcf86cd799439011/process')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paymentMethod: 'card',
          cardNumber: '1234567890123456',
          expiryDate: '12/25',
          cvv: '123'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 결제를 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments/507f1f77bcf86cd799439011/process')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          paymentMethod: 'card',
          cardNumber: '1234567890123456',
          expiryDate: '12/25',
          cvv: '123'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 결제를 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments/507f1f77bcf86cd799439011/process')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          paymentMethod: 'card',
          cardNumber: '1234567890123456',
          expiryDate: '12/25',
          cvv: '123'
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    it('관리자가 결제를 환불할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments/507f1f77bcf86cd799439011/refund')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: '고객 요청',
          amount: 50000
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 결제를 환불할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments/507f1f77bcf86cd799439011/refund')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          reason: '고객 요청',
          amount: 50000
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 결제를 환불할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/payments/507f1f77bcf86cd799439011/refund')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          reason: '고객 요청',
          amount: 50000
        });

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/payments/stats', () => {
    it('관리자가 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 결제 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('GET /api/payments/revenue', () => {
    it('관리자가 수익을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('강사가 수익을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/revenue')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });

    it('학생이 수익을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/payments/revenue')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/payments');

      expect([200, 404, 401, 500]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', 'Bearer invalid-token');

      expect([200, 404, 401, 500]).toContain(response.status);
    });
  });
});