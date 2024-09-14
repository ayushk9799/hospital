import mongoose from 'mongoose';
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Syrup', 'Other'],  },
  expiryDate: { type: Date, },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  CP: Number,
  MRP: Number,
  quantity: { type: Number, default: 0 },
  orders: [{
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    quantity: { type: Number,}
  }]
});

inventorySchema.plugin(hospitalPlugin)

// Method to update total quantity
inventorySchema.methods.updateTotalQuantity = function() {
  this.totalQuantity = this.quantityNotFromOrders + this.quantityFromOrders;
  return this.save();
};

export const Inventory = mongoose.model('Inventory', inventorySchema);