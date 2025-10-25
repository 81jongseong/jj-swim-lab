const mongoose = require('mongoose');
const fetch = require('node-fetch');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('🧪 로그인 후 강사 정보 수정 테스트 시작...');
  
  // 센터 관리자로 로그인
  const loginData = {
    email: 'center@swim.com',
    password: 'password123'
  };
  
  try {
    console.log('🔐 로그인 시도...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📡 로그인 응답 상태:', loginResponse.status);
    
    const loginResult = await loginResponse.json();
    console.log('📡 로그인 응답:', loginResult);
    
    if (!loginResult.success || !loginResult.token) {
      console.log('❌ 로그인 실패!');
      mongoose.disconnect();
      return;
    }
    
    const token = loginResult.token;
    console.log('✅ 로그인 성공! 토큰 길이:', token.length);
    
    // 강사 정보 조회
    const instructor = await User.findOne({ userType: 'instructor' });
    if (!instructor) {
      console.log('❌ 강사를 찾을 수 없습니다.');
      mongoose.disconnect();
      return;
    }
    
    console.log('👨‍🏫 테스트 대상 강사:', instructor.name);
    console.log('🆔 강사 ID:', instructor._id);
    
    // 강사 정보 수정 API 호출
    const updateData = {
      phone: '010-7777-6666',
      instructorInfo: {
        instructorLevel: 'expert',
        maxStudents: 25,
        workSchedule: {
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          timeSlots: ['09:00-18:00', '19:00-21:00']
        },
        salaryInfo: {
          type: 'monthly',
          amount: 5000000,
          currency: 'KRW',
          incentive: 20
        },
        memo: '로그인 후 API 테스트 메모',
        hiredAt: new Date(),
        contractType: 'full-time',
        specialties: ['자유형', '배영', '접영', '평영'],
        certifications: ['수영지도사 1급', '생존수영지도사', '수상안전지도사', '코치 자격증']
      }
    };
    
    console.log('📤 강사 정보 수정 API 호출 시작...');
    console.log('📋 업데이트 데이터:', JSON.stringify(updateData, null, 2));
    
    const editResponse = await fetch(`http://localhost:5000/api/center-admin/instructors/${instructor._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('📡 수정 API 응답 상태:', editResponse.status);
    console.log('📡 수정 API 응답 헤더:', Object.fromEntries(editResponse.headers.entries()));
    
    const editResult = await editResponse.text();
    console.log('📡 수정 API 응답 본문:', editResult);
    
    if (editResponse.ok) {
      console.log('✅ 강사 정보 수정 성공!');
    } else {
      console.log('❌ 강사 정보 수정 실패!');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ 연결 실패:', err);
  process.exit(1);
});


