/**
 * center@swim.com을 센터 관리자 사용자로 생성
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';

async function createCenterUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      phone: String,
      userType: String,
      centerAdminInfo: {
        managedCenters: [mongoose.Schema.Types.ObjectId],
        permissions: [String],
        role: String
      },
      isActive: Boolean,
      createdAt: Date,
      updatedAt: Date
    });

    const centerSchema = new mongoose.Schema({
      name: String,
      email: String
    });

    const User = mongoose.model('User', userSchema);
    const Center = mongoose.model('Center', centerSchema);

    // 1. center@swim.com 센터 찾기
    const center = await Center.findOne({ email: 'center@swim.com' });
    if (!center) {
      console.error('❌ center@swim.com 센터를 찾을 수 없습니다.');
      return;
    }
    console.log('📋 찾은 센터:', center.name, '- ID:', center._id);

    // 2. 이미 center@swim.com 사용자가 있는지 확인
    const existingUser = await User.findOne({ email: 'center@swim.com' });
    if (existingUser) {
      console.log('ℹ️ center@swim.com 사용자가 이미 존재합니다.');
      console.log('📋 기존 사용자 정보:', {
        name: existingUser.name,
        userType: existingUser.userType,
        centerAdminInfo: existingUser.centerAdminInfo
      });
      return;
    }

    // 3. center@swim.com 사용자 생성
    const hashedPassword = await bcrypt.hash('center123', 10);
    
    const newUser = new User({
      name: 'JJ Swim Center 관리자',
      email: 'center@swim.com',
      password: hashedPassword,
      phone: '010-1234-5678',
      userType: 'center-admin',
      centerAdminInfo: {
        managedCenters: [center._id],
        permissions: ['read', 'write', 'delete'],
        role: 'admin'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();
    console.log('✅ center@swim.com 센터 관리자 생성 완료!');
    console.log('📋 이메일: center@swim.com');
    console.log('📋 비밀번호: center123');
    console.log('📋 관리 센터 ID:', center._id);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

createCenterUser();
