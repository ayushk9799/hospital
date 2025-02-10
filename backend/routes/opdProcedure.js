import express from "express";
import mongoose from "mongoose";
import { OPDProcedure } from "../models/OPDProcedure.js";
import { Payment } from "../models/Payment.js";
import { ServicesBill } from "../models/ServicesBill.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { BillCounter } from "../models/BillCounter.js";
const router = express.Router();
//get all opd procedures
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate && !endDate) {
        dateFilter.createdAt = new Date(startDate);
      } else if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        };
      }
    }

    const opdProcedures = await OPDProcedure.find(dateFilter).populate({
      path: "servicesBill",
      populate: {
        path: "payments",
      },
    });

    res.status(200).json(opdProcedures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  // Start a new session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      registrationNumber,
      ipdNumber,
      gender,
      age,
      contactNumber,
      procedureName,
      totalAmount,
      amountPaid,
      paymentMethod,
      address,
    } = req.body;

    let invoiceNumber = await BillCounter.getNextBillNumber(session);
    // First create the ServicesBill
    const servicesBill = new ServicesBill({
      invoiceNumber: invoiceNumber || null,
      services: [
        {
          name: procedureName,
          quantity: 1,
          rate: totalAmount,
          category: "OPDProcedure",
        },
      ],
      totalAmount: totalAmount,
      subtotal: totalAmount,
      amountPaid: amountPaid,
      patientType: "OPDProcedure",
      patientInfo: {
        name: name,
        phone: contactNumber,
        registrationNumber:registrationNumber,
        age:age,
        ipdNumber:ipdNumber,
        gender:gender,
        address:address
      },
      createdBy: req.user._id,
    });

    // Create OPD Procedure
    const opdProcedure = new OPDProcedure({
      name,
      registrationNumber,
      ipdNumber,
      gender,
      age,
      contactNumber,
      procedureName,
      totalAmount,
      amountPaid,
      address,
      servicesBill: servicesBill._id,
    });
    servicesBill.opdProcedure = opdProcedure._id;
    // Create payment records for each payment method
    const payments = [];
    for (const payment of paymentMethod) {
      const newPayment = new Payment({
        amount: Number(payment.amount),
        paymentMethod: payment.method,
        associatedInvoiceOrId:servicesBill.invoiceNumber,
        paymentType: {
          name: "Services",
          id: servicesBill._id.toString(),
        },
        type: "Income",
        createdByName:req.user?.name,
        description: `${procedureName} for patient ${name}`,
        createdBy: req.user._id,
      });

      // Save payment with session
      await newPayment.save({ session });
      payments.push(newPayment);
      servicesBill.payments.push(newPayment._id);
    }

    // Save the services bill and OPD procedure with session
    await servicesBill.save({ session });
    await opdProcedure.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(201).json({
      message: "OPD Procedure created successfully",
      opdProcedure,
      servicesBill,
      payments,
    });
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();

    res.status(500).json({
      message: "Error creating OPD Procedure",
      error: error.message,
    });
  } finally {
    // End the session
    session.endSession();
  }
});

export default router;
