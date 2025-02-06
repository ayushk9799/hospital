import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
import { Patient } from "./Patient.js";

const CounterSchema = new mongoose.Schema({
  year: { type: Number },
  sequence: { type: Number, default: 0 },
});

CounterSchema.plugin(hospitalPlugin);
const Counter = mongoose.model("LabCounter", CounterSchema);

const labRegistrationSchema = new mongoose.Schema(
  {
    // Basic Patient Info
    patientName: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    contactNumber: { type: String },
    address: { type: String },

    // Registration Details
    bookingDate: { type: Date, default: Date.now },
    bookingNumber: { type: Number },
    labNumber: { type: String, unique: true },
    registrationNumber: { type: String }, // UHID if exists

    // References to existing records if any
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    visit: { type: mongoose.Schema.Types.ObjectId, ref: "visit" },
    ipdAdmission: { type: mongoose.Schema.Types.ObjectId, ref: "ipdAdmission" },

    // Lab Tests and Reports
    labTests: [
      {
        name: { type: String, required: true },
        category: { type: String },
        reportStatus: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
        },
        result: { type: mongoose.Schema.Types.Mixed },
        reportDate: { type: Date },
        normalRange: { type: String },
        units: { type: String },
      },
    ],

    // Payment Information
    paymentInfo: {
      totalAmount: { type: Number, required: true },
      amountPaid: { type: Number, default: 0 },
      paymentMethod: [
        {
          method: { type: String },
          amount: { type: Number },
        },
      ],
      additionalDiscount: { type: Number, default: 0 },
      balanceDue: { type: Number },
    },

    // Status and Notes
    status: {
      type: String,
      enum: ["Registered", "In Progress", "Completed"],
      default: "Registered",
    },
    notes: { type: String },

    // Doctor Reference if referred
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    department: { type: String },
  },
  { timestamps: true }
);

// Generate unique lab number
labRegistrationSchema.statics.getNextLabNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const doc = await Counter.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );
  return `LAB/${yearSuffix}/${doc.sequence.toString().padStart(4, "0")}`;
};

// Get current lab number without incrementing
labRegistrationSchema.statics.getCurrentLabNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const doc = await Counter.findOneAndUpdate(
    { year: currentYear },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );
  return `LAB/${yearSuffix}/${(doc.sequence + 1).toString().padStart(4, "0")}`;
};

// Pre-save middleware to handle patient data
labRegistrationSchema.pre("save", async function (next) {
  // If registration number exists but no patient ID, try to find and link the patient
  if (this.registrationNumber && !this.patient) {
    const patient = await Patient.findOne({
      registrationNumber: this.registrationNumber,
    });
    if (patient) {
      this.patient = patient._id;
    }
  }

  // Calculate balance due before saving
  if (this.paymentInfo) {
    this.paymentInfo.balanceDue =
      (this.paymentInfo.totalAmount || 0) - (this.paymentInfo.amountPaid || 0);
  }

  next();
});

labRegistrationSchema.plugin(hospitalPlugin);
export const LabRegistration = mongoose.model(
  "LabRegistration",
  labRegistrationSchema
);
