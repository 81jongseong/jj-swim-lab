const mongoose = require('mongoose');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('🧪 강사 정보 수정 테스트 시작...');
  
  // 강사 정보 조회
  const instructor = await User.findOne({ userType: 'instructor' });
  if (!instructor) {
    console.log('❌ 강사를 찾을 수 없습니다.');
    mongoose.disconnect();
    return;
  }
  
  console.log('👨‍🏫 테스트 대상 강사:', instructor.name);
  console.log('📧 이메일:', instructor.email);
  
  // 강사 정보 수정 테스트
  const updateData = {
    phone: '010-1234-5678',
    instructorInfo: {
      instructorLevel: 'senior',
      maxStudents: 15,
      workSchedule: {
        daysOfWeek: [1, 2, 3, 4, 5],
        timeSlots: ['09:00-18:00']
      },
      salaryInfo: {
        type: 'monthly',
        amount: 3500000,
        currency: 'KRW',
        incentive: 10
      },
      memo: '테스트 메모',
      hiredAt: new Date(),
      contractType: 'full-time',
      specialties: ['자유형', '배영'],
      certifications: ['수영지도사 1급', '생존수영지도사']
    }
  };
  
  try {
    const updatedInstructor = await User.findByIdAndUpdate(
      instructor._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('✅ 강사 정보 수정 성공!');
    console.log('📱 전화번호:', updatedInstructor.phone);
    console.log('🎓 강사 등급:', updatedInstructor.instructorInfo?.instructorLevel);
    console.log('👥 최대 학생 수:', updatedInstructor.instructorInfo?.maxStudents);
    console.log('📝 메모:', updatedInstructor.instructorInfo?.memo);
    
  } catch (error) {
    console.error('❌ 강사 정보 수정 실패:', error);
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ 연결 실패:', err);
  process.exit(1);
});


