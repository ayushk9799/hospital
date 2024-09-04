import mongoose from "mongoose";
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'


const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required:true
  },
  username: {
    type: String,
    unique: true,
    sparse:true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  hospital:{type:mongoose.Schema.Types.ObjectId, ref:'Hospital'},
 employeeID:{type:String, unique:true, sparse:true},
  department: [{ type: String }],
  roles: [
    {
      type: String,
      enum: [
        "pharmacist",
        "admin",
        "reception",
        "nurse",
        "receptionist",
        "doctor",
      ],
    },
  ],
  yearsOfExperience: Number,
  currentPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
  email:{type:String,unique:true, sparse:true},
  address: {
    type: String,
  },
  dateOfBirth: String,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  hireDate:String,
  qualifications: [String],
  certifications: [String],
  shift: {
    type: { type: String, enum: ["Morning", "Afternoon", "Night", "Rotating"] },
    hours: { start: String, end: String },
  },
  salary: Number,
  payrollInfo: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
  },
  paymentHistory: [
    {
      date: Date,
      amount: Number,
      type: {
        type: String,
        enum: ["salary", "bonus", "deduction"],
      },
      month: {
        type: String,
        enum: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
      },
      year: Number,
    },
  ],
  // schedule: [scheduleSchema],
});

 staffSchema.plugin(hospitalPlugin)
export const Staff = mongoose.model("Staff", staffSchema);
