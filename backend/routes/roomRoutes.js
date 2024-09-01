import express from 'express';
import { Room } from '../models/Room.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
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

export default router;