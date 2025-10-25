const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('🔍 센터 관리자 정보 확인 중...');
  
  // 센터 관리자 정보 조회
  const centerAdmin = await User.findOne({ userType: 'centerAdmin' });
  if (!centerAdmin) {
    console.log('❌ 센터 관리자를 찾을 수 없습니다.');
    mongoose.disconnect();
    return;
  }
  
  console.log('👨‍💼 센터 관리자 정보:');
  console.log('  이름:', centerAdmin.name);
  console.log('  이메일:', centerAdmin.email);
  console.log('  비밀번호 해시:', centerAdmin.password);
  console.log('  센터 ID:', centerAdmin.centerId);
  console.log('  사용자 타입:', centerAdmin.userType);
  
  // 모든 사용자 타입 확인
  const userTypes = await User.distinct('userType');
  console.log('📊 전체 사용자 타입:', userTypes);
  
  // 각 사용자 타입별 수 확인
  for (const userType of userTypes) {
    const count = await User.countDocuments({ userType });
    console.log(`  ${userType}: ${count}명`);
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ 연결 실패:', err);
  process.exit(1);
});


