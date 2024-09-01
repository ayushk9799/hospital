import mongoose from 'mongoose';
import { hospitalPlugin } from '../plugins/hospitalPlugin.js';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactInfo: {
    type:Number,
    
  }
});

supplierSchema.plugin(hospitalPlugin);
export const Supplier = mongoose.model('Supplier', supplierSchema);