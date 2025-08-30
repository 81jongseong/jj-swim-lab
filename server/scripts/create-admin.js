/**
 * 👑 JJ Swim Lab - Admin 계정 생성 스크립트
 * 
 * 📋 **목적**
 * - 시드 데이터 생성 후 사라진 admin 계정 복구
 * - 기본 관리자 계정 생성
 * 
 * 🔄 **생성 계정**
 * - superAdmin: admin / 101010
 * - centerAdmin: center1 / 101010
 * - instructor: instructor1 / 101010
 * - student: student1 / 101010
 * 
 * 🛠️ **실행 방법**
 * node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 환경 변수 로드
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');

// 스키마 정의
const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  email: String,
  password: String,
  name: String,
  userType: String,
  centerId: String,
  instructorId: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

// 모델 생성
const User = mongoose.model('User', userSchema);

// 비밀번호 해시화 함수
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Admin 계정 생성 함수
const createAdminAccounts = async () => {
  try {
    console.log('👑 Admin 계정 생성을 시작합니다...');
    
    // 기존 admin 계정 확인
    const existingAdmin = await User.findOne({ userId: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin 계정이 이미 존재합니다.');
      return;
    }
    
    // 비밀번호 해시화
    const hashedPassword = await hashPassword('101010');
    
    // Admin 계정들 생성
    const adminAccounts = [
      {
        userId: 'admin',
        username: 'admin',
        email: 'admin@jjswimlab.com',
        password: hashedPassword,
        name: '최고 관리자',
        userType: 'superAdmin',
        centerId: null,
        instructorId: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 'center1',
        username: 'center1',
        email: 'center1@jjswimlab.com',
        password: hashedPassword,
        name: '센터 관리자',
        userType: 'centerAdmin',
        centerId: 'center-001',
        instructorId: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 'instructor1',
        username: 'instructor1',
        email: 'instructor1@jjswimlab.com',
        password: hashedPassword,
        name: '김강사',
        userType: 'instructor',
        centerId: 'center-001',
        instructorId: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 'student1',
        username: 'student1',
        email: 'student1@jjswimlab.com',
        password: hashedPassword,
        name: '이학생',
        userType: 'student',
        centerId: null,
        instructorId: 'instructor1',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 계정 생성
    const createdAccounts = await User.insertMany(adminAccounts);
    
    console.log('✅ Admin 계정 생성 완료:');
    createdAccounts.forEach(account => {
      console.log(`  - ${account.userId} (${account.userType}): ${account.name}`);
    });
    
    console.log('\n🔑 로그인 정보:');
    console.log('  - ID: admin, center1, instructor1, student1');
    console.log('  - 비밀번호: 101010');
    
  } catch (error) {
    console.error('❌ Admin 계정 생성 중 오류 발생:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 데이터베이스 연결을 종료합니다.');
  }
};

// 스크립트 실행
if (require.main === module) {
  createAdminAccounts();
}

module.exports = { createAdminAccounts };
