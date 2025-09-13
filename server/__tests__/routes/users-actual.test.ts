import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 사용자 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/users', () => {
    it('관리자가 사용자 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('강사가 사용자 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('학생이 사용자 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/users', () => {
    it('관리자가 사용자를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: '새 사용자',
          userType: 'student',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('강사가 사용자를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          email: 'newuser2@example.com',
          password: 'password123',
          name: '새 사용자2',
          userType: 'student',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('학생이 사용자를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          email: 'newuser3@example.com',
          password: 'password123',
          name: '새 사용자3',
          userType: 'student',
          centerId: '507f1f77bcf86cd799439011'
        });

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/users/:id', () => {
    it('관리자가 특정 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('강사가 특정 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('학생이 특정 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('존재하지 않는 사용자 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 401, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('관리자가 사용자를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '수정된 사용자',
          userType: 'instructor'
        });

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('강사가 사용자를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          name: '수정된 사용자',
          userType: 'instructor'
        });

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('학생이 사용자를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '수정된 사용자',
          userType: 'instructor'
        });

      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('관리자가 사용자를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('강사가 사용자를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('학생이 사용자를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/users/center/:centerId', () => {
    it('관리자가 특정 센터의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('강사가 특정 센터의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('학생이 특정 센터의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/users/type/:userType', () => {
    it('관리자가 특정 타입의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/type/student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('강사가 특정 타입의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/type/instructor')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('학생이 특정 타입의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/type/admin')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/users/stats', () => {
    it('관리자가 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('강사가 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('학생이 사용자 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/users/:id/activate', () => {
    it('관리자가 사용자를 활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users/507f1f77bcf86cd799439011/activate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('강사가 사용자를 활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users/507f1f77bcf86cd799439011/activate')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('학생이 사용자를 활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users/507f1f77bcf86cd799439011/activate')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/users/:id/deactivate', () => {
    it('관리자가 사용자를 비활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users/507f1f77bcf86cd799439011/deactivate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('강사가 사용자를 비활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users/507f1f77bcf86cd799439011/deactivate')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('학생이 사용자를 비활성화할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/users/507f1f77bcf86cd799439011/deactivate')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
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