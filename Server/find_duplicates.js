const mongoose = require('mongoose');
const Result = require('./models/Result');
require('dotenv').config();

async function checkDuplicates() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const results = await Result.find({});
        console.log(`Total results in DB: ${results.length}`);
        
        const counts = {};
        const duplicates = [];

        results.forEach(r => {
            const key = `${r.registerNumber}_${r.year}_${r.semester}_${r.iae}`;
            if (counts[key]) {
                duplicates.push({ key, id: r._id });
            }
            counts[key] = (counts[key] || 0) + 1;
        });

        if (duplicates.length > 0) {
            console.log('--- DUPLICATES FOUND ---');
            duplicates.forEach(d => console.log(d));
        } else {
            console.log('No duplicates found in database.');
        }
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDuplicates();
