const mongoose = require('mongoose');
const Result = require('./models/Result');
require('dotenv').config();

const checkResults = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const results = await Result.find({ registerNumber: 'REG2001' });
        console.log('Results found for REG2001:', JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkResults();
