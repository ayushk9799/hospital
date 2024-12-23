import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";
import { RegistrationNumber } from "./RegistrationNumber.js";

const servicesBillSchema = new mongoose.Schema({
  services: [{
    name : {type : String, required : true},
    quantity : {type : Number, default : 1},
    rate : Number,
    category : String,
    date: Date,
  }],
  totalAmount : { type: Number, required : true},
  subtotal : { type: Number, required : true},
  additionalDiscount : { type: Number, default : 0 },
  amountPaid : { type: Number, default : 0 },
  payments : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  patientType : {
    type : String,
    enum : ["OPD","IPD","OPDProcedure"],
    required : true,
  },
  patient : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Patient",
    
  },
  
  patientInfo : {
    name : String,
    phone : String,
    registrationNumber:String,
    ipdNumber:String,
    age:Number,
    gender:String,
    address:String
  },
  opdProcedure : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "OPDProcedure",
  },
  visit:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"visit"
  },
  admission:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"ipdAdmission"
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Staff",
    required : true,
  },
  invoiceNumber: {
    type: String,
    
   
  }
}, {timestamps : true});

servicesBillSchema.plugin(hospitalPlugin);
export const ServicesBill = mongoose.model("ServicesBill", servicesBillSchema);
