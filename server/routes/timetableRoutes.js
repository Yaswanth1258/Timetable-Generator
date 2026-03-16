import express from 'express';
import {
    triggerTimetableGeneration,
    getTimetables,
    getTimetableById,
    publishTimetable
} from '../controllers/timetableController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All timetable routes require authentication

// Admin only routes
router.post('/generate', admin, triggerTimetableGeneration);
router.put('/:id/publish', admin, publishTimetable);

// Accessible by all authenticated users (Admin, Faculty, Student)
router.route('/').get(getTimetables);
router.route('/:id').get(getTimetableById);

// Update single entry
router.put('/:id/entries/:entryId', admin, async (req, res) => {
    const { updateTimetableEntry } = await import('../controllers/timetableController.js');
    return updateTimetableEntry(req, res);
});

export default router;
