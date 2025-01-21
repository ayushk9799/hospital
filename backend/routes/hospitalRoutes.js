import express from "express";
import { verifySuperAdmin } from "../middleware/SuperAdminMiddleWare.js";
import { Hospital } from "../models/Hospital.js"; // Make sure to import the Hospital model
import mongoose from "mongoose";
import cookie from "cookie";
import { Template } from "../models/Template.js";
import { identifyHospital } from "../middleware/hospitalMiddleware.js";
import { presignedUrl } from "../s3.js";

const router = express.Router();

router.post("/create", verifySuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingHospital = await Hospital.findOne({
      hospitalId: req.body.hospitalId,
    }).session(session);
    if (existingHospital) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "A hospital with this ID already exists" });
    }

    const newHospital = new Hospital({
      ...req.body,
    });

    const savedHospital = await newHospital.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Hospital created successfully",
      hospital: savedHospital,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
});

// New route to fetch hospital details
router.get("/getHospital", async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const hospitalId = cookies?.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospital not specified" });
    }

    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.status(200).json(hospital);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching hospital details",
        error: error.message,
      });
  }
});

// New route to update hospital information
router.post("/:hospitalId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hospital = await Hospital.findOne({
      hospitalId: req.params.hospitalId,
    }).session(session);
    if (!hospital) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Update all fields, including the new category fields
    Object.assign(hospital, req.body);

    const updatedHospital = await hospital.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Hospital updated successfully",
      hospital: updatedHospital,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(400)
      .json({ message: "Error updating hospital", error: error.message });
  }
});

router.post("/template/create", identifyHospital, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let template = await Template.findOne().session(session);
    if (!template) {
      template = new Template({
        labTestsTemplate: [],
        headerTemplate: "",
        diagnosisTemplate: [],
        comorbidities:[],
        opdRxTemplate:"",
        medicinelist:[],
        dischargeSummaryTemplate: "",
        opdPrescriptionTemplate: "",
      });
    }

    if (req.body.labTestsTemplate) {
      template.labTestsTemplate.push(req.body.labTestsTemplate);
    }
    if (req.body.headerTemplate) {
      template.headerTemplate = req.body.headerTemplate;
    }
    if (req.body.diagnosisTemplate) {
      template.diagnosisTemplate = req.body.diagnosisTemplate;
    }
    if(req.body.opdRxTemplate){
      template.opdRxTemplate=req.body.opdRxTemplate;
    }
    if(req.body.comorbidities)
    {
      template.comorbidities=req.body.comorbidities;
    }
    if(req.body.medicinelist)
    {
      template.medicinelist=req.body.medicinelist;
    }
    if(req.body.dischargeSummaryTemplate)
    {
      template.dischargeSummaryTemplate=req.body.dischargeSummaryTemplate;
    }
    if(req.body.opdPrescriptionTemplate)
    {
      template.opdPrescriptionTemplate=req.body.opdPrescriptionTemplate;
    }
        

    await template.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(template);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(400)
      .json({ message: "Error handling template", error: error.message });
  }
});

// New route to get the template
router.get("/template/read", identifyHospital, async (req, res) => {
  try {
    const template = await Template.findOne();
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json(template);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching template", error: error.message });
  }
});

router.post(
  "/template/service_collections",
  identifyHospital,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const template = await Template.findOne().session(session);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Ensure req.body.service_collections is an array of valid ObjectIds
      if (
        !Array.isArray(req.body.service_collections) ||
        !req.body.service_collections.every(mongoose.Types.ObjectId.isValid)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid service_collections data" });
      }

      template.service_collections = req.body.service_collections;
      await template.save({ session });
      await session.commitTransaction();
      res.status(200).json(template.service_collections);
    } catch (error) {
      await session.abortTransaction();
      res
        .status(400)
        .json({
          message: "Error updating service bill collections",
          error: error.message,
        });
    } finally {
      session.endSession();
    }
  }
);

router.get("/getUploadUrl", identifyHospital, async (req, res) => {
  try {
    const data = await presignedUrl();
    res.status(200).json(data);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching upload url", error: error.message });
  }
});
export default router;
