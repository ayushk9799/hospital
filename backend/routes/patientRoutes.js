import express from 'express';
import { Patient } from '../models/Patient.js';
import { Room } from '../models/Room.js';
import { Visit } from '../models/Visits.js';
import { IPDAdmission } from '../models/IPDAdmission.js';
import { checkPermission, verifyToken } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new patient (All authenticated staff)
router.post('/', verifyToken, checkPermission('write:patients'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { patientType, visit, admission, ...patientData } = req.body;

    if (!patientType || !['OPD', 'IPD'].includes(patientType)) {
      throw new Error('Invalid or missing patient type');
    }

    // Create patient
    const patient = new Patient({ ...patientData, patientType });
    await patient.save({ session });

    let admissionRecord;

    if (patientType === 'OPD') {
      if (!visit) {
        throw new Error('Visit details are required for OPD patients');
      }
      // Create visit and link it to the patient
      admissionRecord = new Visit({
        ...visit,
        patient: patient._id
      });
    } else if (patientType === 'IPD') {
      if (!admission) {
        throw new Error('Admission details are required for IPD patients');
      }
      // Create IPD admission and link it to the patient
      admissionRecord = new IPDAdmission({
        ...admission,
        patient: patient._id
      });
    }

    await admissionRecord.save({ session });

    // Add admission reference to patient
    patient.admissionDetails = [admissionRecord._id];
    await patient.save({ session });

    await session.commitTransaction();
    res.status(201).json({ patient, admissionRecord });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Get all patients (All authenticated staff)
router.post('/search', async (req, res) => {
  try {
    const { name, date, patientType, dateAdmitted, dateDischarged } = req.body;
    
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
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
        query['admissionDetails.dateAdmitted'] = { $gte: new Date(start), $lte: new Date(end) };
      }
    }

    if (dateDischarged) {
      const { start, end } = dateDischarged;
      if (start && end) {
        query['admissionDetails.dateDischarged'] = { $gte: new Date(start), $lte: new Date(end) };
      }
    }

    const patients = await Patient.find(query);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/details', verifyToken, async (req, res) => {
  try {
    const visits = await Visit.find()
      .populate('patient', 'name dateOfBirth gender contactNumber email address bloodType')
      .populate('doctor', 'name')
     

    const ipdAdmissions = await IPDAdmission.find()
      .populate('patient', 'name dateOfBirth gender contactNumber email address bloodType')
      .populate('assignedDoctor', 'name')
      .populate('assignedRoom', 'roomNumber type')
      

    const processedVisits = visits.map(visit => ({
      _id: visit._id,
      bookingNumber: visit.bookingNumber,
      patient: visit.patient,
      bookingDate: visit.bookingDate,
      doctor: visit.doctor,
      reasonForVisit: visit.reasonForVisit,
      type: 'OPD'
    }));

    const processedAdmissions = ipdAdmissions.map(admission => ({
      _id: admission._id,
      bookingNumber: admission.bookingNumber,
      patient: admission.patient,
      bookingDate: admission.bookingDate,
      doctor: admission.assignedDoctor,
      assignedRoom: admission.assignedRoom,
      reasonForAdmission: admission.reasonForAdmission,
      type: 'IPD'
    }));

    const combinedData = [...processedVisits, ...processedAdmissions];

    res.json(combinedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a specific patient by ID (All authenticated staff)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, checkPermission("write:patients"), async (req, res) => {
  try{
  // could be changed according to frontend
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  res.json(patient);
} catch (error) {
  res.status(400).json({ message: error.message });
}
});

router.delete('/:id', verifyToken, checkPermission("write:patients"),  async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move patient from OPD to IPD
router.post('/:id/admit', verifyToken, checkPermission('write:patients'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { dateAdmitted, reasonForAdmission, assignedDoctor, assignedRoom } = req.body;

    // Validate required fields
    if (!dateAdmitted || !assignedRoom) {
      throw new Error('Date admitted and assigned room are required');
    }

    const patient = await Patient.findById(id).session(session);
    if (!patient) {
      throw new Error('Patient not found');
    }

    if (patient.patientType === 'IPD') {
      throw new Error('Patient is already admitted');
    }

    const room = await Room.findById(assignedRoom).session(session);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.currentOccupancy >= room.capacity) {
      throw new Error('Room is at full capacity');
    }

    // Optimistic concurrency control for room update
    const updatedRoom = await Room.findOneAndUpdate(
      { 
        _id: assignedRoom, 
        currentOccupancy: room.currentOccupancy,
        currentPatients: room.currentPatients
      },
      { 
        $inc: { currentOccupancy: 1 },
        $push: { currentPatients: patient._id },
        $set: { status: room.currentOccupancy + 1 === room.capacity ? 'Occupied' : room.status }
      },
      { new: true, session, runValidators: true }
    );

    if (!updatedRoom) {
      throw new Error('Room data has been modified. Please try again.');
    }

    // Create new IPD admission
    const newAdmission = new IPDAdmission({
      patient: patient._id,
      admissionDate: dateAdmitted || null,
      reasonForAdmission: reasonForAdmission || 'Not specified',
      assignedDoctor: assignedDoctor || null,
      assignedRoom
    });

    await newAdmission.save({ session });

    // Update patient details
    patient.patientType = 'IPD';
    patient.admissionDetails.push(newAdmission._id);
    await patient.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ patient, admission: newAdmission });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Add medical history to a patient (All authenticated staff)

// Handle patient revisit
router.post('/:id/revisit', verifyToken, checkPermission('write:patients'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { visit, ...patientData } = req.body;

   
  

    const patient = await Patient.findById(id).session(session);
    if (!patient) {
      throw new Error('Patient not found');
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
      treatment: visit.treatment || null
    });

    await newVisit.save({ session });

    // Update patient's visits array
    patient.visits.push(newVisit._id);
    await patient.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      message: 'Revisit recorded successfully', 
      patient: patient,
      visit: newVisit 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Get all details from visits and IPD admissions with populated patient information


export default router;