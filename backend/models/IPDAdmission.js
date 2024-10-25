import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
import { Patient } from "./Patient.js";
const CounterSchema = new mongoose.Schema({
  date: { type: Date },
  seq: { type: Number, default: 0 },
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
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    dateDischarged: { type: Date },
    conditionOnAdmission: { type: String },
    conditionOnDischarge: { type: String },
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

ipdAdmissionSchema.pre("save", async function (next) {
  if (!this.bookingNumber) {
    const counter = await Counter.findOneAndUpdate(
      { date: this.bookingDate },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    this.bookingNumber = counter.seq;
  }

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
