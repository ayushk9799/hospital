import express from "express";
import { LabRegistration } from "../models/LabRegistration.js";
import { Patient } from "../models/Patient.js";
import { ServicesBill } from "../models/ServicesBill.js";
import { BillCounter } from "../models/BillCounter.js";
import { Payment } from "../models/Payment.js";
import { verifyToken, checkPermission } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// Register a new lab test
router.post("/register", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      age,
      gender,
      contactNumber,
      address,
      registrationNumber,
      labTests,
      paymentInfo,
      referredBy,
      department,
      notes,
      bookingDate,
    } = req.body;

    const user = req.user;

    // Generate lab number
    const labNumber = await LabRegistration.getNextLabNumber(session);

    // Create lab registration
    const labRegistration = new LabRegistration({
      patientName: name,
      age,
      gender,
      contactNumber,
      address,
      registrationNumber,
      labNumber,
      labTests: labTests.map((test) => ({
        name: test.name,
        category: test.category,
        price: test.price,
      })),
      paymentInfo: {
        totalAmount: paymentInfo.totalAmount,
        amountPaid: paymentInfo.amountPaid,
        paymentMethod: paymentInfo.paymentMethod,
        additionalDiscount: paymentInfo.additionalDiscount,
      },
      referredBy,
      department,
      notes,
      bookingDate: bookingDate || new Date(),
    });

    // Create services bill
    let invoiceNumber = await BillCounter.getNextBillNumber(session);
    const bill = new ServicesBill({
      invoiceNumber,
      services: labTests.map((test) => ({
        name: test.name,
        quantity: 1,
        rate: test.price,
        category: "Laboratory",
      })),
      totalAmount: paymentInfo.totalAmount,
      subtotal: paymentInfo.totalAmount + (paymentInfo.additionalDiscount || 0),
      additionalDiscount: paymentInfo.additionalDiscount || 0,
      amountPaid: paymentInfo.amountPaid || 0,
      patientType: "Lab",
      patientInfo: {
        name,
        phone: contactNumber,
        registrationNumber,
        age,
        gender,
        address,
      },
      createdBy: user._id,
    });

    // Create payment records if payment is made
    if (paymentInfo.paymentMethod?.length > 0 && paymentInfo.amountPaid > 0) {
      await Promise.all(
        paymentInfo.paymentMethod.map(async (pm) => {
          const payment = new Payment({
            amount: pm.amount,
            paymentMethod: pm.method,
            paymentType: { name: "Laboratory", id: bill._id },
            type: "Income",
            createdBy: user._id,
          });
          await payment.save({ session });
          bill.payments.push(payment._id);
        })
      );
    }

    await bill.save({ session });
    await labRegistration.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      labRegistration,
      bill,
      message: "Lab registration completed successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
});

// Get lab registrations by date range
router.get("/registrations", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status) {
      query.status = status;
    }

    const registrations = await LabRegistration.find(query)
      .sort({ bookingDate: -1 })
      .populate("referredBy", "name")
      .populate("patient", "name age gender contactNumber address");

    res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific lab registration
router.get("/registration/:labNumber", verifyToken, async (req, res) => {
  try {
    const registration = await LabRegistration.findOne({
      labNumber: req.params.labNumber,
    })
      .populate("referredBy", "name")
      .populate("patient", "name age gender contactNumber address");

    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Lab registration not found" });
    }

    res.json({
      success: true,
      registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update lab test results
router.put("/update-results/:labNumber", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { testResults } = req.body;
    const registration = await LabRegistration.findOne({
      labNumber: req.params.labNumber,
    }).session(session);

    if (!registration) {
      throw new Error("Lab registration not found");
    }

    // Update test results
    testResults.forEach((result) => {
      const test = registration.labTests.find((t) => t.name === result.name);
      if (test) {
        test.result = result.result;
        test.reportStatus = "Completed";
        test.reportDate = new Date();
        test.normalRange = result.normalRange;
        test.units = result.units;
      }
    });

    // Update overall status if all tests are completed
    const allCompleted = registration.labTests.every(
      (test) => test.reportStatus === "Completed"
    );
    if (allCompleted) {
      registration.status = "Completed";
    } else {
      registration.status = "In Progress";
    }

    await registration.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      registration,
      message: "Test results updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
});

// Get pending lab tests
router.get("/pending-tests", verifyToken, async (req, res) => {
  try {
    const registrations = await LabRegistration.find({
      status: { $in: ["Registered", "In Progress"] },
    })
      .sort({ bookingDate: 1 })
      .populate("referredBy", "name")
      .populate("patient", "name age gender contactNumber");

    res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search lab registrations
router.post("/search", verifyToken, async (req, res) => {
  try {
    const { searchType, searchQuery } = req.body;
    let query = {};

    switch (searchType) {
      case "labNumber":
        query.labNumber = new RegExp(searchQuery, "i");
        break;
      case "patientName":
        query.patientName = new RegExp(searchQuery, "i");
        break;
      case "registrationNumber":
        query.registrationNumber = new RegExp(searchQuery, "i");
        break;
      case "contactNumber":
        query.contactNumber = searchQuery;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid search type" });
    }

    const registrations = await LabRegistration.find(query)
      .sort({ bookingDate: -1 })
      .populate("referredBy", "name")
      .populate("patient", "name age gender contactNumber");

    res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
