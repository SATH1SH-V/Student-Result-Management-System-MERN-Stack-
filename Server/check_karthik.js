const mongoose = require('mongoose');
const Result = require('./models/Result');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const r = await Result.findOne({ registerNumber: 'CSE1005' });
    if (r) {
        console.log('Karthik Raj subjects:');
        r.subjects.forEach(s => console.log(`  ${s.name}: ${s.marks}`));
        console.log('Passed:', r.passed);
    } else {
        console.log('CSE1005 not found');
    }
    process.exit();
}
check();
