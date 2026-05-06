const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Result = require('./models/Result');

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for migration...');

        const results = await Result.find({});
        console.log(`Found ${results.length} records to update.`);

        let updatedCount = 0;

        for (let result of results) {
            // Determine Pass/Fail logic: Any 'AB' or mark < 50 is a failure
            const hasFailedSubject = result.subjects.some(s => s.marks === 'AB' || Number(s.marks) < 50);
            const passed = !hasFailedSubject;
            
            // If it's a fail, ensure grade is 'F'
            let grade = result.grade;
            if (!passed) {
                grade = 'F';
            }

            result.passed = passed;
            result.grade = grade;
            await result.save();
            updatedCount++;
        }

        console.log(`Successfully updated ${updatedCount} records.`);
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
