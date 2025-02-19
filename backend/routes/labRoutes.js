import express from "express";
import { LabRegistration } from "../models/LabRegistration.js";
import { Patient } from "../models/Patient.js";
import { ServicesBill } from "../models/ServicesBill.js";
import { BillCounter } from "../models/BillCounter.js";
import { Payment } from "../models/Payment.js";
import { verifyToken, checkPermission } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
import { Visit } from "../models/Visits.js";
import { IPDAdmission } from "../models/IPDAdmission.js";

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
      lastVisitType,
      lastVisit,
      lastVisitId,
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
      lastVisitType: lastVisitType,
      lastVisit: lastVisit,
      lastVisitId: lastVisitId,
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
    labRegistration.billDetails = {
      invoiceNumber,
      billId: bill._id,
    };
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

// Add lab report
router.post("/addLabReport", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { labReport, component } = req.body;

    // Handle Discharge Summary case
    if (component === "DischargeSummary") {
      let registration = await IPDAdmission.findOne({
        _id: req.body._id,
      }).session(session);
      if (!registration) {
        throw new Error("IPD admission not found");
      }

      let existingReportIndex = registration.labReports.findIndex(
        (report) =>
          report.name === labReport.name &&
          report.date.toISOString().split("T")[0] === labReport.date
      );

      if (existingReportIndex !== -1) {
        registration.labReports[existingReportIndex] = {
          ...registration.labReports[existingReportIndex],
          ...labReport,
        };
      } else {
        registration.labReports.push(labReport);
      }

      await registration.save({ session });
      await session.commitTransaction();

      return res.json({
        success: true,
        visit: registration,
        message: "Lab report added successfully",
      });
    }

    // Handle regular Lab Registration case
    const registration = await LabRegistration.findOne({
      _id: req.body._id,
    }).session(session);

    if (!registration) {
      throw new Error("Lab registration not found");
    }

    // Add lab report to registration
    const existingReportIndex = registration.labReports.findIndex(
      (report) =>
        report.name === labReport.name &&
        report.date.toISOString().split("T")[0] === labReport.date
    );

    if (existingReportIndex !== -1) {
      registration.labReports[existingReportIndex] = {
        ...registration.labReports[existingReportIndex],
        ...labReport,
      };
      registration.labReports[existingReportIndex].reportStatus = "Completed";

      // Update corresponding lab test status
      const testIndex = registration.labTests.findIndex(
        (test) => test.name === labReport.name
      );
      if (testIndex !== -1) {
        registration.labTests[testIndex].reportStatus = "Completed";
      }
    } else {
      registration.labReports.push({ ...labReport, reportStatus: "Completed" });

      // Update corresponding lab test status
      const testIndex = registration.labTests.findIndex(
        (test) => test.name === labReport.name
      );
      if (testIndex !== -1) {
        registration.labTests[testIndex].reportStatus = "Completed";
      }
    }

    // Find and update corresponding record
    let correspondingRecord;
    if (registration.lastVisitType === "OPD") {
      correspondingRecord = await Visit.findById(
        registration.lastVisitId
      ).session(session);
    } else if (registration.lastVisitType === "IPD") {
      correspondingRecord = await IPDAdmission.findById(
        registration.lastVisitId
      ).session(session);
    }

    if (correspondingRecord) {
      if (!correspondingRecord.labReports) {
        correspondingRecord.labReports = [];
      }

      const existingReportIndex = correspondingRecord.labReports.findIndex(
        (report) =>
          report.name === labReport.name &&
          report.date.toISOString().split("T")[0] === labReport.date
      );

      if (existingReportIndex !== -1) {
        correspondingRecord.labReports[existingReportIndex] = {
          ...correspondingRecord.labReports[existingReportIndex],
          ...labReport,
        };
      } else {
        correspondingRecord.labReports.push(labReport);
      }

      await correspondingRecord.save({ session });
    }

    // Update overall registration status
    const allTestsCompleted = registration.labTests.every(
      (test) => test.reportStatus === "Completed"
    );
    if (allTestsCompleted) {
      registration.status = "Completed";
    } else {
      registration.status = "In Progress";
    }

    await registration.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      registration,
      message: "Lab report added successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
});

// Get lab reports
router.get("/lab-reports/:labNumber", verifyToken, async (req, res) => {
  try {
    const registration = await LabRegistration.findOne({
      labNumber: req.params.labNumber,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Lab registration not found",
      });
    }

    // Get reports from both registration and corresponding record
    let correspondingReports = [];
    if (registration.lastVisitType === "OPD") {
      const visit = await Visit.findById(registration.lastVisitId);
      if (visit) {
        correspondingReports = visit.labReports || [];
      }
    } else if (registration.lastVisitType === "IPD") {
      const admission = await IPDAdmission.findById(registration.lastVisitId);
      if (admission) {
        correspondingReports = admission.labReports || [];
      }
    }

    res.json({
      success: true,
      labReports: registration.labReports,
      correspondingReports,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    const { searchQuery } = req.body;
    let query = {
      $or: [
        { labNumber: new RegExp(searchQuery, "i") },
        { registrationNumber: new RegExp(searchQuery, "i") },
        { contactNumber: new RegExp(searchQuery, "i") },
      ],
    };

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

// Update lab test status
router.put("/update-test-status", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { registrationId, testName, newStatus } = req.body;

    const registration = await LabRegistration.findById(registrationId).session(
      session
    );
    if (!registration) {
      throw new Error("Lab registration not found");
    }

    // Update test status in labTests array
    const testIndex = registration.labTests.findIndex(
      (test) => test.name === testName
    );
    if (testIndex === -1) {
      throw new Error("Test not found");
    }

    registration.labTests[testIndex].reportStatus = newStatus;

    // Update corresponding lab report if it exists
    const reportIndex = registration.labReports.findIndex(
      (report) => report.name === testName
    );
    if (reportIndex !== -1) {
      registration.labReports[reportIndex].reportStatus = newStatus;
    }

    // Update overall status based on all test statuses
    const allTestsCompleted = registration.labTests.every(
      (test) => test.reportStatus === "Completed"
    );
    const hasInProgress = registration.labTests.some(
      (test) => test.reportStatus === "Sample Collected"
    );

    if (allTestsCompleted) {
      registration.status = "Completed";
    } else if (hasInProgress) {
      registration.status = "In Progress";
    } else {
      registration.status = "Registered";
    }

    await registration.save({ session });

    // Update corresponding record (OPD/IPD) if it exists
    if (registration.lastVisitId) {
      const Model = registration.lastVisitType === "OPD" ? Visit : IPDAdmission;
      const record = await Model.findById(registration.lastVisitId).session(
        session
      );

      if (record) {
        const recordTestIndex = record.labTests?.findIndex(
          (test) => test.name === testName
        );
        if (recordTestIndex !== -1) {
          record.labTests[recordTestIndex].reportStatus = newStatus;
        }

        const recordReportIndex = record.labReports?.findIndex(
          (report) => report.name === testName
        );
        if (recordReportIndex !== -1) {
          record.labReports[recordReportIndex].reportStatus = newStatus;
        }

        await record.save({ session });
      }
    }

    await session.commitTransaction();
    res.json({
      success: true,
      registration,
      message: "Test status updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
});

// Add payment to lab registration
router.post("/:id/payment", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { method, amount } = req.body;
    const user = req.user;

    const labRegistration = await LabRegistration.findById(id).session(session);
    if (!labRegistration) {
      throw new Error("Lab registration not found");
    }

    // Create payment record
    const payment = new Payment({
      amount: parseFloat(amount),
      paymentMethod: method,
      paymentType: { name: "Laboratory", id: labRegistration._id },
      type: "Income",
      createdBy: user._id,
      associatedInvoiceOrId: labRegistration.invoiceNumber,
    });

    await payment.save({ session });

    // Update lab registration payment info
    labRegistration.paymentInfo.paymentMethod.push({
      method,
      amount: parseFloat(amount),
    });

    labRegistration.paymentInfo.amountPaid =
      (labRegistration.paymentInfo.amountPaid || 0) + parseFloat(amount);

    labRegistration.paymentInfo.balanceDue =
      labRegistration.paymentInfo.totalAmount -
      labRegistration.paymentInfo.amountPaid;

    await labRegistration.save({ session });
    // Update services bill if it exists
    const bill = await ServicesBill.findOne({
      invoiceNumber: labRegistration.billDetails?.invoiceNumber,
    }).session(session);
    if (bill) {
      bill.amountPaid = (bill.amountPaid || 0) + parseFloat(amount);
      bill.payments.push(payment._id);
      await bill.save({ session });
    }

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      labRegistration,
      payment,
      message: "Payment added successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding payment:", error);
    res.status(500).json({
      success: false,
      message: "Error adding payment",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

export default router;
