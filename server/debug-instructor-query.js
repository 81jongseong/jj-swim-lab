// 강사 조회 쿼리 디버깅
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

console.log('🔗 MongoDB Atlas 연결 시도...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas 연결 성공');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // center@swim.com 계정 정보 확인
    const centerAdmin = await User.findOne({ email: 'center@swim.com' });
    const centerId = centerAdmin?.centerId;
    
    if (!centerId) {
      console.log('❌ 센터 ID를 찾을 수 없습니다.');
      mongoose.disconnect();
      return;
    }
    
    console.log('🔍 센터 ID:', centerId);
    console.log('🔍 센터 ID 타입:', typeof centerId);
    console.log('🔍 센터 ID ObjectId 변환:', new mongoose.Types.ObjectId(centerId));
    
    // 1. 모든 강사 조회
    const allInstructors = await User.find({ userType: 'instructor' });
    console.log(`\n👨‍🏫 전체 강사 목록 (${allInstructors.length}명):`);
    allInstructors.forEach(instructor => {
      console.log(`- ${instructor.name}: centerId=${instructor.centerId}, 타입=${typeof instructor.centerId}`);
    });
    
    // 2. centerId로 강사 조회 (문자열 비교)
    const instructorsByString = await User.find({ 
      userType: 'instructor', 
      centerId: centerId.toString()
    });
    console.log(`\n🔍 문자열 centerId로 조회: ${instructorsByString.length}명`);
    
    // 3. centerId로 강사 조회 (ObjectId 비교)
    const instructorsByObjectId = await User.find({ 
      userType: 'instructor', 
      centerId: new mongoose.Types.ObjectId(centerId)
    });
    console.log(`\n🔍 ObjectId centerId로 조회: ${instructorsByObjectId.length}명`);
    
    // 4. isActive 조건 없이 조회
    const instructorsWithoutActive = await User.find({ 
      userType: 'instructor', 
      centerId: new mongoose.Types.ObjectId(centerId)
    });
    console.log(`\n🔍 isActive 조건 없이 조회: ${instructorsWithoutActive.length}명`);
    
    // 5. isActive 조건과 함께 조회
    const instructorsWithActive = await User.find({ 
      userType: 'instructor', 
      centerId: new mongoose.Types.ObjectId(centerId),
      isActive: true
    });
    console.log(`\n🔍 isActive 조건과 함께 조회: ${instructorsWithActive.length}명`);
    
    // 6. 강사 데이터에 isActive 필드 확인
    if (allInstructors.length > 0) {
      console.log(`\n🔍 첫 번째 강사 데이터 상세:`, {
        name: allInstructors[0].name,
        isActive: allInstructors[0].isActive,
        status: allInstructors[0].status,
        centerId: allInstructors[0].centerId
      });
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });



