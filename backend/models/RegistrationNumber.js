import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const registrationNumberSchema = new mongoose.Schema({
  department: { type: String, required: true },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 },
  prefix: { type: String},
  useYearSuffix: { type: Boolean, default: true },
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

  return `${doc.prefix ? doc.prefix+"/" : ""}${doc.useYearSuffix ? yearSuffix+"/" : ""}${doc.sequence.toString()}`;
};

registrationNumberSchema.statics.getCurrentRegistrationNumber = async function (
  session
) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear },
    {}, // no updates needed
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      session,
    }
  );

  return `${doc.prefix ? doc.prefix+"/" : ""}${doc.useYearSuffix ? yearSuffix+"/" : ""}${(doc.sequence+1).toString()}`;
};

export const RegistrationNumber = mongoose.model(
  "RegistrationNumber",
  registrationNumberSchema
);
