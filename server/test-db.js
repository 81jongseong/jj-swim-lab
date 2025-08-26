const mongoose = require('mongoose');
require('dotenv').config();

// TeachingMethod 모델 import
const { TeachingMethod } = require('./src/models/TeachingMethod');

// MongoDB 연결
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
}
