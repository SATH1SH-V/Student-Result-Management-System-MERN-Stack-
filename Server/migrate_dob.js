const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

const formatDate = (val) => {
    if (!val) return '2000-01-01';
    
    // If it's a number (Excel serial date)
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }
    
    // If it's a numeric string (e.g., "37756" from Excel)
    if (typeof val === 'string' && /^\d+$/.test(val) && val.length > 4) {
        const numVal = Number(val);
        const date = new Date(Math.round((numVal - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }
    
    // If it's already a date string or object
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }
    
    // Try manual parsing for DD-MM-YYYY or DD/MM/YYYY
    const str = String(val);
    const parts = str.split(/[-/]/);
    if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        if (y.length === 4) return `${y}-${m}-${d}`;
        if (y.length === 2) return `20${y}-${m}-${d}`;
    }
    
    return str; // Fallback
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find({});
        console.log(`Found ${students.length} students. Checking for date mismatches...`);

        let updatedCount = 0;
        for (let student of students) {
            const originalDob = student.dob;
            const formattedDob = formatDate(originalDob);

            if (originalDob !== formattedDob) {
                student.dob = formattedDob;
                await student.save();
                console.log(`Updated ${student.registerNumber}: ${originalDob} -> ${formattedDob}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
