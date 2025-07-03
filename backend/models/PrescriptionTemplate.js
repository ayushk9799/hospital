import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const prescriptionTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can store string (template string) or structured JSON for form builder
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  associatedDoctors: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      name: String,
    },
  ],
});

// Attach hospital context plugin so data is automatically filtered by hospital
prescriptionTemplateSchema.plugin(hospitalPlugin);

export const PrescriptionTemplate = mongoose.model(
  "PrescriptionTemplate",
  prescriptionTemplateSchema
);
