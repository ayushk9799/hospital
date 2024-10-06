import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import {hospitalPlugin} from './plugins/hospitalPlugin.js'
import patientRoutes from './routes/patientRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import { identifyHospital } from './middleware/hospitalMiddleware.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import superAdminRoutes from './routes/superAdmin.js';
import orderRoutes from './routes/orderRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import billingRoutes from './routes/BillingRoutes.js';
import dashboardRoute from './routes/dashboardRoute.js';
dotenv.config({path:'./config/config.env'});

const app = express();
const PORT = process.env.PORT || 3000;

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../frontend/build')));
 app.options("*", cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://ayushkumarsanu6969:fk7f7SRyMjd6B84V@cluster0.ajyh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' || 'mongodb://localhost:27017/hospital_management')
.then(() => )
.catch(err => console.error('MongoDB connection error:', err));

// Apply tenant plugin to all schemas

// API routes
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', identifyHospital);
app.use('/api/patients', patientRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoute);

// Serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});