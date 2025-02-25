import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const templateSchema = new mongoose.Schema({
  labTestsTemplate: [
    {
      name: String,
      fields: mongoose.Schema.Types.Mixed,
      rate: Number,
    },
  ],
  headerTemplate: String,
  mergeTemplate: String,
  dischargeSummaryTemplate: String,
  opdPrescriptionTemplate: String,
  opdRxTemplate: String,
  labReportUiTemplate: String,
  headerTemplateArray: [
    {
      name: String,
      value: String,
    },
  ],
  diagnosisTemplate: [String],
  dischargeSummaryTemplateArray: [
    {
      name: String,
      value: String,
    },
  ],
  opdPrescriptionTemplateArray: [
    {
      name: String,
      value: String,
    },
  ],
  opdRxTemplateArray: [
    {
      name: String,
      value: String,
    },
  ],
  consentFormArray: [
    {
      name: String,
      value: String,
    },
  ],
  comorbidities: [String],
  medicinelist: [String],
  service_collections: [
    { ref: "Service", type: mongoose.Schema.Types.ObjectId },
  ],
  dischargeFormTemplates: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  birthCertificateTemplate: String,
});

templateSchema.plugin(hospitalPlugin);
export const Template = mongoose.model("Template", templateSchema);
