import express from "express";
import { Patient } from "../models/Patient.js";
import { Room } from "../models/Room.js";
import { Visit } from "../models/Visits.js";
import { IPDAdmission } from "../models/IPDAdmission.js";
import { ServicesBill } from "../models/ServicesBill.js";
import { BillCounter } from "../models/BillCounter.js";
import { getHospitalId } from "../utils/asyncLocalStorage.js";
import { Service } from "../models/Services.js";
import { Payment } from "../models/Payment.js";
import { Template } from "../models/Template.js";
import { checkPermission, verifyToken } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
import { RegistrationNumber } from "../models/RegistrationNumber.js";

const router = express.Router();

// Add this route near the top of the file, before any parameterized routes
router.get("/registration-ipd-numbers", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get next registration number
    const registrationNumber =
      await RegistrationNumber.getCurrentRegistrationNumber(session);

    // Get next IPD number
    const ipdNumber = await IPDAdmission.getCurrentIPDNumber(session);

    await session.commitTransaction();

    res.json({
      registrationNumber,
      ipdNumber,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Move this route BEFORE any routes with parameters (/:id)
router.get("/admittedpatients", verifyToken, async (req, res) => {
  try {
    const admittedPatients = await IPDAdmission.find({ status: "Admitted" })
      .populate({
        path: "assignedRoom",
        model: "Room",
      })
      .populate({
        path: "patient",
        model: "Patient",
      })
      .populate({
        path: "bills.services",
        populate: {
          path: "payments",
        },
      })
      .populate({
        path: "bills.pharmacy",
        populate: {
          path: "payments",
        },
      });

    // Calculate financial details for each patient
    const patientsWithBillDetails = admittedPatients.map((admission) => {
      let totalAmount = 0;
      let amountPaid = 0;

      // Calculate from service bills
      if (admission.bills && admission.bills.services) {
        admission.bills.services.forEach((bill) => {
          totalAmount += bill.totalAmount || 0;
          amountPaid += bill.payments.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          );
        });
      }

      // Calculate from pharmacy bills
      if (admission.bills && admission.bills.pharmacy) {
        admission.bills.pharmacy.forEach((bill) => {
          totalAmount += bill.totalAmount || 0;
          amountPaid += bill.payments.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          );
        });
      }

      // Convert mongoose document to plain object and spread its properties
      const plainAdmission = admission.toObject();

      return {
        ...plainAdmission, // This will now properly spread all admission fields
        _id: admission._id,
        patient: {
          name: admission.patientName,
          registrationNumber: admission.registrationNumber,
          ipdNumber: admission.ipdNumber,
          ...plainAdmission.patient,
        },
        admissionDate: admission.bookingDate,
        operationName: admission.operationName,
        totalAmount,
        amountPaid,
        amountDue: totalAmount - amountPaid,
        status: admission.status,
        bills: {
          services: admission.bills?.services || [],
          pharmacy: admission.bills?.pharmacy || [],
        },
      };
    });

    res.json(patientsWithBillDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/admittedpatientsSearch", verifyToken, async (req, res) => {
  try {
    const { searchQuery } = req.body;
    const admittedPatients = await IPDAdmission.find({
      registrationNumber: searchQuery,
    })
      .populate({
        path: "assignedRoom",
        model: "Room",
      })
      .populate({
        path: "patient",
        model: "Patient",
      })
      .populate({
        path: "bills.services",
        populate: {
          path: "payments",
        },
      })
      .populate({
        path: "bills.pharmacy",
        populate: {
          path: "payments",
        },
      });

    // Calculate financial details for each patient
    const patientsWithBillDetails = admittedPatients.map((admission) => {
      let totalAmount = 0;
      let amountPaid = 0;

      // Calculate from service bills
      if (admission.bills && admission.bills.services) {
        admission.bills.services.forEach((bill) => {
          totalAmount += bill.totalAmount || 0;
          amountPaid += bill.payments.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          );
        });
      }

      // Calculate from pharmacy bills
      if (admission.bills && admission.bills.pharmacy) {
        admission.bills.pharmacy.forEach((bill) => {
          totalAmount += bill.totalAmount || 0;
          amountPaid += bill.payments.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          );
        });
      }

      // Convert mongoose document to plain object and spread its properties
      const plainAdmission = admission.toObject();

      return {
        ...plainAdmission, // This will now properly spread all admission fields
        _id: admission._id,
        patient: {
          name: admission.patientName,
          registrationNumber: admission.registrationNumber,
          ipdNumber: admission.ipdNumber,
          ...plainAdmission.patient,
        },
        admissionDate: admission.bookingDate,
        operationName: admission.operationName,
        totalAmount,
        amountPaid,
        amountDue: totalAmount - amountPaid,
        status: admission.status,
        bills: {
          services: admission.bills?.services || [],
          pharmacy: admission.bills?.pharmacy || [],
        },
      };
    });

    res.json(patientsWithBillDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AFTER that, put your parameterized routes
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate({
        path: "visits",
        populate: {
          path: "bills.services bills.pharmacy",
          populate: {
            path: "payments",
            model: "Payment",
          },
        },
      })
      .populate({
        path: "admissionDetails",
        populate: {
          path: "bills.services bills.pharmacy",
          populate: {
            path: "payments",
            model: "Payment",
          },
        },
      });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new patient (All authenticated staff)
router.post(
  "/",
  verifyToken,
  checkPermission("create_patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        patientType,
        visit,
        admission,
        paymentInfo,
        upgradegenReg,
        upgradegenIpd,
        ...patientData
      } = req.body;
      const user = req.user;

      if (!patientType || !["OPD", "IPD"].includes(patientType)) {
        throw new Error("Invalid or missing patient type");
      }

      if (upgradegenReg) {
        let registrationNumber =
          await RegistrationNumber.getNextRegistrationNumber(session);

        if (!patientData.registrationNumber) {
          patientData.registrationNumber = registrationNumber;
        }
      }
      if (upgradegenIpd) {
        let ipdNumber = await IPDAdmission.getNextIpdNumber(session);

        if (!admission.ipdNumber) {
          admission.ipdNumber = ipdNumber;
        }
      }

      const patient = new Patient({
        ...patientData,
        registrationNumber: patientData.registrationNumber,
        patientType: patientType,
      });
      await patient.save({ session });

      let admissionRecord, bill;
      let payment = [];
      if (patientType === "OPD") {
        if (!visit) {
          throw new Error("Visit details are required for OPD patients");
        }

        // Create visit record
        admissionRecord = new Visit({
          ...visit,
          patient: patient._id,
          patientName: patient.name,
          contactNumber: patient.contactNumber,
          registrationNumber: patient.registrationNumber,
          doctor: visit.doctor || null,
        });

        // Create bill
        const totalFee = Number(visit.totalFee) || 0;
        const discount = Number(visit.discount) || 0;
        const amountPaid = Number(visit.amountPaid) || 0;
        let invoiceNumber = await BillCounter.getNextBillNumber(session);
        bill = new ServicesBill({
          invoiceNumber: invoiceNumber || null,
          services: [
            {
              name: "Consultation Fee",
              quantity: 1,
              rate: totalFee,
              category: "Consultation",
            },
          ],
          patient: patient._id,
          patientInfo: {
            name: patient.name,
            phone: patient?.contactNumber,
            registrationNumber: patient.registrationNumber,
          },
          totalAmount: totalFee - discount,
          subtotal: totalFee,
          additionalDiscount: discount,
          amountPaid: amountPaid,
          patientType: "OPD",
          createdBy: user._id,
          visit: admissionRecord._id,
        });

        if (
          visit.paymentMethod &&
          visit.paymentMethod !== "Due" &&
          amountPaid > 0
        ) {
          await Promise.all(
            visit.paymentMethod.map(async (pm) => {
              let payments = new Payment({
                amount: pm.amount,
                paymentMethod: pm.method,
                paymentType: { name: "Services", id: bill._id },
                type: "Income",
                createdBy: user._id,
              });
              await payments.save({ session });
              bill.payments.push(payments._id);
              payment.push(payments);
            })
          );
        }

        await bill.save({ session });

        // Link bill to visit and patient
        admissionRecord.bills.services.push(bill._id);
        patient.visits.push(admissionRecord._id);

        await admissionRecord.save({ session });
        await patient.save({ session });
      } else if (patientType === "IPD") {
        if (!admission) {
          throw new Error("Admission details are required for IPD patients");
        }

        // Create IPD admission
        admissionRecord = new IPDAdmission({
          ...admission,
          patient: patient._id,
          patientName: patient.name,
          contactNumber: patient.contactNumber,
          ipdNumber: admission.ipdNumber || null,
          registrationNumber: patient.registrationNumber,
          doctor: admission.doctor || null,
          department: admission.department || null,
        });

        // Handle room assignment if provided
        if (admission.assignedRoom) {
          const room = await Room.findById(admission.assignedRoom).session(
            session
          );
          if (!room) {
            throw new Error("Room not found");
          }

          const bedIndex = room.beds.findIndex(
            (bed) => bed._id.toString() === admission.assignedBed.toString()
          );
          if (bedIndex === -1 || room.beds[bedIndex].status !== "Available") {
            throw new Error("Bed not available");
          }

          room.beds[bedIndex].status = "Occupied";
          room.beds[bedIndex].currentPatient = patient._id;
          room.currentOccupancy += 1;
          await room.save({ session });
        }

        // Handle initial services bill if any
        if (paymentInfo?.includeServices) {
          const services = await Service.find({
            _id: { $in: paymentInfo.services },
          }).session(session);

          // Get room rate if room is assigned
          let roomCharge = 0;
          if (admission.assignedRoom) {
            const room = await Room.findById(admission.assignedRoom).session(
              session
            );
            if (room) {
              roomCharge = room.ratePerDay || 0;
            }
          }
          let invoiceNumber = await BillCounter.getNextBillNumber(session);
          bill = new ServicesBill({
            invoiceNumber: invoiceNumber || null,
            services: [
              ...services.map((service) => ({
                name: service.name,
                quantity: 1,
                rate: service.rate,
                category: service?.category || "Other",
              })),
              // Add room charge if room is assigned
              ...(roomCharge > 0
                ? [
                    {
                      name: "Room Charge",
                      quantity: 1,
                      rate: roomCharge,
                      category: "Room Rent",
                    },
                  ]
                : []),
            ],
            patient: patient._id,
            patientInfo: {
              name: patient.name,
              phone: patient?.contactNumber,
              registrationNumber: patient.registrationNumber,
              ipdNumber: admission.ipdNumber,
            },
            admission: admissionRecord._id,
            totalAmount: Number(paymentInfo.totalAmount),
            subtotal: services.reduce((sum, service) => sum + service.rate, 0)
              ? services.reduce((sum, service) => sum + service.rate, 0) +
                roomCharge
              : Number(paymentInfo.totalAmount),
            additionalDiscount: paymentInfo.additionalDiscount || 0,
            amountPaid: Number(paymentInfo.amountPaid) || 0,
            patientType: "IPD",
            createdBy: user._id,
          });
          if (
            paymentInfo?.paymentMethod.length > 0 &&
            paymentInfo.amountPaid > 0
          ) {
            await Promise.all(
              paymentInfo.paymentMethod.map(async (pm) => {
                let payments = new Payment({
                  amount: pm.amount,
                  paymentMethod: pm.method,
                  paymentType: { name: "Services", id: bill._id },
                  type: "Income",
                  createdBy: user._id,
                });
                await payments.save({ session });
                payment.push(payments);
                bill.payments.push(payments._id);
              })
            );
          }

          await bill.save({ session });
          admissionRecord.bills.services.push(bill._id);
        }

        // Link admission to patient
        patient.admissionDetails.push(admissionRecord._id);
        await admissionRecord.save({ session });
        await patient.save({ session });
      }

      await session.commitTransaction();
      res.status(201).json({
        patient,
        admissionRecord,
        bill,
        payment,
        message: `Patient registered successfully as ${patientType}`,
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }
);

// Get all patients (All authenticated staff)
router.post("/search", async (req, res) => {
  try {
    const { name, date, patientType, dateAdmitted, dateDischarged } = req.body;

    let query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (date) {
      const { start, end } = date;
      if (start && end) {
        query.date = { $gte: new Date(start), $lte: new Date(end) };
      }
    }

    if (patientType) {
      query.patientType = patientType;
    }

    if (dateAdmitted) {
      const { start, end } = dateAdmitted;
      if (start && end) {
        query["admissionDetails.dateAdmitted"] = {
          $gte: new Date(start),
          $lte: new Date(end),
        };
      }
    }

    if (dateDischarged) {
      const { start, end } = dateDischarged;
      if (start && end) {
        query["admissionDetails.dateDischarged"] = {
          $gte: new Date(start),
          $lte: new Date(end),
        };
      }
    }

    const patients = await Patient.find(query);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// all patients details for patient
router.post("/details", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.bookingDate = {};
      if (startDate && !endDate) {
        // If only startDate is provided, make it equal to that date
        let nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // If only startDate is provided, search from start of startDate to start of next day
        dateFilter.bookingDate = {
          $gte: new Date(startDate),
          $lt: nextDay,
        };
      } else if (startDate && endDate) {
        // If both dates are provided, use gte and lt
        dateFilter.bookingDate = {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        };
      }
    }

    // Apply date filter to both queries
    const visits = await Visit.find(dateFilter)
      .populate(
        "patient",
        "name dateOfBirth gender contactNumber email address bloodType age lastVisit lastVisitType"
      )
      .populate("doctor", "name");

    const ipdAdmissions = await IPDAdmission.find(dateFilter)
      .populate(
        "patient",
        "name dateOfBirth gender contactNumber email address bloodType age lastVisit lastVisitType"
      )
      .populate("assignedDoctor", "name")
      .populate("assignedRoom", "roomNumber type");

    const processedVisits = visits.map((visit) => ({
      _id: visit._id,
      bookingNumber: visit.bookingNumber,
      patient: visit.patient,
      registrationNumber: visit.registrationNumber,
      bookingDate: visit.bookingDate,
      doctor: visit.doctor,
      department: visit.department,
      guardianName: visit.guardianName,
      relation: visit.relation,
      reasonForVisit: visit.reasonForVisit,
      status: visit.status,
      comorbidities: visit.comorbidities,
      vitals: visit.vitals,
      diagnosis: visit.diagnosis,
      treatment: visit.treatment,
      medications: visit.medications,
      labTests: visit.labTests,
      timeSlot: visit.timeSlot,
      additionalInstructions: visit.additionalInstructions,
      type: "OPD",
      createdAt: visit.createdAt,
      bills: visit.bills,
    }));

    const processedAdmissions = ipdAdmissions.map((admission) => ({
      _id: admission._id,
      bookingNumber: admission.bookingNumber,
      patient: admission.patient,
      registrationNumber: admission.registrationNumber,
      ipdNumber: admission.ipdNumber,
      bookingDate: admission.bookingDate,
      department: admission.department,
      doctor: admission.assignedDoctor,
      assignedRoom: admission.assignedRoom,
      guardianName: admission.guardianName,
      relation: admission.relation,
      assignedBed: admission.assignedBed,
      dateDischarged: admission.dateDischarged,
      clinicalSummary: admission.clinicalSummary,
      comorbidities: admission.comorbidities,
      diagnosis: admission.diagnosis,
      status: admission.status,
      labReports: admission.labReports,
      treatment: admission.treatment,
      conditionOnAdmission: admission.conditionOnAdmission,
      conditionOnDischarge: admission.conditionOnDischarge,
      medications: admission.medications,
      additionalInstructions: admission.additionalInstructions,
      labTests: admission.labTests,
      notes: admission.notes,
      timeSlot: admission.timeSlot,
      vitals: admission.vitals,
      type: "IPD",
      operationName: admission.operationName,
      createdAt: admission.createdAt,
      bills: admission.bills,
    }));

    const combinedData = [...processedVisits, ...processedAdmissions];

    // Sort the combined data
    const sortedData = combinedData.sort((a, b) => {
      const dateA = a.bookingDate;
      const dateB = b.bookingDate;

      if (dateB > dateA) return 1;
      if (dateB < dateA) return -1;
      return a.bookingNumber - b.bookingNumber;
    });

    res.json(sortedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete(
  "/admissions",
  checkPermission("delete_patients"),
  async (req, res) => {
    try {
      const result = await Visit.deleteMany();

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "No matching admissions found" });
      }

      res.json({
        message: `${result.deletedCount} admission(s) deleted successfully`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
router.get("/admittedpatients", verifyToken, async (req, res) => {
  try {
    const admittedPatients = await IPDAdmission.find({ status: "Admitted" })
      .populate({
        path: "bills.services",
        populate: {
          path: "payments",
        },
      })
      .populate({
        path: "bills.pharmacy",
        populate: {
          path: "payments",
        },
      });

    // Calculate financial details for each patient
    const patientsWithBillDetails = admittedPatients.map((admission) => {
      let totalAmount = 0;
      let amountPaid = 0;

      // Calculate from service bills
      if (admission.bills && admission.bills.services) {
        admission.bills.services.forEach((bill) => {
          totalAmount += bill.totalAmount || 0;
          amountPaid += bill.payments.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          );
        });
      }

      // Calculate from pharmacy bills
      if (admission.bills && admission.bills.pharmacy) {
        admission.bills.pharmacy.forEach((bill) => {
          totalAmount += bill.totalAmount || 0;
          amountPaid += bill.payments.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          );
        });
      }

      return {
        ...admission,
        _id: admission._id,
        patient: {
          name: admission.patientName,
          registrationNumber: admission.registrationNumber,
        },
        admissionDate: admission.bookingDate,
        totalAmount,
        amountPaid,
        amountDue: totalAmount - amountPaid,
        status: admission.status,
      };
    });

    res.json(patientsWithBillDetails);
  } catch (error) {
    console.error("Error in admitted-patients route:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific patient by ID (All authenticated staff)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate({
        path: "visits",
        populate: {
          path: "bills.services bills.pharmacy",
          populate: {
            path: "payments",
            model: "Payment",
          },
        },
      })
      .populate({
        path: "admissionDetails",
        populate: {
          path: "bills.services bills.pharmacy",
          populate: {
            path: "payments",
            model: "Payment",
          },
        },
      });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { visitID, type, ...patientData } = req.body;
    
    // Update patient data
    const patient = await Patient.findByIdAndUpdate(req.params.id, patientData, {
      new: true,
      runValidators: true,
      session
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Update visit/admission data if visitID and type are provided
    if (visitID && type) {
      const Model = type === "OPD" ? Visit : IPDAdmission;
      const visitData = {
        patientName: patient.name,
        contactNumber: patient.contactNumber,
      };

      const updatedVisit = await Model.findByIdAndUpdate(
        visitID,
        visitData,
        {
          new: true,
          runValidators: true,
          session
        }
      );

       await ServicesBill.findByIdAndUpdate(updatedVisit.bills.services[0],
        {
          patientInfo: {
            name: patientData?.name,
            phone: patientData.contactNumber,
            age: patientData?.age,
            address: patientData?.address,
            gender: patientData?.gender
          }
        }, {
          new: true,
          runValidators: true,
          session
        }
      )

      if (!updatedVisit) {
        throw new Error(`${type} record not found`);
      }
    }

    await session.commitTransaction();
    res.json(patient);

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

router.delete(
  "/:id",
  verifyToken,
  checkPermission("delete_patients"),
  async (req, res) => {
    try {
      const patient = await Patient.findByIdAndDelete(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Move patient from OPD to IPD
router.post("/:id/admit", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      dateAdmitted,
      reasonForAdmission,
      assignedDoctor,
      assignedRoom,
      assignedBed,
    } = req.body;

    // Validate required fields
    if (!dateAdmitted || !assignedRoom || !assignedBed) {
      throw new Error(
        "Date admitted, assigned room, and assigned bed are required"
      );
    }

    const patient = await Patient.findById(id).session(session);
    if (!patient) {
      throw new Error("Patient not found");
    }

    if (patient.patientType === "IPD") {
      throw new Error("Patient is already admitted");
    }

    // Find the room and update the specific bed
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: assignedRoom,
        beds: {
          $elemMatch: {
            _id: assignedBed,
            status: "Available",
          },
        },
      },
      {
        $inc: { currentOccupancy: 1 },
        $set: {
          "beds.$.status": "Occupied",
          "beds.$.currentPatient": patient._id,
        },
      },
      { new: true, session, runValidators: true }
    );

    if (!updatedRoom) {
      throw new Error("Room or bed not available");
    }

    // Update room status if necessary
    if (updatedRoom.currentOccupancy === updatedRoom.capacity) {
      updatedRoom.status = "Occupied";
    } else if (updatedRoom.currentOccupancy > 0) {
      updatedRoom.status = "Partially Available";
    }
    await updatedRoom.save({ session });

    // Create new IPD admission
    const newAdmission = new IPDAdmission({
      patient: patient._id,
      admissionDate: dateAdmitted,
      patientName: patient.name,
      contactNumber: patient.contactNumber,
      registrationNumber: patient.registrationNumber || null,
      reasonForAdmission: reasonForAdmission || "Not specified",
      assignedDoctor: assignedDoctor || null,
      assignedRoom: updatedRoom._id,
      assignedBed: assignedBed,
    });

    await newAdmission.save({ session });

    // Update patient details
    patient.patientType = "IPD";
    patient.admissionDetails.push(newAdmission._id);
    await patient.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ patient, admission: newAdmission, room: updatedRoom });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Add medical history to a patient (All authenticated staff)

// Handle patient revisit
router.post(
  "/:id/revisit",
  verifyToken,
  checkPermission("create_patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const { visit, ...patientData } = req.body;
      const user = req.user;

      const patient = await Patient.findById(id).session(session);
      if (!patient) {
        throw new Error("Patient not found");
      }

      // Update patient data if provided
      if (Object.keys(patientData).length > 0) {
        Object.assign(patient, patientData);
        await patient.save({ session });
      }

      // Create new visit
      const newVisit = new Visit({
        ...visit,
        patient: patient._id,
        patientName: patient.name,
        contactNumber: patient.contactNumber,
        registrationNumber: patient.registrationNumber,
        doctor: visit.doctor || null,
      });

      // Create bill
      const totalFee = Number(visit.totalFee) || 0;
      const discount = Number(visit.discount) || 0;
      const amountPaid = Number(visit.amountPaid) || 0;
      let invoiceNumber = await BillCounter.getNextBillNumber(session);
      const bill = new ServicesBill({
        invoiceNumber: invoiceNumber || null,
        services: [
          {
            name: "Consultation Fee",
            quantity: 1,
            rate: totalFee,
            category: "Consultation",
          },
        ],
        patient: patient._id,
        patientInfo: {
          name: patient.name,
          phone: patient?.contactNumber,
          registrationNumber: patient.registrationNumber,
        },
        totalAmount: totalFee - discount,
        subtotal: totalFee,
        additionalDiscount: discount,
        amountPaid: amountPaid,
        patientType: "OPD",
        createdBy: user._id,
      });

      let payments = [];
      if (
        visit.paymentMethod &&
        visit.paymentMethod !== "Due" &&
        amountPaid > 0
      ) {
        visit.paymentMethod.map(async (pm) => {
          let payment = new Payment({
            amount: pm.amount,
            paymentMethod: pm.method,
            paymentType: { name: "Services", id: bill._id },
            type: "Income",
            createdBy: user._id,
          });
          payments.push(payment);
          await payment.save({ session });
          bill.payments.push(payment._id);
        });
      }

      await bill.save({ session });

      // Link bill to visit and patient
      newVisit.bills.services.push(bill._id);
      patient.visits.push(newVisit._id);

      await newVisit.save({ session });
      await patient.save({ session });

      await session.commitTransaction();

      res.status(201).json({
        message: "Revisit recorded successfully",
        patient,
        visit: newVisit,
        bill,
        payment: payments,
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }
);

// Get all details from visits and IPD admissions with populated patient information

// Update visit details
router.put(
  "/visit/:id",
  verifyToken,
  checkPermission("create_patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { vitals, prescription, labTests, comorbidities } = req.body;
      const visit = await Visit.findById(id)
        .session(session)
        .select(
          "diagnosis bookingNumber treatment medications labTests additionalInstructions vitals comorbidities"
        );
      if (!visit) {
        throw new Error("Visit not found");
      }
      // Update vitals
      visit.vitals = {
        ...visit.vitals,
        ...vitals,
      };
      // Update prescription details
      visit.diagnosis = prescription.diagnosis;
      visit.treatment = prescription.treatment;
      visit.medications = prescription.medications;
      visit.additionalInstructions = prescription.additionalInstructions;
      // Update lab tests
      visit.labTests = labTests;
      visit.comorbidities = comorbidities;
      await visit.save({ session });
      await session.commitTransaction();
      res.status(200).json(visit);
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }
);
// ... existing code ...

// Update visit details

// Update IPD admission details
router.put(
  "/admission/:id",
  verifyToken,
  checkPermission("create_patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const {
        vitals,
        prescription,
        labTests,
        clinicalSummary,
        notes,
        comorbidities,
        conditionOnAdmission,
        conditionOnDischarge,
      } = req.body;

      const admission = await IPDAdmission.findById(id).session(session);
      if (!admission) {
        throw new Error("IPD Admission not found");
      }

      // Update vitals
      admission.vitals = {
        ...admission.vitals,
        ...vitals,
      };

      // Update prescription details
      admission.diagnosis = prescription.diagnosis;
      admission.treatment = prescription.treatment;
      admission.medications = prescription.medications;
      admission.additionalInstructions = prescription.additionalInstructions;
      admission.clinicalSummary = clinicalSummary;
      admission.comorbidities = comorbidities;
      admission.conditionOnAdmission = conditionOnAdmission;
      admission.conditionOnDischarge = conditionOnDischarge;
      admission.notes = notes;
      // Update lab tests
      admission.labTests = labTests;

      await admission.save({ session });

      await session.commitTransaction();
      res.json({ message: "IPD Admission updated successfully", admission });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }
);

// ... remaining code ...

router.post("/complexsearch", async (req, res) => {
  const { searchQuery, searchType, searchWhere } = req.body;

  try {
    let Model = searchWhere === "opd" ? Visit : IPDAdmission; //should be changed to the Patient model
    let query = { bookingDate: searchQuery.bookingDate };

    switch (searchType) {
      case "registration":
        query.registrationNumber = searchQuery.registration;
        break;
      case "name":
        query.patientName = { $regex: searchQuery.name, $options: "i" };
        break;
      case "mobile":
        query.contactNumber = searchQuery.mobile;
        break;
      default:
        return res.status(400).json({ error: "Invalid search type" });
    }

    const patients = await Model.find(query).populate(
      "patient",
      "age gender bloodType address"
    );

    if (patients.length === 0) {
      return res.status(200).json({ message: "Patient not found" });
    }

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// add lab report
router.post("/addLabReport", async (req, res) => {
  try {
    const { visitId, labReport, searchWhere } = req.body;
    const Model = searchWhere === "opd" ? Visit : IPDAdmission;

    const visit = await Model.findById(visitId).populate(
      "patient",
      "name dateOfBirth gender contactNumber email address bloodType age"
    );
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    // Check if a report with the same name and date already exists
    const existingReportIndex = visit.labReports.findIndex(
      (report) =>
        report.name === labReport.name &&
        report.date.toISOString().split("T")[0] === labReport.date
    );

    if (existingReportIndex !== -1) {
      // Update existing report
      visit.labReports[existingReportIndex] = {
        ...visit.labReports[existingReportIndex],
        ...labReport,
      };
    } else {
      // Add new report

      visit.labReports.push(labReport);
    }

    await visit.save();

    res.status(200).json({
      message:
        existingReportIndex !== -1
          ? "Lab report updated successfully"
          : "Lab report added successfully",
      visit,
    });
  } catch (error) {
    console.error("Error adding/updating lab report:", error);
    res.status(500).json({
      message: "Error adding/updating lab report",
      error: error.message,
    });
  }
});

// Add this route after the existing routes
router.post("/discharge/:id", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { formConfig, ...dischargeData } = req.body;

    const admission = await IPDAdmission.findById(id).session(session);
    if (!admission) {
      throw new Error("Admission not found");
    }

    // Store the complete form data
    admission.dischargeData = dischargeData;
    admission.formConfig = formConfig;
    admission.status = "Discharged";

    // Update standard fields if they exist in the discharge data
    const standardFields = [
      "dateDischarged",
      "conditionOnAdmission",
      "conditionOnDischarge",
      "comorbidities",
      "clinicalSummary",
      "diagnosis",
      "treatment",
      "medicineAdvice",
      "labReports",
      "vitals",
      "notes",
    ];

    standardFields.forEach((field) => {
      if (dischargeData[field] !== undefined) {
        admission[field] = dischargeData[field];
      }
    });

    await admission.save({ session });

    // Update room and bed status
    if (admission.assignedRoom && admission.assignedBed) {
      const room = await Room.findById(admission.assignedRoom).session(session);
      if (room) {
        const bedIndex = room.beds.findIndex(
          (bed) => bed._id.toString() === admission.assignedBed.toString()
        );
        if (bedIndex !== -1) {
          room.beds[bedIndex].status = "Available";
          room.beds[bedIndex].currentPatient = null;
          room.currentOccupancy -= 1;
          await room.save({ session });
        }
      }
    }

    await session.commitTransaction();
    res.json({ message: "Patient discharged successfully", admission });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

router.post("/SaveButNotDischarge/:id", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { formConfig, ...dischargeData } = req.body;

    const admission = await IPDAdmission.findById(id).session(session);
    if (!admission) {
      throw new Error("Admission not found");
    }

    // Store the complete form data
    admission.dischargeData = dischargeData;
    admission.formConfig = formConfig;

    // Update standard fields if they exist in the discharge data
    const standardFields = [
      "dateDischarged",
      "conditionOnAdmission",
      "conditionOnDischarge",
      "comorbidities",
      "clinicalSummary",
      "diagnosis",
      "treatment",
      "medicineAdvice",
      "labReports",
      "vitals",
      "notes",
    ];

    standardFields.forEach((field) => {
      if (dischargeData[field] !== undefined) {
        admission[field] = dischargeData[field];
      }
    });

    await admission.save({ session });

    await session.commitTransaction();
    res.json({ message: "Discharge data saved successfully", admission });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Add this route after the existing routes
router.post(
  "/:id/readmission",
  verifyToken,
  checkPermission("create_patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const {
        admission,
        paymentInfo,
        upgradegenIpd,
        upgradegenReg,
        ...patientData
      } = req.body;
      const user = req.user;

      const patient = await Patient.findById(id).session(session);
      if (!patient) {
        throw new Error("Patient not found");
      }

      // Update patient data if provided
      if (Object.keys(patientData).length > 0) {
        Object.assign(patient, patientData);
        await patient.save({ session });
      }
      if (upgradegenIpd) {
        let ipdNumber = await IPDAdmission.getNextIpdNumber(session);

        if (!admission.ipdNumber) {
          admission.ipdNumber = ipdNumber;
        }
      }
      // Create new IPD admission
      const newAdmission = new IPDAdmission({
        patient: patient._id,
        patientName: patient.name,
        contactNumber: patient.contactNumber,
        registrationNumber: patient.registrationNumber || null,
        bookingDate: admission.bookingDate || new Date(),
        reasonForAdmission: admission.reasonForAdmission || "Not specified",
        assignedDoctor: admission.assignedDoctor || null,
        ipdNumber: admission.ipdNumber || null,
        assignedRoom: admission.assignedRoom || null,
        assignedBed: admission.assignedBed || null,
        diagnosis: admission.diagnosis || null,
        conditionOnAdmission: admission.conditionOnAdmission || null,
        department: admission.department || null,
        timeSlot: admission.timeSlot || null,
        vitals: admission.vitals || null,
        comorbidities: admission.comorbidities || [],
        operationName: admission.operationName || null,
      });

      let bill;
      let payment = [];

      // Handle initial services bill if any
      if (paymentInfo?.includeServices) {
        const services = await Service.find({
          _id: { $in: paymentInfo.services },
        }).session(session);

        // Get room rate if room is assigned
        let roomCharge = 0;
        if (admission.assignedRoom) {
          const room = await Room.findById(admission.assignedRoom).session(
            session
          );
          if (room) {
            roomCharge = room.ratePerDay || 0;
          }
        }
        let invoiceNumber = await BillCounter.getNextBillNumber(session);
        bill = new ServicesBill({
          invoiceNumber: invoiceNumber || null,
          services: [
            ...services.map((service) => ({
              name: service.name,
              quantity: 1,
              rate: service.rate,
              category: service?.category || "Other",
            })),
            // Add room charge if room is assigned
            ...(roomCharge > 0
              ? [
                  {
                    name: "Room Charge",
                    quantity: 1,
                    rate: roomCharge,
                    category: "Room Rent",
                  },
                ]
              : []),
          ],
          patient: patient._id,
          patientInfo: {
            name: patient.name,
            phone: patient?.contactNumber,
            registrationNumber: patient.registrationNumber,
            ipdNumber: admission.ipdNumber,
          },
          totalAmount: Number(paymentInfo.totalAmount),
          subtotal: services.reduce((sum, service) => sum + service.rate, 0)
            ? services.reduce((sum, service) => sum + service.rate, 0) +
              roomCharge
            : Number(paymentInfo.totalAmount),
          additionalDiscount: paymentInfo.additionalDiscount || 0,
          amountPaid: Number(paymentInfo.amountPaid) || 0,
          patientType: "IPD",
          createdBy: user._id,
        });

        if (
          paymentInfo?.paymentMethod.length > 0 &&
          paymentInfo.amountPaid > 0
        ) {
          await Promise.all(
            paymentInfo.paymentMethod.map(async (pm) => {
              let payments = new Payment({
                amount: pm.amount,
                paymentMethod: pm.method,
                paymentType: { name: "Services", id: bill._id },
                type: "Income",
                createdBy: user._id,
              });
              await payments.save({ session });
              bill.payments.push(payments._id);
              payment.push(payments);
            })
          );
        }

        await bill.save({ session });
        newAdmission.bills.services.push(bill._id);
      }

      // Handle room assignment if provided
      if (admission.assignedRoom) {
        const room = await Room.findOneAndUpdate(
          {
            _id: admission.assignedRoom,
            beds: {
              $elemMatch: {
                _id: admission.assignedBed,
                status: "Available",
              },
            },
          },
          {
            $inc: { currentOccupancy: 1 },
            $set: {
              "beds.$.status": "Occupied",
              "beds.$.currentPatient": patient._id,
            },
          },
          { new: true, session, runValidators: true }
        );

        if (!room) {
          throw new Error("Room or bed not available");
        }

        // Update room status if necessary
        if (room.currentOccupancy === room.capacity) {
          room.status = "Occupied";
        } else if (room.currentOccupancy > 0) {
          room.status = "Partially Available";
        }
        await room.save({ session });
      }

      await newAdmission.save({ session });

      // Update patient's admissionDetails array
      patient.admissionDetails.push(newAdmission._id);
      patient.patientType = "IPD";
      await patient.save({ session });

      await session.commitTransaction();
      res.status(201).json({
        message: "Readmission recorded successfully",
        patient,
        admission: newAdmission,
        bill,
        payment,
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }
);

// ... remaining code ...

// Get specific visit/admission details
router.post("/visit-details", verifyToken, async (req, res) => {
  try {
    const { id, type } = req.body;

    let result;
    if (type === "OPD") {
      result = await Visit.findById(id)
        .populate(
          "patient",
          "name dateOfBirth gender contactNumber email address bloodType age"
        )
        .populate("doctor", "name");

      if (!result) {
        return res.status(404).json({ error: "Visit not found" });
      }

      result = {
        _id: result._id,
        bookingNumber: result.bookingNumber,
        patient: result.patient,
        registrationNumber: result.registrationNumber,
        bookingDate: result.bookingDate,
        doctor: result.doctor,
        reasonForVisit: result.reasonForVisit,
        status: result.status,
        comorbidities: result.comorbidities,
        vitals: result.vitals,
        diagnosis: result.diagnosis,
        treatment: result.treatment,
        medications: result.medications,
        labTests: result.labTests,
        timeSlot: result.timeSlot,
        additionalInstructions: result.additionalInstructions,
        type: "OPD",
        createdAt: result.createdAt,
        bills: result.bills,
      };
    } else if (type === "IPD") {
      result = await IPDAdmission.findById(id)
        .populate(
          "patient",
          "name dateOfBirth gender contactNumber email address bloodType age"
        )
        .populate("assignedDoctor", "name")
        .populate("assignedRoom", "roomNumber type");

      if (!result) {
        return res.status(404).json({ error: "Admission not found" });
      }

      result = {
        _id: result._id,
        bookingNumber: result.bookingNumber,
        patient: result.patient,
        registrationNumber: result.registrationNumber,
        ipdNumber: result.ipdNumber,
        bookingDate: result.bookingDate,
        doctor: result.assignedDoctor,
        assignedRoom: result.assignedRoom,
        assignedBed: result.assignedBed,
        dateDischarged: result.dateDischarged,
        clinicalSummary: result.clinicalSummary,
        comorbidities: result.comorbidities,
        diagnosis: result.diagnosis,
        status: result.status,
        labReports: result.labReports,
        treatment: result.treatment,
        conditionOnAdmission: result.conditionOnAdmission,
        conditionOnDischarge: result.conditionOnDischarge,
        medications: result.medications,
        additionalInstructions: result.additionalInstructions,
        labTests: result.labTests,
        notes: result.notes,
        timeSlot: result.timeSlot,
        vitals: result.vitals,
        type: "IPD",
        createdAt: result.createdAt,
        bills: result.bills,
      };
    } else {
      return res.status(400).json({ error: "Invalid type specified" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... remaining code ...

// Get details by registration number
router.post("/registration-details", verifyToken, async (req, res) => {
  try {
    const { registrationNumber, type } = req.body;

    if (!registrationNumber || !type) {
      return res.status(400).json({
        error: "Both registration number and type (OPD/IPD) are required",
      });
    }
    const regexPattern = new RegExp(registrationNumber, "i");

    let result;
    if (type === "OPD") {
      result = await Visit.findOne({ registrationNumber: regexPattern })
        .populate(
          "patient",
          "name dateOfBirth gender contactNumber email address bloodType age"
        )
        .populate("doctor", "name");

      if (!result) {
        return res.status(404).json({ error: "Visit not found" });
      }

      result = {
        _id: result._id,
        bookingNumber: result.bookingNumber,
        patient: result.patient,
        registrationNumber: result.registrationNumber,
        bookingDate: result.bookingDate,
        doctor: result.doctor,
        reasonForVisit: result.reasonForVisit,
        status: result.status,
        comorbidities: result.comorbidities,
        vitals: result.vitals,
        diagnosis: result.diagnosis,
        treatment: result.treatment,
        medications: result.medications,
        labTests: result.labTests,
        timeSlot: result.timeSlot,
        additionalInstructions: result.additionalInstructions,
        type: "OPD",
        createdAt: result.createdAt,
        bills: result.bills,
      };
    } else if (type === "IPD") {
      result = await IPDAdmission.findOne({ registrationNumber: regexPattern })
        .populate(
          "patient",
          "name dateOfBirth gender contactNumber email address bloodType age"
        )
        .populate("assignedDoctor", "name")
        .populate("assignedRoom", "roomNumber type");

      if (!result) {
        return res.status(404).json({ error: "Admission not found" });
      }

      result = {
        _id: result._id,
        bookingNumber: result.bookingNumber,
        patient: result.patient,
        registrationNumber: result.registrationNumber,
        bookingDate: result.bookingDate,
        ipdNumber: result.ipdNumber,
        doctor: result.assignedDoctor,
        assignedRoom: result.assignedRoom,
        assignedBed: result.assignedBed,
        dateDischarged: result.dateDischarged,
        clinicalSummary: result.clinicalSummary,
        comorbidities: result.comorbidities,
        diagnosis: result.diagnosis,
        status: result.status,
        labReports: result.labReports,
        treatment: result.treatment,
        conditionOnAdmission: result.conditionOnAdmission,
        conditionOnDischarge: result.conditionOnDischarge,
        medications: result.medications,
        additionalInstructions: result.additionalInstructions,
        labTests: result.labTests,
        notes: result.notes,
        timeSlot: result.timeSlot,
        vitals: result.vitals,
        type: "IPD",
        createdAt: result.createdAt,
        bills: result.bills,
      };
    } else {
      return res.status(400).json({ error: "Invalid type specified" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the admitted-patients route

export default router;
