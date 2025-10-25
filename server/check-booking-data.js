/**
 * 예약 데이터 확인 스크립트
 * 연동 데이터: PersonalLesson, LaneRental 모델
 * 연동 파일: server/src/models/PersonalLesson.ts, server/src/models/LaneRental.ts
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ MongoDB 연결 성공');

  try {
    // PersonalLesson 데이터 확인
    const PersonalLesson = mongoose.model('PersonalLesson', new mongoose.Schema({}, { strict: false }));
    const personalLessons = await PersonalLesson.find({});
    console.log('📊 개인레슨 데이터 개수:', personalLessons.length);
    console.log('📊 개인레슨 데이터:', personalLessons);

    // LaneRental 데이터 확인
    const LaneRental = mongoose.model('LaneRental', new mongoose.Schema({}, { strict: false }));
    const laneRentals = await LaneRental.find({});
    console.log('📊 레인대여 데이터 개수:', laneRentals.length);
    console.log('📊 레인대여 데이터:', laneRentals);

    // Center 데이터 확인
    const Center = mongoose.model('Center', new mongoose.Schema({}, { strict: false }));
    const centers = await Center.find({});
    console.log('📊 센터 데이터 개수:', centers.length);
    console.log('📊 센터 데이터:', centers);

    // User 데이터 확인 (center-admin)
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const centerAdmins = await User.find({ userType: 'center-admin' });
    console.log('📊 센터 관리자 데이터 개수:', centerAdmins.length);
    console.log('📊 센터 관리자 데이터:', centerAdmins);

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류:', error);
  } finally {
    mongoose.connection.close();
  }
});


