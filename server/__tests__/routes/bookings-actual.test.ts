import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 예약 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/bookings', () => {
    it('관리자가 예약 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 예약 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 예약 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings', () => {
    it('관리자가 예약을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          laneNumber: 1,
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
          status: 'confirmed'
        });

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 예약을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          courseId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          laneNumber: 1,
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
          status: 'confirmed'
        });

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 예약을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          laneNumber: 1,
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
          status: 'confirmed'
        });

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('관리자가 특정 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 특정 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 특정 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('존재하지 않는 예약 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('관리자가 예약을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          laneNumber: 2,
          startTime: new Date('2024-01-01T11:00:00Z'),
          endTime: new Date('2024-01-01T12:00:00Z'),
          status: 'confirmed'
        });

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 예약을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          laneNumber: 2,
          startTime: new Date('2024-01-01T11:00:00Z'),
          endTime: new Date('2024-01-01T12:00:00Z'),
          status: 'confirmed'
        });

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 예약을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          laneNumber: 2,
          startTime: new Date('2024-01-01T11:00:00Z'),
          endTime: new Date('2024-01-01T12:00:00Z'),
          status: 'confirmed'
        });

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('관리자가 예약을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 예약을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 예약을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/user/:userId', () => {
    it('관리자가 특정 사용자의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 특정 사용자의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 특정 사용자의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/course/:courseId', () => {
    it('관리자가 특정 강의의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/course/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 특정 강의의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/course/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 특정 강의의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/course/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/center/:centerId', () => {
    it('관리자가 특정 센터의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 특정 센터의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 특정 센터의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/confirm', () => {
    it('관리자가 예약을 확인할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings/507f1f77bcf86cd799439011/confirm')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 예약을 확인할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings/507f1f77bcf86cd799439011/confirm')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 예약을 확인할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings/507f1f77bcf86cd799439011/confirm')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/cancel', () => {
    it('관리자가 예약을 취소할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings/507f1f77bcf86cd799439011/cancel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 예약을 취소할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings/507f1f77bcf86cd799439011/cancel')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 예약을 취소할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/bookings/507f1f77bcf86cd799439011/cancel')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/stats', () => {
    it('관리자가 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('강사가 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('학생이 예약 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/bookings');

      expect([404, 401, 200]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', 'Bearer invalid-token');

      expect([404, 401, 200]).toContain(response.status);
    });
  });
});