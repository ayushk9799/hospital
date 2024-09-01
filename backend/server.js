import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
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
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://ayushkumarsanu6969:fk7f7SRyMjd6B84V@cluster0.ajyh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' || 'mongodb://localhost:27017/hospital_management')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Apply tenant plugin to all schemas
mongoose.plugin(hospitalPlugin)
// Apply tenant middleware to all routes except auth

app.use('/api/hospitals', hospitalRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api', identifyHospital);

app.use('/api/auth', authRoutes);

// Apply verifyToken middleware to all routes except login and register
app.use('/api/patients', patientRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});