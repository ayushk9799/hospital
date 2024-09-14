import mongoose from 'mongoose';
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'

const paymentSchema = new mongoose.Schema({
  amount : Number,
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'Staff'},
  createdAt : {type : Date, default : Date.now},
  paymentMethod : {type : String, enum : ['Cash','UPI', 'Card', 'Cheque','Bank Transfer','Other']},
  paymentFor : {name : {type : String, enum : ['Supplier','Employee','Other']}, id : String, },
  paymentFrom : {type : String, enum : ['pharmacy','laboratory','doctor','reception','other']},
  type : {type : String, enum : ['Income','Expense']},
  status : {type : String, enum : ['due','paid','cancelled']},
  description: { type: String, maxlength: 500 },
});

paymentSchema.plugin(hospitalPlugin)
export const Payment = mongoose.model('Payment', paymentSchema);
