import mongoose from 'mongoose';
import { hospitalPlugin } from '../plugins/hospitalPlugin.js';

const supplierSchema = new mongoose.Schema({  
  name: { type: String, required: true },
  address : String,
  phone : String,
  email : String,
  amountPaid : Number,
  amountDue : Number,
  orders : [{type : mongoose.Schema.Types.ObjectId, ref : 'Order'}],
  items : [{type : mongoose.Schema.Types.ObjectId, ref : 'Inventory'}],
  payments : [{orderID : String,amount : Number,date : Date}],
});

supplierSchema.plugin(hospitalPlugin);
export const Supplier = mongoose.model('Supplier', supplierSchema);