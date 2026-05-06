const mongoose = require('mongoose');
const Result = require('./models/Result');
const Student = require('./models/Student');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const results = await Result.find({ dob: { $exists: false } });
        console.log(`Found ${results.length} results without DOB.`);

        let updatedCount = 0;
        for (let result of results) {
            const student = await Student.findOne({ registerNumber: result.registerNumber });
            if (student) {
                result.dob = student.dob;
                await result.save();
                updatedCount++;
            } else {
                // If student not found, use a default
                result.dob = '01-01-2000';
                await result.save();
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} results.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
