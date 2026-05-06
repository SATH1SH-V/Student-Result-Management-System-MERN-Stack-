const Student = require('../models/Student');
const Result = require('../models/Result');

// @desc    Student login and fetch result
// @route   POST /api/student/login
// @access  Public
const loginStudent = async (req, res) => {
    try {
        const { registerNumber, dob, year, semester, iae } = req.body;

        // Verify Student
        console.log(`Login attempt: RegNo=${registerNumber}, DOB=${dob}`);
        const student = await Student.findOne({ registerNumber, dob });
        
        if (!student) {
            console.log(`Login failed: Invalid Register Number or Date of Birth for ${registerNumber}`);
            return res.status(401).json({ message: 'Invalid Register Number or Date of Birth' });
        }

        console.log(`Login success for student: ${student.studentName}`);

        // Fetch Result
        const query = {
            registerNumber,
            year: Number(year),
            semester: Number(semester)
        };
        
        // Handle IAE query carefully
        if (iae && iae !== 'null' && iae !== 'undefined') {
            query.iae = iae;
        } else {
            query.iae = null;
        }

        console.log(`Searching for result with query:`, JSON.stringify(query));
        const result = await Result.findOne(query);

        if (!result) {
            console.log(`Result lookup failed for ${registerNumber} with query criteria.`);
            return res.status(404).json({ message: 'Result not found for the selected exam criteria' });
        }

        console.log(`Result found for ${registerNumber}. Sending response.`);

        res.json({
            student: {
                registerNumber: student.registerNumber,
                studentName: student.studentName,
                dob: student.dob
            },
            result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    loginStudent
};
