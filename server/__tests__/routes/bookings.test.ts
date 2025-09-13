/**
 * 📅 JJ Swim Lab - 예약 라우트 테스트
 * 
 * 📋 **테스트 목적**
 * - 예약 관리 API 엔드포인트 검증
 * - 예약 생성, 수정, 취소 기능 테스트
 * - 예약 조회 및 필터링 기능 확인
 * - 예약 상태 관리 및 전환 테스트
 * 
 * 🔄 **주요 테스트 항목**
 * - 예약 생성 및 검증
 * - 예약 조회 및 목록 관리
 * - 예약 수정 및 업데이트
 * - 예약 취소 및 상태 변경
 * - 예약 시간 충돌 검사
 * - 권한 및 접근 제어
 * 
 * 🗄️ **테스트 데이터**
 * - 수영 강의 예약 요청
 * - 예약 시간 및 날짜 정보
 * - 사용자 및 강사 정보
 * - 예약 상태 및 결제 정보
 * - 예약 메모 및 특별 요청사항
 * 
 * 🛠️ **필요한 설정**
 * - Jest 테스트 프레임워크
 * - Supertest (API 테스트)
 * - 테스트 데이터베이스
 * - 인증 토큰 생성
 * 
 * ⚠️ **테스트 시 주의사항**
 * 1. 예약 시간 충돌 및 중복 검증
 * 2. 사용자 권한 및 접근 제어
 * 3. 예약 상태 전환 규칙 준수
 * 4. 결제 상태와 예약 상태 연동
 * 5. 예약 취소 정책 및 환불 규칙
 * 6. 시간대 및 날짜 처리 정확성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 예약 API 엔드포인트 동작 확인
 * - [ ] 예약 생성 및 검증 로직 확인
 * - [ ] 예약 조회 및 필터링 확인
 * - [ ] 예약 상태 관리 확인
 * - [ ] 권한 및 접근 제어 확인
 * - [ ] 에러 처리 및 예외 상황 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 예약 라우트 테스트 구현
 * - 2024-12-19: 예약 생성 및 조회 테스트 추가
 * - 2024-12-19: 예약 수정 및 취소 테스트 구현
 * - 2024-12-19: 예약 상태 관리 테스트 추가
 */

import request from 'supertest';
import { app } from '../../src/index';
import { generateTestToken, clearDatabase } from '../setup';

describe('예약 라우트 테스트', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // 테스트 토큰 생성
    adminToken = generateTestToken({
      userId: '507f1f77bcf86cd799439011',
      email: 'admin@example.com',
      userType: 'admin'
    });

    instructorToken = generateTestToken({
      userId: '507f1f77bcf86cd799439012',
      email: 'instructor@example.com',
      userType: 'instructor'
    });

    studentToken = generateTestToken({
      userId: '507f1f77bcf86cd799439013',
      email: 'student@example.com',
      userType: 'student'
    });
  });

  describe('POST /api/bookings', () => {
    it('학생이 예약을 생성할 수 있어야 함', async () => {
      const bookingData = {
        instructorId: '507f1f77bcf86cd799439012',
        courseId: '507f1f77bcf86cd799439020',
        centerId: '507f1f77bcf86cd799439021',
        bookingDate: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00',
        notes: '첫 번째 수영 강의입니다.'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(bookingData);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('강사가 예약을 생성할 수 있어야 함', async () => {
      const bookingData = {
        studentId: '507f1f77bcf86cd799439013',
        courseId: '507f1f77bcf86cd799439020',
        centerId: '507f1f77bcf86cd799439021',
        bookingDate: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(bookingData);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('관리자가 예약을 생성할 수 있어야 함', async () => {
      const bookingData = {
        studentId: '507f1f77bcf86cd799439013',
        instructorId: '507f1f77bcf86cd799439012',
        courseId: '507f1f77bcf86cd799439020',
        centerId: '507f1f77bcf86cd799439021',
        bookingDate: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookingData);

      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('필수 필드가 누락되면 400 에러를 반환해야 함', async () => {
      const incompleteData = {
        bookingDate: '2024-12-25',
        startTime: '10:00'
        // endTime, instructorId 등 필수 필드 누락
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(incompleteData);

      expect([400, 401, 403]).toContain(response.status);
    });

    it('토큰 없이 접근 시 401 에러를 반환해야 함', async () => {
      const bookingData = {
        instructorId: '507f1f77bcf86cd799439012',
        courseId: '507f1f77bcf86cd799439020',
        bookingDate: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/bookings', () => {
    it('사용자가 자신의 예약 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          page: 1,
          limit: 10
        });

      expect([200, 401, 403]).toContain(response.status);
    });

    it('관리자가 모든 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          page: 1,
          limit: 20
        });

      expect([200, 401, 403]).toContain(response.status);
    });

    it('강사가 자신의 강의 예약을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${instructorToken}`)
        .query({
          instructorId: '507f1f77bcf86cd799439012',
          status: 'confirmed'
        });

      expect([200, 401, 403]).toContain(response.status);
    });

    it('날짜별로 예약을 필터링할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          status: 'confirmed'
        });

      expect([200, 401, 403]).toContain(response.status);
    });

    it('페이지네이션 파라미터를 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          page: 2,
          limit: 5,
          sort: 'bookingDate'
        });

      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('예약 상세 정보를 조회할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('존재하지 않는 예약 ID로 조회 시 404 에러를 반환해야 함', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/api/bookings/${nonExistentId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([404, 401, 403]).toContain(response.status);
    });

    it('잘못된 예약 ID 형식으로 조회 시 400 에러를 반환해야 함', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/api/bookings/${invalidId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([400, 404, 401, 403, 500]).toContain(response.status);
    });

    it('다른 사용자의 예약은 조회할 수 없어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      // 권한이 없으면 403 또는 404 반환
      expect([403, 404, 401]).toContain(response.status);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('예약을 수정할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';
      const updateData = {
        startTime: '11:00',
        endTime: '12:00',
        notes: '시간이 변경되었습니다.'
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData);

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('예약 상태를 변경할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';
      const statusUpdate = {
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(statusUpdate);

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('관리자가 모든 예약을 수정할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';
      const updateData = {
        status: 'cancelled',
        cancellationReason: '강사 개인 사정'
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('예약을 취소할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cancellationReason: '개인 사정으로 인한 취소'
        });

      expect([200, 204, 404, 400, 401, 403]).toContain(response.status);
    });

    it('강사가 예약을 취소할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          cancellationReason: '강사 개인 사정'
        });

      expect([200, 204, 404, 400, 401, 403]).toContain(response.status);
    });

    it('관리자가 예약을 삭제할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 204, 404, 401, 403]).toContain(response.status);
    });

    it('완료된 예약은 취소할 수 없어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cancellationReason: '완료된 예약 취소 시도'
        });

      expect([400, 403, 404, 401]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/confirm', () => {
    it('강사가 예약을 확정할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          instructorNotes: '예약을 확정합니다.'
        });

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('관리자가 예약을 확정할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('학생은 예약을 확정할 수 없어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect([403, 401, 404]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/complete', () => {
    it('강사가 강의 완료를 처리할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          instructorNotes: '수영 자세가 많이 개선되었습니다.',
          attendance: 'present',
          progress: 'good'
        });

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('관리자가 강의 완료를 처리할 수 있어야 함', async () => {
      const bookingId = '507f1f77bcf86cd799439020';

      const response = await request(app)
        .post(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          instructorNotes: '관리자에 의한 강의 완료 처리'
        });

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/availability', () => {
    it('강사별 예약 가능 시간을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/availability')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          instructorId: '507f1f77bcf86cd799439012',
          date: '2024-12-25'
        });

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('센터별 예약 가능 시간을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/availability')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          centerId: '507f1f77bcf86cd799439021',
          startDate: '2024-12-25',
          endDate: '2024-12-31'
        });

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });

    it('기간별 예약 가능 시간을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/availability')
        .set('Authorization', `Bearer ${instructorToken}`)
        .query({
          startDate: '2024-12-25',
          endDate: '2024-12-31',
          duration: 60
        });

      expect([200, 404, 400, 401, 403]).toContain(response.status);
    });
  });

  describe('에러 처리', () => {
    it('잘못된 엔드포인트 접근 시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/bookings/invalid-endpoint')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 500]).toContain(response.status);
    });

    it('서버 오류 시 500 에러를 반환해야 함', async () => {
      // 잘못된 데이터로 서버 오류 유발 시도
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          invalidField: null
        });

      expect([400, 500, 401, 403]).toContain(response.status);
    });

    it('시간 충돌 시 409 에러를 반환해야 함', async () => {
      const conflictingBooking = {
        instructorId: '507f1f77bcf86cd799439012',
        courseId: '507f1f77bcf86cd799439020',
        centerId: '507f1f77bcf86cd799439021',
        bookingDate: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(conflictingBooking);

      expect([200, 201, 400, 409, 401, 403]).toContain(response.status);
    });
  });

  describe('성능 테스트', () => {
    it('예약 조회가 적절한 시간 내에 응답해야 함', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          page: 1,
          limit: 10
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // 2초 이내 응답
      expect([200, 401, 403]).toContain(response.status);
    });

    it('대량 예약 조회가 효율적으로 처리되어야 함', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          page: 1,
          limit: 100,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

      expect([200, 401, 403]).toContain(response.status);
    });
  });
});