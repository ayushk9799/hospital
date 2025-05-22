import express from "express";
import { SuperAdmin } from "../models/SuperAdmin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { LabData } from "../models/LabData.js";
import { verifySuperAdmin } from "../middleware/SuperAdminMiddleWare.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if a SuperAdmin with the given email already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const superAdmin = new SuperAdmin({ email, password: hashedPassword });
    const savedSuperAdmin = await superAdmin.save();

    if (!savedSuperAdmin) {
      res.status(400).json({ message: "Invalid user data" });
    }

    const payload = { _id: savedSuperAdmin._id };
    jwt.sign(payload, "secretkey", { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res
        .status(201)
        .json({ token, message: "SuperAdmin registered successfully" });
    });
  } catch (error) {
    console.error("Error during super admin registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { _id: superAdmin._id };
    jwt.sign(payload, "secretkey", { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error("Error during super admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/lab-data", verifySuperAdmin, async (req, res) => {
  try {
    const { labCategories, labReportFields } = req.body;

    // Validate input
    if (!labCategories || !labReportFields) {
      return res.status(400).json({
        message: "Missing labCategories or labReportFields in request body",
      });
    }

    // Update or create LabData document
    const updatedLabData = await LabData.findOneAndUpdate(
      {},
      { labCategories, labReportFields },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json({ message: "Lab data updated successfully", data: updatedLabData });
  } catch (error) {
    console.error("Error updating lab data:", error);
    res
      .status(500)
      .json({ message: "Internal server error while updating lab data" });
  }
});

export default router;
