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
  },
  rate: {
    type: Number,
    required: true,
  },
});
serviceSchema.plugin(hospitalPlugin);
export const Service = mongoose.model("Service", serviceSchema);
