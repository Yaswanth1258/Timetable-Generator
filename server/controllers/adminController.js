import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import Classroom from '../models/Classroom.js';
import Faculty from '../models/Faculty.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';
import Timetable from '../models/Timetable.js';

// --- Departments ---
export const getDepartments = async (req, res) => {
    const depts = await Department.find({});
    res.json(depts);
};

export const createDepartment = async (req, res) => {
    const { name, code } = req.body;
    const deptExists = await Department.findOne({ code });
    if (deptExists) return res.status(400).json({ message: 'Department exists' });
    const dept = await Department.create({ name, code });
    res.status(201).json(dept);
};

export const updateDepartment = async (req, res) => {
    const { name, code } = req.body;
    const dept = await Department.findByIdAndUpdate(req.params.id, { name, code }, { new: true });
    res.json(dept);
};

export const deleteDepartment = async (req, res) => {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department removed' });
};

// --- Subjects ---
export const getSubjects = async (req, res) => {
    const subjects = await Subject.find({}).populate('department', 'name code');
    res.json(subjects);
};

export const createSubject = async (req, res) => {
    const { name, code, department, credits, contactHours, semester, type } = req.body;
    const subExists = await Subject.findOne({ code });
    if (subExists) return res.status(400).json({ message: 'Subject exists' });
    const subject = await Subject.create({ name, code, department, credits, contactHours, semester, type });
    res.status(201).json(subject);
};

export const updateSubject = async (req, res) => {
    const { name, code, department, credits, contactHours, semester, type } = req.body;
    const subject = await Subject.findByIdAndUpdate(req.params.id, { name, code, department, credits, contactHours, semester, type }, { new: true });
    res.json(subject);
};

export const deleteSubject = async (req, res) => {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject removed' });
};

// --- Classrooms ---
export const getClassrooms = async (req, res) => {
    const rooms = await Classroom.find({});
    res.json(rooms);
};

export const createClassroom = async (req, res) => {
    try {
        const { name, capacity, type, building, projector, status } = req.body;
        console.log("Receiving:", req.body);
        const roomExists = await Classroom.findOne({ name });
        if (roomExists) return res.status(400).json({ message: 'Classroom exists' });
        const room = await Classroom.create({ name, capacity, type, building, projector, status });
        res.status(201).json(room);
    } catch (err) {
        console.error("CREATE CLASSROOM ERROR:", err);
        return res.status(418).send("MY_ERROR: " + err.message);
    }
};

export const updateClassroom = async (req, res) => {
    const { name, capacity, type, building, projector, status } = req.body;
    const room = await Classroom.findByIdAndUpdate(req.params.id, { name, capacity, type, building, projector, status }, { new: true });
    res.json(room);
};

export const deleteClassroom = async (req, res) => {
    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ message: 'Classroom removed' });
};

// --- Faculty ---
export const getFaculty = async (req, res) => {
    const faculties = await Faculty.find({}).populate('user', 'name email').populate('expertise', 'name code');
    res.json(faculties);
};

export const createFaculty = async (req, res) => {
    const { user, expertise, maxLoad, designation, availability } = req.body;
    const facExists = await Faculty.findOne({ user });
    if (facExists) return res.status(400).json({ message: 'Faculty profile exists for this user' });
    const faculty = await Faculty.create({ user, expertise, maxLoad, designation, availability });
    res.status(201).json(faculty);
};

export const updateFaculty = async (req, res) => {
    const { user, expertise, maxLoad, designation, availability } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, { user, expertise, maxLoad, designation, availability }, { new: true });
    res.json(faculty);
};

export const deleteFaculty = async (req, res) => {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty removed' });
};

// --- TimeSlots ---
export const getTimeSlots = async (req, res) => {
    const slots = await TimeSlot.find({});
    res.json(slots);
};

export const createTimeSlot = async (req, res) => {
    const { order, label, startTime, endTime, type } = req.body;
    const slot = await TimeSlot.create({ order, label, startTime, endTime, type });
    res.status(201).json(slot);
};

export const updateTimeSlot = async (req, res) => {
    const { order, label, startTime, endTime, type } = req.body;
    const slot = await TimeSlot.findByIdAndUpdate(req.params.id, { order, label, startTime, endTime, type }, { new: true });
    res.json(slot);
};

export const deleteTimeSlot = async (req, res) => {
    await TimeSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'TimeSlot removed' });
};

// ============================================
// SYSTEM OVERVIEW STATS
// ============================================

export const getOverviewStats = async (req, res) => {
    try {
        const [
            deptCount, facultyCount, classroomCount, timeSlotCount, 
            subjectCount, usersCount, timetables
        ] = await Promise.all([
            Department.countDocuments(),
            Faculty.countDocuments(),
            Classroom.countDocuments(),
            TimeSlot.countDocuments(),
            Subject.countDocuments(),
            User.countDocuments(),
            Timetable.find({}, 'status')
        ]);

        const published = timetables.filter(t => t.status === 'PUBLISHED').length;
        const drafts = timetables.filter(t => t.status === 'DRAFT').length;

        // Calculate some 'progress' metric manually based on bare minimum setups
        const setupProgress = Math.min(100, Math.round(
            ((deptCount > 0 ? 25 : 0) + 
            (facultyCount > 0 ? 25 : 0) + 
            (classroomCount > 0 ? 25 : 0) + 
            (timeSlotCount > 0 ? 25 : 0))
        ));

        res.json({
            departments: deptCount,
            faculty: facultyCount,
            classrooms: classroomCount,
            timeslots: timeSlotCount,
            subjects: subjectCount,
            users: usersCount,
            timetables: {
                total: timetables.length,
                published,
                drafts
            },
            setupProgress
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ============================================
// USERS
// ============================================

// --- Users ---
export const getUsers = async (req, res) => {
    const users = await User.find({}).populate('department', 'name code');
    res.json(users);
};

export const createUser = async (req, res) => {
    const { name, email, password, role, department } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    // We explicitly set the password. The pre-save hook in the User model handles hashing.
    const user = await User.create({ name, email, password, role, department });
    
    if (req.app.get('io')) {
        req.app.get('io').emit('users_updated', { action: 'create', user });
    }
    res.status(201).json(user);
};

export const updateUser = async (req, res) => {
    const { name, email, role, department, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    if (password) {
        user.password = password; // pre-save will hash it
    }

    const updatedUser = await user.save();
    
    if (req.app.get('io')) {
        req.app.get('io').emit('users_updated', { action: 'update', user: updatedUser });
    }
    res.json(updatedUser);
};

export const deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    if (req.app.get('io')) {
        req.app.get('io').emit('users_updated', { action: 'delete', userId: req.params.id });
    }
    res.json({ message: 'User removed' });
};

