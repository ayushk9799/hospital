import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const doctorDataSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },
    medicines: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: [String],
      default: [],
    },
    complaints: {
      type: [String],
      default: [],
    },
    comorbidities: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Attach hospital context plugin so data is automatically filtered by hospital
doctorDataSchema.plugin(hospitalPlugin);

// Ensure that a doctor has only one record per hospital
doctorDataSchema.index({ doctor: 1, hospital: 1 }, { unique: true });

export const DoctorData = mongoose.model("DoctorData", doctorDataSchema);
