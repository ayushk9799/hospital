import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const billCounterSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

billCounterSchema.plugin(hospitalPlugin);

billCounterSchema.statics.getNextBillNumber = async function (session) {
  const currentYear = new Date().getFullYear();

  const doc = await this.findOneAndUpdate(
    { year: currentYear},
    { $inc: { lastNumber: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `${doc.prefix}/${currentYear}/${doc.lastNumber}`;
};

export const BillCounter = mongoose.model("BillCounter", billCounterSchema);
