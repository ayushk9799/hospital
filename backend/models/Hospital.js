import mongoose from "mongoose";

const HospitalSchema = new mongoose.Schema({
  name: String,
  logo: String,
  address: String,
  contactNumber: String,
  email: String,
  website: String,
  doctorName: String,
  doctorInfo: String,
  hospitalId: {
    type: String,
    required: true,
  },
  pharmacyName: String,
  pharmacyAddress: String,
  pharmacyContactNumber: String,
  pharmacyLogo: String,
  pharmacyExpiryThreshold: Number,
  pharmacyExpiryThresholdUnit: String,
});

export const Hospital = mongoose.model("Hospital", HospitalSchema);
