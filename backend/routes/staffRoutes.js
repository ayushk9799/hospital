import express from 'express';
import { Staff } from '../models/Staff.js';
import { Department } from '../models/Departments.js';
import { checkPermission, verifyToken } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Create a new staff member (Admin only)
router.post('/', verifyToken, checkPermission('create_staff'),  async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const staffData = { ...req.body };

    // Hash password if provided
    if (staffData.password) {
      const salt = await bcrypt.genSalt(10);
      staffData.password = await bcrypt.hash(staffData.password, salt);
    }

    const staff = new Staff(staffData);
    await staff.save({ session });

    if (staffData.department) {
      const departments = Array.isArray(staffData.department) ? staffData.department : [staffData.department];
      for (const depName of departments) {
        const department = await Department.findOne({ name: depName }).session(session);
        if (department) {
          department.staff.push(staff._id);
          await department.save({ session });
        }
      }
    }

    await session.commitTransaction();
    res.status(201).json({ staff: staff.toObject({ versionKey: false, transform: (doc, ret) => { delete ret.password; return ret; } }) });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

router.get('/', verifyToken,  async (req, res) => {
  try {
    const staffMembers = await Staff.find().select('-password');
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/me',verifyToken,async(req,res)=>{
  try {
    const staff = await Staff.findById(req.user._id).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
// Get a specific staff member by ID (Admin, Manager, and Self)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
  
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldStaff = await Staff.findById(req.params.id).session(session);
    if (!oldStaff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, session }
    ).select('-password');

    // Handle department updates
    if (req.body.department && Array.isArray(req.body.department)) {
      // Remove staff from old departments
      for (const oldDep of oldStaff.department) {
        if (!req.body.department.includes(oldDep)) {
          await Department.findOneAndUpdate(
            { name: oldDep },
            { $pull: { staff: oldStaff._id } },
            { session }
          );
        }
      }

      // Add staff to new departments
      for (const newDep of req.body.department) {
        if (!oldStaff.department.includes(newDep)) {
          await Department.findOneAndUpdate(
            { name: newDep },
            { $addToSet: { staff: oldStaff._id } },
            { upsert: true, session }
          );
        }
      }
    }

    await session.commitTransaction();
    res.json(updatedStaff);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Delete a staff member (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;