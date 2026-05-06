const mongoose = require('mongoose');
const Result = require('./models/Result');
require('dotenv').config();

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const r = await Result.findOne({ registerNumber: 'CSE1005' });
    if (r) {
        // Add Eng Graphics with AB mark (insert after C Programming)
        const cpIdx = r.subjects.findIndex(s => s.name.toLowerCase().includes('programming'));
        if (cpIdx !== -1) {
            r.subjects.splice(cpIdx + 1, 0, { name: 'Eng Graphics', marks: 'AB' });
        } else {
            r.subjects.push({ name: 'Eng Graphics', marks: 'AB' });
        }
        r.passed = false;
        r.grade = 'F';
        r.markModified('subjects');
        await r.save();
        console.log('Updated Karthik Raj with AB in Eng Graphics');
        console.log('Subjects now:');
        r.subjects.forEach(s => console.log(`  ${s.name}: ${s.marks}`));
    } else {
        console.log('CSE1005 not found');
    }
    process.exit();
}
fix();
