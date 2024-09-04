import mongoose from "mongoose";
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'
function formatDate(date) {
  console.log(typeof(date))
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();
  console.log(`${day}-${month}-${year}`)
  return `${day}-${month}-${year}`;
}

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  registrationNumber: { type: Number },
  dateOfBirth: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  contactNumber: String,
  email: String,
  address: String,
  bloodType: String,
  patientType: {
    type: String,
    enum: ["IPD", "OPD"],
    required: true,
    default: "OPD",
  },
  admissionDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: "IPDAdmission" }],
  visits: [ { type: mongoose.Schema.Types.ObjectId, ref: "Visit" } ],
    
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    coverageType: String,
  },
});
patientSchema.plugin(hospitalPlugin)
export const Patient = mongoose.model("Patient", patientSchema);