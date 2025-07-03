import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
import { RegistrationNumber } from "./RegistrationNumber.js";

const servicesBillSchema = new mongoose.Schema(
  {
    services: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        rate: Number,
        category: String,
        date: { type: Date },
        type: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    additionalDiscount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    procedureName: { type: String },
    operationName: { type: String },
    patientType: {
      type: String,
      enum: ["OPD", "IPD", "OPDProcedure", "Lab"],
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },

    patientInfo: {
      name: String,
      phone: String,
      registrationNumber: String,
      ipdNumber: String,
      age: String,
      gender: String,
      address: String,
    },
    labRegistration:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"LabRegistration"
    },
    opdProcedure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OPDProcedure",
    },
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "visit",
    },
    admission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ipdAdmission",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    invoiceNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

servicesBillSchema.plugin(hospitalPlugin);
export const ServicesBill = mongoose.model("ServicesBill", servicesBillSchema);
