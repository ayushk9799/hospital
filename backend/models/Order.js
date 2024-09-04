import mongoose from 'mongoose';
import { hospitalPlugin } from '../plugins/hospitalPlugin.js';

const orderSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', },
    quantity: { type: Number, required: true },
    
  }],
  totalAmount: { type: Number  },
  paymentDone: { type: Number,  },
  orderDate: { type: Date, default: Date.now },
});



orderSchema.plugin(hospitalPlugin);
export const Order = mongoose.model('Order', orderSchema);