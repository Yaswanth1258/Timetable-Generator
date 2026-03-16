import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true
    },
    label: {
        type: String, // e.g., 'Period 1', 'Lunch'
        required: true
    },
    startTime: {
        type: String, // e.g., '09:00'
        required: true
    },
    endTime: {
        type: String, // e.g., '10:00'
        required: true
    },
    type: {
        type: String,
        enum: ['regular', 'break', 'lunch'],
        default: 'regular'
    }
}, { timestamps: true });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
export default TimeSlot;
