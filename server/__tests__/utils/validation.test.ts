/**
 * 🔍 유효성 검증 유틸리티 테스트
 */

import { validateEmail, validatePassword, validatePhone, validateObjectId } from '../../src/utils/validation';

describe('유효성 검증 유틸리티', () => {
  describe('이메일 검증', () => {
    it('유효한 이메일을 검증해야 함', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('무효한 이메일을 거부해야 함', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('비밀번호 검증', () => {
    it('유효한 비밀번호를 검증해야 함', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('MySecure123!')).toBe(true);
    });

    it('무효한 비밀번호를 거부해야 함', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('전화번호 검증', () => {
    it('유효한 전화번호를 검증해야 함', () => {
      expect(validatePhone('010-1234-5678')).toBe(true);
      expect(validatePhone('01012345678')).toBe(true);
    });

    it('무효한 전화번호를 거부해야 함', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('010-123-45')).toBe(false);
    });
  });

  describe('ObjectId 검증', () => {
    it('유효한 ObjectId를 검증해야 함', () => {
      expect(validateObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('무효한 ObjectId를 거부해야 함', () => {
      expect(validateObjectId('invalid-id')).toBe(false);
      expect(validateObjectId('123')).toBe(false);
    });
  });
});

