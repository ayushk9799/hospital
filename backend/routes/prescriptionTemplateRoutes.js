import express from "express";
import mongoose from "mongoose";
import { PrescriptionTemplate } from "../models/PrescriptionTemplate.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get default template
router.get("/default", verifyToken, async (req, res) => {
  try {
    // Find template based on hospital and either it's the default template or associated with the doctor
    const template = await PrescriptionTemplate.find();
    res.json({ success: true, template });
  } catch (error) {
    console.error("Error fetching default template:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/textTemplates/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { templateData, fieldId } = req.body;
    const template = await PrescriptionTemplate.findById(id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    const field = template?.value?.sections?.[0]?.fields?.find(
      (f) => f.id === fieldId
    );

    if (!field) throw new Error("Field not found"); // no matching field: bail out

    if (!Array.isArray(field.suggestions)) {
      field.suggestions = []; // make the array if it isn't there yet
    }

    const newSuggestion = {
      _id: new mongoose.Types.ObjectId(),
      name: templateData?.name,
      content: templateData?.content,
    };
    field.suggestions.push(newSuggestion);

    template.markModified("value");
    await template.save();
    res.json({ success: true, suggestion: newSuggestion ,template:template});
  } catch (error) {
    console.error("Error saving text template:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.delete("/textTemplates/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldId, templateId } = req.body;
    const template = await PrescriptionTemplate.findById(id);
    let deleted = false;

    if (template) {
      let modified = false;
      const field = template?.value?.sections[0]?.fields?.filter(
        (field) => field.id === fieldId
      );
      if (field[0]) {
        if (Array.isArray(field[0].suggestions)) {
          const originalLength = field[0].suggestions.length;
          field[0].suggestions = field[0].suggestions.filter(
            (s) => s._id?.toString() !== templateId
          );
          if (field[0].suggestions.length !== originalLength) {
            modified = true;
            deleted = true;
          }
        }
      }
      if (modified) {
        template.markModified("value");
        await template.save();
      }
    }

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// Save/Update default template
router.post("/", verifyToken, async (req, res) => {
  try {
    const { _id, name, value, associatedDoctors } = req.body;

    let template;

    if (_id) {
      // If _id exists, update the existing template
      template = await PrescriptionTemplate.findById(_id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      template.name = name;
      template.value = value;
      template.associatedDoctors = associatedDoctors;
      await template.save();
    } else {
      // Create new template if no _id provided
      template = new PrescriptionTemplate({
        name: name,
        value: value,
        associatedDoctors: associatedDoctors,
      });
      await template.save();
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error("Error saving template:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/listSuggestions/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { suggestions = [], fieldId } = req.body; // suggestions expected as array

    const template = await PrescriptionTemplate.findById(id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    const field = template?.value?.sections?.[0]?.fields?.find(
      (f) => f.id === fieldId
    );
    if (!field) {
      return res
        .status(404)
        .json({ success: false, message: "Field not found" });
    }

    if (!Array.isArray(field.suggestions)) {
      field.suggestions = [];
    }

    // Ensure suggestions is an array even if a single string passed
    const suggArray = Array.isArray(suggestions) ? suggestions : [suggestions];

    let modified = false;
    suggArray.forEach((sug) => {
      if (sug && !field.suggestions.includes(sug)) {
        field.suggestions.push(sug);
        modified = true;
      }
    });

    if (modified) {
      template.markModified("value");
      await template.save();
    }

    res.json({ success: true, suggestions: suggArray });
  } catch (error) {
    console.error("Error saving list suggestions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/listSuggestions/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldId, suggestion } = req.body;
    const template = await PrescriptionTemplate.findById(id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    const field = template?.value?.sections?.[0]?.fields?.find(
      (f) => f.id === fieldId
    );
    if (!field || !Array.isArray(field.suggestions)) {
      return res
        .status(404)
        .json({ success: false, message: "Suggestions not found" });
    }

    const originalLength = field.suggestions.length;
    field.suggestions = field.suggestions.filter((s) => s !== suggestion);

    if (field.suggestions.length === originalLength) {
      return res
        .status(404)
        .json({ success: false, message: "Suggestion not found" });
    }

    template.markModified("value");
    await template.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting list suggestion:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
