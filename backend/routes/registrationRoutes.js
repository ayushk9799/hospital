import express from "express";
import { RegistrationNumber } from "../models/RegistrationNumber.js";
import { BillCounter } from "../models/BillCounter.js";
import { PaymentCounter } from "../models/PaymentCounter.js";
import mongoose from "mongoose";

const router = express.Router();

// Get current registration settings for all number types
router.get("/settings", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const [regSettings, billCounter, paymentCounter, ipdCounter, labCounter] = await Promise.all([
      RegistrationNumber.findOne({ year: currentYear }),
      BillCounter.findOne({ year: currentYear }),
      PaymentCounter.findOne({ year: currentYear }),
      mongoose.model("IPDCounter").findOne({ year: currentYear }),
      mongoose.model("LabCounter").findOne({ year: currentYear })
    ]);

    res.json({
      registration: {
        prefix: regSettings?.prefix || "",
        useYearSuffix: regSettings?.useYearSuffix ?? true,
        sequence: regSettings?.sequence ?? 0
      },
      ipd: {
        prefix: ipdCounter?.prefix || "IPD",
        useYearSuffix: ipdCounter?.useYearSuffix ?? true,
        sequence: ipdCounter?.sequence ?? 0
      },
      lab: {
        prefix: labCounter?.prefix || "LAB",
        useYearSuffix: labCounter?.useYearSuffix ?? true,
        sequence: labCounter?.sequence ?? 0
      },
      invoice: {
        prefix: billCounter?.prefix || "INV",
        useYearSuffix: billCounter?.useYearSuffix ?? true,
        sequence: billCounter?.lastNumber ?? 0
      },
      payment: {
        prefix: paymentCounter?.prefix || "PAY",
        useYearSuffix: paymentCounter?.useYearSuffix ?? true,
        sequence: paymentCounter?.sequence ?? 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update registration settings for all number types
router.post("/settings", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { registration, ipd, lab, invoice, payment } = req.body;
    const currentYear = new Date().getFullYear();

    // Update registration number settings
    await RegistrationNumber.findOneAndUpdate(
      { year: currentYear },
      { 
        prefix: registration.prefix,
        useYearSuffix: registration.useYearSuffix,
        sequence: parseInt(registration.sequence) || 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );

    // Update IPD counter
    await mongoose.model("IPDCounter").findOneAndUpdate(
      { year: currentYear },
      { 
        prefix: ipd.prefix || "IPD",
        useYearSuffix: ipd.useYearSuffix,
        sequence: parseInt(ipd.sequence) || 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );

    // Update Lab counter
    await mongoose.model("LabCounter").findOneAndUpdate(
      { year: currentYear },
      { 
        prefix: lab.prefix || "LAB",
        useYearSuffix: lab.useYearSuffix,
        sequence: parseInt(lab.sequence) || 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );

    // Update Bill counter
    await BillCounter.findOneAndUpdate(
      { year: currentYear },
      { 
        prefix: invoice.prefix || "INV",
        useYearSuffix: invoice.useYearSuffix,
        lastNumber: parseInt(invoice.sequence) || 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );

    // Update Payment counter
    await PaymentCounter.findOneAndUpdate(
      { year: currentYear },
      { 
        prefix: payment.prefix || "PAY",
        useYearSuffix: payment.useYearSuffix,
        sequence: parseInt(payment.sequence) || 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );

    await session.commitTransaction();
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Failed to update settings" });
  } finally {
    session.endSession();
  }
});

export default router;
