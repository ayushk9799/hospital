import express from 'express';
import { Expense } from '../models/Expense.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { Payment } from '../models/Payment.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to get start of day in UTC
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Create a new expense
router.post('/create', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { category, description, amount, date, amountPaid, paymentMethod } = req.body;

    // Ensure only the date is stored (not time)
    const expenseDate = getStartOfDay(date);

    const newExpense = new Expense({
      category,
      description,
      amount,
      amountPaid,
      date: expenseDate,
      createdBy: req.user._id,
      createdByName: req.user.name
    });

    if (amountPaid > 0) {
      const payment = new Payment({
        amount: amountPaid,
        paymentMethod,
        paymentType: { name: 'Expense', id: newExpense._id },
        type: 'Expense',
        createdBy: req.user._id,
        description: description || 'Payment for Expense',
      });
      await payment.save({ session });
      newExpense.payments.push(payment._id);
    }

    const savedExpense = await newExpense.save({ session });

    // Populate the saved expense with payment information
    const populatedExpense = await Expense.findById(savedExpense._id)
      .populate('payments')
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(populatedExpense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: 'Error creating expense',
      error: error.message
    });
  }
});

// Update an existing expense
router.post('/update/:id', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { category, description, amount, date, amountPaid, paymentMethod } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure only the date is stored (not time)
    const expenseDate = date ? getStartOfDay(date) : expense.date;

    // Update expense fields
    expense.category = category || expense.category;
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.date = expenseDate;
    expense.amountPaid = amountPaid || expense.amountPaid;

    // Handle payment update
    if (amountPaid > expense.amountPaid) {
      const additionalPayment = amountPaid - expense.amountPaid;
      const payment = new Payment({
        amount: additionalPayment,
        paymentMethod,
        paymentType: { name: 'Expense', id: expense._id },
        type: 'Expense',
        createdBy: req.user._id,
        description: description || 'Additional Payment for Expense',
      });
      await payment.save({ session });
      expense.payments.push(payment._id);
    }

    const updatedExpense = await expense.save({ session });

    // Populate the updated expense with payment information
    const populatedExpense = await Expense.findById(updatedExpense._id)
      .populate('payments')
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(populatedExpense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: 'Error updating expense',
      error: error.message
    });
  }
});

// Make a payment for an existing expense
router.post('/:id/pay', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { amount, paymentMethod, description } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.amountPaid + amount > expense.amount) {
      return res.status(400).json({ message: 'Payment amount exceeds the remaining balance' });
    }

    const payment = new Payment({
      amount,
      paymentMethod,
      paymentType: { name: 'Expense', id: expense._id },
      type: 'Expense',
      createdBy: req.user._id,
      description: description || 'Payment for Expense',
    });

    await payment.save({ session });

    expense.payments.push(payment._id);
    expense.amountPaid += amount;

    const updatedExpense = await expense.save({ session });

    // Populate the updated expense with payment information
    const populatedExpense = await Expense.findById(updatedExpense._id)
      .populate('payments')
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(populatedExpense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: 'Error making payment for expense',
      error: error.message
    });
  }
});

// Delete an expense
router.delete('/:id', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Delete associated payments
    await Payment.deleteMany({ 'paymentType.id': expense._id }, { session });

    // Delete the expense
    await Expense.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Expense and associated payments deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: 'Error deleting expense',
      error: error.message
    });
  }
});

// Fetch all expenses
router.get('/', verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('payments')
      .sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(400).json({
      message: 'Error fetching expenses',
      error: error.message
    });
  }
});

export default router;