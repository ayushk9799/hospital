import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
import { Patient } from "./Patient.js";
import { getHospitalId } from '../utils/asyncLocalStorage.js';

// Lab Counter Schema
const CounterSchema = new mongoose.Schema({
  department: { type: String, required: true, default: 'LAB' },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 },
  prefix: { type: String, default: 'LAB' },
  useYearSuffix: { type: Boolean, default: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true }
}, { timestamps: true });

CounterSchema.plugin(hospitalPlugin);

CounterSchema.statics.getNextLabNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const hospitalId = getHospitalId();

  const doc = await this.findOneAndUpdate(
    { year: currentYear, hospital: hospitalId },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  // Use the prefix and useYearSuffix from the counter document
  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${doc.sequence}`;
};

CounterSchema.statics.getCurrentLabNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const hospitalId = getHospitalId();

  const doc = await this.findOneAndUpdate(
    { year: currentYear, hospital: hospitalId },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  // Use the prefix and useYearSuffix from the counter document
  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${(doc.sequence + 1)}`;
};

const Counter = mongoose.model("LabCounter", CounterSchema);

const labRegistrationSchema = new mongoose.Schema(
  {
    // Basic Patient Info
    patientName: { type: String, required: true },
    age: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    contactNumber: { type: String },
    address: { type: String },
    guardianName: { type: String },
    relation: { type: String },

    // Registration Details
    bookingDate: { type: Date, default: Date.now },
    bookingNumber: { type: Number },
    labNumber: { type: String },
    registrationNumber: { type: String }, 
    billDetails:{
      invoiceNumber:{type:String},
      billId:{type:mongoose.Schema.Types.ObjectId,ref:"ServiceBill"},
    },
    // References to existing records if any
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    visit: { type: mongoose.Schema.Types.ObjectId, ref: "visit" },
    ipdAdmission: { type: mongoose.Schema.Types.ObjectId, ref: "ipdAdmission" },

    // Lab Tests and Reports
    labTests: [
      {
        name: { type: String },

        reportStatus: {
          type: String,
          enum: ["Registered", "Sample Collected", "Completed"],
          default: "Registered",
        },
        price: { type: Number },
      },
    ],
    labReports: [
      {
        date: { type: Date },
        name: { type: String },
        report: { type: mongoose.Schema.Types.Mixed },
        reportStatus: {
          type: String,
          enum: ["Registered", "Sample Collected", "Completed"],
          default: "Registered",
        },
      },
    ],
    lastVisitType: { type: String, enum: ["OPD", "IPD"] },
    lastVisit: { type: Date, default: Date.now },
    lastVisitId: { type: mongoose.Schema.Types.ObjectId },
    payments:[{type: mongoose.Schema.Types.ObjectId,ref:"Payment"}],

    // Payment Information
    paymentInfo: {
      totalAmount: { type: Number, required: true },
      amountPaid: { type: Number, default: 0 },
     
      additionalDiscount: { type: Number, default: 0 },
      balanceDue: { type: Number },
    },

    status: {
      type: String,
      enum: ["Registered", "In Progress", "Completed"],
      default: "Registered",
    },
    notes: { type: String },
    referredByName: { type: String },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    department: { type: String },
  },
  { timestamps: true }
);

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

  if (this.paymentInfo) {
    this.paymentInfo.balanceDue =
      (this.paymentInfo.totalAmount-this.paymentInfo.additionalDiscount || 0) - (this.paymentInfo.amountPaid || 0);
  }

  next();
});

labRegistrationSchema.plugin(hospitalPlugin);
export const LabRegistration = mongoose.model(
  "LabRegistration",
  labRegistrationSchema
);
