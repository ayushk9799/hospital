import express from "express";
import { PrescriptionTemplate } from "../models/PrescriptionTemplate.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/text-templates -> return flat list of all text templates across prescription templates
router.get("/", verifyToken, async (req, res) => {
  try {
    const templates = await PrescriptionTemplate.find();
    const allSuggestions = [];
    templates.forEach((tpl) => {
      tpl?.value?.sections?.forEach((section) => {
        section?.fields?.forEach((field) => {
          if (Array.isArray(field.suggestions)) {
            field.suggestions.forEach((sugg) => {
              allSuggestions.push({
                ...sugg,
                fieldId: field.id,
                prescriptionTemplateId: tpl._id,
              });
            });
          }
        });
      });
    });
    res.json({ success: true, templates: allSuggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/text-templates/:id -> remove suggestion with given _id


export default router;
