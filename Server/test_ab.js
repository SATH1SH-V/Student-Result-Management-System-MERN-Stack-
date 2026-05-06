const mongoose = require('mongoose');
const Result = require('./models/Result');
require('dotenv').config();

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const res = await Result.findOne({ registerNumber: 'CSE1003' });
    if (res) {
        // Set the second subject to AB
        if (res.subjects[1]) {
            res.subjects[1].marks = 'AB';
            res.passed = false;
            res.grade = 'F';
            await res.save();
            console.log('Updated CSE1003 to have AB in subject:', res.subjects[1].name);
        }
    }
    process.exit();
}
fix();
