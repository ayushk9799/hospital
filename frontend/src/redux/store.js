import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './slices/patientSlice';
import staffReducer from './slices/staffSlice';
import departmentReducer from './slices/departmentSlice';
import roomReducer from './slices/roomSlice';
export const store = configureStore({
  reducer: {
    patients: patientReducer,
    staff: staffReducer,
    departments:departmentReducer,
    rooms:roomReducer
  },
});