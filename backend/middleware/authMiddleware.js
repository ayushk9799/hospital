import jwt from "jsonwebtoken";
import cookie from "cookie";
import { Staff } from "../models/Staff.js";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Define all possible permissions
export const PERMISSIONS = {
  // Patient Management
  VIEW_PATIENTS: "view_patients",
  CREATE_PATIENTS: "create_patients",
  EDIT_PATIENTS: "edit_patients",
  DELETE_PATIENTS: "delete_patients",
  
  // Inventory Management
  VIEW_INVENTORY: "view_inventory",
  CREATE_INVENTORY: "create_inventory",
  EDIT_INVENTORY: "edit_inventory",
  DELETE_INVENTORY: "delete_inventory",
  EDIT_INVENTORY_PRICE: "edit_inventory_price",
  EDIT_INVENTORY_QUANTITY: "edit_inventory_quantity",
  
  // Financial Management
  VIEW_FINANCIAL: "view_financial",
  CREATE_BILLS: "create_bills",
  EDIT_BILLS: "edit_bills",
  DELETE_BILLS: "delete_bills",
  COLLECT_PAYMENTS: "collect_payments",
  VIEW_REPORTS: "view_reports",
  
  // Clinical Operations
  VIEW_PRESCRIPTIONS: "view_prescriptions",
  CREATE_PRESCRIPTIONS: "create_prescriptions",
  EDIT_PRESCRIPTIONS: "edit_prescriptions",
  RECORD_VITALS: "record_vitals",
  
  // Staff Management
  VIEW_STAFF: "view_staff",
  CREATE_STAFF: "create_staff",
  EDIT_STAFF: "edit_staff",
  DELETE_STAFF: "delete_staff",
  
  // Hospital Management
  VIEW_HOSPITAL: "view_hospital",
  EDIT_HOSPITAL: "edit_hospital",
  
  // Purchase Management
  CREATE_PURCHASE: "create_purchase",
  VIEW_PURCHASE: "view_purchase",
  EDIT_PURCHASE: "edit_purchase",
  
  // Supplier Management
  VIEW_SUPPLIERS: "view_suppliers",
  CREATE_SUPPLIERS: "create_suppliers",
  EDIT_SUPPLIERS: "edit_suppliers",
  
  // Appointments
  VIEW_APPOINTMENTS: "view_appointments",
  CREATE_APPOINTMENTS: "create_appointments",
  EDIT_APPOINTMENTS: "edit_appointments"
};

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies?.jwtaccesstoken;

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decoded = await jwt.verify(token, "secretkey");

    req.user = await Staff.findById(decoded._id);
    if (!req.user) {
      next(new Error("user not found"));
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to check user role and permissions
export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // const user = await Staff.findById(req.user._id);
      const user=req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

     if(user.permissions?.includes(requiredPermission))
     {
    next()
     }
      else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error checking permissions", error: error.message });
    }
  };
};

// Helper function to generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: "1d" });
};
