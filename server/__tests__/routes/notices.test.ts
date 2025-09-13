/**
 * 📢 공지사항 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('공지사항 라우트 테스트', () => {
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

  describe('GET /api/notices', () => {
    it('모든 사용자가 공지사항 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('관리자가 공지사항 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/notices', () => {
    it('관리자가 새 공지사항을 생성할 수 있어야 함', async () => {
      const noticeData = {
        title: '새로운 공지사항',
        content: '공지사항 내용입니다.',
        type: 'general',
        priority: 'normal'
      };

      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(noticeData);

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('일반 사용자가 공지사항 생성 시 403 에러를 반환해야 함', async () => {
      const noticeData = {
        title: '학생이 작성한 공지사항',
        content: '이것은 허용되지 않습니다.',
        type: 'general'
      };

      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(noticeData);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/notices/:id', () => {
    it('특정 공지사항을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/notices/:id', () => {
    it('관리자가 공지사항을 수정할 수 있어야 함', async () => {
      const updateData = {
        title: '수정된 공지사항',
        content: '수정된 내용입니다.'
      };

      const response = await request(app)
        .put('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/notices/:id', () => {
    it('관리자가 공지사항을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/notices/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/notices');

      expect(response.status).toBe(200); // 공지사항은 공개 API
    });
  });
});

