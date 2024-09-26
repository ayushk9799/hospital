import express from 'express';
import { Service } from '../models/Services.js';
import { ServicesBill } from '../models/ServicesBill.js';

const router = express.Router();

// Create a new bill of services
router.post('/create-bill', async (req, res) => {
  try {
    const { services, patient, patientType, totals, patientInfo, department, physician } = req.body;
    if (!services || !Array.isArray(services)) return res.status(400).json({ message: 'Invalid services data' });

    const bill = { ...totals, patientType, patient, services, patientInfo, department, physician };

    const newBill = new ServicesBill(bill);
    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all bills
router.get('/get-bills', async (req, res) => {
  try {
    const bills = await ServicesBill.find();
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create or update a service
router.post('/service', async (req, res) => {
  try {
    const { name, category, rate } = req.body;
    if (!name || !rate) return res.status(400).json({ message: 'Name and rate are required' });

    const serviceData = { name, category, rate };
    let service = await Service.findOne({ name });

    if (service) {
      service = await Service.findByIdAndUpdate(service._id, serviceData, { new: true });
      res.status(200).json(service);
    } else {
      service = new Service(serviceData);
      await service.save();
      res.status(201).json(service);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().select('-hospital');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a service
router.delete('/service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a service
router.put('/service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, rate } = req.body;
    if (!name || !rate) return res.status(400).json({ message: 'Name and rate are required' });

    const updatedService = await Service.findByIdAndUpdate(id, { name, category, rate }, { new: true });
    if (!updatedService) return res.status(404).json({ message: 'Service not found' });

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



export default router;
