import express from 'express';
import { Room } from '../models/Room.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const roomData = req.body;
    
    // Ensure the number of beds matches the capacity
    if (roomData.beds.length !== roomData.capacity) {
      return res.status(400).json({ error: 'Number of beds must match the room capacity' });
    }
    
    // Create bed objects with bedNumber property
    roomData.beds = roomData.beds.map(bedNumber => ({ bedNumber }));
  
    
    const room = new Room(roomData);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('beds.currentPatient');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all empty rooms
router.get('/empty', async (req, res) => {
  try {
    const emptyRooms = await Room.find({
      $or: [
        { currentOccupancy: 0 },
        { status: 'Available' }
      ]
    });
    res.json(emptyRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all rooms
router.delete('/all', async (req, res) => {
  try {
    await Room.deleteMany({});
    res.status(200).json({ message: 'All rooms have been deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;