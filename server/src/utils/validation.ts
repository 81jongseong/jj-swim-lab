/**
 * 🔍 유효성 검증 유틸리티
 * 
 * 📋 **목적**
 * - 입력 데이터 유효성 검증
 * - 보안 강화를 위한 데이터 검증
 * - API 요청 데이터 검증
 * 
 * 🔄 **주요 기능**
 * - 이메일 형식 검증
 * - 비밀번호 강도 검증
 * - 전화번호 형식 검증
 * - ObjectId 형식 검증
 */

/**
 * 이메일 형식 검증
 * @param email 검증할 이메일
 * @returns 유효한 이메일인지 여부
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 강도 검증
 * @param password 검증할 비밀번호
 * @returns 유효한 비밀번호인지 여부
 */
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // 최소 8자 이상
  return password.length >= 8;
};

/**
 * 전화번호 형식 검증
 * @param phone 검증할 전화번호
 * @returns 유효한 전화번호인지 여부
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // 한국 전화번호 형식 (010-1234-5678 또는 01012345678)
  const phoneRegex = /^010-?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * MongoDB ObjectId 형식 검증
 * @param id 검증할 ObjectId
 * @returns 유효한 ObjectId인지 여부
 */
export const validateObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // MongoDB ObjectId는 24자리 16진수
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};



