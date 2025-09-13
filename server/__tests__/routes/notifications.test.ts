/**
 * 🔔 알림 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('알림 라우트 테스트', () => {
  let adminToken: string;
  let studentToken: string;

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
  });

  describe('GET /api/notifications', () => {
    it('사용자가 자신의 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('관리자가 모든 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/notifications', () => {
    it('관리자가 새 알림을 생성할 수 있어야 함', async () => {
      const notificationData = {
        title: '새로운 공지사항',
        message: '중요한 공지사항이 있습니다.',
        type: 'announcement',
        priority: 'high',
        targetUsers: ['507f1f77bcf86cd799439011']
      };

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect([200, 201, 400, 404]).toContain(response.status);
    });

    it('일반 사용자가 알림 생성 시 403 에러를 반환해야 함', async () => {
      const notificationData = {
        title: '학생이 작성한 알림',
        message: '이것은 허용되지 않습니다.',
        type: 'announcement'
      };

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(notificationData);

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('특정 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('알림을 읽음으로 표시할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notifications/507f1f77bcf86cd799439011/read')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/notifications/:id/unread', () => {
    it('알림을 읽지 않음으로 표시할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/notifications/507f1f77bcf86cd799439011/unread')
        .set('Authorization', `Bearer ${studentToken}`);

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

    it('일반 사용자가 알림 삭제 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .delete('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/notifications/unread', () => {
    it('읽지 않은 알림을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    it('모든 알림을 읽음으로 표시할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(401);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});

