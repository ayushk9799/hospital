import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const expenseSchema = new mongoose.Schema({
  createdByName: {
    type: String,
    required: true
  },
  category: {
    type: String,
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true
  },
}, { timestamps: true });

expenseSchema.plugin(hospitalPlugin);
export const Expense = mongoose.model("Expense", expenseSchema);
