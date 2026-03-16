import mongoose from 'mongoose';
import Dept from './models/Department.js';
import Subject from './models/Subject.js';

async function check() {
    await mongoose.connect('mongodb://localhost:27017/timetable-optimization');
    const cs = await Dept.findOne({ code: 'CS' });

    const subjectsStrict = await Subject.find({ department: cs._id, semester: '3' });
    console.log('Strict string match:', subjectsStrict.length);

    const subjectsIn = await Subject.find({ department: cs._id, semester: { $in: ['3', 3] } });
    console.log('$in array match:', subjectsIn.length);

    const subjectsNum = await Subject.find({ department: cs._id, semester: 3 });
    console.log('Number match:', subjectsNum.length);

    process.exit(0);
}
check().catch(console.error);