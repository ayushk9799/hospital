import mongoose from 'mongoose';
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'

const paymentSchema = new mongoose.Schema({
  amount : Number,
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'Staff'},
  paymentMethod : {type : String, enum : ['Cash','UPI', 'Card', 'Cheque','Bank Transfer','Other', 'Due']},
  paymentFor : {name : {type : String, enum : ['Supplier','Employee', 'Services', 'Other']}, id : String, },
  paymentFrom : {type : String, enum : ['pharmacy','laboratory','doctor','reception','other']},
  type : {type : String, enum : ['Income','Expense']},
  status : {type : String, enum : ['due','paid'], default : 'due'},
  description: { type: String, maxlength: 500 },
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'Staff'},
}, {timestamps : true});

paymentSchema.plugin(hospitalPlugin)
export const Payment = mongoose.model('Payment', paymentSchema);
