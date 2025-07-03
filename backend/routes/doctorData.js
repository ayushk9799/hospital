import express from "express";
import { DoctorData } from "../models/DoctorData.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all doctor data
router.get("/", verifyToken, async (req, res) => {
  try {
    const allDoctorData = await DoctorData.find({}).populate("doctor", "name");
    res.status(200).json(allDoctorData);
  } catch (error) {
    console.error("Error fetching all doctor data:", error);
    res.status(500).json({ message: "Failed to fetch all doctor data" });
  }
});

// Update or create doctor data
router.post("/update", verifyToken, async (req, res) => {
  try {
    const { doctor, medicines, diagnosis, comorbidities } = req.body;

    // Find existing doctor data or create new
    let doctorData = await DoctorData.findOne({ doctor }).populate("doctor", "name");

    if (doctorData) {
      // Update existing
      doctorData.medicines = medicines;
      doctorData.diagnosis = diagnosis;
      doctorData.comorbidities = comorbidities;
      await doctorData.save();
    } else {
      // Create new
      doctorData = await DoctorData.create({
        doctor,
        medicines,
        diagnosis,
        comorbidities,
      });
    }

    res.status(200).json(doctorData);
  } catch (error) {
    console.error("Error updating doctor data:", error);
    res.status(500).json({ message: "Failed to update doctor data" });
  }
});

// Get doctor data
router.get("/:doctorId", verifyToken, async (req, res) => {
  try {
    const doctorData = await DoctorData.findOne({
      doctor: req.params.doctorId,
    }).populate("doctor");
    res.status(200).json(doctorData || {});
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    res.status(500).json({ message: "Failed to fetch doctor data" });
  }
});

export default router;
