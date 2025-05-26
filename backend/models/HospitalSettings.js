import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const hospitalSettingsSchema = new mongoose.Schema({
  defaultBreakBillMode: {
    type: Boolean,
    default: true,
  },
  investigationDefaultInDischarge: {
    type: Boolean,
    default: true,
  },
  defaultBillPrintView: {
    type: String,
    default: "listwithoutdate",
    enum: ["datewise", "list","listwithoutdate"],
  }

  // Add any other settings as needed
});

hospitalSettingsSchema.plugin(hospitalPlugin);
export const HospitalSettings = mongoose.model(
  "HospitalSettings",
  hospitalSettingsSchema
);
