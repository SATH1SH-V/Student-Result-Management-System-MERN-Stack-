const mongoose = require('mongoose');
const Result = require('./models/Result');
const Student = require('./models/Student');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Migrate Results without department
        const results = await Result.find({ department: { $exists: false } });
        console.log(`Found ${results.length} results without department.`);
        let updatedCount = 0;
        for (let result of results) {
            const student = await Student.findOne({ registerNumber: result.registerNumber });
            result.department = (student && student.department) ? student.department : '';
            await result.save();
            updatedCount++;
        }
        console.log(`Updated ${updatedCount} results.`);

        // Also migrate Students without department
        const students = await Student.find({ department: { $exists: false } });
        console.log(`Found ${students.length} students without department.`);
        for (let s of students) {
            s.department = '';
            await s.save();
        }
        console.log(`Updated ${students.length} students.`);

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
