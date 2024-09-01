import express from 'express';
import { Prescription } from '../models/Prescription.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find().populate('patient doctor');
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;