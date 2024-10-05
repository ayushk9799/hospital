import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './slices/patientSlice';
import staffReducer from './slices/staffSlice';
import departmentReducer from './slices/departmentSlice';
import userReducer from './slices/userSlice';
import roomReducer from './slices/roomSlice';
import pharmacyReducer from './slices/pharmacySlice';
import loaderReducer from './slices/loaderSlice';
import serviceReducer from './slices/serviceSlice';
import billingReducer from './slices/BillingSlice';
import hospitalReducer from './slices/HospitalSlice';
import templatesReducer from './slices/templatesSlice';
import dashboardReducer from './slices/dashboardSlice';
export const store = configureStore({
  reducer: {
    patients: patientReducer,
    staff: staffReducer,
    departments:departmentReducer,
    rooms:roomReducer,
    pharmacy:pharmacyReducer,
    user:userReducer,
    loader:loaderReducer,
    services:serviceReducer,
    bills:billingReducer,
    hospital:hospitalReducer,
    templates: templatesReducer,
    dashboard: dashboardReducer
  },
});