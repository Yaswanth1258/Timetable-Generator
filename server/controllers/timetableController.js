import { generateTimetable } from '../scheduler/greedyScheduler.js';
import Timetable from '../models/Timetable.js';
import TimeSlot from '../models/TimeSlot.js';

export const triggerTimetableGeneration = async (req, res) => {
    try {
        const { departments, semester, workingDays } = req.body;

        if (!departments || departments.length === 0) {
            return res.status(400).json({ message: 'Please select at least one department' });
        }
        if (!semester) {
            return res.status(400).json({ message: 'Please select a semester' });
        }
        if (!workingDays || workingDays.length === 0) {
            return res.status(400).json({ message: 'Please select at least one working day' });
        }

        // Loop through all selected departments and run algorithm
        const timetables = [];
        for (const deptId of departments) {
            try {
                const timetable = await generateTimetable(deptId, semester, workingDays);
                timetables.push(timetable);
            } catch (err) {
                console.error(`Error generating timetable for department ${deptId}:`, err.message);
                // Continue with other departments even if one fails
            }
        }

        if (timetables.length === 0) {
            return res.status(500).json({ message: 'Failed to generate timetables for any department' });
        }

        res.status(201).json({
            message: `Timetables generated successfully for ${timetables.length} departments`,
            timetables,
            timetable: timetables[0] // Return the first one for direct viewing
        });
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ message: error.message || 'Error generating timetable' });
    }
};

export const getTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find({})
            .populate('department')
            .populate({
                path: 'entries',
                populate: [
                    { path: 'timeSlot' },
                    { path: 'subject' },
                    { 
                        path: 'faculty',
                        populate: { path: 'user' }
                    },
                    { path: 'classroom' }
                ]
            });
        
        // Also add timeSlots to each timetable for consistency with getTimetableById
        const timeSlots = await TimeSlot.find({}).sort({ order: 1 });
        const enrichedTimetables = timetables.map(tt => ({
            ...tt.toObject(),
            timeSlots,
            entries: tt.entries || []
        }));
        
        res.json(enrichedTimetables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching timetables' });
    }
};

export const getTimetableById = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id)
            .populate('department')
            .populate({
                path: 'entries',
                populate: [
                    { path: 'timeSlot' },
                    { path: 'subject' },
                    { 
                        path: 'faculty',
                        populate: { path: 'user' }
                    },
                    { path: 'classroom' }
                ]
            });

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        // Ensure entries is always an array
        if (!timetable.entries) {
            timetable.entries = [];
        }

        const timeSlots = await TimeSlot.find({}).sort({ order: 1 });
        res.json({
            ...timetable.toObject(),
            timeSlots,
            entries: timetable.entries || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching timetable details' });
    }
};

export const publishTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        timetable.status = 'PUBLISHED';
        await timetable.save();

        req.app.get('io').emit('timetable_updated', { timetableId: timetable._id });

        res.json({ message: 'Timetable published successfully', timetable });
    } catch (error) {
        res.status(500).json({ message: 'Error publishing timetable' });
    }
};

export const updateTimetableEntry = async (req, res) => {
    try {
        const { id, entryId } = req.params;
        const { faculty, classroom, timeSlot, day } = req.body;

        const { TimetableEntry } = await import('../models/TimetableEntry.js');

        const entry = await TimetableEntry.findById(entryId);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        if (faculty) entry.faculty = faculty;
        if (classroom) entry.classroom = classroom;
        if (timeSlot) entry.timeSlot = timeSlot;
        if (day) entry.day = day;

        await entry.save();

        req.app.get('io').emit('timetable_updated', { timetableId: id });

        res.json({ message: 'Entry updated successfully', entry });

    } catch (error) {
        res.status(500).json({ message: 'Error updating entry' });
    }
};
