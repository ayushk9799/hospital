import express from 'express';
import { verifySuperAdmin } from '../middleware/SuperAdminMiddleWare.js';
import { Hospital } from '../models/Hospital.js'; // Make sure to import the Hospital model

const router = express.Router();

router.post('/create', verifySuperAdmin, async (req, res) => {
    try {
        // Check if a hospital with the same hospitalID already exists
        const existingHospital = await Hospital.findOne({ hospitalId: req.body.hospitalId });
        if (existingHospital) {
            return res.status(400).json({ message: 'A hospital with this ID already exists' });
        }

        // If no existing hospital, create a new one
        const newHospital = new Hospital({
            ...req.body
        });

        const savedHospital = await newHospital.save();

        // Set the cookie with the hospital ID
        // res.cookie('hospitalId', savedHospital.hospitalID, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        //     sameSite: 'strict',
        //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
        // });

        res.status(201).json({
            message: 'Hospital created successfully',
            hospital: savedHospital
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;