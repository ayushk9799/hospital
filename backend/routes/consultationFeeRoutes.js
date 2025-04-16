import express from "express";
import ConsultationFee from "../models/ConsultationFee.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const DEFAULT_CONSULTATION_TYPES = ["new", "follow-up"];

// Get all consultation fees and types
router.get("/", verifyToken, async (req, res) => {
  try {
    const fees = await ConsultationFee.findOne().populate("doctorWiseFee.doctor", "name");
    res.json(
      fees || {
        doctorWiseFee: [],
        consultationTypes: DEFAULT_CONSULTATION_TYPES,
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update or create consultation fee
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      doctor,
      consultationType,
      followUpDateWithin,
      oldPatientAfterFollowUpDateType,
    } = req.body;

    // Convert consultationType from object to Map
    const typeMap = new Map();
    for (const [key, value] of Object.entries(consultationType)) {
      typeMap.set(key, value);
    }

    // Find existing fee document or create new one
    let feeDoc = await ConsultationFee.findOne();
    if (!feeDoc) {
      feeDoc = new ConsultationFee({
        doctorWiseFee: [],
        consultationTypes: DEFAULT_CONSULTATION_TYPES
        
      });
    }

    // Update oldPatientAfterFollowUpDateType if provided
  

    // Find or update doctor's fee
    const doctorFeeIndex = feeDoc.doctorWiseFee.findIndex(
      (df) => df.doctor.toString() === doctor
    );

    if (doctorFeeIndex !== -1) {
      feeDoc.doctorWiseFee[doctorFeeIndex].consultationType = typeMap;
      feeDoc.doctorWiseFee[doctorFeeIndex].followUpDateWithin =
        followUpDateWithin;
    } else {
      feeDoc.doctorWiseFee.push({
        doctor,
        consultationType: typeMap,
        followUpDateWithin: followUpDateWithin,
      });
    }

    await feeDoc.save();

    // Populate doctor details before sending response
    await feeDoc.populate("doctorWiseFee.doctor", "name");
    res.json(feeDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update consultation types
router.post("/types", verifyToken, async (req, res) => {
  try {
    const { types } = req.body;

    // Ensure default types are included
    if (!DEFAULT_CONSULTATION_TYPES.every((type) => types.includes(type))) {
      return res.status(400).json({
        message: "Cannot remove default consultation types (new and follow-up)",
      });
    }

    let feeDoc = await ConsultationFee.findOne();
    if (!feeDoc) {
      feeDoc = new ConsultationFee({
        doctorWiseFee: [],
        consultationTypes: types,
        hospital: req.hospital,
      });
    } else {
      feeDoc.consultationTypes = types;
    }

    await feeDoc.save();
    await feeDoc.populate("doctorWiseFee.doctor", "name");
    res.json(feeDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
