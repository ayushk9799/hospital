import mongoose from 'mongoose';
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'
const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, default: Date.now },
  medications: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: false
    },
    medicineName: {
      type: String,
      required: function() {
        return !this.medicine;
      }
    },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  diagnosis: String,
  notes: String
});
prescriptionSchema.plugin(hospitalPlugin)
export const Prescription = mongoose.model('Prescription', prescriptionSchema);