import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './slices/patientSlice';
import staffReducer from './slices/staffSlice';
import departmentReducer from './slices/departmentSlice';
import userReducer from './slices/userSlice';
import roomReducer from './slices/roomSlice';
import pharmacyReducer from './slices/pharmacySlice';
import loaderReducer from './slices/loaderSlice';
export const store = configureStore({
  reducer: {
    patients: patientReducer,
    staff: staffReducer,
    departments:departmentReducer,
    rooms:roomReducer,
    pharmacy:pharmacyReducer,
    user:userReducer
  },
});