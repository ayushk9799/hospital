import express from "express";
import mongoose from "mongoose";
import { Service } from "../models/Services.js";
import { ServicesBill } from "../models/ServicesBill.js";
import { IPDAdmission } from "../models/IPDAdmission.js";
import { Visit } from "../models/Visits.js";
import { Patient } from "../models/Patient.js";
import { Payment } from "../models/Payment.js";
import { verifyToken, checkPermission } from "../middleware/authMiddleware.js";
import { LabRegistration } from "../models/LabRegistration.js";
import { OPDProcedure } from "../models/OPDProcedure.js";

const router = express.Router();

// Create a new bill of services
router.post("/create-bill", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      services,
      patient,
      patientType,
      totals,
      patientInfo,
      department,
      visitID,
    } = req.body;
    const user = req.user;
    if (!services || !Array.isArray(services)) {
      throw new Error("Invalid services data");
    }

    const bill = {
      ...totals,
      patientType,
      patient,
      services,
      patientInfo,
      department,
      createdBy: user._id,
    };
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
router.post("/update-bill/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { services, totals } = req.body;

    const bill = await ServicesBill.findById(id)
      .populate("payments")
      .session(session);
    if (!bill) {
      throw new Error("Bill not found");
    }
    // Create a map of existing services with their dates
    const existingServiceDates = new Map(
      bill.services.map((service) => [service._id?.toString(), service.date])
    );
    // Update services array while preserving dates for existing services
    if (services && Array.isArray(services)) {
      bill.services = services.map((service) => ({
        ...service,
        // If service exists in old bill, use its date, otherwise use current date
        date: service.isExisting
          ? existingServiceDates.get(service._id?.toString()) || new Date()
          : new Date(),
      }));
    }

    // Update other bill fields
    if (totals) {
      bill.totalAmount = totals.totalAmount;
      bill.subtotal = totals.subtotal;
      bill.additionalDiscount = totals.additionalDiscount;
    }

    await bill.save({ session });

    await session.commitTransaction();
    res.status(200).json(bill);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get all service bills
router.get("/get-bills", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    // Add date range filter if provided
    if (startDate && endDate) {
      query.updatedAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    const bills = await ServicesBill.find(query)
      .sort({ updatedAt: -1 })
      .populate("patient", "name phone registrationNumber age gender address")
      .populate("createdBy", "name")
      .populate("opdProcedure", "procedureName")
      .populate("payments");

    res.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res
      .status(500)
      .json({ message: "Error fetching bills", error: error.message });
  }
});

// Get a specific service bill by ID

// Create or update a service
router.post("/service", async (req, res) => {
  try {
    const { name, category, rate } = req.body;
    if (!name)
      return res.status(400).json({ message: "Name and rate are required" });

    const serviceData = { name, category, rate };
    let service = await Service.findOne({ name });

    if (service) {
      service = await Service.findByIdAndUpdate(service._id, serviceData, {
        new: true,
      });
      res.status(200).json(service);
    } else {
      service = new Service(serviceData);
      await service.save();
      res.status(201).json(service);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find().select("-hospital").lean();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete a service
router.delete("/service/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id).lean();
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a service
router.put("/service/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, rate, subdivisions, isRecurring, recurringLogic } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Create the update object with the basic fields
    const updateData = {
      name,
      category,
      rate: parseFloat(rate),
    };

    // Add subdivisions if provided
    if (subdivisions) {
      updateData.subdivisions = subdivisions;
    }

    // Add recurring fields if isRecurring is true
    if (isRecurring) {
      updateData.isRecurring = true;
      updateData.recurringLogic = recurringLogic;
    } else {
      updateData.isRecurring = false;
      updateData.recurringLogic = undefined;
    }

    // Validate subdivisions if they exist
    if (subdivisions && subdivisions.length > 0) {
      const sumOfRates = subdivisions.reduce(
        (sum, sub) => sum + (sub.rate || 0),
        0
      );
      if (Math.abs(sumOfRates - parseFloat(rate)) >= 0.01) {
        return res.status(400).json({
          message: "Sum of subdivision rates must equal the service rate",
        });
      }
    }

    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a bill
router.delete("/delete-bill/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const bill = await ServicesBill.findById(id).session(session);
    if (!bill) {
      throw new Error("Bill not found");
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
    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Add a new payment to a service bill
router.post("/:id/payments", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, paymentMethod, createdAt } = req.body;
    const user = req.user;

    const bill = await ServicesBill.findById(req.params.id)
      .populate("payments")
      .session(session);
    if (!bill) {
      throw new Error("Bill not found");
    }

    // Ensure amount is a valid number
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Create payment with custom timestamp if provided
    const payment = new Payment({
      amount: paymentAmount,
      paymentMethod,
      associatedInvoiceOrId: bill.invoiceNumber,
      description: bill.patientInfo.name,
      paymentType: {
        name:
          bill.patientType === "Lab"
            ? "Laboratory"
            : bill.patientType || "Services",
        id: bill._id,
      },
      type: "Income",
      createdByName: user.name,
      createdBy: user._id,
    });

    // Set custom timestamp if provided
    if (createdAt) {
      payment.set({ createdAt: new Date(createdAt) });
    }

    await payment.save({ session });
    bill.payments.push(payment._id);

    // Calculate total amount paid
    bill.amountPaid = bill.amountPaid + paymentAmount;
    await bill.save({ session });

    // If this is a Lab bill, update the corresponding LabRegistration record
    if (bill.patientType === "Lab" && bill.labRegistration) {
      const labRegistration = await LabRegistration.findById(
        bill.labRegistration
      ).session(session);

      if (labRegistration) {
        // Update payment information
        labRegistration.paymentInfo.amountPaid =
          (labRegistration.paymentInfo.amountPaid || 0) + paymentAmount;

        // Recalculate balance due
        labRegistration.paymentInfo.balanceDue =
          labRegistration.paymentInfo.totalAmount -
          labRegistration.paymentInfo.additionalDiscount -
          labRegistration.paymentInfo.amountPaid;

        // Add payment to the payments array
        labRegistration.payments.push(payment._id);

        await labRegistration.save({ session });
      }
    }
    if (bill.patientType === "OPD") {
      const visit = await Visit.findById(bill.visit).session(session);
      if (visit) {
        visit.billStatus = "Paid";
        await visit.save({ session });
      }
    }

    const updatedBill = await ServicesBill.findById(bill._id)
      .populate("payments")
      .populate("patient", "name phone registrationNumber age gender address")
      .populate("createdBy", "name")
      .populate("opdProcedure", "procedureName")
      .session(session);

    await session.commitTransaction();
    res.status(200).json(updatedBill);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Create a new OPD Procedure bill
router.post("/create-opd-procedure-bill", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { services, patient, totalAmount, subtotal, patientInfo } = req.body;
    const user = req.user;

    if (!services || !Array.isArray(services)) {
      throw new Error("Invalid services data");
    }

    const opdProcedureBill = new ServicesBill({
      services,
      totalAmount,
      subtotal,
      patientType: "OPD",
      patient,
      patientInfo,

      createdBy: user._id,
    });
    await opdProcedureBill.save({ session });

    await Patient.findByIdAndUpdate(
      patient,
      { $push: { opdProcedureBills: opdProcedureBill._id } },
      { session }
    );
    await session.commitTransaction();
    res.status(201).json(opdProcedureBill);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Add this route handler with your other routes
router.get("/get-bill/:id", verifyToken, async (req, res) => {
  try {
    const bill = await ServicesBill.findById(req.params.id)
      .populate("patient")
      .populate({
        path: "visit",
        populate: {
          path: "doctor",
          select: "name",
        },
      })
      .populate({
        path: "admission",
        populate: {
          path: "assignedDoctor",
          select: "name",
        },
      })
      .populate("payments")
      .populate("createdBy", "name");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route after the "get-bills" route
router.post("/search-invoice", async (req, res) => {
  try {
    const { invoiceNumber } = req.body;
    if (invoiceNumber) {
      const bill = await ServicesBill.findOne({ invoiceNumber: invoiceNumber })
        .populate("patient", "name phone registrationNumber age gender address")
        .populate("createdBy", "name")
        .populate("opdProcedure", "procedureName")
        .populate("payments");
      if (!bill) {
        throw new Error("Bill not found");
      }
      res.status(200).json([bill]);
    } else {
      throw new Error("No invoice Number");
    }
    // Return as array to match get-bills format
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching bill", error: error.message });
  }
});

// Edit payment route - following consistent pattern with other payment routes
router.put("/:billId/payments/:paymentId", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { billId, paymentId } = req.params;
    const { amount, paymentMethod, createdAt } = req.body;

    // Find the bill and payment
    const bill = await ServicesBill.findById(billId)
      .populate("payments")
      .session(session);
    if (!bill) {
      throw new Error("Bill not found");
    }

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Calculate the difference in amount
    const amountDifference = parseFloat(amount) - payment.amount;

    // Update payment details
    payment.amount = parseFloat(amount);
    payment.paymentMethod = paymentMethod;
    if (createdAt) {
      console.log(createdAt);
      payment.set({ createdAt: new Date(createdAt) });
    }

    await payment.save({ session });

    // Update bill's amountPaid
    bill.amountPaid = bill.amountPaid + amountDifference;
    await bill.save({ session });

    // If this is a Lab bill, update the corresponding LabRegistration record
    if (bill.patientType === "Lab" && bill.labRegistration) {
      const labRegistration = await LabRegistration.findById(
        bill.labRegistration
      ).session(session);
      if (labRegistration) {
        // Update payment information
        labRegistration.paymentInfo.amountPaid =
          (labRegistration.paymentInfo.amountPaid || 0) + amountDifference;

        // Recalculate balance due
        labRegistration.paymentInfo.balanceDue =
          labRegistration.paymentInfo.totalAmount -
          labRegistration.paymentInfo.additionalDiscount -
          labRegistration.paymentInfo.amountPaid;

        await labRegistration.save({ session });
      }
    }

    // Get updated bill with populated fields
    const updatedBill = await ServicesBill.findById(billId)
      .populate("payments")
      .populate("patient", "name phone registrationNumber age gender address")
      .populate("createdBy", "name")
      .populate("opdProcedure", "procedureName")
      .session(session);

    await session.commitTransaction();
    res.status(200).json(updatedBill);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Delete payment route
router.delete(
  "/:billId/payments/:paymentId",
  verifyToken,
  checkPermission("delete_payments"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { billId, paymentId } = req.params;

      // Find the bill and payment
      const bill = await ServicesBill.findById(billId)
        .populate("payments")
        .session(session);
      if (!bill) {
        throw new Error("Bill not found");
      }

      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) {
        throw new Error("Payment not found");
      }

      // Remove payment from bill's payments array
      bill.payments = bill.payments.filter(
        (p) => p._id.toString() !== paymentId
      );

      // Update bill's amountPaid
      bill.amountPaid = bill.amountPaid - payment.amount;

      // If this is a Lab bill, update the corresponding LabRegistration record
      if (bill.patientType === "Lab" && bill.labRegistration) {
        const labRegistration = await LabRegistration.findById(
          bill.labRegistration
        ).session(session);
        if (labRegistration) {
          // Update payment information
          labRegistration.paymentInfo.amountPaid =
            (labRegistration.paymentInfo.amountPaid || 0) - payment.amount;

          // Recalculate balance due
          labRegistration.paymentInfo.balanceDue =
            labRegistration.paymentInfo.totalAmount -
            labRegistration.paymentInfo.additionalDiscount -
            labRegistration.paymentInfo.amountPaid;

          // Remove payment from the payments array
          labRegistration.payments = labRegistration.payments.filter(
            (p) => p.toString() !== paymentId
          );

          await labRegistration.save({ session });
        }
      }
      // Update OPD Procedure if it exists
      else if (bill.opdProcedure) {
        const opdProcedure = await OPDProcedure.findById(
          bill.opdProcedure
        ).session(session);
        if (opdProcedure) {
          opdProcedure.amountPaid =
            (opdProcedure.amountPaid || 0) - payment.amount;
          await opdProcedure.save({ session });
        }
      }

      // Delete the payment
      await Payment.findByIdAndDelete(paymentId).session(session);
      await bill.save({ session });

      // Get updated bill with populated fields
      const updatedBill = await ServicesBill.findById(billId)
        .populate("payments")
        .populate("patient", "name phone registrationNumber age gender address")
        .populate("createdBy", "name")
        .populate("opdProcedure", "procedureName")
        .session(session);

      await session.commitTransaction();
      res.status(200).json(updatedBill);
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ message: error.message });
    } finally {
      session.endSession();
    }
  }
);

// Bulk import services (upsert by name)
router.post("/services/bulk", async (req, res) => {
  try {
    const { services } = req.body;
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: "No services provided" });
    }
    const results = [];
    for (const item of services) {
      const { name, category, rate } = item;
      if (!name || typeof rate === "undefined") {
        results.push({
          name,
          status: "error",
          message: "Name and rate are required",
        });
        continue;
      }
      try {
        let service = await Service.findOne({ name });
        if (service) {
          service = await Service.findByIdAndUpdate(
            service._id,
            { name, category, rate },
            { new: true }
          );
          results.push({ name, status: "updated", id: service._id });
        } else {
          service = new Service({ name, category, rate });
          await service.save();
          results.push({ name, status: "inserted", id: service._id });
        }
      } catch (err) {
        results.push({ name, status: "error", message: err.message });
      }
    }
    res.status(200).json({ results });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Bulk import failed", error: error.message });
  }
});

export default router;
