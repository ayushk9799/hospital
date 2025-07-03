import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const billCounterSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, default: 'INV' },
    year: {
      type: Number,
      required: true,
    },
    lastNumber: {
      type: Number,
      default: 0,
    },
    prefix: {
      type: String,
      default: "INV",
    },
    useYearSuffix: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

billCounterSchema.plugin(hospitalPlugin);

billCounterSchema.statics.getNextBillNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear},
    { $inc: { lastNumber: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${doc.lastNumber}`;
};

billCounterSchema.statics.getCurrentBillNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${(doc.lastNumber + 1)}`;
};

export const BillCounter = mongoose.model("BillCounter", billCounterSchema);
