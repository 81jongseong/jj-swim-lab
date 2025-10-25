// MongoDB Atlas에 강사 정보 생성 (2단계)
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
    
    // 2. 강사 정보 생성
    const instructors = [
      {
        name: '김수영',
        email: 'kim.instructor@example.com',
        phone: '010-1111-2222',
        userType: 'instructor',
        centerId: centerId,
        instructorInfo: {
          experience: 5,
          specialties: ['자유형', '배영', '개인레슨'],
          certifications: ['수영지도사 1급', '생존수영지도사'],
          rating: 4.8,
          assignedCenters: [centerId],
          maxStudents: 10,
          lessonTypes: ['group', 'personal'],
          skillLevels: ['beginner', 'intermediate'],
          price: 50000,
          currentBookings: 0,
          pricingType: 'per_session',
          singleSessionPrice: 50000,
          packageOptions: [
            {
              name: '5회 패키지',
              sessions: 5,
              price: 225000,
              discount: 10
            },
            {
              name: '10회 패키지',
              sessions: 10,
              price: 400000,
              discount: 20
            }
          ],
          expirationDays: 30,
          lessonDuration: 60,
          bufferTime: 15,
          weeklySchedule: {
            monday: { available: true, startTime: '09:00', endTime: '22:00' },
            tuesday: { available: true, startTime: '09:00', endTime: '22:00' },
            wednesday: { available: true, startTime: '09:00', endTime: '22:00' },
            thursday: { available: true, startTime: '09:00', endTime: '22:00' },
            friday: { available: true, startTime: '09:00', endTime: '22:00' },
            saturday: { available: true, startTime: '09:00', endTime: '20:00' },
            sunday: { available: false, startTime: '', endTime: '' }
          }
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '박수영',
        email: 'park.instructor@example.com',
        phone: '010-3333-4444',
        userType: 'instructor',
        centerId: centerId,
        instructorInfo: {
          experience: 3,
          specialties: ['평영', '접영', '단체반'],
          certifications: ['수영지도사 2급'],
          rating: 4.6,
          assignedCenters: [centerId],
          maxStudents: 8,
          lessonTypes: ['group', 'personal'],
          skillLevels: ['beginner', 'intermediate', 'advanced'],
          price: 45000,
          currentBookings: 0,
          pricingType: 'per_session',
          singleSessionPrice: 45000,
          packageOptions: [
            {
              name: '5회 패키지',
              sessions: 5,
              price: 202500,
              discount: 10
            },
            {
              name: '10회 패키지',
              sessions: 10,
              price: 360000,
              discount: 20
            }
          ],
          expirationDays: 30,
          lessonDuration: 60,
          bufferTime: 15,
          weeklySchedule: {
            monday: { available: true, startTime: '09:00', endTime: '22:00' },
            tuesday: { available: true, startTime: '09:00', endTime: '22:00' },
            wednesday: { available: true, startTime: '09:00', endTime: '22:00' },
            thursday: { available: true, startTime: '09:00', endTime: '22:00' },
            friday: { available: true, startTime: '09:00', endTime: '22:00' },
            saturday: { available: true, startTime: '09:00', endTime: '20:00' },
            sunday: { available: false, startTime: '', endTime: '' }
          }
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      },
      {
        name: '이수영',
        email: 'lee.instructor@example.com',
        phone: '010-5555-6666',
        userType: 'instructor',
        centerId: centerId,
        instructorInfo: {
          experience: 7,
          specialties: ['자유형', '배영', '접영', '개인레슨'],
          certifications: ['수영지도사 1급', '생존수영지도사', '수상안전지도사'],
          rating: 4.9,
          assignedCenters: [centerId],
          maxStudents: 12,
          lessonTypes: ['group', 'personal'],
          skillLevels: ['beginner', 'intermediate', 'advanced'],
          price: 60000,
          currentBookings: 0,
          pricingType: 'per_session',
          singleSessionPrice: 60000,
          packageOptions: [
            {
              name: '5회 패키지',
              sessions: 5,
              price: 270000,
              discount: 10
            },
            {
              name: '10회 패키지',
              sessions: 10,
              price: 480000,
              discount: 20
            }
          ],
          expirationDays: 30,
          lessonDuration: 60,
          bufferTime: 15,
          weeklySchedule: {
            monday: { available: true, startTime: '09:00', endTime: '22:00' },
            tuesday: { available: true, startTime: '09:00', endTime: '22:00' },
            wednesday: { available: true, startTime: '09:00', endTime: '22:00' },
            thursday: { available: true, startTime: '09:00', endTime: '22:00' },
            friday: { available: true, startTime: '09:00', endTime: '22:00' },
            saturday: { available: true, startTime: '09:00', endTime: '20:00' },
            sunday: { available: false, startTime: '', endTime: '' }
          }
        },
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      }
    ];
    
    // 기존 강사 삭제
    await User.deleteMany({ userType: 'instructor', centerId: centerId });
    console.log('🗑️ 기존 강사 데이터 삭제 완료');
    
    // 새 강사 생성
    const createdInstructors = await User.insertMany(instructors);
    console.log('✅ 강사 3명 생성 완료:', createdInstructors.map(i => i.name));
    
    // 결과 확인
    console.log('\n📊 생성된 강사 목록:');
    createdInstructors.forEach(instructor => {
      console.log(`- ${instructor.name}: ${instructor.instructorInfo?.experience}년 경력, ${instructor.instructorInfo?.specialties?.join(', ')}, 평점 ${instructor.instructorInfo?.rating}`);
    });
    
    console.log('\n🎉 강사 생성 완료!');
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ 오류:', err.message);
    mongoose.disconnect();
  });
