import express from 'express';
import { PharmacyBill } from '../models/PharmacyBill.js';
import { Payment } from '../models/Payment.js';
import { Inventory } from '../models/Inventory.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/create-sales-bill', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { patient, patientInfo, buyerName, items, paymentMethod, totals } = req.body;
        
        // Create payment
        const payment = new Payment({
            amount: totals.totalAmount,
            paymentMethod : paymentMethod === 'Due' ? '' : paymentMethod,
            paymentFrom: 'pharmacy',
            type: 'Income',
            status: paymentMethod === 'Due' ? 'due' : 'paid',
        });
        await payment.save({ session });

        // Create pharmacy bill
        const newPharmacyBill = new PharmacyBill({
            patient,
            patientInfo,
            buyerName,
            items,
            ...totals,
            payment: payment._id,
        });
        await newPharmacyBill.save({ session });

        // Update inventory quantities
        for (const item of items) {
            await Inventory.findByIdAndUpdate(
                item.item,
                { $inc: { quantity: -item.quantity } },
                { session, new: true }
            );
        }

        await session.commitTransaction();

        // Populate the newPharmacyBill before sending the response
        const populatedBill = await PharmacyBill.findById(newPharmacyBill._id)
            .populate('payment', 'amount paymentMethod status')
            .populate('items.item', 'name type');

        res.status(201).json(populatedBill);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
});

// New route to get all sales bills
router.get('/sales-bills', async (req, res) => {
    try {
        const salesBills = await PharmacyBill.find()
            .sort({ createdAt: -1 }) // Sort in descending order
            .populate('payment', 'amount paymentMethod status')
            .populate('items.item', 'name type');
        res.status(200).json(salesBills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// New route to edit inventory items
router.post('/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedItem = await Inventory.findByIdAndUpdate(id, updateData, { new: true })
            .populate('supplier', 'name'); // Populate the supplier field with the name

        if (!updatedItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;