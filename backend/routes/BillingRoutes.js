import express from 'express';
import mongoose from 'mongoose';
import { Service } from '../models/Services.js';
import { ServicesBill } from '../models/ServicesBill.js';
import { IPDAdmission } from '../models/IPDAdmission.js';
import { Visit } from '../models/Visits.js';
import { Payment } from '../models/Payment.js';

const router = express.Router();

// Create a new bill of services
router.post('/create-bill', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { services, patient, patientType, totals, patientInfo, department, physician, visitID } = req.body;
    if (!services || !Array.isArray(services)) {
      throw new Error('Invalid services data');
    }

    const bill = { ...totals, patientType, patient, services, patientInfo, department, physician };
    const newBill = new ServicesBill(bill);

    if (visitID) {
      const model = patientType === "IPD" ? IPDAdmission : Visit;
      const visit = await model.findById(visitID).session(session);
      if (visit) {
        visit.bills.services.push(newBill._id);
        await visit.save({ session });
      }
    }

    await newBill.save({ session });

    await session.commitTransaction();
    res.status(201).json(newBill);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Update an existing bill
router.post('/update-bill/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { services, totals, patientInfo } = req.body;

    const bill = await ServicesBill.findById(id).session(session);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Update services array
    if (services && Array.isArray(services)) {
      bill.services = services;
    }

    // Update other bill fields
    if (totals) {
      bill.totalAmount = totals.totalAmount;
      bill.subtotal = totals.subtotal;
      bill.additionalDiscount = totals.additionalDiscount;
    }
    bill.patientInfo = patientInfo || bill.patientInfo;

    await bill.save({ session });

    const updatedBill = await ServicesBill.findById(bill._id).populate('payments').session(session);

    await session.commitTransaction();
    res.status(200).json(updatedBill);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get all bills
router.get('/get-bills', async (req, res) => {
  try {
    const bills = await ServicesBill.find().sort({ createdAt: -1 }).populate('payments');
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create or update a service 
router.post('/service', async (req, res) => {
  try {
    const { name, category, rate } = req.body;
    if (!name || !rate) return res.status(400).json({ message: 'Name and rate are required' });

    const serviceData = { name, category, rate };
    let service = await Service.findOne({ name });

    if (service) {
      service = await Service.findByIdAndUpdate(service._id, serviceData, { new: true });
      res.status(200).json(service);
    } else {
      service = new Service(serviceData);
      await service.save();
      res.status(201).json(service);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().select('-hospital');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a service
router.delete('/service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a service
router.put('/service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, rate } = req.body;
    if (!name || !rate) return res.status(400).json({ message: 'Name and rate are required' });

    const updatedService = await Service.findByIdAndUpdate(id, { name, category, rate }, { new: true });
    if (!updatedService) return res.status(404).json({ message: 'Service not found' });

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a bill
router.delete('/delete-bill/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const bill = await ServicesBill.findById(id).session(session);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Remove bill reference from visit/admission if it exists
    if (bill.patientType === "IPD") {
      await IPDAdmission.updateOne(
        { "bills.services": id },
        { $pull: { "bills.services": id } }
      ).session(session);
    } else {
      await Visit.updateOne(
        { "bills.services": id },
        { $pull: { "bills.services": id } }
      ).session(session);
    }

    await ServicesBill.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    res.status(200).json({ message: 'Bill deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Add a new payment to a bill
router.post('/:id/payments', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, paymentMethod } = req.body;
    const bill = await ServicesBill.findById(req.params.id).populate('payments').session(session);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Ensure amount is a valid number
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error('Invalid payment amount');
    }

    const payment = new Payment({
      amount: paymentAmount,
      paymentMethod,
      paymentFor: {name : 'Services', id : bill._id},
      type: 'Income',
      status: 'paid'
    });
    await payment.save({ session });
    bill.payments.push(payment._id);

    // Calculate total amount paid
    bill.amountPaid = bill.amountPaid + paymentAmount;
    await bill.save({ session });

    const updatedBill = await ServicesBill.findById(bill._id).populate('payments').session(session);

    await session.commitTransaction();
    res.status(200).json(updatedBill);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

export default router;
