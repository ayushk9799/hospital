import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
const CounterSchema = new mongoose.Schema({
  date: { type: Date },
  seq: { type: Number, default: 0 },
});
CounterSchema.plugin(hospitalPlugin);
const Counter = mongoose.model("Counter", CounterSchema);

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
const visitSchema = new mongoose.Schema(
  {
    bookingDate: { type: Date },
    bookingNumber: { type: Number },
    patientName: { type: String },
    contactNumber: { type: String },
    registrationNumber: { type: String },
    guardianName:String,
    relation:String,
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    department: { type: String },
    reasonForVisit: { type: String },
    timeSlot: {
      start: { type: String },
      end: { type: String },
    },
    diagnosis: { type: String },
    treatment: { type: String },
    medications: [
      {
        name: String,
        frequency: String,
        duration: String,
      },
    ],
    labTests: [String],
    comorbidities: [{ type: String }],
    additionalInstructions: { type: String },
    status: { type: String, default: "pending" },
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      oxygenSaturation: Number,
      respiratoryRate: Number,
    },
    bills: {
      pharmacy: [{ type: mongoose.Schema.Types.ObjectId, ref: "PharmacyBill" }],
      services: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServicesBill" }],
    },
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      coverageType: String,
    },
    labReports: [
      {
        date: { type: Date },
        name: { type: String, required: true },
        report: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

visitSchema.pre("save", async function (next) {
  if (!this.bookingNumber) {
    const counter = await Counter.findOneAndUpdate(
      { date: this.bookingDate },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    this.bookingNumber = counter.seq;
  }

  next();
});
visitSchema.plugin(hospitalPlugin);
export const Visit = mongoose.model("visit", visitSchema);
