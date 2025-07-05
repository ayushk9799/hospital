import express from "express";
import { Expense } from "../models/Expense.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { Payment } from "../models/Payment.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper function to get start of day in UTC
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Create a new expense
router.post("/create", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { category, description, amount, date, amountPaid, paymentMethod } =
      req.body;

    // Ensure only the date is stored (not time)
    const expenseDate = getStartOfDay(date);
    const now = new Date();
    const combinedDateTime = new Date(
      expenseDate.getFullYear(),
      expenseDate.getMonth(),
      expenseDate.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    const newExpense = new Expense({
      category,
      description,
      amount,
      amountPaid,
      date: expenseDate,
      createdBy: req.user?._id,
      createdByName: req.user?.name,
    });

    if (amountPaid > 0) {
      const payment = new Payment({
        amount: amountPaid,
        associatedInvoiceOrId: newExpense._id,
        paymentMethod,
        paymentType: { name: "Expense", id: newExpense._id },
        type: "Expense",
        createdByName: req.user?.name,
        createdBy: req.user._id,
        description: category + " paid to " + description || "Payment for Expense",
        createdAt: combinedDateTime
      });
      await payment.save({ session });
      newExpense.payments.push(payment._id);
    }

    const savedExpense = await newExpense.save({ session });

    // Populate the saved expense with payment information
    const populatedExpense = await Expense.findById(savedExpense._id)
      .populate("payments")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(populatedExpense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: "Error creating expense",
      error: error.message,
    });
  }
});

// Update an existing expense
router.post("/update/:id", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { category, description, amount, date, amountPaid, paymentMethod } =
      req.body;

    const expense = await Expense.findById(id).session(session);

    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Expense not found" });
    }

    // Delete existing payments associated with the expense
    if (expense.payments && expense.payments.length > 0) {
      await Payment.deleteMany({ _id: { $in: expense.payments } }, { session });
    }

    // Ensure only the date is stored (not time)
    const expenseDate = getStartOfDay(date);
    const now = new Date();
    const combinedDateTime = new Date(
      expenseDate.getFullYear(),
      expenseDate.getMonth(),
      expenseDate.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    // Update expense fields
    expense.category = category || expense.category;
    expense.description = description || expense.description;
    expense.amount = amount;
    expense.date = expenseDate;
    expense.amountPaid = amountPaid;
    expense.payments = []; // Reset payments array

    // Create a new payment if amountPaid > 0
    if (amountPaid > 0) {
      const payment = new Payment({
        amount: amountPaid,
        paymentMethod,
        associatedInvoiceOrId: expense._id,
        paymentType: { name: "Expense", id: expense._id },
        type: "Expense",
        createdByName: req.user?.name,
        createdBy: req.user._id,
        description:
          `${category} paid to ${description}` || "Payment for Expense",
        createdAt: combinedDateTime,
      });
      await payment.save({ session });
      expense.payments.push(payment._id);
    }

    const updatedExpense = await expense.save({ session });

    // Populate the updated expense with payment information
    const populatedExpense = await Expense.findById(updatedExpense._id)
      .populate("payments")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(populatedExpense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: "Error updating expense",
      error: error.message,
    });
  }
});

// Make a payment for an existing expense
router.post("/:id/pay", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { amount, paymentMethod, description } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.amountPaid + amount > expense.amount) {
      return res
        .status(400)
        .json({ message: "Payment amount exceeds the remaining balance" });
    }

    const expenseDate = new Date(expense.date);
    const now = new Date();
    const combinedDateTime = new Date(
      expenseDate.getFullYear(),
      expenseDate.getMonth(),
      expenseDate.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    const payment = new Payment({
      amount,
      paymentMethod,
      paymentType: { name: "Expense", id: expense._id },
      type: "Expense",
      createdByName: req.user?.name,
      createdBy: req.user._id,
      description: description || "Payment for Expense",
      createdAt: combinedDateTime
    });

    await payment.save({ session });

    expense.payments.push(payment._id);
    expense.amountPaid += amount;

    const updatedExpense = await expense.save({ session });

    // Populate the updated expense with payment information
    const populatedExpense = await Expense.findById(updatedExpense._id)
      .populate("payments")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(populatedExpense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: "Error making payment for expense",
      error: error.message,
    });
  }
});

// Delete an expense
router.delete("/:id", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Delete associated payments
    await Payment.deleteMany({ "paymentType.id": expense._id }, { session });

    // Delete the expense
    await Expense.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Expense and associated payments deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: "Error deleting expense",
      error: error.message,
    });
  }
});

// Fetch all expenses
router.get("/", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    // Build date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate && !endDate) {
        // If only startDate is provided, search from start of startDate to start of next day
        let nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = {
          $gte: new Date(startDate),
          $lt: nextDay,
        };
      } else if (startDate && endDate) {
        // If both dates are provided, use gte and lt
        query.date = {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        };
      }
    }

    const expenses = await Expense.find(query)
      .populate("payments")
      .sort({ date: -1, _id: -1 })
      .lean();

    res.status(200).json(expenses);
  } catch (error) {
    res.status(400).json({
      message: "Error fetching expenses",
      error: error.message,
    });
  }
});

export default router;
