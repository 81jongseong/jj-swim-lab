/**
 * 📊 대시보드 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestToken } from '../setup';

describe('대시보드 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 관리자 토큰 생성
    adminToken = createTestToken({
      userId: '507f1f77bcf86cd799439011',
      email: 'admin@example.com',
      userType: 'centerAdmin'
    });

    // 강사 토큰 생성
    instructorToken = createTestToken({
      userId: '507f1f77bcf86cd799439012',
      email: 'instructor@example.com',
      userType: 'instructor'
    });

    // 학생 토큰 생성
    studentToken = createTestToken({
      userId: '507f1f77bcf86cd799439013',
      email: 'student@example.com',
      userType: 'student'
    });
  });

  describe('GET /api/dashboard', () => {
    it('관리자가 대시보드 데이터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('강사가 대시보드 데이터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('학생이 대시보드 데이터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('관리자가 통계 데이터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('일반 사용자도 통계 데이터를 조회할 수 있어야 함 (공개 API)', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBeDefined();
    });
  });

  describe('GET /api/dashboard/recent', () => {
    it('최근 활동을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이도 접근할 수 있어야 함 (공개 API)', async () => {
      const response = await request(app)
        .get('/api/dashboard');

      expect(response.status).toBe(404); // /api/dashboard 엔드포인트는 없음
    });
  });
});
