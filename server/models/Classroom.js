import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        default: 60
    },
    type: {
        type: String,
        enum: ['lecture_hall', 'lab', 'seminar_room', 'auditorium'],
        default: 'lecture_hall'
    },
    building: {
        type: String,
        required: true,
        default: 'Main Block'
    },
    projector: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['available', 'maintenance'],
        default: 'available'
    }
}, { timestamps: true });

const Classroom = mongoose.model('Classroom', classroomSchema);
export default Classroom;
