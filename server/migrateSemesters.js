import mongoose from 'mongoose';
import Subject from './models/Subject.js';
import Timetable from './models/Timetable.js';

async function migrate() {
    await mongoose.connect('mongodb://localhost:27017/timetable-optimization');

    // We must bypass mongoose schema validation doing raw collection update to change types
    const db = mongoose.connection.db;

    const subjects = await db.collection('subjects').find({}).toArray();
    let count = 0;
    for (const sub of subjects) {
        if (typeof sub.semester === 'number') {
            await db.collection('subjects').updateOne(
                { _id: sub._id },
                { $set: { semester: sub.semester.toString() } }
            );
            count++;
        }
    }
    console.log(`Migrated ${count} subjects to string semesters.`);

    // Also migrate timetables if any exist with numeric semesters
    const timetables = await db.collection('timetables').find({}).toArray();
    let ttCount = 0;
    for (const tt of timetables) {
        if (typeof tt.semester === 'number') {
            await db.collection('timetables').updateOne(
                { _id: tt._id },
                { $set: { semester: tt.semester.toString() } }
            );
            ttCount++;
        }
    }
    console.log(`Migrated ${ttCount} timetables to string semesters.`);

    process.exit(0);
}
migrate().catch(console.error);
