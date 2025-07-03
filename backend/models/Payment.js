import mongoose from 'mongoose';
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'
import { PaymentCounter } from './PaymentCounter.js';

const paymentSchema = new mongoose.Schema({
  paymentNumber: { type: String},
  amount : Number,
  associatedInvoiceOrId:String,
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'Staff'},
  paymentMethod : {type : String, enum : ['Cash','UPI', 'Card', 'Cheque','Bank Transfer','Other', 'Due']},
  paymentType : {name : {type : String, enum : ['Pharmacy','Employee', 'Services','Expense','Other',"Laboratory","IPD","OPD","OPDProcedure","IPDProcedure"]}, id : String, },
  type : {type : String, enum : ['Income','Expense']},
  description: { type: String, maxlength: 500 },
  createdByName:String,
  createdAt: { type: Date, default: Date.now },
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref : 'Staff'},
}, {timestamps : true});

paymentSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Get the next payment number from PaymentCounter
    const session = this.$session();
    this.paymentNumber = await PaymentCounter.getNextPaymentNumber(session);
  }
  next();
});

paymentSchema.plugin(hospitalPlugin)
paymentSchema.index({ hospital: 1, paymentNumber: 1 }, { unique: true });
export const Payment = mongoose.model('Payment', paymentSchema);
