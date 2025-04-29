import express from "express";
import mongoose from "mongoose";
import { Payment } from "../models/Payment.js";
import { ServicesBill } from "../models/ServicesBill.js";
import { Order } from "../models/Order.js";
import { PharmacyBill } from "../models/PharmacyBill.js";
import { Supplier } from "../models/Supplier.js";
import { LabRegistration } from "../models/LabRegistration.js";
import { Expense } from "../models/Expense.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get filtered payments
router.get("/filter", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      hospitalId: req.user.hospitalId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.json(payments);
  } catch (error) {
    console.error("Error fetching filtered payments:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch payments", error: error.message });
  }
});

// Get payment statistics
router.get("/statistics", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      hospitalId: req.user.hospitalId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const [income, expense] = await Promise.all([
      Payment.aggregate([
        { $match: { ...query, type: "Income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { ...query, type: "Expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      income: income[0]?.total || 0,
      expense: expense[0]?.total || 0,
      net: (income[0]?.total || 0) - (expense[0]?.total || 0),
    });
  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch statistics", error: error.message });
  }
});

// DELETE a specific payment
router.delete("/:paymentId", verifyToken, async (req, res) => {
  const { paymentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({ message: "Invalid Payment ID" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({
      _id: paymentId,
    }).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Payment not found" });
    }
    const amount = payment.amount || 0;
    const associatedId = payment.associatedInvoiceOrId;
    const paymentIdObj = new mongoose.Types.ObjectId(paymentId);
    const paymentType = payment.paymentType?.name;

    // Update related documents based on paymentType and associatedId
    if (associatedId) {
      switch (paymentType) {
        case "Pharmacy":
          if (associatedId) {
            await PharmacyBill.updateOne(
              { invoiceNumber: associatedId },
              { $inc: { amountPaid: -amount }, $unset: { payment: "" } },
              { session }
            );
          }
          break;
        case "Services":
        case "IPD":
        case "OPD":
        case "OPDProcedure":
        case "IPDProcedure":
          await ServicesBill.updateOne(
            {
              invoiceNumber: associatedId,
            },
            {
              $inc: { amountPaid: -amount },
              $pull: { payments: paymentIdObj },
            },
            { session }
          );
          break;
        case "Expense":
        case "Employee":
          if (associatedId) {
            await Expense.updateOne(
              { _id: associatedId },
              {
                $inc: { amountPaid: -amount },
                $pull: { payments: paymentIdObj },
              },
              { session }
            );
          }
          break;
        case "Laboratory":
          if (associatedId) {
            const labReg = await LabRegistration.findOne({
              invoiceNumber: associatedId,
            }).session(session);
            if (labReg) {
              labReg.paymentInfo.amountPaid =
                (labReg.paymentInfo.amountPaid || 0) - amount;
              labReg.payments.pull(paymentIdObj);
              labReg.paymentInfo.balanceDue =
                labReg.paymentInfo.totalAmount -
                (labReg.paymentInfo.additionalDiscount || 0) -
                labReg.paymentInfo.amountPaid;
              await labReg.save({ session });
            }
          }
          break;
        case "Other":
          console.warn(
            `Payment ${paymentId} has type 'Other'. Associated document link ${associatedId} might need manual handling.`
          );
          break;
        default:
          console.warn(
            `Unhandled payment type ${paymentType} for payment ${paymentId} with associated ID ${associatedId}`
          );
      }
    }

    // Fallback checks for Order and Supplier
    await Order.updateOne(
      { payment: paymentIdObj },
      { $inc: { paidAmount: -amount }, $unset: { payment: "" } },
      { session }
    );

    await Supplier.updateOne(
      { payments: paymentIdObj },
      { $inc: { amountPaid: -amount }, $pull: { payments: paymentIdObj } },
      { session }
    );

    // Finally, delete the payment document
    await Payment.deleteOne({ _id: paymentIdObj }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Payment deleted successfully",
      deletedPaymentId: paymentId,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting payment:", error);
    res
      .status(500)
      .json({ message: "Failed to delete payment", error: error.message });
  }
});

export default router;
