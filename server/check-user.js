const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab')
  .then(async () => {
    console.log('MongoDB 연결됨');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({ email: 'center@swim.com' });
    
    console.log('사용자 정보:');
    users.forEach(user => {
      console.log('ID:', user._id);
      console.log('이름:', user.name);
      console.log('이메일:', user.email);
      console.log('사용자 타입:', user.userType);
      console.log('센터 ID:', user.centerId);
      console.log('---');
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('오류:', err);
    mongoose.disconnect();
  });




