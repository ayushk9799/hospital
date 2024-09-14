import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  timeSlot:{
    start: { type: String },
    end: { type: String },
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  // You can add more fields here if needed, such as:
  // description, eventType, location, etc.
});

// Add any methods or virtual properties here if needed

export const Event = mongoose.model('Event', eventSchema);

