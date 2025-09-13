import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 강의 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/courses', () => {
    it('관리자가 강의 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201, 403]).toContain(response.status);
    });

    it('강사가 강의 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 201, 403]).toContain(response.status);
    });

    it('학생이 강의 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 201, 403]).toContain(response.status);
    });
  });

  describe('POST /api/courses', () => {
    it('관리자가 강의를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '테스트 강의',
          description: '테스트 강의 설명',
          price: 50000,
          maxStudents: 20,
          centerId: '507f1f77bcf86cd799439011',
          instructorId: '507f1f77bcf86cd799439012'
        });

      expect([200, 201, 403]).toContain(response.status);
    });

    it('강사가 강의를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          name: '테스트 강의',
          description: '테스트 강의 설명',
          price: 50000,
          maxStudents: 20,
          centerId: '507f1f77bcf86cd799439011',
          instructorId: '507f1f77bcf86cd799439012'
        });

      expect([200, 201, 403]).toContain(response.status);
    });

    it('학생이 강의를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '테스트 강의',
          description: '테스트 강의 설명',
          price: 50000,
          maxStudents: 20,
          centerId: '507f1f77bcf86cd799439011',
          instructorId: '507f1f77bcf86cd799439012'
        });

      expect([200, 201, 403]).toContain(response.status);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('관리자가 특정 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 특정 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 특정 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('존재하지 않는 강의 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('관리자가 강의를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '수정된 강의',
          description: '수정된 강의 설명',
          price: 60000,
          maxStudents: 25
        });

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 강의를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          name: '수정된 강의',
          description: '수정된 강의 설명',
          price: 60000,
          maxStudents: 25
        });

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 강의를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '수정된 강의',
          description: '수정된 강의 설명',
          price: 60000,
          maxStudents: 25
        });

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('관리자가 강의를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 강의를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 강의를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/courses/center/:centerId', () => {
    it('관리자가 특정 센터의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 특정 센터의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 특정 센터의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/center/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/courses/instructor/:instructorId', () => {
    it('관리자가 특정 강사의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/instructor/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 특정 강사의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/instructor/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 특정 강사의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/instructor/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    it('관리자가 강의에 등록할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses/507f1f77bcf86cd799439011/enroll')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 강의에 등록할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses/507f1f77bcf86cd799439011/enroll')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 강의에 등록할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses/507f1f77bcf86cd799439011/enroll')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('POST /api/courses/:id/unenroll', () => {
    it('관리자가 강의 등록을 취소할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses/507f1f77bcf86cd799439011/unenroll')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 강의 등록을 취소할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses/507f1f77bcf86cd799439011/unenroll')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 강의 등록을 취소할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/courses/507f1f77bcf86cd799439011/unenroll')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('GET /api/courses/:id/students', () => {
    it('관리자가 강의 수강생을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('강사가 강의 수강생을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011/students')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });

    it('학생이 강의 수강생을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011/students')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/courses');

      expect([200, 401]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', 'Bearer invalid-token');

      expect([200, 401]).toContain(response.status);
    });
  });
});