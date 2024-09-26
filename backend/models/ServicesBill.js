import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
const servicesBillSchema = new mongoose.Schema({
  services: [{
    name : {type : String, required : true},
    quantity : {type : Number, default : 1},
    rate : Number,
    discount : { type: Number, default : 0 },
    category : String
  }],
  totalAmount : { type: Number, required : true},
  subtotal : { type: Number, required : true},
  gst : { type: Number},
  additionalDiscount : { type: Number, default : 0 },
  amountPaid : { type: Number, required : true},
  payment : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  patientType : {
    type : String,
    enum : ["OPD","IPD"],
    required : true,
  },
  patient : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Patient",
    required : true,
  },
  department : {
    type : String,
    required : true,
  },
  physician : {
    type : String,
    required : true,
  },
  patientInfo : {
    name : String,
    phone : String
  }
}, {timestamps : true});
servicesBillSchema.plugin(hospitalPlugin);
export const ServicesBill = mongoose.model("ServicesBill", servicesBillSchema);
