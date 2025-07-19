import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/users', usersRouter);

// MongoDB 연결 후 서버 시작
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
