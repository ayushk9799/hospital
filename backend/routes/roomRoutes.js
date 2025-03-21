import express from "express";
import { Room } from "../models/Room.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const roomData = req.body;

    // Ensure the number of beds matches the capacity
    if (roomData.beds.length !== roomData.capacity) {
      return res
        .status(400)
        .json({ error: "Number of beds must match the room capacity" });
    }

    // Create bed objects with bedNumber property
    roomData.beds = roomData.beds.map((bedNumber) => ({ bedNumber }));

    const room = new Room(roomData);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().populate("beds.currentPatient");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all empty rooms
router.get("/empty", async (req, res) => {
  try {
    const emptyRooms = await Room.find({
      $or: [{ currentOccupancy: 0 }, { status: "Available" }],
    });
    res.json(emptyRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all rooms
router.delete("/all", async (req, res) => {
  try {
    await Room.deleteMany({});
    res
      .status(200)
      .json({ message: "All rooms have been deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Empty beds in rooms
router.post("/empty-beds", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomIds, bedIds } = req.body;

    if (!roomIds || !Array.isArray(roomIds)) {
      return res
        .status(400)
        .json({ error: "Room IDs must be provided as an array" });
    }

    let updatePromises = [];

    for (const roomId of roomIds) {
      // First get the room to calculate occupancy change
      const room = await Room.findById(roomId).session(session);
      if (!room) continue;

      let updateQuery;

      if (bedIds && bedIds[roomId]) {
        // Count how many occupied beds we're emptying to update occupancy correctly
        const bedsToEmpty = room.beds.filter(
          (bed) =>
            bedIds[roomId].includes(bed._id.toString()) &&
            bed.status === "Occupied"
        ).length;

        // Calculate new occupancy
        const newOccupancy = room.currentOccupancy - bedsToEmpty;

        // Determine room status based on new occupancy
        let newStatus;
        if (newOccupancy === 0) {
          newStatus = "Available";
        } else if (newOccupancy < room.capacity) {
          newStatus = "Partially Available";
        } else {
          newStatus = "Occupied";
        }

        // Update specific beds in the room
        updateQuery = {
          $set: {
            "beds.$[bed].status": "Available",
            "beds.$[bed].currentPatient": null,
            currentOccupancy: newOccupancy,
            status: newStatus,
          },
        };

        const arrayFilters = [
          {
            "bed._id": { $in: bedIds[roomId] },
          },
        ];

        updatePromises.push(
          Room.findOneAndUpdate({ _id: roomId }, updateQuery, {
            arrayFilters,
            new: true,
            session,
            runValidators: true,
          })
        );
      } else {
        // Empty all beds in the room
        updateQuery = {
          $set: {
            "beds.$[].status": "Available",
            "beds.$[].currentPatient": null,
            currentOccupancy: 0,
            status: "Available", // When emptying all beds, room becomes available
          },
        };

        updatePromises.push(
          Room.findOneAndUpdate({ _id: roomId }, updateQuery, {
            new: true,
            session,
            runValidators: true,
          })
        );
      }
    }

    const updatedRooms = await Promise.all(updatePromises);
    await session.commitTransaction();

    res.json({
      message: "Beds emptied successfully",
      rooms: updatedRooms,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

export default router;
