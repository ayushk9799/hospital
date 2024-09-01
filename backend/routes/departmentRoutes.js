import express from 'express';
import { Department } from '../models/Departments.js';
import { Staff } from '../models/Staff.js';
import { checkPermission, verifyToken } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new department (Admin only)
router.post('/', verifyToken, checkPermission('write:all'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, staffIds } = req.body;

    if (!name) {
      throw new Error('Department name is required');
    }

    const department = new Department({ name });

    if (staffIds && Array.isArray(staffIds)) {
      const staffMembers = await Staff.find({ _id: { $in: staffIds } }).session(session);

      if (staffMembers.length !== staffIds.length) {
        throw new Error('One or more staff members not found');
      }

      department.staff = staffIds;

      // Update department for each staff member
      await Promise.all(staffMembers.map(async (staff) => {
        if (!staff.department.includes(name)) {
          staff.department.push(name);
        }
        await staff.save({ session });
      }));
    }

    await department.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(department);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Get all departments
router.get('/', verifyToken, async (req, res) => {
  try {
    const departments = await Department.find().populate('staff', 'name roles');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a doctor to a department
router.post('/:id/addDoctor', verifyToken, checkPermission('write:all'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { doctorId } = req.body;

    const department = await Department.findById(id).session(session);
    if (!department) {
      throw new Error('Department not found');
    }

    const doctor = await Staff.findById(doctorId).session(session);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (!doctor.roles.includes('doctor')) {
      throw new Error('Staff member is not a doctor');
    }

    if (department.staff.includes(doctorId)) {
      throw new Error('Doctor is already in this department');
    }

    department.staff.push(doctorId);
    doctor.department.push(department.name);

    await department.save({ session });
    await doctor.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(department);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Remove a doctor from a department
router.post('/:id/removeDoctor', verifyToken, checkPermission('write:all'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { doctorId } = req.body;

    const department = await Department.findById(id).session(session);
    if (!department) {
      throw new Error('Department not found');
    }

    const doctor = await Staff.findById(doctorId).session(session);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (!department.staff.includes(doctorId)) {
      throw new Error('Doctor is not in this department');
    }

    department.staff = department.staff.filter(staffId => staffId.toString() !== doctorId);
    doctor.department = doctor.department.filter(dep => dep !== department.name);

    await department.save({ session });
    await doctor.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(department);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

export default router;