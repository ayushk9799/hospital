import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
    },
    dateOfBirth: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contactNumber: String,
    email: String,
    address: String,
    bloodType: String,
    opdProcedureBills: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServicesBill" },
    ],
    admissionDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ipdAdmission" },
    ],
    visits: [{ type: mongoose.Schema.Types.ObjectId, ref: "visit" }],
    lastVisit: { type: Date, default: Date.now },
    lastVisitType: { type: String, enum: ["OPD", "IPD"] },
  },
  { timestamps: true }
);

// Add compound index for hospital-wise unique registration numbers
patientSchema.index(
  { hospital: 1, registrationNumber: 1 },
  { unique: true, sparse: true }
);

patientSchema.plugin(hospitalPlugin);
export const Patient = mongoose.model("Patient", patientSchema);
