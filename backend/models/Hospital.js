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
  pharmacyExpiryThreshold: {
    type: Number,
    min: 0,
    default: 3 // Default to 3 months, for example
  },
  pharmacyItemCategories: {
    type: [String],
    default: []
  }
  // Removed hospitalServiceCategories
});

export const Hospital = mongoose.model("Hospital", HospitalSchema);
