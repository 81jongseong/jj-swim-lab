const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createInstructors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a.mongodb.net/jjswimlab?retryWrites=true&w=majority');
    console.log('✅ MongoDB 연결 성공');

    // 현재 로그인한 사용자의 센터 ID
    const currentUserCenterId = '68f10983ccca24669078e1b4';
    
    const instructorPassword = await bcrypt.hash('password123', 10);

    // 강사 데이터 생성
    const instructorsData = [
      {
        name: '김수영',
        email: 'kim.instructor@example.com',
        password: instructorPassword,
        userType: 'instructor',
        centerId: new mongoose.Types.ObjectId(currentUserCenterId),
        instructorInfo: {
          instructorType: 'instructor',
          experience: '5년',
          specialties: ['자유형', '배영', '개인레슨'],
          personalLessonSettings: {
            isPersonalLessonEnabled: true,
            lessonTypes: [
              { type: '1:1', maxStudents: 1, pricePerSession: 80000 },
              { type: '1:2', maxStudents: 2, pricePerSession: 50000 },
            ],
            frequencyOptions: [
              { type: 'weekly', sessions: 4, price: 300000, expirationDays: 30 },
              { type: 'monthly', sessions: 8, price: 560000, expirationDays: 60 },
            ],
            availability: {
              timeSlots: [
                { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', isActive: true },
                { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', isActive: true },
                { dayOfWeek: 3, startTime: '14:00', endTime: '15:00', isActive: true },
                { dayOfWeek: 5, startTime: '18:00', endTime: '19:00', isActive: true },
              ],
              maxDailyLessons: 3,
              bufferTime: 15,
            },
          },
        },
        isActive: true,
        accessPermissions: { dashboard: true, courses: true, bookings: true, payments: true, notices: true, progress: true, evaluations: true, reports: true, userManagement: true, systemSettings: false, aiConfigManagement: false },
      },
      {
        name: '박수영',
        email: 'park.instructor@example.com',
        password: instructorPassword,
        userType: 'instructor',
        centerId: new mongoose.Types.ObjectId(currentUserCenterId),
        instructorInfo: {
          instructorType: 'instructor',
          experience: '3년',
          specialties: ['평영', '접영', '개인레슨'],
          personalLessonSettings: {
            isPersonalLessonEnabled: true,
            lessonTypes: [
              { type: '1:1', maxStudents: 1, pricePerSession: 70000 },
              { type: '1:2', maxStudents: 2, pricePerSession: 45000 },
            ],
            frequencyOptions: [
              { type: 'weekly', sessions: 2, price: 150000, expirationDays: 15 },
              { type: 'monthly', sessions: 4, price: 280000, expirationDays: 30 },
            ],
            availability: {
              timeSlots: [
                { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', isActive: true },
                { dayOfWeek: 4, startTime: '16:00', endTime: '17:00', isActive: true },
              ],
              maxDailyLessons: 2,
              bufferTime: 10,
            },
          },
        },
        isActive: true,
        accessPermissions: { dashboard: true, courses: true, bookings: true, payments: true, notices: true, progress: true, evaluations: true, reports: true, userManagement: true, systemSettings: false, aiConfigManagement: false },
      },
      {
        name: '이수영',
        email: 'lee.instructor@example.com',
        password: instructorPassword,
        userType: 'instructor',
        centerId: new mongoose.Types.ObjectId(currentUserCenterId),
        instructorInfo: {
          instructorType: 'instructor',
          experience: '7년',
          specialties: ['자유형', '배영'],
          personalLessonSettings: { isPersonalLessonEnabled: false },
        },
        isActive: true,
        accessPermissions: { dashboard: true, courses: true, bookings: true, payments: true, notices: true, progress: true, evaluations: true, reports: true, userManagement: true, systemSettings: false, aiConfigManagement: false },
      },
    ];

    // 기존 강사들 삭제 (이메일이 다르므로)
    await mongoose.connection.db.collection('users').deleteMany({ userType: 'instructor' });
    console.log('🗑️ 기존 강사들 삭제 완료');

    // 새 강사들 생성
    const createdInstructors = await mongoose.connection.db.collection('users').insertMany(instructorsData);
    console.log(`✅ ${createdInstructors.insertedCount}명의 강사 생성 완료`);

    // 생성된 강사들 확인
    const instructors = await mongoose.connection.db.collection('users').find({ userType: 'instructor' }).toArray();
    console.log('\n👨‍🏫 생성된 강사 목록:');
    instructors.forEach(instructor => {
      console.log(`  - ${instructor.name} (${instructor.email}) - 센터ID: ${instructor.centerId}`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  }
}

createInstructors();




