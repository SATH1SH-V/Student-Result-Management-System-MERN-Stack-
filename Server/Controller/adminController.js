const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const Admin = require('../models/Admin');
const Result = require('../models/Result');
const Student = require('../models/Student');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {
    console.log('authAdmin controller hit with:', req.body.username);
    const { username, password } = req.body;

    // Check for admin, if not exists, create one (FOR LOCAL SETUP PURPOSES)
    let admin = await Admin.findOne({ username });
    if (!admin && username === 'admin') {
        admin = await Admin.create({ username: 'admin', password: 'password123' });
    }

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            username: admin.username,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

const calculateGrade = (percentage) => {
    if(percentage >= 90) return 'O';
    if(percentage >= 80) return 'A+';
    if(percentage >= 70) return 'A';
    if(percentage >= 60) return 'B+';
    if(percentage >= 50) return 'B';
    return 'F';
};

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
        // Assume DD-MM-YYYY
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        if (y.length === 4) return `${y}-${m}-${d}`;
        if (y.length === 2) return `20${y}-${m}-${d}`;
    }
    
    return str; // Fallback
};

// @desc    Upload Excel Results
// @route   POST /api/admin/upload
// @access  Private
const uploadResults = async (req, res) => {
    try {
        const { year, semester, iae } = req.body;
        
        if (!req.file || !year || !semester) {
            return res.status(400).json({ message: 'Please upload a file and provide year, semester.' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const resultsToInsert = [];
        
        for (let row of sheetData) {
            // Excel columns expected: Register Number, Student Name, DOB, various subjects, Marks...
            // Let's dynamically find subject columns vs fixed columns
            const fixedCols = ['Register Number', 'Student Name', 'DOB'];
            const subjectsRow = [];
            let total = 0;
            
            let regNo = '';
            let sName = '';
            let dob = '01-01-2000'; // fallback
            let department = '';
            
            for (let [key, val] of Object.entries(row)) {
                const cleanKey = key.trim();
                const lowerKey = cleanKey.toLowerCase().replace(/[\s_-]/g, ''); // normalize: remove spaces, underscores, dashes

                // Register Number — matches: regno, registernumber, regnum, rollno, rollnumber
                if (['regno', 'registernumber', 'regnum', 'rollno', 'rollnumber', 'reg'].includes(lowerKey)) {
                    regNo = String(val).trim();

                // Student Name — matches: name, studentname, fullname, studentfullname
                } else if (['name', 'studentname', 'fullname', 'studentfullname'].includes(lowerKey)) {
                    sName = String(val).trim();

                // Date of Birth — matches: dob, dateofbirth, birthdate, bdate
                } else if (['dob', 'dateofbirth', 'birthdate', 'bdate', 'dateofbirth', 'dateob'].includes(lowerKey)) {
                    dob = formatDate(val);

                // Department — matches: department, dept, departmentname
                } else if (['department', 'dept', 'departmentname'].includes(lowerKey)) {
                    department = String(val).trim();

                // Explicitly skip non-marks columns (email, phone, address, etc.)
                } else if (['email', 'emailid', 'mail', 'phone', 'mobile', 'address', 'gender', 'category'].includes(lowerKey)) {
                    // skip

                } else {
                    // Treat as subject/marks column if numeric or "AB"
                    const strVal = String(val).trim().toUpperCase();
                    const mark = Number(strVal);
                    if (!isNaN(mark) && strVal !== '' && typeof val !== 'boolean') {
                        subjectsRow.push({ name: cleanKey, marks: mark });
                        total += mark;
                    } else if (strVal === 'AB' || strVal === 'ABSENT') {
                        subjectsRow.push({ name: cleanKey, marks: 'AB' });
                    }
                }
            }

            if (!regNo) continue; // Skip invalid rows

            // Upsert student info so they can login using DOB
            await Student.findOneAndUpdate(
                { registerNumber: regNo },
                { registerNumber: regNo, studentName: sName, dob: dob, department: department },
                { upsert: true, new: true }
            );

            let maxTotal = subjectsRow.length * 100; // assuming each subject is out of 100
            let percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
            
            // Determine Pass/Fail: Any "AB" or mark < 50 is a failure
            const hasFailedSubject = subjectsRow.some(s => s.marks === 'AB' || Number(s.marks) < 50);
            const passed = !hasFailedSubject;
            let grade = passed ? calculateGrade(percentage) : 'F';

            resultsToInsert.push({
                registerNumber: regNo,
                studentName: sName,
                department: department,
                dob: dob,
                year: Number(year),
                semester: Number(semester),
                iae: iae || null,
                subjects: subjectsRow,
                total,
                percentage: parseFloat(percentage.toFixed(2)),
                grade,
                passed
            });
        }

        if (resultsToInsert.length > 0) {
            // Removing old records for the same exam
            await Result.deleteMany({ year: Number(year), semester: Number(semester), iae: iae || null });
            await Result.insertMany(resultsToInsert);
        }

        res.status(201).json({ message: 'Results uploaded successfully', records: resultsToInsert.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during upload', error: error.message });
    }
};

// @desc    Get all results
// @route   GET /api/admin/results
// @access  Private
const getResults = async (req, res) => {
    try {
        const results = await Result.find({}).sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching results', error: error.message });
    }
};

// @desc    Delete result
// @route   DELETE /api/admin/results/:id
// @access  Private
const deleteResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (result) {
            await Result.deleteOne({ _id: result._id });
            res.json({ message: 'Result removed' });
        } else {
            res.status(404).json({ message: 'Result not found' });
        }
    } catch (error) {
        console.error(error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid result ID format' });
        }
        res.status(500).json({ message: 'Server Error deleting result', error: error.message });
    }
};

// @desc    Update result
// @route   PUT /api/admin/results/:id
// @access  Private
const updateResult = async (req, res) => {
    try {
        const { studentName, dob, total, percentage, grade } = req.body;
        const result = await Result.findById(req.params.id);

        if (result) {
            result.studentName = studentName || result.studentName;
            result.dob = dob || result.dob;
            result.total = total || result.total;
            result.percentage = percentage || result.percentage;
            result.grade = grade || result.grade;

            const updatedResult = await result.save();
            res.json(updatedResult);
        } else {
            res.status(404).json({ message: 'Result not found' });
        }
    } catch (error) {
        console.error(error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid result ID format' });
        }
        res.status(500).json({ message: 'Server Error updating result', error: error.message });
    }
};

// @desc    Bulk Delete results
// @route   DELETE /api/admin/results-bulk
// @access  Private
const deleteBulkResults = async (req, res) => {
    try {
        const { year, semester, iae } = req.query;

        const query = {};
        if (year && year !== 'all') query.year = Number(year);
        if (semester && semester !== 'all') query.semester = Number(semester);
        if (iae && iae !== 'all') query.iae = iae;

        if (Object.keys(query).length === 0) {
            return res.status(400).json({ message: 'At least one filter (Year, Sem, or IAE) must be selected for bulk delete.' });
        }

        console.log('Flexible bulk delete request with query:', JSON.stringify(query));
        const deleted = await Result.deleteMany(query);

        res.json({ 
            message: `Successfully deleted ${deleted.deletedCount} records matching the selected criteria.`,
            count: deleted.deletedCount 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during bulk delete', error: error.message });
    }
};

// @desc    Get Pass/Fail report filtered by year, semester, iae, department
// @route   GET /api/admin/results/report
// @access  Private
const getPassFailReport = async (req, res) => {
    try {
        const { year, semester, iae, department } = req.query;
        const query = {};
        if (year && year !== 'all') query.year = Number(year);
        if (semester && semester !== 'all') query.semester = Number(semester);
        if (iae && iae !== 'all') query.iae = iae;
        if (department && department !== 'all') query.department = department;

        const results = await Result.find(query).sort({ studentName: 1 });

        const report = results.map(r => {
            const failedSubjects = r.subjects.filter(s => s.marks === 'AB' || Number(s.marks) < 50);
            return {
                _id: r._id,
                registerNumber: r.registerNumber,
                studentName: r.studentName,
                department: r.department || '',
                year: r.year,
                semester: r.semester,
                iae: r.iae,
                percentage: r.percentage,
                grade: r.grade,
                passed: r.passed,
                failedSubjects: failedSubjects.map(s => ({ name: s.name, marks: s.marks })),
                subjects: r.subjects,
            };
        });

        const passedList = report.filter(r => r.passed);
        const failedList = report.filter(r => !r.passed);

        // Get unique departments for filter options
        const allDepts = [...new Set(results.map(r => r.department).filter(Boolean))];

        res.json({ passedList, failedList, allDepts, total: results.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error generating report', error: error.message });
    }
};

module.exports = {
    authAdmin,
    uploadResults,
    getResults,
    deleteResult,
    updateResult,
    deleteBulkResults,
    getPassFailReport
};
