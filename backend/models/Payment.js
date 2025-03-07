import mongoose from 'mongoose';
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'

const paymentSchema = new mongoose.Schema({
  amount : Number,
  associatedInvoiceOrId:String,
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'Staff'},
  paymentMethod : {type : String, enum : ['Cash','UPI', 'Card', 'Cheque','Bank Transfer','Other', 'Due']},
  paymentType : {name : {type : String, enum : ['Pharmacy','Employee', 'Services','Expense','Other',"Laboratory","IPD","OPD","OPDProcedure","IPDProcedure"]}, id : String, },
  type : {type : String, enum : ['Income','Expense']},
  description: { type: String, maxlength: 500 },
  createdByName:String,
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'Staff'},
}, {timestamps : true});

paymentSchema.plugin(hospitalPlugin)
export const Payment = mongoose.model('Payment', paymentSchema);
