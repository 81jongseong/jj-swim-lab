const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab')
  .then(async () => {
    console.log('MongoDB connected');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({ email: 'center@swim.com' });
    
    console.log('User info:');
    users.forEach(user => {
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('User Type:', user.userType);
      console.log('Center ID:', user.centerId);
      console.log('---');
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });




