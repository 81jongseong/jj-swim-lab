/**
 * Delete all swim programs from MongoDB
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const SwimProgramSchema = new mongoose.Schema({}, { strict: false });
const SwimProgram = mongoose.model('SwimProgram', SwimProgramSchema);

async function deleteAllPrograms() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    console.log('Deleting all swim programs...');
    const result = await SwimProgram.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} programs`);
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAllPrograms();







