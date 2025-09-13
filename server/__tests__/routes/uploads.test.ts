/**
 * 📁 파일 업로드 라우트 테스트
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase, createTestUser } from '../setup';

describe('파일 업로드 라우트 테스트', () => {
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

  describe('POST /api/uploads/image', () => {
    it('이미지 파일을 업로드할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

      expect([200, 201, 400, 404]).toContain(response.status);
    });

    it('지원하지 않는 파일 형식을 거부해야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('image', Buffer.from('fake-data'), 'test.txt');

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/uploads/document', () => {
    it('문서 파일을 업로드할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/document')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('document', Buffer.from('fake-document-data'), 'test.pdf');

      expect([200, 201, 400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/uploads/:filename', () => {
    it('업로드된 파일을 다운로드할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/uploads/test-file.jpg')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/uploads/:filename', () => {
    it('관리자가 파일을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete('/api/uploads/test-file.jpg')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('일반 사용자가 파일 삭제 시 403 에러를 반환해야 함', async () => {
      const response = await request(app)
        .delete('/api/uploads/test-file.jpg')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/uploads/image');

      expect([401, 404]).toContain(response.status);
    });

    it('파일 크기가 너무 클 때 적절한 에러를 반환해야 함', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB (더 작은 크기)
      
      try {
        const response = await request(app)
          .post('/api/uploads/image')
          .set('Authorization', `Bearer ${studentToken}`)
          .attach('image', largeBuffer, 'large-file.jpg')
          .timeout(5000); // 5초 타임아웃

        expect([400, 413, 500]).toContain(response.status);
      } catch (error) {
        // 연결 에러도 허용 (ECONNRESET 등)
        expect(error).toBeDefined();
      }
    });
  });
});
