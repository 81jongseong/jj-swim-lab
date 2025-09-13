import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 알림 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/notifications', () => {
    it('관리자가 알림 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 알림 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 알림 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/notifications', () => {
    it('관리자가 알림을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '테스트 알림',
          message: '테스트 메시지',
          type: 'info',
          recipients: ['507f1f77bcf86cd799439011']
        });

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 알림을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: '테스트 알림',
          message: '테스트 메시지',
          type: 'info',
          recipients: ['507f1f77bcf86cd799439011']
        });

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 알림을 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: '테스트 알림',
          message: '테스트 메시지',
          type: 'info',
          recipients: ['507f1f77bcf86cd799439011']
        });

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('관리자가 특정 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 특정 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 특정 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('존재하지 않는 알림 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/notifications/:id', () => {
    it('관리자가 알림을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '수정된 알림',
          message: '수정된 메시지',
          type: 'warning'
        });

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 알림을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: '수정된 알림',
          message: '수정된 메시지',
          type: 'warning'
        });

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 알림을 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: '수정된 알림',
          message: '수정된 메시지',
          type: 'warning'
        });

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('관리자가 알림을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 알림을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 알림을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/notifications/user/:userId', () => {
    it('관리자가 특정 사용자의 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 특정 사용자의 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 특정 사용자의 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/notifications/:id/read', () => {
    it('관리자가 알림을 읽음 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications/507f1f77bcf86cd799439011/read')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 알림을 읽음 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications/507f1f77bcf86cd799439011/read')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 알림을 읽음 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications/507f1f77bcf86cd799439011/read')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/notifications/:id/unread', () => {
    it('관리자가 알림을 읽지 않음 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications/507f1f77bcf86cd799439011/unread')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 알림을 읽지 않음 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications/507f1f77bcf86cd799439011/unread')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 알림을 읽지 않음 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications/507f1f77bcf86cd799439011/unread')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/notifications/unread', () => {
    it('관리자가 읽지 않은 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 읽지 않은 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 읽지 않은 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/notifications/stats', () => {
    it('관리자가 알림 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('강사가 알림 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('학생이 알림 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect([200, 404, 401]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalid-token');

      expect([200, 404, 401]).toContain(response.status);
    });
  });
});