const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab')
  .then(async () => {
    console.log('✅ MongoDB 연결 성공');
    
    // User 모델 정의
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      userType: String,
      studentInfo: {
        centerMemos: [{
          _id: mongoose.Schema.Types.ObjectId,
          content: String,
          type: String,
          createdAt: Date,
          createdByName: String
        }]
      }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // 메모가 있는 회원 찾기
    const member = await User.findOne({
      userType: 'student',
      'studentInfo.centerMemos': { $exists: true, $ne: [] }
    }).select('name studentInfo.centerMemos');
    
    if (member) {
      console.log('📝 메모가 있는 회원:', member.name);
      console.log('📝 전체 회원 데이터:', JSON.stringify(member, null, 2));
      console.log('📝 메모 이력:', JSON.stringify(member.studentInfo?.centerMemos, null, 2));
    } else {
      console.log('❌ 메모가 있는 회원을 찾을 수 없습니다.');
      
      // 모든 회원의 메모 정보 확인
      const allMembers = await User.find({ userType: 'student' }).select('name studentInfo');
      console.log('📋 모든 회원 메모 정보:');
      allMembers.forEach(m => {
        console.log(`- ${m.name}: ${JSON.stringify(m.studentInfo, null, 2)}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
    process.exit(1);
  });
