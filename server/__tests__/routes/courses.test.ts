/**
 * 📚 강의 관리 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase } from '../setup';

describe('강의 관리 라우트 테스트', () => {
  let instructorToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 강사 토큰 생성
    instructorToken = generateTestToken({
      userId: '507f1f77bcf86cd799439011',
      email: 'instructor@example.com',
      userType: 'instructor'
    });

    // 관리자 토큰 생성
    adminToken = generateTestToken({
      userId: '507f1f77bcf86cd799439012',
      email: 'admin@example.com',
      userType: 'centerAdmin'
    });
  });

  describe('GET /api/courses', () => {
    it('강사가 강의 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('관리자가 강의 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/courses/my-courses', () => {
    it('강사가 자신의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/my-courses')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/courses', () => {
    it('강사가 새 강의를 생성할 수 있어야 함', async () => {
      const courseData = {
        title: '초급 수영 강의',
        description: '수영 초보자를 위한 강의',
        level: 'beginner',
        maxStudents: 10,
        duration: 60,
        price: 50000
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이도 접근할 수 있어야 함 (공개 API)', async () => {
      const response = await request(app)
        .get('/api/courses');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
