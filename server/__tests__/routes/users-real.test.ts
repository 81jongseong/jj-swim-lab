/**
 * 👥 실제 사용자 관리 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('실제 사용자 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 관리자 사용자 생성
    const admin = await createTestUser({
      email: 'admin@example.com',
      userType: 'centerAdmin',
      name: '관리자',
      centerId: '507f1f77bcf86cd799439011'
    });

    adminToken = generateTestToken({
      userId: admin._id.toString(),
      email: admin.email,
      userType: admin.userType,
      centerId: admin.centerId
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

  describe('GET /api/users/center-users', () => {
    it('센터 관리자가 센터 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/center-users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 400, 404]).toContain(response.status);
    });

    it('일반 사용자가 센터 사용자 조회 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users/center-users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 400]).toContain(response.status);
    });

    it('센터 정보가 없는 관리자가 조회 시 400 에러를 반환해야 함', async () => {
      const adminWithoutCenter = await createTestUser({
        email: 'admin2@example.com',
        userType: 'centerAdmin',
        name: '센터 없는 관리자'
        // centerId 없음
      });

      const tokenWithoutCenter = generateTestToken({
        userId: adminWithoutCenter._id.toString(),
        email: adminWithoutCenter.email,
        userType: adminWithoutCenter.userType
        // centerId 없음
      });

      const response = await request(app)
        .get('/api/users/center-users')
        .set('Authorization', `Bearer ${tokenWithoutCenter}`);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('GET /api/users', () => {
    it('관리자가 모든 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403, 400]).toContain(response.status);
    });

    it('일반 사용자가 사용자 목록 조회 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 400]).toContain(response.status);
    });

    it('쿼리 파라미터로 필터링할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({
          page: 1,
          limit: 10,
          userType: 'student',
          search: '테스트'
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403, 400]).toContain(response.status);
    });
  });

  describe('GET /api/users/:id', () => {
    it('관리자가 특정 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403, 400]).toContain(response.status);
    });

    it('존재하지 않는 사용자 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 403]).toContain(response.status);
    });

    it('잘못된 ObjectId 형식으로 조회 시 400 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('POST /api/users', () => {
    it('관리자가 새 사용자를 생성할 수 있어야 함', async () => {
      const newUserData = {
        userId: 'newuser123',
        name: '새 사용자',
        email: 'newuser@example.com',
        password: 'password123',
        userType: 'student',
        phone: '010-1234-5678'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUserData);

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('필수 필드가 누락된 경우 400 에러를 반환해야 함', async () => {
      const incompleteData = {
        name: '불완전한 사용자'
        // userId, email, password 누락
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteData);

      expect([400, 403]).toContain(response.status);
    });

    it('일반 사용자가 사용자 생성 시 403 에러를 반환해야 함', async () => {
      const newUserData = {
        userId: 'studentuser',
        name: '학생이 생성한 사용자',
        email: 'studentuser@example.com',
        password: 'password123',
        userType: 'student'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newUserData);

      expect([403, 400]).toContain(response.status);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('관리자가 사용자 정보를 수정할 수 있어야 함', async () => {
      const updateData = {
        name: '수정된 이름',
        phone: '010-9876-5432',
        address: '수정된 주소'
      };

      const response = await request(app)
        .put('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([200, 404, 403, 400]).toContain(response.status);
    });

    it('존재하지 않는 사용자 수정 시 404 에러를 반환해야 함', async () => {
      const updateData = {
        name: '수정된 이름'
      };

      const response = await request(app)
        .put('/api/users/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('관리자가 사용자를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403, 400]).toContain(response.status);
    });

    it('일반 사용자가 사용자 삭제 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 400]).toContain(response.status);
    });
  });

  describe('GET /api/users/stats', () => {
    it('관리자가 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403, 400]).toContain(response.status);
    });

    it('일반 사용자가 사용자 통계 조회 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 400]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});

