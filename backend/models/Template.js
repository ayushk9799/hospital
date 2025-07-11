import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const templateSchema = new mongoose.Schema({
  labTestsTemplate: [
    {
      name: String,
      fields: mongoose.Schema.Types.Mixed,
      rate: Number,
      notes: String,
      remarksArray : Array,
      status : {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
      sections: [
        {
          name: String,
          position: Number,
        },
      ],
    },
  ],
  headerTemplate: String,
  mergeTemplate: String,
  dischargeSummaryTemplate: String,
  opdPrescriptionTemplate: String,
  opdRxTemplate: String,
  labReportUiTemplate: String,
  opdBillTokenTemplate: String,
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
  dischargeFormTemplateArray: [
    {
      name: String,
      value: mongoose.Schema.Types.Mixed,
      isDefault: {
        type: Boolean,
        default: false,
      },
      associatedDoctors: [
        {
          _id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Staff"
          },
          name:{
          type:String
          }
        },
      ],
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
  labBillingTemplate: String,
});

templateSchema.plugin(hospitalPlugin);
export const Template = mongoose.model("Template", templateSchema);
