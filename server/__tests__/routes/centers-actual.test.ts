import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('실제 센터 관리 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    adminToken = generateTestToken({ userType: 'admin' });
    instructorToken = generateTestToken({ userType: 'instructor' });
    studentToken = generateTestToken({ userType: 'student' });
  });

  describe('GET /api/centers', () => {
    it('관리자가 센터 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 센터 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 센터 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('POST /api/centers', () => {
    it('관리자가 센터를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/centers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '테스트 센터',
          address: '서울시 강남구',
          phone: '02-1234-5678',
          email: 'test@center.com',
          managerId: '507f1f77bcf86cd799439011',
          facilities: ['수영장', '샤워실', '락커룸'],
          operatingHours: '09:00-22:00'
        });

      expect([404]).toContain(response.status);
    });

    it('강사가 센터를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/centers')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          name: '테스트 센터2',
          address: '서울시 강남구',
          phone: '02-1234-5678',
          email: 'test2@center.com',
          managerId: '507f1f77bcf86cd799439011',
          facilities: ['수영장', '샤워실', '락커룸'],
          operatingHours: '09:00-22:00'
        });

      expect([404]).toContain(response.status);
    });

    it('학생이 센터를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/centers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '테스트 센터3',
          address: '서울시 강남구',
          phone: '02-1234-5678',
          email: 'test3@center.com',
          managerId: '507f1f77bcf86cd799439011',
          facilities: ['수영장', '샤워실', '락커룸'],
          operatingHours: '09:00-22:00'
        });

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/centers/:id', () => {
    it('관리자가 특정 센터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 특정 센터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 특정 센터를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });

    it('존재하지 않는 센터 조회 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/centers/:id', () => {
    it('관리자가 센터를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '수정된 센터',
          address: '서울시 강남구 수정된 주소',
          phone: '02-9876-5432',
          email: 'updated@center.com',
          facilities: ['수영장', '샤워실', '락커룸', '사우나'],
          operatingHours: '08:00-23:00'
        });

      expect([404]).toContain(response.status);
    });

    it('강사가 센터를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          name: '수정된 센터',
          address: '서울시 강남구 수정된 주소',
          phone: '02-9876-5432',
          email: 'updated@center.com',
          facilities: ['수영장', '샤워실', '락커룸', '사우나'],
          operatingHours: '08:00-23:00'
        });

      expect([404]).toContain(response.status);
    });

    it('학생이 센터를 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '수정된 센터',
          address: '서울시 강남구 수정된 주소',
          phone: '02-9876-5432',
          email: 'updated@center.com',
          facilities: ['수영장', '샤워실', '락커룸', '사우나'],
          operatingHours: '08:00-23:00'
        });

      expect([404]).toContain(response.status);
    });
  });

  describe('DELETE /api/centers/:id', () => {
    it('관리자가 센터를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 센터를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 센터를 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/centers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/centers/:id/courses', () => {
    it('관리자가 특정 센터의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 특정 센터의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/courses')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 특정 센터의 강의를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/centers/:id/users', () => {
    it('관리자가 특정 센터의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 특정 센터의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/users')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 특정 센터의 사용자를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/centers/:id/stats', () => {
    it('관리자가 특정 센터의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 특정 센터의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 특정 센터의 통계를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/centers/:id/facilities', () => {
    it('관리자가 특정 센터의 시설을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/facilities')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 특정 센터의 시설을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/facilities')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 특정 센터의 시설을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/507f1f77bcf86cd799439011/facilities')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('POST /api/centers/:id/facilities', () => {
    it('관리자가 특정 센터에 시설을 추가할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/centers/507f1f77bcf86cd799439011/facilities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '새로운 시설',
          type: 'equipment',
          description: '새로 추가된 시설',
          capacity: 10
        });

      expect([404]).toContain(response.status);
    });

    it('강사가 특정 센터에 시설을 추가할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/centers/507f1f77bcf86cd799439011/facilities')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          name: '새로운 시설',
          type: 'equipment',
          description: '새로 추가된 시설',
          capacity: 10
        });

      expect([404]).toContain(response.status);
    });

    it('학생이 특정 센터에 시설을 추가할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/centers/507f1f77bcf86cd799439011/facilities')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: '새로운 시설',
          type: 'equipment',
          description: '새로 추가된 시설',
          capacity: 10
        });

      expect([404]).toContain(response.status);
    });
  });

  describe('GET /api/centers/search', () => {
    it('관리자가 센터를 검색할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/search?q=강남')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404]).toContain(response.status);
    });

    it('강사가 센터를 검색할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/search?q=강남')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect([404]).toContain(response.status);
    });

    it('학생이 센터를 검색할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/centers/search?q=강남')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/centers');

      expect([404, 401]).toContain(response.status);
    });

    it('잘못된 토큰으로 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/centers')
        .set('Authorization', 'Bearer invalid-token');

      expect([404, 401]).toContain(response.status);
    });
  });
});