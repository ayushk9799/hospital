import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const hospitalSettingsSchema = new mongoose.Schema({
  defaultBreakBillMode: {
    type: Boolean,
    default: true,
  }

  // Add any other settings as needed
});

hospitalSettingsSchema.plugin(hospitalPlugin);
export const HospitalSettings = mongoose.model(
  "HospitalSettings",
  hospitalSettingsSchema
);
