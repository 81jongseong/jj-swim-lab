const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User 모델 정의
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  userType: { 
    type: String, 
    enum: ['member', 'instructor', 'admin'], 
    default: 'member' 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공');

    // 기존 테스트 사용자 삭제
    await User.deleteMany({ 
      userId: { $in: ['admin', 'instructor1', 'instructor2', 'member1', 'member2', 'member3'] } 
    });
    console.log('🗑️ 기존 테스트 사용자 삭제 완료');

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 테스트 사용자 생성
    const testUsers = [
      {
        userId: 'admin',
        password: hashedPassword,
        name: '관리자',
        email: 'admin@jjswimlab.com',
        phone: '010-1234-5678',
        userType: 'admin'
      },
      {
        userId: 'instructor1',
        password: hashedPassword,
        name: '김강사',
        email: 'instructor1@jjswimlab.com',
        phone: '010-2345-6789',
        userType: 'instructor'
      },
      {
        userId: 'instructor2',
        password: hashedPassword,
        name: '이강사',
        email: 'instructor2@jjswimlab.com',
        phone: '010-3456-7890',
        userType: 'instructor'
      },
      {
        userId: 'member1',
        password: hashedPassword,
        name: '박회원',
        email: 'member1@jjswimlab.com',
        phone: '010-4567-8901',
        userType: 'member'
      },
      {
        userId: 'member2',
        password: hashedPassword,
        name: '최회원',
        email: 'member2@jjswimlab.com',
        phone: '010-5678-9012',
        userType: 'member'
      },
      {
        userId: 'member3',
        password: hashedPassword,
        name: '정회원',
        email: 'member3@jjswimlab.com',
        phone: '010-6789-0123',
        userType: 'member'
      }
    ];

    // 사용자 생성
    const createdUsers = await User.insertMany(testUsers);
    console.log('✅ 테스트 사용자 생성 완료');

    // 생성된 사용자 정보 출력
    console.log('\n📋 생성된 테스트 사용자:');
    createdUsers.forEach(user => {
      console.log(`- ${user.userType.toUpperCase()}: ${user.userId} (${user.name})`);
    });

    console.log('\n🔑 모든 사용자의 비밀번호: password123');
    console.log('\n💡 로그인 테스트:');
    console.log('- 관리자: admin / password123');
    console.log('- 강사: instructor1 / password123');
    console.log('- 회원: member1 / password123');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
createTestUsers(); 