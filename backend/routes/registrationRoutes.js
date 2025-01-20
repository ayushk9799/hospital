import express from "express";
import { RegistrationNumber } from "../models/RegistrationNumber.js";

const router = express.Router();

// Get current registration settings
router.get("/settings", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const settings = await RegistrationNumber.findOne({ year: currentYear });

    res.json({
      prefix: settings?.prefix,
      useYearSuffix: settings?.useYearSuffix ?? true,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update registration settings
router.post("/settings", async (req, res) => {
  try {
    const { prefix, useYearSuffix } = req.body;
    const currentYear = new Date().getFullYear();

    await RegistrationNumber.findOneAndUpdate(
      { year: currentYear },
      { prefix, useYearSuffix },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
});

export default router;
