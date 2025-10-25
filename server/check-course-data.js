const mongoose = require('mongoose');
const Course = require('./dist/models/Course');

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

async function checkCourse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');
    
    const course = await Course.findById('68fb24ce93a6078f2bc6697b')
      .populate('instructor', 'name email')
      .select('name instructor instructorId instructorName');
    
    console.log('📋 강습 과정 정보:');
    console.log('  - 이름:', course?.name);
    console.log('  - instructor:', course?.instructor);
    console.log('  - instructorId:', course?.instructorId);
    console.log('  - instructorName:', course?.instructorName);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkCourse();