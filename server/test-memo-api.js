const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab')
  .then(async () => {
    console.log('✅ MongoDB 연결 성공');
    
    // User 모델 정의 (간단하게)
    const userSchema = new mongoose.Schema({}, { strict: false });
    
    const User = mongoose.model('User', userSchema);
    
    // 김철수 회원 찾기
    const member = await User.findOne({ name: '김철수', userType: 'student' });
    
    if (member) {
      console.log('📝 김철수 회원 찾음:', member._id);
      
      // studentInfo 객체 초기화
      if (!member.studentInfo) {
        member.studentInfo = {};
      }
      
      // centerMemos 배열 초기화
      if (!member.studentInfo.centerMemos) {
        member.studentInfo.centerMemos = [];
      }
      
      // 새 메모 추가
      const newMemo = {
        _id: new mongoose.Types.ObjectId(),
        content: '테스트 메모입니다. 이 회원은 수영 초보자이며 특별한 주의사항이 있습니다.',
        type: 'info',
        createdAt: new Date(),
        createdBy: new mongoose.Types.ObjectId(),
        createdByName: '센터 관리자'
      };
      
      member.studentInfo.centerMemos.push(newMemo);
      member.studentInfo.centerMemo = newMemo.content;
      
      await member.save();
      
      console.log('✅ 메모 저장 완료');
      console.log('📝 저장된 메모 이력:', JSON.stringify(member.studentInfo.centerMemos, null, 2));
    } else {
      console.log('❌ 김철수 회원을 찾을 수 없습니다.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
    process.exit(1);
  });