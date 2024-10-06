import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String },
  floor: Number,
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },

  ratePerDay: Number,
  status: {
    type: String,
    enum: ["Available", "Partially Available", "Occupied", "Under Maintenance"],
    default: "Available",
  },
  lastCleaned: Date,

  beds: [
    {
      bedNumber: { type: String, required: true },
      status: {
        type: String,
        enum: ["Available", "Occupied", "Under Maintenance"],
        default: "Available",
      },
      currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    },
  ],
});

// Modified pre-save middleware
roomSchema.pre("save", function (next) {
  // If the status is manually set to 'Under Maintenance', don't change it
  if (this.status === "Under Maintenance") {
    return next();
  }

  const occupiedBeds = this.beds.filter(
    (bed) => bed.status === "Occupied"
  ).length;
  const totalBeds = this.beds.length;

  if (occupiedBeds === 0) {
    this.status = "Available";
  } else if (occupiedBeds < totalBeds) {
    this.status = "Partially Available";
  } else if (occupiedBeds === totalBeds) {
    this.status = "Occupied";
  }

  console.log(this.status);
  next();
});

// Add a method to set the room under maintenance
roomSchema.methods.setUnderMaintenance = function () {
  this.status = "Under Maintenance";
  return this.save();
};

// Add a method to clear the maintenance status
roomSchema.methods.clearMaintenance = function () {
  // This will trigger the pre-save middleware to set the correct status
  this.status = "Available";
  return this.save();
};

roomSchema.plugin(hospitalPlugin);
export const Room = mongoose.model("Room", roomSchema);
