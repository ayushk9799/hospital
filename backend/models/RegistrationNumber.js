import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const registrationNumberSchema = new mongoose.Schema({
  department: { type: String, required: true },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 },
});

// Add a compound unique index for hospital + year

registrationNumberSchema.plugin(hospitalPlugin);

registrationNumberSchema.statics.getNextRegistrationNumber = async function (
  session
) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `U/${yearSuffix}/${doc.sequence.toString()}`;
};

export const RegistrationNumber = mongoose.model(
  "RegistrationNumber",
  registrationNumberSchema
);
