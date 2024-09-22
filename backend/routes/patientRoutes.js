import express from "express";
import { Patient } from "../models/Patient.js";
import { Room } from "../models/Room.js";
import { Visit } from "../models/Visits.js";
import { IPDAdmission } from "../models/IPDAdmission.js";
import { checkPermission, verifyToken } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// Create a new patient (All authenticated staff)
router.post(
  "/",
  verifyToken,
  checkPermission("write:patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { patientType, visit, admission, ...patientData } = req.body;

      if (!patientType || !["OPD", "IPD"].includes(patientType)) {
        throw new Error("Invalid or missing patient type");
      }

      // Create patient
      const patient = new Patient({ ...patientData, patientType });
      console.log(patient);
      await patient.save({ session });

      let admissionRecord;

      if (patientType === "OPD") {
        if (!visit) {
          throw new Error("Visit details are required for OPD patients");
        }
        // Create visit and link it to the patient
        admissionRecord = new Visit({
          ...visit,
          doctor:visit.doctor||null,
          registrationNumber:patient.registrationNumber||null,
          patientName:patient.name,
          contactNumber:patient.contactNumber,
          patient: patient._id,
        });
        patient.visits.push(admissionRecord._id);
      } else if (patientType === "IPD") {
        if (!admission) {
          throw new Error("Admission details are required for IPD patients");
        }
        // Create IPD admission and link it to the patient
        admissionRecord = new IPDAdmission({
          ...admission,
          registrationNumber:patient.registrationNumber||null,
          patientName:patient.name,
          contactNumber:patient.contactNumber,
          patient: patient._id,
        });
        console.log(admissionRecord);
        patient.admissionDetails.push(admissionRecord._id);

        // Update Room if assigned
        // if (admission.assignedRoom) {
        //   const room = await Room.findById(admission.assignedRoom).session(session);
        //   if (!room) {
        //     throw new Error('Assigned room not found');
        //   }
        //   if(room.currentOccupancy >= room.capacity){
        //     throw new Error('Room is at full capacity');
        //   }
        //   room.currentOccupancy += 1;
        //   room.currentPatients.push(patient._id);
        //   await room.save({ session });
        // }

        if (admission.assignedRoom) {
          const room = await Room.findOneAndUpdate(
            { _id: admission.assignedRoom,
              'beds':{
                $elemMatch:{
                  _id:admission.assignedBed,
                }
              }
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
          if(!room){
            throw new Error('Room or bed not available')
          }
       
          
        }
      }
      await admissionRecord.save({ session });

      // Add admission reference to patient
      await patient.save({ session });

      await session.commitTransaction();
      res.status(201).json({ patient, admissionRecord });
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
router.get("/details", verifyToken, async (req, res) => {
  console.log("details")
  try {
    const visits = await Visit.find()
      .populate(
        "patient",
        "name dateOfBirth gender contactNumber email address bloodType"
      )
      .populate("doctor", "name");

    const ipdAdmissions = await IPDAdmission.find()
      .populate(
        "patient",
        "name dateOfBirth gender contactNumber email address bloodType"
      )
      .populate("assignedDoctor", "name")
      .populate("assignedRoom", "roomNumber type");

    const processedVisits = visits.map((visit) => ({
      _id: visit._id,
      bookingNumber: visit.bookingNumber,
      patient: visit.patient,
      bookingDate: visit.bookingDate,
      doctor: visit.doctor,
      reasonForVisit: visit.reasonForVisit,
      vitals: visit.vitals,
      diagnosis: visit.diagnosis,
      treatment: visit.treatment,
      medications: visit.medications,
      labTests: visit.labTests,
      timeSlot: visit.timeSlot,
      additionalInstructions: visit.additionalInstructions,
      type: "OPD",
    }));

    const processedAdmissions = ipdAdmissions.map((admission) => ({
      _id: admission._id,
      bookingNumber: admission.bookingNumber,
      patient: admission.patient,
      bookingDate: admission.bookingDate,
      doctor: admission.assignedDoctor,
      assignedRoom: admission.assignedRoom,
      diagnosis: admission.diagnosis,
      treatment: admission.treatment,
      medications: admission.medications,
      additionalInstructions: admission.additionalInstructions,
      labTests: admission.labTests,
      reasonForAdmission: admission.reasonForAdmission,
      timeSlot: admission.timeSlot,
      vitals: admission.vitals,
      type: "IPD",
    }));

    const combinedData = [...processedVisits, ...processedAdmissions];

    // Sort the combined data
    const sortedData = combinedData.sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a.bookingDate.split("-").reverse().join("-"));
      const dateB = new Date(b.bookingDate.split("-").reverse().join("-"));

      // Compare dates first (descending order)
      if (dateB > dateA) return 1;
      if (dateB < dateA) return -1;

      // If dates are equal, compare booking numbers (ascending order)
      return a.bookingNumber - b.bookingNumber;
    });

    res.json(sortedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a specific patient by ID (All authenticated staff)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate("visits")
      .populate("admissionDetails");
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/:id",
  verifyToken,
  checkPermission("write:patients"),
  async (req, res) => {
    try {
      // could be changed according to frontend
      const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  verifyToken,
  checkPermission("write:patients"),
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
router.post(
  "/:id/admit",
  verifyToken,
  checkPermission("write:patients"),
  async (req, res) => {
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
        patientName:patient.name,
        contactNumber:patient.contactNumber,  
        registrationNumber:patient.registrationNumber||null,
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
  }
);

// Add medical history to a patient (All authenticated staff)

// Handle patient revisit
router.post(
  "/:id/revisit",
  verifyToken,
  checkPermission("write:patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const { visit, ...patientData } = req.body;

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
        patient: patient._id,
        reasonForVisit: visit.reasonForVisit || null,
        doctor: visit.doctor || null,
        department: visit.department || null,
        diagnosis: visit.diagnosis || null,
        treatment: visit.treatment || null,
        vitals: visit.vitals || null,
        bookingNumber: visit.bookingNumber || null,
        bookingDate: visit.bookingDate || null,
      });

      await newVisit.save({ session });

      // Update patient's visits array
      patient.visits.push(newVisit._id);
      await patient.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: "Revisit recorded successfully",
        patient: patient,
        visit: newVisit,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: error.message });
    }
  }
);

// Get all details from visits and IPD admissions with populated patient information

// Update visit details
router.put(
  "/visit/:id",
  verifyToken,
  checkPermission("write:patients"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { vitals, prescription, labTests } = req.body;
      const visit = await Visit.findById(id).session(session).select("diagnosis treatment medications labTests additionalInstructions vitals");
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
      await visit.save({ session });
      await session.commitTransaction();
      res.json(visit);
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }
);

router.post("/complexsearch", async (req, res) => {
  const { searchQuery, searchType, searchWhere } = req.body;

  try {
    let Model = searchWhere === "opd" ? Visit : IPDAdmission;
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
  console.log(query);
    const patients = await Model.find(query);

    if (patients.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
