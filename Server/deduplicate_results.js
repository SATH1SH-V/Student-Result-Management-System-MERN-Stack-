const mongoose = require('mongoose');
const Result = require('./models/Result');
require('dotenv').config();

async function deduplicate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for deduplication...');

        const results = await Result.find({}).sort({ updatedAt: -1 });
        console.log(`Initial records: ${results.length}`);

        const seen = new Set();
        const toDelete = [];
        let updatedCount = 0;

        for (let r of results) {
            // Standardize year: if it's 2024, set to 1. 2025, set to 2. etc.
            // Or just check if it's > 1000 and treat it as academic year (1, 2, 3, 4)
            // Looking at the subagent's report, 2024 maps to Year 1.
            let academicYear = r.year;
            if (r.year === 2024) academicYear = 1;

            const key = `${r.registerNumber}_${academicYear}_${r.semester}_${r.iae || 'null'}`;

            if (seen.has(key)) {
                // Already have a more recent record for this student/exam
                toDelete.push(r._id);
            } else {
                seen.add(key);
                if (r.year !== academicYear) {
                    r.year = academicYear;
                    await r.save();
                    updatedCount++;
                }
            }
        }

        if (toDelete.length > 0) {
            await Result.deleteMany({ _id: { $in: toDelete } });
            console.log(`Deleted ${toDelete.length} duplicate records.`);
        }

        console.log(`Updated ${updatedCount} records to standard year format.`);
        console.log(`Final unique records: ${seen.size}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

deduplicate();
