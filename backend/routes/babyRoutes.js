import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/authMiddleware.js";
import { Baby } from "../models/Baby.js";
const router = express.Router();
// Create new baby record
router.post("/", verifyToken, async (req, res) => {
  try {
    const babyData = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    const baby = new Baby(babyData);

   const number= await Baby.updateBirthCounter(session,babyData.dateOfBirth);
   console.log(number)
    baby.birthCounter = number;
    
    await baby.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(baby);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
});

// Get baby records by mother's IPD admission
router.get("/admission/:ipdAdmissionId", verifyToken, async (req, res) => {
  try {
    const babies = await Baby.find({ ipdAdmission: req.params.ipdAdmissionId })
      .populate("mother", "name registrationNumber")
      .sort("-createdAt");
    res.json(babies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update baby record
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const baby = await Baby.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!baby) {
      return res.status(404).json({ message: "Baby record not found" });
    }
    res.json(baby);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
