import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
const babySchema = new mongoose.Schema(
  {
    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    ipdAdmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IPDAdmission",
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    timeOfAdmission: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    timeOfBirth: {
      type: String,
      required: true,
    },
    weight: {
      type: Number, // in grams
      required: true,
    },
    apgarScore: {
      oneMinute: {
        type: Number,
        min: 0,
        max: 10,
      },
      fiveMinutes: {
        type: Number,
        min: 0,
        max: 10,
      },
      tenMinutes: {
        type: Number,
        min: 0,
        max: 10,
      },
    },
  },
  {
    timestamps: true,
  }
);
babySchema.plugin(hospitalPlugin);
export const Baby = mongoose.model("Baby", babySchema);
