import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

// Birth Counter Schema - Combined yearly and monthly counters
const BirthCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  yearlyCount: { type: Number, default: 0 },
  monthlyCounts: {
    type: Map,
    of: Number, 
    default: {},
  },
});
BirthCounterSchema.plugin(hospitalPlugin);
export const BirthCounter = mongoose.model("BirthCounter", BirthCounterSchema);

const babySchema = new mongoose.Schema(
  {
    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    birthCounter: {
      type: String,
    },
    ipdAdmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ipdAdmission",
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
    babyHandOverName: {
      type: String,
      trim: true,
    },
    babyHandOverRelation: {
      type: String,
      trim: true,
    },
    babyFatherName: {
      type: String,
      trim: true,
    },
    certificatedCreated: {
      type: Boolean,
      default: false,
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

// Add static methods for birth counting
babySchema.statics.getBirthStats = async function (year, month) {
  if (month) {
    // Get specific month stats
    const stats = await BirthCounter.findOne({ year, month });
    return stats || { year, month, yearlyCount: 0, monthlyCount: 0 };
  } else {
    // Get all months for the year
    const stats = await BirthCounter.find({ year });
    return stats;
  }
};

// Pre-save middleware to update counters
babySchema.statics.updateBirthCounter = async function (session, dateOfBirth) {
  const year = dateOfBirth?.split("-")?.[0];
  const month = dateOfBirth?.split("-")?.[1]; 

  // Update both yearly and monthly counts in single document
  const counterDoc = await BirthCounter.findOneAndUpdate(
    { year },
    { 
      $inc: { 
        yearlyCount: 1, 
        [`monthlyCounts.${month}`]: 1
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );
  return `${counterDoc.year}-${month}/${counterDoc.yearlyCount}-${counterDoc.monthlyCounts.get(month)}`;
};

babySchema.index({ birthCounter: 1 });

babySchema.plugin(hospitalPlugin);
export const Baby = mongoose.model("Baby", babySchema);
