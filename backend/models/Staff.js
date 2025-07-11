import mongoose from "mongoose";
import { hospitalPlugin } from "../plugins/hospitalPlugin.js";

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,

    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  aadharNumber: {
    type: String,
  },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  employeeID: { type: String },
  employeeID: { type: String },
  department: [{ type: String }],
  roles: [
    {
      type: String,
      enum: [
        "pharmacist",
        "admin",
        "nurse",
        "receptionist",
        "doctor",
        "technician",
        "lab technician",
        "manager",
        "accountant",
      ],
    },
  ],
  yearsOfExperience: Number,
  currentPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
  email: { type: String },
  contactNumber: { type: String },
  address: {
    type: String,
  },
  dateOfBirth: String,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  hireDate: String,
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
  permissions: [
    {
      type: String,
      enum: [
        // Patient Management
        "view_patients",
        "create_patients",
        "edit_patients",
        "delete_patients",
        "give_discount",
        "can_discharge",

        // Inventory Management
        "view_inventory",
        "create_inventory",
        "edit_inventory",
        "delete_inventory",
        "edit_inventory_price",
        "edit_inventory_quantity",

        // Financial Management
        "view_financial",
        "create_bills",
        "edit_bills",
        "delete_payments",
        "delete_bills",
        "collect_payments",
        "view_reports",

        // Clinical Operations
        "view_prescriptions",
        "create_prescriptions",
        "edit_prescriptions",
        "record_vitals",

        // Staff Management
        "view_staff",
        "create_staff",
        "edit_staff",
        "delete_staff",

        // Hospital Management
        "view_hospital",
        "edit_hospital",

        // Purchase Management
        "create_purchase",
        "view_purchase",
        "edit_purchase",

        // Supplier Management
        "view_suppliers",
        "create_suppliers",
        "edit_suppliers",

        // Collections/Payments Viewing
        "view_otherscollection_all", // Permission to view all collections/payments
        "view_otherscollection_for_just_today", // Permission to view only today's collections/payments

        "record_expense",
        "make_prescription",

        // Appointments
        "view_appointments",
        "create_appointments",
        "edit_appointments",
      ],
    },
  ],
});

staffSchema.plugin(hospitalPlugin);
export const Staff = mongoose.model("Staff", staffSchema);
