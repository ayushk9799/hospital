import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const templateSchema = new mongoose.Schema({
  labTestsTemplate: [
    {
      name: String,
      fields: mongoose.Schema.Types.Mixed
    },
  ],
  headerTemplate: mongoose.Schema.Types.Mixed,
  diagnosisTemplate: [String],
});

templateSchema.plugin(hospitalPlugin);
export const Template = mongoose.model("Template", templateSchema);