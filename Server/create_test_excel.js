const xlsx = require('xlsx');

const data = [
  { "RegNo": "CSE1001", "Name": "Arun Kumar", "Dept": "CSE", "DOB": "12-05-2003", "Maths": 85, "Physics": 78, "Chemistry": 72, "C Programming": 90, "Eng Graphics": 68, "English": 81, "Email": "arun1001@gmail.com" },
  { "RegNo": "CSE1002", "Name": "Priya Sharma", "Dept": "CSE", "DOB": "23-09-2004", "Maths": 90, "Physics": 84, "Chemistry": 79, "C Programming": 85, "Eng Graphics": 88, "English": 91, "Email": "priya1002@gmail.com" },
  { "RegNo": "CSE1003", "Name": "Rahul Verma", "Dept": "CSE", "DOB": "05-11-2003", "Maths": 72, "Physics": "AB", "Chemistry": 75, "C Programming": 80, "Eng Graphics": 65, "English": 77, "Email": "rahul1003@gmail.com" },
  { "RegNo": "CSE1004", "Name": "Sneha Patel", "Dept": "CSE", "DOB": "18-03-2004", "Maths": 88, "Physics": 91, "Chemistry": 86, "C Programming": 90, "Eng Graphics": 85, "English": 89, "Email": "sneha1004@gmail.com" },
  { "RegNo": "CSE1005", "Name": "Karthik Raj", "Dept": "CSE", "DOB": "30-07-2003", "Maths": 65, "Physics": 70, "Chemistry": 38, "C Programming": 72, "Eng Graphics": "AB", "English": 33, "Email": "karthik1005@gmail.com" },
  { "RegNo": "CSE1006", "Name": "Divya Nair", "Dept": "CSE", "DOB": "14-01-2004", "Maths": 92, "Physics": 89, "Chemistry": 94, "C Programming": 90, "Eng Graphics": 87, "English": 91, "Email": "divya1006@gmail.com" },
  { "RegNo": "CSE1007", "Name": "Sanjay Kumar", "Dept": "CSE", "DOB": "27-08-2003", "Maths": 78, "Physics": 82, "Chemistry": 80, "C Programming": "AB", "Eng Graphics": 79, "English": 81, "Email": "sanjay1007@gmail.com" },
  { "RegNo": "CSE1008", "Name": "Meera Iyer", "Dept": "CSE", "DOB": "09-02-2004", "Maths": 95, "Physics": 93, "Chemistry": 96, "C Programming": 94, "Eng Graphics": 91, "English": 92, "Email": "meera1008@gmail.com" }
];

const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
xlsx.writeFile(workbook, "test_data.xlsx");
console.log("Excel generated successfully!");
