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
  logo2:String,
  pharmacyName: String,
  pharmacyAddress: String,
  pharmacyContactNumber: String,
  pharmacyLogo: String,
  pharmacyExpiryThreshold: {
    type: Number,
    min: 0,
    default: 3 
  },
  pharmacyItemCategories: {
    type: [String],
    default: []
  }
  // Removed hospitalServiceCategories
});

export const Hospital = mongoose.model("Hospital", HospitalSchema);
