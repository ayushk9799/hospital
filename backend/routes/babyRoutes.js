import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/authMiddleware.js";
import { Baby } from "../models/Baby.js";
const router = express.Router();
// Create new baby record
router.post("/search", verifyToken, async (req, res) => {
  try {
    const searchNumber = req.body.searchNumber;
    if (!searchNumber) {
      throw new Error("Search number is required");
    }
    const babies = await Baby.find({
      birthCounter: { $regex: searchNumber, $options: "i" },
    })
      .populate("mother", "name registrationNumber")
      .sort("-createdAt")
      .limit(10);

    res.json(babies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/", verifyToken, async (req, res) => {
  try {
    const babyData = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    const baby = new Baby(babyData);

    const number = await Baby.updateBirthCounter(session, babyData.dateOfBirth);
    baby.birthCounter = number;

    await baby.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Fetch the saved baby with populated mother data
    const populatedBaby = await Baby.findById(baby._id).populate(
      "mother",
      "name registrationNumber"
    );

    res.status(201).json(populatedBaby);
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
router.put("/", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove _id from update data to prevent MongoDB errors
    const { _id, ...updateData } = req.body;

    const baby = await Baby.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
      session,
    });

    if (!baby) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Baby record not found" });
    }

    await session.commitTransaction();
    session.endSession();

    // Fetch the updated baby with populated mother data
    const populatedBaby = await Baby.findById(baby._id).populate(
      "mother",
      "name registrationNumber"
    );

    res.json(populatedBaby);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
});

// Get all baby records
router.get("/", verifyToken, async (req, res) => {
  try {
    const babies = await Baby.find({})
      .populate("mother", "name registrationNumber")
      .sort("-createdAt");
    res.json(babies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add this route before the final export

export default router;
