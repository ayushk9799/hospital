import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const templateSchema = new mongoose.Schema({
  labTestsTemplate: [
    {
      name: String,
      fields: mongoose.Schema.Types.Mixed,
    },
  ],
  headerTemplate: String,
  diagnosisTemplate: [String],
  dischargeSummaryTemplate: String,
  opdPrescriptionTemplate: String,
  opdRxTemplate: String,
  comorbidities: [String],
  medicinelist: [String],
  service_collections: [
    { ref: "Service", type: mongoose.Schema.Types.ObjectId },
  ],
});

templateSchema.plugin(hospitalPlugin);
export const Template = mongoose.model("Template", templateSchema);
