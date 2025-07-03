import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
import { Patient } from "./Patient.js";

// IPD Counter Schema
const CounterSchema = new mongoose.Schema({
  department: { type: String, required: true, default: 'IPD' },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 },
  prefix: { type: String, default: 'IPD' },
  useYearSuffix: { type: Boolean, default: true }
}, { timestamps: true });

CounterSchema.plugin(hospitalPlugin);

CounterSchema.statics.getNextIPDNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${doc.sequence}`;
};

CounterSchema.statics.getCurrentIPDNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${(doc.sequence + 1)}`;
};

const Counter = mongoose.model("IPDCounter", CounterSchema);

const ipdAdmissionSchema = new mongoose.Schema(
  {
    bookingDate: { type: Date },
    bookingTime : {type : String},
    bookingNumber: { type: Number },
    patientName: { type: String },
    contactNumber: { type: String },
    registrationNumber: { type: String },
    ipdNumber: { type: String },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    dateDischarged: { type: Date },
    conditionOnAdmission: { type: String },
    conditionOnDischarge: { type: String },
    operationName: String,
    history:String,
    medicineAdvice: [{ name: String, dosage: String, duration: String, remarks: String }],
    comorbidities: [{ type: String }],
    clinicalSummary: { type: String },
    diagnosis: { type: String },
    guardianName: String,
    relation: String,
    treatment: { type: String },
    medications: [{ name: String, duration: String, frequency: String, remarks: String }],
    referredBy: String,
    labTests: [String],
    labReports: [
      {
        date: { type: Date },
        name: { type: String },
        report: { type: mongoose.Schema.Types.Mixed },
        category: { type: String },
      },
    ],
    vitals: {
      admission: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        weight: Number,
        height: Number,
        oxygenSaturation: Number,
        respiratoryRate: Number,
      },
      discharge: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        oxygenSaturation: Number,
        respiratoryRate: Number,
      },
    },
    timeSlot: {
      start: { type: String },
      end: { type: String },
    },
    status: {
      type: String,
      enum: ["Admitted", "Discharged"],
      default: "Admitted",
    },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    department: { type: String },
    assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    assignedBed: { type: mongoose.Schema.Types.ObjectId, ref: "Room.beds" },
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      coverageType: String,
    },
    notes: { type: String },
    bills: {
      pharmacy: [{ type: mongoose.Schema.Types.ObjectId, ref: "PharmacyBill" }],
      services: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServicesBill" }],
    },
    dischargeData: { type: mongoose.Schema.Types.Mixed },
    formConfig: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

ipdAdmissionSchema.statics.getNextIpdNumber = async function (session) {
  return Counter.getNextIPDNumber(session);
};

ipdAdmissionSchema.statics.getCurrentIPDNumber = async function (session) {
  return Counter.getCurrentIPDNumber(session);
};

ipdAdmissionSchema.pre("save", async function (next) {
  if (!this.registrationNumber && this.patient) {
    const patient = await Patient.findById(this.patient);
    if (patient) {
      this.registrationNumber = patient.registrationNumber;
    }
  }

  next();
});

ipdAdmissionSchema.plugin(hospitalPlugin);
export const IPDAdmission = mongoose.model("ipdAdmission", ipdAdmissionSchema);
