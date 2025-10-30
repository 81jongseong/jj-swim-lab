const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Payment = require('../dist/models/Payment').Payment;
    const Approval = require('../dist/models/Approval').Approval;
    
    const paymentCount = await Payment.countDocuments();
    const approvalCount = await Approval.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const pendingApprovals = await Approval.countDocuments({ status: 'pending' });
    
    console.log(`Payment data: ${paymentCount} items`);
    console.log(`Approval data: ${approvalCount} items`);
    console.log(`Pending payments: ${pendingPayments} items`);
    console.log(`Pending approvals: ${pendingApprovals} items`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();


