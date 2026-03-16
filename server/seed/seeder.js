import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import TimeSlot from '../models/TimeSlot.js';

dotenv.config(); // Adjust path if needed, though running from server root usually works with just .env

const importData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany(),
            Department.deleteMany(),
            Subject.deleteMany(),
            Faculty.deleteMany(),
            Classroom.deleteMany(),
            TimeSlot.deleteMany()
        ]);

        console.log('Seeding TimeSlots...');
        const timeSlots = [
            { order: 1, label: 'Period 1', startTime: '09:00', endTime: '10:00', type: 'regular' },
            { order: 2, label: 'Period 2', startTime: '10:00', endTime: '11:00', type: 'regular' },
            { order: 3, label: 'Break', startTime: '11:00', endTime: '11:15', type: 'break' },
            { order: 4, label: 'Period 3', startTime: '11:15', endTime: '12:15', type: 'regular' },
            { order: 5, label: 'Period 4', startTime: '12:15', endTime: '13:15', type: 'regular' },
            { order: 6, label: 'Lunch', startTime: '13:15', endTime: '14:00', type: 'lunch' },
            { order: 7, label: 'Period 5', startTime: '14:00', endTime: '15:00', type: 'regular' },
            { order: 8, label: 'Period 6', startTime: '15:00', endTime: '16:00', type: 'regular' },
        ];
        await TimeSlot.insertMany(timeSlots);

        console.log('Seeding Classrooms...');
        const classrooms = [
            { name: 'LAB-1', building: 'IT Block', capacity: 40, type: 'lab', projector: true, status: 'available' },
            { name: 'LAB-2', building: 'IT Block', capacity: 35, type: 'lab', projector: true, status: 'available' },
            { name: 'LAB-3', building: 'Science Block', capacity: 30, type: 'lab', projector: false, status: 'available' },
            { name: 'LAB-4', building: 'IT Block', capacity: 40, type: 'lab', projector: true, status: 'available' },
            { name: 'LAB-5', building: 'Science Block', capacity: 35, type: 'lab', projector: true, status: 'available' },
            { name: 'LAB-6', building: 'Engineering Block', capacity: 30, type: 'lab', projector: true, status: 'available' },
            { name: 'B-201', building: 'Science Block', capacity: 55, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'B-202', building: 'Science Block', capacity: 50, type: 'lecture_hall', projector: false, status: 'available' },
            { name: 'B-203', building: 'Science Block', capacity: 60, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'B-204', building: 'Science Block', capacity: 55, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'AUDI', building: 'Main Block', capacity: 200, type: 'auditorium', projector: true, status: 'available' },
            { name: 'A-101', building: 'Main Block', capacity: 70, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'A-102', building: 'Main Block', capacity: 60, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'A-103', building: 'Main Block', capacity: 60, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'A-104', building: 'Main Block', capacity: 65, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'A-105', building: 'Main Block', capacity: 55, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'C-101', building: 'Engineering Block', capacity: 60, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'C-102', building: 'Engineering Block', capacity: 55, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'C-103', building: 'Engineering Block', capacity: 50, type: 'lecture_hall', projector: false, status: 'available' },
            { name: 'C-104', building: 'Engineering Block', capacity: 60, type: 'lecture_hall', projector: true, status: 'available' },
            { name: 'SEM-1', building: 'Main Block', capacity: 30, type: 'seminar_room', projector: true, status: 'available' },
            { name: 'SEM-2', building: 'Main Block', capacity: 35, type: 'seminar_room', projector: true, status: 'available' },
        ];
        await Classroom.insertMany(classrooms);

        console.log('Seeding Departments...');
        const deptNames = [
            { name: 'Computer Science', code: 'CS' },
            { name: 'Electrical Engineering', code: 'EE' },
            { name: 'Mechanical Engineering', code: 'ME' },
            { name: 'Civil Engineering', code: 'CE' },
            { name: 'Electronics & Communication', code: 'ECE' }
        ];
        const depts = await Department.insertMany(deptNames);
        const dMap = {};
        depts.forEach(d => { dMap[d.code] = d._id; });

        console.log('Seeding Subjects...');
        const subjectsData = [
            // Computer Science - Semester 3
            { code: 'CS301', name: 'Data Structures', department: dMap['CS'], semester: 3, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'CS302', name: 'Digital Logic Design', department: dMap['CS'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS303', name: 'Discrete Mathematics', department: dMap['CS'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS304', name: 'Computer Organization', department: dMap['CS'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS305L', name: 'Data Structures Lab', department: dMap['CS'], semester: 3, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'CS306L', name: 'Digital Logic Lab', department: dMap['CS'], semester: 3, contactHours: 2, credits: 1, type: 'lab' },

            // Computer Science - Semester 4
            { code: 'CS401', name: 'Algorithms', department: dMap['CS'], semester: 4, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'CS402', name: 'Computer Networks', department: dMap['CS'], semester: 4, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS403', name: 'Database Management Systems', department: dMap['CS'], semester: 4, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'CS404', name: 'Operating Systems', department: dMap['CS'], semester: 4, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS405L', name: 'Algorithm Lab', department: dMap['CS'], semester: 4, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'CS406L', name: 'DBMS Lab', department: dMap['CS'], semester: 4, contactHours: 2, credits: 1, type: 'lab' },

            // Computer Science - Semester 5
            { code: 'CS501', name: 'Software Engineering', department: dMap['CS'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS502', name: 'Theory of Computation', department: dMap['CS'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS503', name: 'Compiler Design', department: dMap['CS'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS504', name: 'Machine Learning', department: dMap['CS'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS505L', name: 'Software Engineering Lab', department: dMap['CS'], semester: 5, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'CS506L', name: 'ML Lab', department: dMap['CS'], semester: 5, contactHours: 2, credits: 1, type: 'lab' },

            // Computer Science - Semester 6
            { code: 'CS601', name: 'Artificial Intelligence', department: dMap['CS'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS602', name: 'Web Technologies', department: dMap['CS'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS603', name: 'Computer Graphics', department: dMap['CS'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS604', name: 'Cryptography', department: dMap['CS'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS605L', name: 'AI Lab', department: dMap['CS'], semester: 6, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'CS606L', name: 'Web Technologies Lab', department: dMap['CS'], semester: 6, contactHours: 2, credits: 1, type: 'lab' },

            // Computer Science - Semester 7
            { code: 'CS701', name: 'Cloud Computing', department: dMap['CS'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS702', name: 'Big Data Analytics', department: dMap['CS'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS703', name: 'Information Security', department: dMap['CS'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS704', name: 'Mobile Computing', department: dMap['CS'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'CS705L', name: 'Cloud Computing Lab', department: dMap['CS'], semester: 7, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'CS706L', name: 'Big Data Lab', department: dMap['CS'], semester: 7, contactHours: 2, credits: 1, type: 'lab' },

            // Electrical Engineering - Semester 3
            { code: 'EE301', name: 'Circuit Theory', department: dMap['EE'], semester: 3, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'EE302', name: 'Electrical Machines I', department: dMap['EE'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE303', name: 'Signals and Systems', department: dMap['EE'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE304', name: 'Electronic Devices', department: dMap['EE'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE305L', name: 'Circuit Theory Lab', department: dMap['EE'], semester: 3, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'EE306L', name: 'Electronics Lab I', department: dMap['EE'], semester: 3, contactHours: 2, credits: 1, type: 'lab' },

            // Electrical Engineering - Semester 4
            { code: 'EE401', name: 'Electrical Machines II', department: dMap['EE'], semester: 4, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'EE402', name: 'Analog Electronics', department: dMap['EE'], semester: 4, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE403', name: 'Digital Electronics', department: dMap['EE'], semester: 4, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE404', name: 'Electromagnetic Fields', department: dMap['EE'], semester: 4, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE405L', name: 'Machines Lab', department: dMap['EE'], semester: 4, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'EE406L', name: 'Electronics Lab II', department: dMap['EE'], semester: 4, contactHours: 2, credits: 1, type: 'lab' },

            // Electrical Engineering - Semester 5
            { code: 'EE501', name: 'Control Systems', department: dMap['EE'], semester: 5, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'EE502', name: 'Power Systems I', department: dMap['EE'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE503', name: 'Microprocessors', department: dMap['EE'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE504', name: 'Communication Systems', department: dMap['EE'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE505L', name: 'Control Systems Lab', department: dMap['EE'], semester: 5, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'EE506L', name: 'Microprocessor Lab', department: dMap['EE'], semester: 5, contactHours: 2, credits: 1, type: 'lab' },

            // Electrical Engineering - Semester 6
            { code: 'EE601', name: 'Power Systems II', department: dMap['EE'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE602', name: 'Power Electronics', department: dMap['EE'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE603', name: 'Digital Signal Processing', department: dMap['EE'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE604', name: 'Instrumentation', department: dMap['EE'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE605L', name: 'Power Electronics Lab', department: dMap['EE'], semester: 6, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'EE606L', name: 'DSP Lab', department: dMap['EE'], semester: 6, contactHours: 2, credits: 1, type: 'lab' },

            // Electrical Engineering - Semester 7
            { code: 'EE701', name: 'Renewable Energy Systems', department: dMap['EE'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE702', name: 'High Voltage Engineering', department: dMap['EE'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE703', name: 'VLSI Design', department: dMap['EE'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE704', name: 'Smart Grid Technology', department: dMap['EE'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'EE705L', name: 'Renewable Energy Lab', department: dMap['EE'], semester: 7, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'EE706L', name: 'VLSI Lab', department: dMap['EE'], semester: 7, contactHours: 2, credits: 1, type: 'lab' },

            // Mechanical Engineering - Semester 3
            { code: 'ME301', name: 'Engineering Mechanics', department: dMap['ME'], semester: 3, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'ME302', name: 'Thermodynamics', department: dMap['ME'], semester: 3, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'ME303', name: 'Manufacturing Technology', department: dMap['ME'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME304', name: 'Material Science', department: dMap['ME'], semester: 3, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME305L', name: 'Manufacturing Lab', department: dMap['ME'], semester: 3, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'ME306L', name: 'Workshop Practice', department: dMap['ME'], semester: 3, contactHours: 2, credits: 1, type: 'lab' },

            // Mechanical Engineering - Semester 4
            { code: 'ME401', name: 'Fluid Mechanics', department: dMap['ME'], semester: 4, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'ME402', name: 'Strength of Materials', department: dMap['ME'], semester: 4, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'ME403', name: 'Heat Transfer', department: dMap['ME'], semester: 4, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME404', name: 'Kinematics of Machines', department: dMap['ME'], semester: 4, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME405L', name: 'Fluid Mechanics Lab', department: dMap['ME'], semester: 4, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'ME406L', name: 'Strength of Materials Lab', department: dMap['ME'], semester: 4, contactHours: 2, credits: 1, type: 'lab' },

            // Mechanical Engineering - Semester 5
            { code: 'ME501', name: 'Machine Design', department: dMap['ME'], semester: 5, contactHours: 4, credits: 4, type: 'lecture' },
            { code: 'ME502', name: 'Dynamics of Machines', department: dMap['ME'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME503', name: 'Thermal Engineering', department: dMap['ME'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME504', name: 'Metrology & Measurements', department: dMap['ME'], semester: 5, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME505L', name: 'Machine Design Lab', department: dMap['ME'], semester: 5, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'ME506L', name: 'Thermal Lab', department: dMap['ME'], semester: 5, contactHours: 2, credits: 1, type: 'lab' },

            // Mechanical Engineering - Semester 6
            { code: 'ME601', name: 'CAD/CAM', department: dMap['ME'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME602', name: 'Automobile Engineering', department: dMap['ME'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME603', name: 'Refrigeration & Air Conditioning', department: dMap['ME'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME604', name: 'Finite Element Analysis', department: dMap['ME'], semester: 6, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME605L', name: 'CAD/CAM Lab', department: dMap['ME'], semester: 6, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'ME606L', name: 'RAC Lab', department: dMap['ME'], semester: 6, contactHours: 2, credits: 1, type: 'lab' },

            // Mechanical Engineering - Semester 7
            { code: 'ME701', name: 'Robotics', department: dMap['ME'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME702', name: 'Industrial Engineering', department: dMap['ME'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME703', name: 'Composite Materials', department: dMap['ME'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME704', name: 'Mechatronics', department: dMap['ME'], semester: 7, contactHours: 3, credits: 3, type: 'lecture' },
            { code: 'ME705L', name: 'Robotics Lab', department: dMap['ME'], semester: 7, contactHours: 2, credits: 1, type: 'lab' },
            { code: 'ME706L', name: 'Mechatronics Lab', department: dMap['ME'], semester: 7, contactHours: 2, credits: 1, type: 'lab' },
        ];
        const insertedSubjects = await Subject.insertMany(subjectsData);
        const sMap = {};
        insertedSubjects.forEach(s => { sMap[s.code] = s._id; });


        console.log('Seeding Users & Faculty...');

        // Make Admin
        await User.create({ name: 'Admin User', email: 'admin@college.edu', password: 'password123', role: 'ADMIN' });

        const facData = [
            // Computer Science Faculty
            { name: 'Dr. Amit Singh', email: 'amit@college.edu', deptCode: 'CS', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS301', 'CS401', 'CS501'] },
            { name: 'Dr. Priya Sharma', email: 'priya@college.edu', deptCode: 'CS', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS302', 'CS402', 'CS502'] },
            { name: 'Prof. Vikram Rao', email: 'vikram@college.edu', deptCode: 'CS', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS303', 'CS403', 'CS503'] },
            { name: 'Prof. Neha Gupta', email: 'neha@college.edu', deptCode: 'CS', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS304', 'CS404', 'CS504'] },
            { name: 'Dr. Rajesh Kumar', email: 'rajesh@college.edu', deptCode: 'CS', desig: 'Associate Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS305L', 'CS405L', 'CS505L'] },
            { name: 'Prof. Anita Desai', email: 'anita@college.edu', deptCode: 'CS', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS306L', 'CS406L', 'CS506L'] },
            { name: 'Dr. Suresh Reddy', email: 'suresh@college.edu', deptCode: 'CS', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS601', 'CS701'] },
            { name: 'Prof. Kavita Iyer', email: 'kavita@college.edu', deptCode: 'CS', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS602', 'CS702'] },
            { name: 'Dr. Manoj Verma', email: 'manoj@college.edu', deptCode: 'CS', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS603', 'CS703'] },
            { name: 'Prof. Deepa Nair', email: 'deepa@college.edu', deptCode: 'CS', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS604', 'CS704'] },
            { name: 'Dr. Arun Pillai', email: 'arun@college.edu', deptCode: 'CS', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS605L', 'CS705L'] },
            { name: 'Prof. Seema Roy', email: 'seema@college.edu', deptCode: 'CS', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['CS606L', 'CS706L'] },

            // Electrical Engineering Faculty
            { name: 'Dr. Ravi Shankar', email: 'ravi@college.edu', deptCode: 'EE', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE301', 'EE401', 'EE501'] },
            { name: 'Prof. Lakshmi Menon', email: 'lakshmi@college.edu', deptCode: 'EE', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE302', 'EE402', 'EE502'] },
            { name: 'Dr. Arjun Reddy', email: 'arjun@college.edu', deptCode: 'EE', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE303', 'EE403', 'EE503'] },
            { name: 'Prof. Meera Nair', email: 'meera@college.edu', deptCode: 'EE', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE304', 'EE404', 'EE504'] },
            { name: 'Dr. Karthik Bose', email: 'karthik@college.edu', deptCode: 'EE', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE305L', 'EE405L', 'EE505L'] },
            { name: 'Prof. Pooja Sinha', email: 'pooja@college.edu', deptCode: 'EE', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE306L', 'EE406L', 'EE506L'] },
            { name: 'Dr. Ramesh Joshi', email: 'ramesh@college.edu', deptCode: 'EE', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE601', 'EE701'] },
            { name: 'Prof. Sunita Das', email: 'sunita@college.edu', deptCode: 'EE', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE602', 'EE702'] },
            { name: 'Dr. Vijay Malhotra', email: 'vijay@college.edu', deptCode: 'EE', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE603', 'EE703'] },
            { name: 'Prof. Anjali Kapoor', email: 'anjali@college.edu', deptCode: 'EE', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE604', 'EE704'] },
            { name: 'Dr. Prakash Rao', email: 'prakash@college.edu', deptCode: 'EE', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE605L', 'EE705L'] },
            { name: 'Prof. Nisha Agarwal', email: 'nisha@college.edu', deptCode: 'EE', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['EE606L', 'EE706L'] },

            // Mechanical Engineering Faculty
            { name: 'Dr. Sanjay Mishra', email: 'sanjay@college.edu', deptCode: 'ME', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME301', 'ME401', 'ME501'] },
            { name: 'Prof. Geeta Rao', email: 'geeta@college.edu', deptCode: 'ME', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME302', 'ME402', 'ME502'] },
            { name: 'Dr. Ashok Trivedi', email: 'ashok@college.edu', deptCode: 'ME', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME303', 'ME403', 'ME503'] },
            { name: 'Prof. Rohit Mehta', email: 'rohit@college.edu', deptCode: 'ME', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME304', 'ME404', 'ME504'] },
            { name: 'Dr. Dinesh Pandey', email: 'dinesh@college.edu', deptCode: 'ME', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME305L', 'ME405L', 'ME505L'] },
            { name: 'Prof. Shalini Varma', email: 'shalini@college.edu', deptCode: 'ME', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME306L', 'ME406L', 'ME506L'] },
            { name: 'Dr. Harish Chandra', email: 'harish@college.edu', deptCode: 'ME', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME601', 'ME701'] },
            { name: 'Prof. Rekha Singh', email: 'rekha@college.edu', deptCode: 'ME', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME602', 'ME702'] },
            { name: 'Dr. Narendra Jain', email: 'narendra@college.edu', deptCode: 'ME', desig: 'Professor', max: 18, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME603', 'ME703'] },
            { name: 'Prof. Priti Saxena', email: 'priti@college.edu', deptCode: 'ME', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME604', 'ME704'] },
            { name: 'Dr. Mukesh Gupta', email: 'mukesh@college.edu', deptCode: 'ME', desig: 'Associate Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME605L', 'ME705L'] },
            { name: 'Prof. Smita Bhatt', email: 'smita@college.edu', deptCode: 'ME', desig: 'Assistant Professor', max: 20, avail: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], subs: ['ME606L', 'ME706L'] },
        ];

        for (const fd of facData) {
            const u = await User.create({
                name: fd.name,
                email: fd.email,
                password: 'password123',
                role: 'FACULTY',
                department: dMap[fd.deptCode]
            });

            await Faculty.create({
                user: u._id,
                expertise: fd.subs.map(code => sMap[code]).filter(Boolean),
                maxLoad: fd.max,
                designation: fd.desig,
                availability: fd.avail
            });
        }

        console.log('Seeding fully completed matching exact Mockup designs!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
