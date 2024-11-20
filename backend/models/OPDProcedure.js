import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
const opdProcedureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    
  },
  ipdNumber: {
    type: String,
    
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    
  },
  age: {
    type: Number,
    
  },
  procedureName : String,
  totalAmount : Number,
  amountPaid : Number,
  servicesBill : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "ServicesBill"
  },
  contactNumber: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
  },
}, {
  timestamps: true
});

opdProcedureSchema.plugin(hospitalPlugin);
export const OPDProcedure = mongoose.model("OPDProcedure", opdProcedureSchema);
