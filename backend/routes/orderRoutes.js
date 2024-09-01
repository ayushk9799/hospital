import express from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Supplier } from '../models/Supplier.js';
import { Inventory } from '../models/Inventory.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { supplier, items, totalAmount, paymentDone } = req.body;

    // Find or create supplier
    let supplierDoc;
    if (supplier) {
        supplierDoc = await Supplier.findOne({ 
            name: { $regex: new RegExp(`^${supplier.name}$`, 'i') } 
          }).session(session);
      if (!supplierDoc) {
        supplierDoc = new Supplier({name: supplier.name,contactInfo: supplier.contactInfo});
        await supplierDoc.save({ session });
      }
    }

    // Check inventory and prepare order items
    const orderItems = [];
    for (let item of items) {
      let inventoryItem = await Inventory.findOne({ 
        name: { $regex: new RegExp(`^${item.name}$`, 'i') } 
      }).session(session);

      if (!inventoryItem) {
        // Create new inventory item if not found
        console.log(typeof(item.quantity))
        inventoryItem = new Inventory({
          name: item.name,
          quantityFromOrders: item.quantity,
          supplier: supplierDoc ? [supplierDoc._id] : []
          // Add other default fields as necessary
        });
        await inventoryItem.save({ session });
      } else {
        // Update existing inventory item
        console.log(typeof(inventoryItem.quantityFromOrders))
        inventoryItem.quantityFromOrders += item.quantity;
        if (supplierDoc && !inventoryItem.supplier.includes(supplierDoc._id)) {
          inventoryItem.supplier.push(supplierDoc._id);
        }
        await inventoryItem.updateTotalQuantity();
        await inventoryItem.save({ session });
      }
      
      orderItems.push({
        item: inventoryItem._id,
        quantity: item.quantity
      });
    }

    // Create order with item references
    const order = new Order({
      supplier: supplierDoc?._id,
      items: orderItems,
      totalAmount,
      paymentDone
    });

    await order.save({ session });

    // Update inventory with order reference
    for (let item of orderItems) {
      await Inventory.findByIdAndUpdate(
        item.item,
        {
          $push: { orders: { order: order._id, quantity: item.quantity } }
        },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: 'Error creating order', error: error.message });
  } finally {
    session.endSession();
  }
});

// Add more routes as needed (e.g., get all orders, update order, delete order)

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'orderDate', order = 'desc' } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sortBy]: order === 'asc' ? 1 : -1 },
      populate: [
        { path: 'supplier', select: 'name' },
        { path: 'items.item', select: 'name' }
      ]
    };

    const orders = await Order.paginate({}, options);

    res.status(200).json({
      orders: orders.docs,
      totalPages: orders.totalPages,
      currentPage: orders.page,
      totalOrders: orders.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

export default router;