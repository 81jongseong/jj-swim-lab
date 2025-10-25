const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('📊 강사 데이터 확인 중...');
  
  const instructors = await User.find({ userType: 'instructor' }).select('name email centerId instructorInfo');
  console.log('👨‍🏫 전체 강사 수:', instructors.length);
  
  instructors.forEach((instructor, index) => {
    console.log(`${index + 1}. ${instructor.name} - ${instructor.email}`);
    console.log('   센터 ID:', instructor.centerId);
    console.log('   강사 정보:', instructor.instructorInfo);
    console.log('---');
  });
  
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ 연결 실패:', err);
  process.exit(1);
});
