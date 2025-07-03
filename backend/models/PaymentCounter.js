import mongoose from 'mongoose';
import { hospitalPlugin } from '../plugins/hospitalPlugin.js';

const paymentCounterSchema = new mongoose.Schema({
  department: { type: String, required: true, default: 'PAY' },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 },
  prefix: { type: String, default: 'PAY' },
  useYearSuffix: { type: Boolean, default: true }
}, { timestamps: true });

paymentCounterSchema.plugin(hospitalPlugin);
paymentCounterSchema.index({ hospital: 1, year: 1 }, { unique: true });

paymentCounterSchema.statics.getNextPaymentNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${doc.sequence}`;
};

paymentCounterSchema.statics.getCurrentPaymentNumber = async function (session) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  const doc = await this.findOneAndUpdate(
    { year: currentYear },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );

  return `${doc.prefix}/${doc.useYearSuffix ? yearSuffix : currentYear}/${doc.sequence + 1}`;
};

export const PaymentCounter = mongoose.model('PaymentCounter', paymentCounterSchema); 