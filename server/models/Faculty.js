import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expertise: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    maxLoad: {
        type: Number,
        required: true,
        default: 16 // Default max teaching hours per week
    },
    designation: {
        type: String,
        required: true,
        default: 'Assistant Professor'
    },
    availability: [{
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }]
}, { timestamps: true });

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;
