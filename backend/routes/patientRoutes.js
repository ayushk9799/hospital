import express from "express";
import { Patient } from "../models/Patient.js";
import { Room } from "../models/Room.js";
import { Visit } from "../models/Visits.js";
import { IPDAdmission } from "../models/IPDAdmission.js";
import { ServicesBill } from "../models/ServicesBill.js";
import { BillCounter } from "../models/BillCounter.js";
import { Service } from "../models/Services.js";
import { Payment } from "../models/Payment.js";
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
      })
      .populate({
        path: "assignedDoctor",
        select: "name",
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
      registrationNumber: { $regex: new RegExp(searchQuery, "i") },
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
      })
      .populate({
        path: "assignedDoctor",
        select: "name",
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

        patientData.registrationNumber = registrationNumber;
      }
      if (upgradegenIpd) {
        let ipdNumber = await IPDAdmission.getNextIpdNumber(session);

        admission.ipdNumber = ipdNumber;
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
          doctor: visit.doctor?.id || visit.doctor || null,
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
              date: new Date(),
              type: "additional",
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
                associatedInvoiceOrId: bill.invoiceNumber,
                description: patient.name,
                paymentType: { name: "OPD", id: bill._id },
                type: "Income",
                createdByName: user?.name,
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
          registrationNumber: patient.registrationNumber || null,
          ipdNumber: admission.ipdNumber || null,
          doctor: admission.doctor || null,
          department: admission.department || null,
        });
        let room;
        // Handle room assignment if provided
        if (admission.assignedRoom) {
          room = await Room.findById(admission.assignedRoom).session(session);
          if (!room) {
            throw new Error("Room not found");
          }

          const bedIndex = room.beds.findIndex(
            (bed) => bed._id?.toString() === admission.assignedBed?.toString()
          );
          if (bedIndex === -1 || room.beds[bedIndex].status !== "Available") {
            throw new Error("Bed not available");
          }

          // Validate that adding another patient won't exceed capacity
          if (room.currentOccupancy >= room.capacity) {
            throw new Error("Room is at full capacity");
          }

          room.beds[bedIndex].status = "Occupied";
          room.beds[bedIndex].currentPatient = patient._id;
          room.currentOccupancy += 1;
          await room.save({ session });
        }

        // Handle initial services bill if any
        if (paymentInfo?.includeServices) {
          const services = await Service.find({
            _id: { $in: paymentInfo.services.map((s) => s.id) },
          }).session(session);

          // Get room rate if room is assigned
          let roomCharge = 0;
          if (admission.assignedRoom) {
            roomCharge = room.ratePerDay || 0;
          }
          let invoiceNumber = await BillCounter.getNextBillNumber(session);
          let userProvided = paymentInfo.services.reduce(
            (sum, service) => sum + service.rate,
            0
          );

          // Process services and their subdivisions
          const processedServices = [];
          let surgeryServices = [];
          for (const service of services) {
            const serviceInfo = paymentInfo.services.find(
              (s) => s.id === service._id?.toString()
            );

            // Check if service has subdivisions and rate hasn't been manipulated
            if (
              service.subdivisions &&
              service.subdivisions.length > 0 &&
              serviceInfo?.rate === service.rate
            ) {
              // Add each subdivision as a separate service
              service.subdivisions.forEach((subdivision) => {
                processedServices.push({
                  name: `${subdivision.name}`,
                  quantity: 1,
                  rate: subdivision.rate,
                  category: service?.category || "Other",
                  date: new Date(),
                  type: "additional",
                });
              });
            } else {
              // Add the service as is
              processedServices.push({
                name: service.name,
                quantity: 1,
                rate: serviceInfo?.rate || 0,
                category: service?.category || "Other",
                date: new Date(),
                type: "additional",
              });

              // If this is a surgery service, add it to the array
              if (service.category === "Surgery") {
                surgeryServices.push(service.name);
              }
            }
          }

          // Add room charge if applicable
          if (roomCharge > 0) {
            processedServices.push({
              name: "Room Charge -- (" + room.type + ")",
              quantity: 1,
              rate: roomCharge,
              category: "Room Rent",
              date: new Date(),
            });
          }

          // If we found any surgery services, join them with commas and set as operationName
          if (surgeryServices.length > 0) {
            admissionRecord.operationName = surgeryServices.join(", ");
          }

          bill = new ServicesBill({
            invoiceNumber: invoiceNumber || null,
            services: processedServices,
            patient: patient._id,
            patientInfo: {
              name: patient.name,
              phone: patient?.contactNumber,
              registrationNumber: patient.registrationNumber,
              ipdNumber: admission.ipdNumber,
              age: patient.age,
              gender: patient.gender,
            },
            operationName: admissionRecord.operationName,
            admission: admissionRecord._id,
            totalAmount: Number(paymentInfo.totalAmount),
            subtotal: userProvided
              ? userProvided + roomCharge
              : Number(paymentInfo.totalAmount),
            additionalDiscount:
              paymentInfo.additionalDiscount ||
              (Number(userProvided + roomCharge) -
                Number(paymentInfo.totalAmount) >
              0
                ? Number(userProvided + roomCharge) -
                  Number(paymentInfo.totalAmount)
                : 0),
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
                  associatedInvoiceOrId: bill.invoiceNumber,
                  description: patient.name,
                  paymentType: { name: "IPD", id: bill._id },
                  type: "Income",
                  createdByName: user?.name,
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

      // Add doctor's name for OPD cases
      if (admissionRecord && patientType === "OPD") {
        admissionRecord = admissionRecord.toObject();
        if (visit.doctor?.id && visit.doctor?.name) {
          admissionRecord.doctor = {
            _id: visit.doctor?.id,
            name: visit.doctor?.name,
          };
        }
      }

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
      consultationType: visit.consultationType,
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
      bookingTime: admission.bookingTime,
      department: admission.department,
      doctor: admission.assignedDoctor,
      assignedRoom: admission.assignedRoom,
      guardianName: admission.guardianName,
      relation: admission.relation,
      assignedBed: admission.assignedBed,
      dischargeData: admission.dischargeData,
      formConfig: admission.formConfig,
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
      })
      .populate({
        path: "assignedDoctor",
        populate: {
          path: "name",
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
    const { visitID, type, visit, admission, ...patientData } = req.body;
    const user = req.user;

    // Update patient data
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      patientData,
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!patient) {
      throw new Error("Patient not found");
    }

    let updatedVisit;
    // Update visit/admission data if visitID and type are provided
    if (visitID && type) {
      const Model = type === "OPD" ? Visit : IPDAdmission;
      let updateObj = {};
      if (type === "OPD" && visit) {
        // Update all visit fields
        updateObj = {
          ...visit,
          doctor: patientData?.doctor?._id,
          patientName: patient.name,
          contactNumber: patient.contactNumber,
          registrationNumber: patient.registrationNumber,
        };

        // Handle service bill update if payment details are present
        if (visit.totalAmount !== undefined && visit.billId) {
          const billId = visit.billId;
          const existingBill = await ServicesBill.findById(billId).session(
            session
          );

          if (existingBill) {
            // Update bill details
            existingBill.totalAmount = Number(visit.totalAmount);
            existingBill.subtotal = Number(visit.totalAmount);
            existingBill.additionalDiscount = 0;
            existingBill.amountPaid = Number(visit.amountPaid) || 0;
            existingBill.services = existingBill.services?.map((service) => {
              if (service.category === "Consultation") {
                return {
                  ...service,
                  rate: Number(visit.totalAmount),
                };
              } else {
                return service;
              }
            });

            // Update patient info in bill
            existingBill.patientInfo = {
              name: patient.name,
              phone: patient.contactNumber,
              registrationNumber: patient.registrationNumber,
              age: patient.age,
              gender: patient.gender,
              address: patient.address,
            };

            // Handle payment updates
            if (visit.paymentMethod && visit.paymentMethod.length > 0) {
              // Get existing payment IDs
              let existingPaymentIds = existingBill.payments || [];

              // Handle deleted payments if any
              if (visit.deletedPayments && visit.deletedPayments.length > 0) {
                // Remove the deleted payments
                await Payment.deleteMany({
                  _id: { $in: visit.deletedPayments },
                }).session(session);

                // Update existingPaymentIds to exclude deleted ones
                const remainingPaymentIds = existingPaymentIds.filter(
                  (id) => !visit.deletedPayments.includes(id.toString())
                );
                existingPaymentIds = remainingPaymentIds;
              }

              // Handle updated payments if any
              if (visit.updatedPayments && visit.updatedPayments.length > 0) {
                for (const updatedPayment of visit.updatedPayments) {
                  await Payment.findByIdAndUpdate(
                    updatedPayment._id,
                    {
                      amount: Number(updatedPayment.amount),
                      paymentMethod: updatedPayment.method,
                    },
                    { session }
                  );
                }
              }

              // Create new payments for any new payment methods
              const newPayments = [];
              for (const pm of visit.paymentMethod) {
                // Skip if this is an existing payment (has _id)
                if (pm._id) continue;

                if (pm.amount && Number(pm.amount) > 0) {
                  const payment = new Payment({
                    amount: Number(pm.amount),
                    paymentMethod: pm.method,
                    associatedInvoiceOrId: existingBill.invoiceNumber,
                    description: patient.name,
                    paymentType: { name: "OPD", id: existingBill._id },
                    type: "Income",
                    createdByName: user?.name,
                    createdBy: user._id,
                  });
                  await payment.save({ session });
                  newPayments.push(payment._id);
                }
              }

              // Update bill with remaining existing payments and new ones
              existingBill.payments = [...existingPaymentIds, ...newPayments];
            }

            await existingBill.save({ session });
          }
        }
      } else if (type === "IPD" && admission) {
        // Update all admission fields
        updateObj = {
          ...admission,
          patientName: patient.name,
          contactNumber: patient.contactNumber,
          registrationNumber: patient.registrationNumber,
        };
      } else {
        // Fallback: update only basic fields
        updateObj = {
          patientName: patient.name,
          contactNumber: patient.contactNumber,
          guardianName: patientData?.guardianName,
          relation: patientData?.relation,
        };
      }

      let formattedData;
      if (type === "OPD") {
        updatedVisit = await Model.findByIdAndUpdate(
          visitID,
          { $set: updateObj },
          {
            new: true,
            runValidators: true,
            session,
          }
        )
          .populate(
            "patient",
            "name dateOfBirth gender contactNumber email address bloodType age"
          )
          .populate("doctor", "name");

        if (!updatedVisit) {
          throw new Error(`${type} record not found`);
        }

        // Format OPD data
        formattedData = {
          _id: updatedVisit._id,
          bookingNumber: updatedVisit.bookingNumber,
          patient: updatedVisit.patient,
          registrationNumber: updatedVisit.registrationNumber,
          bookingDate: updatedVisit.bookingDate,
          doctor: updatedVisit.doctor,
          reasonForVisit: updatedVisit.reasonForVisit,
          status: updatedVisit.status,
          department: updatedVisit.department,
          guardianName: updatedVisit.guardianName,
          relation: updatedVisit.relation,
          comorbidities: updatedVisit.comorbidities,
          vitals: updatedVisit.vitals,
          diagnosis: updatedVisit.diagnosis,
          consultationType: updatedVisit.consultationType,
          treatment: updatedVisit.treatment,
          medications: updatedVisit.medications,
          labTests: updatedVisit.labTests,
          timeSlot: updatedVisit.timeSlot,
          additionalInstructions: updatedVisit.additionalInstructions,
          type: "OPD",
          createdAt: updatedVisit.createdAt,
          bills: updatedVisit.bills,
        };
      } else {
        updatedVisit = await Model.findByIdAndUpdate(
          visitID,
          { $set: updateObj },
          {
            new: true,
            runValidators: true,
            session,
          }
        )
          .populate(
            "patient",
            "name dateOfBirth gender contactNumber email address bloodType age"
          )
          .populate("assignedDoctor", "name")
          .populate("assignedRoom", "roomNumber type");

        if (!updatedVisit) {
          throw new Error(`${type} record not found`);
        }

        // Format IPD data
        formattedData = {
          _id: updatedVisit._id,
          bookingNumber: updatedVisit.bookingNumber,
          bookingTime: updatedVisit.bookingTime,
          department: updatedVisit.department,
          guardianName: updatedVisit.guardianName,
          relation: updatedVisit.relation,
          patient: updatedVisit.patient,
          dischargeData: updatedVisit.dischargeData,
          registrationNumber: updatedVisit.registrationNumber,
          formConfig: updatedVisit.formConfig,
          operationName: updatedVisit.operationName,
          ipdNumber: updatedVisit.ipdNumber,
          bookingDate: updatedVisit.bookingDate,
          doctor: updatedVisit.assignedDoctor,
          assignedRoom: updatedVisit.assignedRoom,
          assignedBed: updatedVisit.assignedBed,
          dateDischarged: updatedVisit.dateDischarged,
          clinicalSummary: updatedVisit.clinicalSummary,
          comorbidities: updatedVisit.comorbidities,
          diagnosis: updatedVisit.diagnosis,
          status: updatedVisit.status,
          labReports: updatedVisit.labReports,
          treatment: updatedVisit.treatment,
          conditionOnAdmission: updatedVisit.conditionOnAdmission,
          conditionOnDischarge: updatedVisit.conditionOnDischarge,
          medications: updatedVisit.medications,
          additionalInstructions: updatedVisit.additionalInstructions,
          labTests: updatedVisit.labTests,
          notes: updatedVisit.notes,
          timeSlot: updatedVisit.timeSlot,
          vitals: updatedVisit.vitals,
          type: "IPD",
          createdAt: updatedVisit.createdAt,
          bills: updatedVisit.bills,
        };
      }

      await session.commitTransaction();
      res.json(formattedData);
    }
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
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
      let newVisit = new Visit({
        ...visit,
        patient: patient._id,
        patientName: patient.name,
        contactNumber: patient.contactNumber,
        registrationNumber: patient.registrationNumber,
        doctor: visit.doctor?.id || visit.doctor || null,
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
            date: new Date(),
            type: "additional",
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
        await Promise.all(
          visit.paymentMethod.map(async (pm) => {
            let payment = new Payment({
              amount: pm.amount,
              paymentMethod: pm.method,
              associatedInvoiceOrId: bill.invoiceNumber,
              description: patient.name,
              paymentType: { name: "OPD", id: bill._id },
              type: "Income",
              createdByName: user?.name,
              createdBy: user._id,
            });
            payments.push(payment);
            await payment.save({ session });
            bill.payments.push(payment._id);
          })
        );
      }

      await bill.save({ session });

      // Link bill to visit and patient
      newVisit.bills.services.push(bill._id);
      patient.visits.push(newVisit._id);

      await newVisit.save({ session });
      await patient.save({ session });

      if (newVisit) {
        newVisit = newVisit.toObject();
        if (visit.doctor?.id) {
          newVisit.doctor = { _id: visit.doctor?.id, name: visit.doctor?.name };
        }
      }

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

          if (
            room.beds[bedIndex].currentPatient?.toString() ===
            admission.patient?.toString()
          ) {
            room.currentOccupancy -= 1;
          }
          room.beds[bedIndex].currentPatient = null;
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
        bookingTime:
          admission.bookingTime ||
          new Date().toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
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
        guardianName: admission.guardianName || null,
        relation: admission.relation || null,
      });

      let bill;
      let payment = [];
      let room;

      // Handle initial services bill if any
      if (paymentInfo?.includeServices) {
        const services = await Service.find({
          _id: { $in: paymentInfo.services.map((s) => s.id) },
        }).session(session);

        // Get room rate if room is assigned
        let roomCharge = 0;
        if (admission.assignedRoom) {
          room = await Room.findById(admission.assignedRoom).session(session);
          if (room) {
            roomCharge = room.ratePerDay || 0;
          }
        }

        let invoiceNumber = await BillCounter.getNextBillNumber(session);
        let userProvided = paymentInfo.services.reduce(
          (sum, service) => sum + service.rate,
          0
        );

        // Process services and their subdivisions
        const processedServices = [];
        let surgeryServices = [];
        for (const service of services) {
          const serviceInfo = paymentInfo.services.find(
            (s) => s.id === service._id?.toString()
          );

          // Check if service has subdivisions and rate hasn't been manipulated
          if (
            service.subdivisions &&
            service.subdivisions.length > 0 &&
            serviceInfo?.rate === service.rate
          ) {
            // Add each subdivision as a separate service
            service.subdivisions.forEach((subdivision) => {
              processedServices.push({
                name: `${subdivision.name}`,
                quantity: 1,
                rate: subdivision.rate,
                category: service?.category || "Other",
                date: new Date(),
                type: "additional",
              });
            });
          } else {
            // Add the service as is
            processedServices.push({
              name: service.name,
              quantity: 1,
              rate: serviceInfo?.rate || 0,
              category: service?.category || "Other",
              date: new Date(),
              type: "additional",
            });

            // If this is a surgery service, add it to the array
            if (service.category === "Surgery") {
              surgeryServices.push(service.name);
            }
          }
        }

        // Add room charge if applicable
        if (roomCharge > 0) {
          processedServices.push({
            name: "Room Charge -- (" + room.type + ")",
            quantity: 1,
            rate: roomCharge,
            category: "Room Rent",
            date: new Date(),
          });
        }

        // If we found any surgery services, join them with commas and set as operationName
        if (surgeryServices.length > 0) {
          newAdmission.operationName = surgeryServices.join(", ");
        }

        bill = new ServicesBill({
          invoiceNumber: invoiceNumber || null,
          services: processedServices,
          patient: patient._id,
          patientInfo: {
            name: patient.name,
            phone: patient?.contactNumber,
            registrationNumber: patient.registrationNumber,
            ipdNumber: admission.ipdNumber,
            age: patient.age,
            gender: patient.gender,
          },
          operationName: newAdmission.operationName,
          admission: newAdmission._id,
          totalAmount: Number(paymentInfo.totalAmount),
          subtotal: userProvided
            ? userProvided + roomCharge
            : Number(paymentInfo.totalAmount),
          additionalDiscount:
            paymentInfo.additionalDiscount ||
            (Number(userProvided + roomCharge) -
              Number(paymentInfo.totalAmount) >
            0
              ? Number(userProvided + roomCharge) -
                Number(paymentInfo.totalAmount)
              : 0),
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
                associatedInvoiceOrId: bill.invoiceNumber,
                description: patient.name,
                paymentType: { name: "IPD", id: bill._id },
                type: "Income",
                createdByName: user?.name,
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

// Get specific visit/admission details (original, lightweight)
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

// New route for full details (for edit)
router.post("/visit-details-full", verifyToken, async (req, res) => {
  try {
    const { id, type } = req.body;
    let result;
    if (type === "OPD") {
      result = await Visit.findById(id)
        .populate(
          "patient",
          "name dateOfBirth gender contactNumber email address bloodType age"
        )
        .populate("doctor", "name")
        .populate({
          path: "bills.services",
          populate: {
            path: "payments",
            model: "Payment",
          },
        });
      if (!result) {
        return res.status(404).json({ error: "Visit not found" });
      }
      res.json(result);
      return;
    } else if (type === "IPD") {
      result = await IPDAdmission.findById(id)
        .populate(
          "patient",
          "name dateOfBirth gender contactNumber email address bloodType age"
        )
        .populate("assignedDoctor", "name")
        .populate("assignedRoom")
        .populate({
          path: "bills.services",
          populate: {
            path: "payments",
            model: "Payment",
          },
        });

      if (!result) {
        return res.status(404).json({ error: "Admission not found" });
      }
      res.json(result);
      return;
    } else {
      return res.status(400).json({ error: "Invalid type specified" });
    }
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

// Add this new route after other routes
router.post("/discharged-by-date", verifyToken, async (req, res) => {
  try {
    const { dischargeDate } = req.body;

    // Create date range for the selected date
    const startDate = new Date(dischargeDate);
    const endDate = new Date(dischargeDate);
    endDate.setDate(endDate.getDate() + 1);

    const dischargedPatients = await IPDAdmission.find({
      dateDischarged: {
        $gte: startDate,
        $lt: endDate,
      },
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
    const patientsWithBillDetails = dischargedPatients.map((admission) => {
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

      const plainAdmission = admission.toObject();

      return {
        ...plainAdmission,
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

// Get OPD details for token printing
router.post("/opd-details", verifyToken, async (req, res) => {
  try {
    const { visitId } = req.body;

    const visit = await Visit.findById(visitId)
      .populate("patient")
      .populate("doctor")
      .populate({
        path: "bills.services",
        populate: {
          path: "payments",
          model: "Payment",
        },
      });

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    // Get the latest payment for this visit

    const responseData = {
      patient: visit.patient,
      bill: visit.bills.services?.[0],
      payment: visit.bills.services?.[0]?.payments,
      admissionRecord: visit,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error in opd-details route:", error);
    res.status(500).json({ error: error.message });
  }
});

// New route for updating IPD Admission
router.put("/ipd-admission/:admissionId", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { admissionId } = req.params;
    const {
      patient: patientDataUpdates,
      admission: admissionDataUpdates,
      bill: billUpdates,
      payments: paymentActions,
    } = req.body;
    const user = req.user;

    // 1. Fetch the IPDAdmission record
    const admission = await IPDAdmission.findById(admissionId).session(session);
    if (!admission) {
      throw new Error("IPD Admission not found");
    }

    // 2. Fetch and Update Patient details if any
    let patient;
    if (patientDataUpdates && Object.keys(patientDataUpdates).length > 0) {
      patient = await Patient.findById(admission.patient).session(session);
      if (!patient) {
        throw new Error("Associated patient not found");
      }
      Object.assign(patient, patientDataUpdates);
      await patient.save({ session });
    } else {
      patient = await Patient.findById(admission.patient).session(session);
    }

    // 3. Handle Room Changes if any
    if (admissionDataUpdates.assignedRoom && admissionDataUpdates.assignedBed) {
      const currentRoomId = admission.assignedRoom?.toString();
      const newRoomId = admissionDataUpdates.assignedRoom?.toString();
      const currentBedId = admission.assignedBed?.toString();
      const newBedId = admissionDataUpdates.assignedBed?.toString();

      // If there's a room/bed change
      if (currentRoomId !== newRoomId || currentBedId !== newBedId) {
        // First, free up the old room/bed if it exists
        if (currentRoomId && currentBedId) {
          const oldRoom = await Room.findById(currentRoomId).session(session);
          if (oldRoom) {
            const oldBedIndex = oldRoom.beds.findIndex(
              (bed) => bed._id.toString() === currentBedId
            );
            if (oldBedIndex !== -1) {
              oldRoom.beds[oldBedIndex].status = "Available";
              oldRoom.beds[oldBedIndex].currentPatient = null;
              oldRoom.currentOccupancy = Math.max(
                0,
                oldRoom.currentOccupancy - 1
              );

              await oldRoom.save({ session });
            }
          }
        }

        // Then, assign the new room/bed
        const newRoom = await Room.findById(newRoomId).session(session);
        if (!newRoom) {
          throw new Error("New room or bed not available");
        }

        const newBedIndex = newRoom.beds.findIndex(
          (bed) => bed._id.toString() === newBedId && bed.status === "Available"
        );
        if (newBedIndex === -1) {
          throw new Error("New bed not available");
        }

        newRoom.beds[newBedIndex].status = "Occupied";
        newRoom.beds[newBedIndex].currentPatient = patient._id;
        newRoom.currentOccupancy = newRoom.currentOccupancy + 1;
        await newRoom.save({ session });
      }
    }

    // 3. Update IPDAdmission details
    // Ensure to preserve fields not explicitly being updated
    const currentAdmissionData = admission.toObject();
    const updatedAdmissionFields = {
      ...currentAdmissionData,
      ...admissionDataUpdates,
    };

    // Make sure sensitive or linked fields are handled correctly
    updatedAdmissionFields.patientName = patient.name; // Always sync patientName
    updatedAdmissionFields.contactNumber = patient.contactNumber; // Always sync contactNumber
    updatedAdmissionFields.registrationNumber = patient.registrationNumber; // Always sync registrationNumber

    // If assignedDoctor is an object with _id, use _id, otherwise use the direct value.
    if (
      updatedAdmissionFields.assignedDoctor &&
      updatedAdmissionFields.assignedDoctor._id
    ) {
      updatedAdmissionFields.assignedDoctor =
        updatedAdmissionFields.assignedDoctor._id;
    }

    Object.assign(admission, updatedAdmissionFields);

    // 4. Handle Billing and Payments
    if (billUpdates && billUpdates.billId) {
      const existingBill = await ServicesBill.findById(
        billUpdates.billId
      ).session(session);
      if (!existingBill) {
        throw new Error("Associated bill not found");
      }

      // Update bill fields
      existingBill.totalAmount =
        Number(billUpdates.totalAmount) || existingBill.totalAmount;
      existingBill.subtotal =
        Number(billUpdates.subtotal) || existingBill.subtotal;
      existingBill.additionalDiscount =
        Number(billUpdates.additionalDiscount) || 0;
      existingBill.operationName = updatedAdmissionFields.operationName;

      // existingBill.amountPaid = Number(billUpdates.amountPaid) || 0; // This will be recalculated based on payments

      // If services are provided in the update, replace them and recalculate subtotal and total
      if (billUpdates.services && Array.isArray(billUpdates.services)) {
        existingBill.services = billUpdates.services.map((s) => ({
          serviceId: s.serviceId, // Assuming frontend sends serviceId
          name: s.name,
          quantity: Number(s.quantity) || 1,
          rate: Number(s.rate) || 0,
          category: s.category || "Other",
          date: s.date ? new Date(s.date) : new Date(), // Ensure date is stored
          // _id: s._id // if you want to preserve existing service item _ids, handle this carefully
        }));

        // Recalculate subtotal based on new services
        const newSubtotal = existingBill.services.reduce((sum, service) => {
          return sum + Number(service.rate) * Number(service.quantity);
        }, 0);
        existingBill.subtotal = newSubtotal;

        // Recalculate totalAmount: subtotal - discount
        const discount = Number(billUpdates.additionalDiscount) || 0;
        existingBill.additionalDiscount = discount; // Ensure discount is set before calculating total
        existingBill.totalAmount = newSubtotal - discount;
      } else {
        // If services are not being updated, but discount might be, recalculate totalAmount
        const currentSubtotal = Number(existingBill.subtotal) || 0;
        const discount = Number(billUpdates.additionalDiscount);
        if (!isNaN(discount)) {
          // check if discount is a valid number
          existingBill.additionalDiscount = discount;
          existingBill.totalAmount = currentSubtotal - discount;
        } else if (billUpdates.hasOwnProperty("additionalDiscount")) {
          // if additionalDiscount was explicitly passed but not a number, default to 0
          existingBill.additionalDiscount = 0;
          existingBill.totalAmount = currentSubtotal;
        }
        // if additionalDiscount is not in billUpdates, totalAmount remains as is or based on previous logic
      }

      // Update patient info in bill
      existingBill.patientInfo = {
        name: patient.name,
        phone: patient.contactNumber,
        registrationNumber: patient.registrationNumber,
        ipdNumber: admission.ipdNumber,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
      };

      let currentBillAmountPaid = 0;

      // Handle payment actions (deleted, updated, new)
      if (paymentActions) {
        const { deletedPayments, updatedPayments, newPayments } =
          paymentActions;
        let billPaymentIds = existingBill.payments.map((p) => p.toString());

        // Deleted payments
        if (deletedPayments && deletedPayments.length > 0) {
          await Payment.deleteMany({ _id: { $in: deletedPayments } }).session(
            session
          );
          billPaymentIds = billPaymentIds.filter(
            (id) => !deletedPayments.includes(id)
          );
        }

        // Updated payments
        if (updatedPayments && updatedPayments.length > 0) {
          for (const up of updatedPayments) {
            const paymentDoc = await Payment.findById(up._id).session(session);
            if (paymentDoc) {
              paymentDoc.amount = Number(up.amount);
              paymentDoc.paymentMethod = up.method;
              await paymentDoc.save({ session });
              currentBillAmountPaid += Number(up.amount);
            }
          }
        } else {
          // If no updated payments, sum amounts from existing non-deleted payments
          const existingValidPayments = await Payment.find({
            _id: { $in: billPaymentIds },
          }).session(session);
          currentBillAmountPaid += existingValidPayments.reduce(
            (sum, p) => sum + p.amount,
            0
          );
        }

        // New payments
        const createdPaymentIds = [];
        if (newPayments && newPayments.length > 0) {
          for (const np of newPayments) {
            if (Number(np.amount) > 0) {
              const payment = new Payment({
                amount: Number(np.amount),
                paymentMethod: np.method,
                associatedInvoiceOrId: existingBill.invoiceNumber,
                description: patient.name,
                paymentType: { name: "IPD", id: existingBill._id },
                type: "Income",
                createdByName: user?.name,
                createdBy: user._id,
              });
              await payment.save({ session });
              createdPaymentIds.push(payment._id);
              currentBillAmountPaid += Number(np.amount);
            }
          }
        }
        existingBill.payments = [
          ...billPaymentIds.filter(
            (id) => !updatedPayments?.find((up) => up._id === id)
          ),
          ...createdPaymentIds,
          ...(updatedPayments?.map((up) => up._id) || []),
        ];
        existingBill.payments = [
          ...new Set(existingBill.payments.map((id) => id.toString())),
        ]; // Deduplicate
      } else {
        // If no paymentActions, recalculate amountPaid from existing payments
        const paymentsForBill = await Payment.find({
          _id: { $in: existingBill.payments },
        }).session(session);
        currentBillAmountPaid = paymentsForBill.reduce(
          (sum, p) => sum + p.amount,
          0
        );
      }

      existingBill.amountPaid = currentBillAmountPaid;
      await existingBill.save({ session });

      // Ensure the bill is linked to the admission if not already
      if (
        !admission.bills.services
          .map((s) => s.toString())
          .includes(existingBill._id.toString())
      ) {
        admission.bills.services.push(existingBill._id);
      }
    }

    // Save the admission record itself after all updates
    await admission.save({ session });

    await session.commitTransaction();

    // Repopulate for response
    const populatedAdmission = await IPDAdmission.findById(admission._id)
      .populate("patient")
      .populate("assignedDoctor", "name")
      .populate("assignedRoom", "roomNumber type")
      .populate({
        path: "bills.services",
        populate: { path: "payments" },
      });

    res.json(populatedAdmission);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error updating IPD admission:", error);
    res.status(400).json({ message: error.message, stack: error.stack });
  } finally {
    session.endSession();
  }
});

// ... existing code ...

// Add this new route before the export default
router.put(
  "/ipd-admission/:admissionId/operation",
  verifyToken,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { admissionId } = req.params;
      const { operationName, billId, includeInBill, serviceDetails } = req.body;

      const admission = await IPDAdmission.findById(admissionId).session(
        session
      );
      if (!admission) {
        throw new Error("IPD Admission not found");
      }

      const bill = await ServicesBill.findById(billId)
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
        .populate("createdBy", "name")
        .session(session);
      if (!bill) {
        throw new Error("Bill not found");
      }

      // Update operation name in both admission and bill
      admission.operationName = operationName;
      bill.operationName = operationName;

      // If includeInBill is true and serviceDetails is an array, add the services to the bill
      if (
        includeInBill &&
        Array.isArray(serviceDetails) &&
        serviceDetails.length > 0
      ) {
        // Add new services to the bill
        const newServices = serviceDetails.map((service) => ({
          name: service.service,
          quantity: service.quantity,
          rate: service.rate,
          category: service.category,
          date: new Date(),
          type: service.type,
        }));

        bill.services.push(...newServices);

        // Recalculate bill totals
        const newSubtotal = bill.services
          .filter((service) => service.type !== "breakup")
          .reduce((sum, service) => sum + service.rate * service.quantity, 0);

        bill.subtotal = newSubtotal;
        bill.totalAmount = newSubtotal - (bill.additionalDiscount || 0);
      }

      await admission.save({ session });
      await bill.save({ session });

      await session.commitTransaction();

      // Repopulate for response
      // const populatedAdmission = await IPDAdmission.findById(admission._id)
      //   .populate("patient")
      //   .populate("assignedDoctor", "name")
      //   .populate("assignedRoom", "roomNumber type")
      //   .populate({
      //     path: "bills.services",
      //     populate: { path: "payments" },
      //   });

      res.json(bill);
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      res.status(400).json({ message: error.message });
    } finally {
      session.endSession();
    }
  }
);

export default router;
