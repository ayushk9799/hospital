import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const DEFAULT_CONSULTATION_TYPES = ["new", "follow-up"];

const consultationFeeSchema = new mongoose.Schema({
  doctorWiseFee: [
    {
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      consultationType: {
        type: Map,
        of: Number,
      },
      followUpDateWithin: {
        type: Number,
        default: 14,
      }
    
    },
  ],
  consultationTypes: {
    type: [String],
    default: DEFAULT_CONSULTATION_TYPES,
    validate: {
      validator: function (types) {
        // Ensure default types are always present
        return DEFAULT_CONSULTATION_TYPES.every((type) => types.includes(type));
      },
      message: "New and Follow-up consultation types cannot be removed",
    },
  },
});

consultationFeeSchema.plugin(hospitalPlugin);

const ConsultationFee = mongoose.model(
  "ConsultationFee",
  consultationFeeSchema
);

export default ConsultationFee;
