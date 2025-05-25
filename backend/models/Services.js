import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
  },
  subdivisions: [
    {
      name: String,
      rate: Number,
    },
  ],
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringLogic: {
    frequency: {
      type: String,
      enum: ["daily", "hourly"],
     
    },
    dailyPrecision: {
      type: String,
      enum: ["precise", "time_based"],
     
     
    },
    resetTime: {
      type: String,
    
    },
  },
});

// Add validation to check if sum of subdivision rates equals parent rate
serviceSchema.pre("save", function (next) {
  if (this.subdivisions && this.subdivisions.length > 0) {
    const sumOfRates = this.subdivisions.reduce(
      (sum, subdivision) => sum + (subdivision.rate || 0),
      0
    );
    if (sumOfRates !== this.rate) {
      next(new Error("Sum of subdivision rates must equal the service rate"));
    }
  }
  next();
});

serviceSchema.plugin(hospitalPlugin);
export const Service = mongoose.model("Service", serviceSchema);
