/**
 * 테스트용 센터 관리자 생성
 * 연동 데이터: User 모델의 centerAdminInfo
 * 연동 파일: server/src/models/User.ts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ MongoDB 연결 성공');

  try {
    // User 모델 정의
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // 테스트 데이터의 센터 ID
    const testCenterId = '68fb75b111747a8229d6cf5d';

    // 기존 센터 관리자 삭제
    await User.deleteMany({ userType: 'center-admin' });
    console.log('🗑️ 기존 센터 관리자 삭제 완료');

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 새로운 센터 관리자 생성
    const newCenterAdmin = new User({
      name: '센터 관리자',
      email: 'center-admin@jjswimlab.com',
      password: hashedPassword,
      phone: '010-1234-5678',
      userType: 'center-admin',
      centerAdminInfo: {
        managedCenters: [testCenterId],
        permissions: ['read', 'write', 'delete'],
        role: 'admin'
      },
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newCenterAdmin.save();
    console.log('✅ 새로운 센터 관리자 생성 완료!');
    console.log('📋 이메일: center-admin@jjswimlab.com');
    console.log('📋 비밀번호: admin123');
    console.log('📋 관리 센터 ID:', testCenterId);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    mongoose.connection.close();
  }
});
