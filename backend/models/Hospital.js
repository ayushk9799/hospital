import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema({
  name: String,
  logo: String,
  address: String,
  contactNumber: String,
  email: String,
  website: String,
  // clinicName has been removed
  doctorName: String,
  doctorInfo: String,
  hospitalId: {
    type: String,
    required: true,
  }
});

export const Hospital = mongoose.model('Hospital', HospitalSchema);