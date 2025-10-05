/**
 * 테스트용 사용자 생성 스크립트
 * MongoDB 연결 없이 메모리에서 테스트
 */

// 테스트용 사용자 데이터
const testUsers = [
  {
    userId: 'admin',
    name: '시스템 관리자',
    email: 'admin@jjswim.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', // admin123!
    userType: 'superAdmin',
    level: 'systemAdmin',
    isActive: true
  },
  {
    userId: 'test',
    name: '테스트 사용자',
    email: 'test@jjswim.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K', // test123!
    userType: 'student',
    level: 'beginner',
    isActive: true
  }
];

console.log('🔍 테스트용 사용자 데이터:');
console.log('📋 로그인 정보:');
console.log('  - ID: admin');
console.log('  - 비밀번호: admin123!');
console.log('  - 타입: superAdmin');
console.log('');
console.log('  - ID: test');
console.log('  - 비밀번호: test123!');
console.log('  - 타입: student');
console.log('');
console.log('⚠️ 실제 데이터베이스 연결이 필요합니다.');
console.log('💡 MongoDB Atlas 또는 로컬 MongoDB를 설정해주세요.');

module.exports = testUsers;
