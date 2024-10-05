import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const servicesBillSchema = new mongoose.Schema({
  services: [{
    name : {type : String, required : true},
    quantity : {type : Number, default : 1},
    rate : Number,
    category : String
  }],
  totalAmount : { type: Number, required : true},
  subtotal : { type: Number, required : true},
  additionalDiscount : { type: Number, default : 0 },
  amountPaid : { type: Number, default : 0 },
  payments : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
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
  patientInfo : {
    name : String,
    phone : String
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Staff",
    required : true,
  }
}, {timestamps : true});

servicesBillSchema.plugin(hospitalPlugin);
export const ServicesBill = mongoose.model("ServicesBill", servicesBillSchema);
