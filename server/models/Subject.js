import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    credits: {
        type: Number,
        required: true,
        default: 3
    },
    contactHours: {
        type: Number,
        required: true,
        default: 3
    },
    semester: {
        type: String, // Changed to String to support formats like 'Fall', 'Spring', or '1', '2'
        required: true,
        default: '1'
    },
    type: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial'],
        default: 'lecture'
    }
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
