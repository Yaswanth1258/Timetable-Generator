import Subject from '../models/Subject.js';
import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import TimeSlot from '../models/TimeSlot.js';
import Timetable from '../models/Timetable.js';
import TimetableEntry from '../models/TimetableEntry.js';

export const generateTimetable = async (departmentId, semester, workingDays) => {
    // 1. Fetch all required data for the department. Try matching both String and Number representation of semester.
    const numSemester = !isNaN(semester) ? Number(semester) : semester;
    const subjects = await Subject.find({
        department: departmentId,
        semester: { $in: [semester, numSemester, semester.toString()] }
    }).sort({ contactHours: -1, credits: -1 });
    const allFaculty = await Faculty.find({}).populate('expertise');
    const classrooms = await Classroom.find({});
    const baseTimeSlots = await TimeSlot.find({}).sort({ order: 1 });

    if (!subjects.length) {
        throw new Error(`No subjects found for department ${departmentId} and semester ${semester}`);
    }
    if (!allFaculty.length) {
        throw new Error("No faculty members available in the system. Please add faculty with expertise.");
    }
    if (!classrooms.length) {
        throw new Error("No classrooms available. Please add classrooms to the system.");
    }
    if (!baseTimeSlots.length) {
        throw new Error("No time slots configured. Please configure time slots first.");
    }

    if (!workingDays || workingDays.length === 0) {
        workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }

    // Get non-break time slots for scheduling
    const nonBreakSlots = baseTimeSlots.filter(slot => slot.type !== 'break' && slot.type !== 'lunch');
    const totalNonBreakSlots = nonBreakSlots.length;

    // Check if we can ensure at least one free slot per day
    if (totalNonBreakSlots < 2) {
        throw new Error("Need at least 2 non-break slots per day to ensure a free slot per day.");
    }

    // Calculate max slots that can be used (leaving at least 1 free per day)
    // But ensure we use at least 60% of available slots for better scheduling
    const minSlotsPerDay = Math.max(2, Math.floor(totalNonBreakSlots * 0.6));
    const maxSlotsPerDay = totalNonBreakSlots - 1;

    // Create a generic unrolled timeslots array across all working days
    const timeSlots = [];
    for (const day of workingDays) {
        for (const slot of baseTimeSlots) {
            timeSlots.push({
                _id: slot._id,
                day: day,
                type: slot.type,
                startTime: slot.startTime,
                endTime: slot.endTime,
                label: slot.label,
                isBreak: slot.type === 'break' || slot.type === 'lunch'
            });
        }
    }

    console.log(`Generating timetable with ${workingDays.length} working days:`, workingDays);
    console.log(`Total time slots created: ${timeSlots.length}`);
    console.log(`Non-break slots per day: ${totalNonBreakSlots}, Min usable: ${minSlotsPerDay}, Max usable: ${maxSlotsPerDay}`);
    console.log(`Total faculty available: ${allFaculty.length}`);
    console.log(`Total classrooms available: ${classrooms.length}`);

    // Create a Draft Timetable record
    const timetable = await Timetable.create({ department: departmentId, semester, status: 'DRAFT', entries: [] });
    const entries = [];

    // Data structures to track hard constraints
    const facultyBusy = {};
    allFaculty.forEach(f => facultyBusy[f._id] = {});

    const roomBusy = {};
    classrooms.forEach(r => roomBusy[r._id] = {});

    const studentBusy = {};

    // Track faculty teaching load
    const facultyLoad = {};
    allFaculty.forEach(f => facultyLoad[f._id] = 0);

    // Track slots used per day to enforce free slot constraint
    const daySlotCount = {};
    workingDays.forEach(day => { daySlotCount[day] = 0; });

    // 2. Iterate through sorted subjects
    for (const subject of subjects) {
        let hoursToSchedule = subject.contactHours;

        const eligibleFaculty = allFaculty.filter(f =>
            f.expertise && f.expertise.length > 0 &&
            f.expertise.some(sub => sub._id.toString() === subject._id.toString())
        );

        if (eligibleFaculty.length === 0) {
            console.warn(`Warning: No faculty available with expertise for subject: ${subject.name}, skipping...`);
            continue; // Skip instead of throwing error
        }

        console.log(`Scheduling ${subject.name} (${hoursToSchedule} hours) - Faculty count: ${eligibleFaculty.length}...`);
        let scheduledCount = 0;
        let attempts = 0;
        // Significantly increase max attempts to allow more flexibility
        const maxAttempts = 1000 + (Math.ceil(hoursToSchedule) * workingDays.length * totalNonBreakSlots * 2);

        while (hoursToSchedule > 0 && attempts < maxAttempts) {
            attempts++;
            let placed = false;

            // Sort days by least loaded (to distribute across full week)
            const orderedDays = [...workingDays].sort((a, b) => daySlotCount[a] - daySlotCount[b]);

            for (const day of orderedDays) {
                // Allow scheduling if we haven't hit the hard maximum
                if (daySlotCount[day] >= maxSlotsPerDay) {
                    continue;
                }

                const shortDay = day.substring(0, 3);

                // Shuffle slots to avoid always picking the same ones
                const shuffledSlots = [...nonBreakSlots].sort(() => Math.random() - 0.5);

                // Try slots in random order across the day
                for (const slot of shuffledSlots) {
                    const slotKey = `${day}_${slot._id}`;
                    if (studentBusy[slotKey]) continue;

                    // Find an eligible faculty that is available
                    const selectedFaculty = eligibleFaculty.find(f =>
                        !facultyBusy[f._id][slotKey] &&
                        facultyLoad[f._id] < (f.maxLoad || 20) &&
                        (!f.availability || f.availability.length === 0 || f.availability.includes(shortDay))
                    );

                    if (!selectedFaculty) continue;

                    // Find a suitable classroom
                    const selectedRoom = classrooms.find(r =>
                        !roomBusy[r._id][slotKey] &&
                        (subject.type === 'lab' ? 
                            (r.type === 'lab' || r.type.includes('lab')) : 
                            (r.type !== 'lab' && !r.type.includes('lab'))) &&
                        r.status === 'available'
                    );

                    if (!selectedRoom) {
                        // If no suitable room found, try to find ANY available room
                        const anyRoom = classrooms.find(r =>
                            !roomBusy[r._id][slotKey] &&
                            r.status === 'available'
                        );
                        if (!anyRoom) continue;
                    }

                    const selectedRoom_final = classrooms.find(r =>
                        !roomBusy[r._id][slotKey] &&
                        r.status === 'available'
                    );

                    if (!selectedRoom_final) continue;

                    try {
                        const entry = await TimetableEntry.create({
                            timetableId: timetable._id,
                            day: day,
                            timeSlot: slot._id,
                            subject: subject._id,
                            faculty: selectedFaculty._id,
                            classroom: selectedRoom_final._id
                        });

                        entries.push(entry._id);

                        studentBusy[slotKey] = true;
                        facultyBusy[selectedFaculty._id][slotKey] = true;
                        roomBusy[selectedRoom_final._id][slotKey] = true;
                        facultyLoad[selectedFaculty._id]++;
                        daySlotCount[day]++;

                        hoursToSchedule--;
                        scheduledCount++;
                        placed = true;
                        break;
                    } catch (err) {
                        console.log(`Error creating entry: ${err.message}`);
                        continue;
                    }
                }

                if (placed) break;
            }

            if (!placed) {
                console.log(`No suitable slot found. Attempts: ${attempts}, Remaining hours: ${hoursToSchedule}`);
                break;
            }
        }

        const successRate = Math.round((scheduledCount / subject.contactHours) * 100);
        if (scheduledCount < subject.contactHours) {
            console.log(`⚠️  Partially scheduled ${subject.name}: ${scheduledCount}/${subject.contactHours} hours (${successRate}%)`);
        } else {
            console.log(`✓ Successfully scheduled all ${scheduledCount} hours for ${subject.name}`);
        }
    }

    // Log free slot verification
    console.log('\n=== FINAL TIMETABLE STATISTICS ===');
    console.log('Slots usage per day:');
    let totalUsedSlots = 0;
    for (const day of workingDays) {
        const freeSlots = totalNonBreakSlots - daySlotCount[day];
        totalUsedSlots += daySlotCount[day];
        console.log(`${day}: ${daySlotCount[day]}/${totalNonBreakSlots} used, ${freeSlots} free`);
    }
    console.log(`Total entries scheduled: ${entries.length}`);
    console.log('===================================\n');

    timetable.entries = entries;
    await timetable.save();

    // Populate the timetable with full data before returning
    const populatedTimetable = await Timetable.findById(timetable._id)
        .populate('department')
        .populate({
            path: 'entries',
            populate: [
                { path: 'timeSlot' },
                { path: 'subject' },
                { path: 'faculty', populate: { path: 'user' } },
                { path: 'classroom' }
            ]
        });

    return populatedTimetable;
};
