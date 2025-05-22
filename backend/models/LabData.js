import mongoose from "mongoose";

const labDataSchema = new mongoose.Schema({
  labCategories: {
    type: Array,
    default: [],
  },
  labReportFields: {
    type: Object,
    default: {},
  },
});

export const LabData = mongoose.model("LabData", labDataSchema);
