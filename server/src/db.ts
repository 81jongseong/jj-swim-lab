import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jongseongj:qkxm0810@jj-swim-cluster.fomz6.mongodb.net/jj-swim-db?retryWrites=true&w=majority';

export const connectDB = async () => {
  try {
    console.log('🔗 MongoDB 연결 시도 중...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
    });
    console.log('✅ MongoDB 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    console.log('🔧 연결 문자열 확인:', MONGODB_URI.substring(0, 50) + '...');
    return false;
  }
};
