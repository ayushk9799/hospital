import express from 'express';
import { Event } from '../models/Event.js';

const router = express.Router();

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { eventName, timeSlot, staffId } = req.body;
    const newEvent = new Event({
      eventName,
      timeSlot: {
        start: timeSlot.start,
        end: timeSlot.end
      },
      staff: staffId
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all events
router.get('/events/:staffId', async (req, res) => {
  try {
    const events = await Event.find({ staff: req.params.staffId }).populate('staff', 'name'); // Populate staff name
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add more routes as needed (update, delete, get by ID, etc.)

export default router;