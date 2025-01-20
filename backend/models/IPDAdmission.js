import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
import { Patient } from "./Patient.js";
const CounterSchema = new mongoose.Schema({
  year: { type: Number },
  sequence: { type: Number, default: 0 },
});
CounterSchema.plugin(hospitalPlugin);
const Counter = mongoose.model("IPDCounter", CounterSchema);


const ipdAdmissionSchema = new mongoose.Schema(
  {
    bookingDate: { type: Date },
    bookingNumber: { type: Number },
    patientName: { type: String },
    contactNumber: { type: String },
    registrationNumber: { type: String },
    ipdNumber: { type: String },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    dateDischarged: { type: Date },
    conditionOnAdmission: { type: String },
    conditionOnDischarge: { type: String },
    operationName:String,
    medicineAdvice: [{ name: String, dosage: String, duration: String }],
    comorbidities: [{ type: String }],
    clinicalSummary: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
    medications: [{ name: String, duration: String, frequency: String }],
    labTests: [String],
    labReports: [
      {
        date: { type: Date },
        name: { type: String },
        report: { type: mongoose.Schema.Types.Mixed },
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
  },
  { timestamps: true }
);
ipdAdmissionSchema.statics.getNextIpdNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const doc = await Counter.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );
  return `IPD/${yearSuffix}/${doc.sequence.toString()}`;
}
ipdAdmissionSchema.statics.getCurrentIPDNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const doc = await Counter.findOneAndUpdate(
    { year: currentYear },
    {},
    { 
      upsert: true, 
      new: true, 
      setDefaultsOnInsert: true, 
      session 
    }
  );
  return `IPD/${yearSuffix}/${(doc.sequence+1).toString()}`;
}
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
