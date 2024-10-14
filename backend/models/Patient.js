import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    registrationNumber: { type: String },
    dateOfBirth: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contactNumber: String,
    email: String,
    address: String,
    bloodType: String,
   
    admissionDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ipdAdmission" },
    ],
    visits: [{ type: mongoose.Schema.Types.ObjectId, ref: "visit" }],
  },
  { timestamps: true }
);
patientSchema.plugin(hospitalPlugin);
export const Patient = mongoose.model("Patient", patientSchema);
