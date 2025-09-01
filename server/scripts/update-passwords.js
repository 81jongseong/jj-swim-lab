const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 모델 정의
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userType: { 
    type: String, 
    required: true, 
    enum: ['superAdmin', 'centerAdmin', 'instructor', 'student', 'guest'] 
  },
  centerId: { type: String },
  phone: { type: String },
  profileImage: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 사용자가 원하는 비밀번호로 업데이트할 계정들
const accountsToUpdate = [
  {
    userId: 'admin',
    password: '101010',
    name: '최고 관리자',
    email: 'admin@jjswim.com',
    userType: 'superAdmin',
    phone: '010-0000-0000'
  },
  {
    userId: 'center',
    password: '101010',
    name: '센터 관리자',
    email: 'center@jjswim.com',
    userType: 'centerAdmin',
    centerId: 'center001',
    phone: '010-1111-1111'
  },
  {
    userId: 'teacher',
    password: '101010',
    name: '김강사',
    email: 'teacher@jjswim.com',
    userType: 'instructor',
    centerId: 'center001',
    phone: '010-2222-2222'
  },
  {
    userId: 'member',
    password: '101010',
    name: '이학생',
    email: 'member@jjswim.com',
    userType: 'student',
    centerId: 'center001',
    phone: '010-3333-3333'
  }
];

async function updateAccountPasswords() {
  try {
    console.log('🔗 데이터베이스 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 데이터베이스 연결 성공');

    console.log('\n📝 계정 비밀번호 업데이트 시작...');
    
    for (const account of accountsToUpdate) {
      try {
        // 기존 계정 확인
        const existingUser = await User.findOne({ 
          $or: [
            { userId: account.userId },
            { email: account.email }
          ]
        });

        if (existingUser) {
          console.log(`⚠️  계정이 이미 존재합니다: ${account.userId} (${account.name})`);
          
          // 비밀번호 해시화
          const saltRounds = 12;
          const hashedPassword = await bcrypt.hash(account.password, saltRounds);
          
          // 계정 정보 업데이트 (해시화된 비밀번호 포함)
          existingUser.password = hashedPassword;
          existingUser.isActive = true;
          await existingUser.save();
          console.log(`✅ 계정 비밀번호 업데이트 완료: ${account.userId} (${account.password})`);
        } else {
          console.log(`❌ 계정을 찾을 수 없습니다: ${account.userId}`);
        }
      } catch (error) {
        console.error(`❌ 계정 업데이트 실패: ${account.userId}`, error.message);
      }
    }

    console.log('\n📊 업데이트된 계정 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('| 계정 ID | 비밀번호 | 이름 | 이메일 | 권한 |');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const account of accountsToUpdate) {
      console.log(`| ${account.userId.padEnd(8)} | ${account.password.padEnd(8)} | ${account.name.padEnd(6)} | ${account.email.padEnd(15)} | ${account.userType.padEnd(8)} |`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🎯 로그인 테스트 계정:');
    console.log('• 최고 관리자: admin / 101010');
    console.log('• 센터 관리자: center / 101010');
    console.log('• 강사: teacher / 101010');
    console.log('• 학생: member / 101010');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 데이터베이스 연결을 종료합니다.');
  }
}

// 스크립트 실행
updateAccountPasswords();

