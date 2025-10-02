/**
 * DB 회원 데이터 확인 스크립트
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkUsers() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('🔗 MongoDB 연결:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ 연결 성공\n');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const totalUsers = await User.countDocuments();
    console.log(`📊 총 회원 수: ${totalUsers}명\n`);
    
    if (totalUsers > 0) {
      const users = await User.find().limit(5).lean();
      
      console.log('📋 샘플 회원 데이터 (최대 5명):');
      users.forEach((u, i) => {
        console.log(`\n${i + 1}. ${u.name || '이름없음'} (${u.email})`);
        console.log(`   타입: ${u.userType}`);
        console.log(`   healthProfile:`, u.healthProfile ? '✅ 있음' : '❌ 없음');
        if (u.healthProfile) {
          console.log(`     - 나이: ${u.healthProfile.age || '-'}`);
          console.log(`     - 성별: ${u.healthProfile.gender || '-'}`);
          console.log(`     - 키/몸무게: ${u.healthProfile.height || '-'}cm / ${u.healthProfile.weight || '-'}kg`);
          console.log(`     - BMI: ${u.healthProfile.bmi || '-'}`);
          console.log(`     - 질환: ${u.healthProfile.chronicConditions?.length || 0}개`);
        }
      });
      
      // 건강정보 통계
      const withHealth = await User.countDocuments({ healthProfile: { $exists: true, $ne: null } });
      console.log(`\n📊 건강정보 통계:`);
      console.log(`   - 건강정보 있음: ${withHealth}명`);
      console.log(`   - 건강정보 없음: ${totalUsers - withHealth}명`);
      console.log(`   - 등록률: ${((withHealth / totalUsers) * 100).toFixed(1)}%`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ 연결 종료');
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

checkUsers();

