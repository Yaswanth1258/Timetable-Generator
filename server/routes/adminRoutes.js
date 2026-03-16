import express from 'express';
import {
    getDepartments, createDepartment, updateDepartment, deleteDepartment,
    getSubjects, createSubject, updateSubject, deleteSubject,
    getClassrooms, createClassroom, updateClassroom, deleteClassroom,
    getFaculty, createFaculty, updateFaculty, deleteFaculty,
    getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot
} from '../controllers/adminController.js';
import { getUsers, createUser, updateUser, deleteUser, getOverviewStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes must be protected and restricted to ADMIN role
router.use(protect, admin);

router.route('/overview').get(getOverviewStats);

// Departments
router.route('/departments').get(getDepartments).post(createDepartment);
router.route('/departments/:id').put(updateDepartment).delete(deleteDepartment);

// Subjects
router.route('/subjects').get(getSubjects).post(createSubject);
router.route('/subjects/:id').put(updateSubject).delete(deleteSubject);

// Classrooms
router.route('/classrooms').get(getClassrooms).post(createClassroom);
router.route('/classrooms/:id').put(updateClassroom).delete(deleteClassroom);

// Faculty
router.route('/faculty').get(getFaculty).post(createFaculty);
router.route('/faculty/:id').put(updateFaculty).delete(deleteFaculty);

// TimeSlots
router.route('/timeslots').get(getTimeSlots).post(createTimeSlot);
router.route('/timeslots/:id').put(updateTimeSlot).delete(deleteTimeSlot);

// Users
router.route('/users').get(getUsers).post(createUser);
router.route('/users/:id').put(updateUser).delete(deleteUser);

export default router;
