import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Backend_URL } from '../../assets/Data';
import createLoadingAsyncThunk from './createLoadingAsyncThunk';

// Replace the existing fetchPatients thunk with this:
export const fetchPatients = createLoadingAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients/details`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Add a new thunk for registering a patient
export const registerPatient = createLoadingAsyncThunk(
  'patients/registerPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const savePrescription = createAsyncThunk(
  'patients/savePrescription',
  async ({ selectedVisitId, vitals, prescription,selectedPatientType,clinicalSummary,notes, labTests,comorbidities,conditionOnAdmission,conditionOnDischarge }) => {
    const response = await fetch(
      `${Backend_URL}/api/patients/${selectedPatientType === "OPD" ? "visit" : "admission"}/${selectedVisitId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({vitals,prescription,labTests,clinicalSummary,notes,comorbidities,conditionOnAdmission,conditionOnDischarge}),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save data');
    }

    const data = await response.json();
    return data;
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState: {
    patientlist: [],
    patientsStatus: 'idle',
    selectedPatient: null,
    status: 'idle',
    prescriptionUpdateStatus: 'idle',
    registerPatientStatus: 'idle',
    error: null,
  },
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload
    },
    setSelectedPatientForBill: (state, action) => {  
      state.selectedPatient = state.patientlist.find(patient => patient.patient._id === action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.patientlist = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(savePrescription.pending, (state) => {
        state.prescriptionUpdateStatus = 'loading';
      })
      .addCase(savePrescription.fulfilled, (state, action) => {
        state.prescriptionUpdateStatus = 'succeeded';
        console.log('visit',action.payload);
        // Update the patient in the patientlist
        const value = action.payload;
        
        const index = state.patientlist.findIndex(patient => patient._id === value._id);
        if (index !== -1) {
          state.patientlist[index] = {...state.patientlist[index], ...value};
        }
      })
      .addCase(savePrescription.rejected, (state, action) => {
        state.prescriptionUpdateStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(registerPatient.pending, (state) => {
        state.registerPatientStatus = 'loading';
      })
      .addCase(registerPatient.fulfilled, (state, action) => {
        state.registerPatientStatus = 'succeeded';
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.registerPatientStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setSelectedPatient, setSelectedPatientForBill } = patientSlice.actions
export default patientSlice.reducer;