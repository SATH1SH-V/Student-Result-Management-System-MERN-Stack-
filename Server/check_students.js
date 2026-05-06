const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

const checkStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const students = await Student.find({}, 'registerNumber dob').limit(5);
        students.forEach(s => console.log(`${s.registerNumber}: ${s.dob}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStudents();
