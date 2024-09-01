import mongoose from 'mongoose';
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['General', 'Semi-Private', 'Private', 'ICU', 'Operation Theater', 'Emergency'], required: true },
  floor: Number,
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
 
  ratePerDay: Number,
  currentPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  status: { type: String, enum: ['Available', 'Occupied', 'Under Maintenance'], default: 'Available' },
  lastCleaned: Date,
  
});
roomSchema.plugin(hospitalPlugin)
export const Room = mongoose.model('Room', roomSchema);