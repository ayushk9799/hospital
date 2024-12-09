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
  service_collections: [
    { ref: "Service", type: mongoose.Schema.Types.ObjectId },
  ],
});

templateSchema.plugin(hospitalPlugin);
export const Template = mongoose.model("Template", templateSchema);
