import { MongoClient } from 'mongodb';

async function check() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('timetable-optimization');

    const cs = await db.collection('departments').findOne({ code: 'CS' });
    console.log('CS Dept:', cs);

    const subjects = await db.collection('subjects').find({ department: cs._id }).toArray();
    console.log('All subjects for CS:');
    subjects.forEach(s => console.log(`- '${s.name}', semester: '${s.semester}', type: ${typeof s.semester}`));

    const subjectsStr = await db.collection('subjects').find({ department: cs._id, semester: '3' }).toArray();
    console.log('Raw search parameter "3" (string):', subjectsStr.length);

    const subjectsNum = await db.collection('subjects').find({ department: cs._id, semester: 3 }).toArray();
    console.log('Raw search parameter 3 (number):', subjectsNum.length);

    await client.close();
}
check().catch(console.error);
