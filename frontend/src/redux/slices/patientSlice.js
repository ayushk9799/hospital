import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Backend_URL } from '../../assets/Data';

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async () => {
    const response = await fetch(`${Backend_URL}/api/patients/details`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (response.status === 500) {
      throw new Error('Server error: 500 Internals Server Error');
    }
    
    const data = await response.json();
    return data;
  }
);

export const savePrescription = createAsyncThunk(
  'patients/savePrescription',
  async ({ selectedVisitId, vitals, prescription,selectedPatientType, labTests }) => {
    const response = await fetch(
      `${Backend_URL}/api/patients/${selectedPatientType === "OPD" ? "visit" : "admission"}/${selectedVisitId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({vitals,prescription,labTests}),
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
    error: null,
  },
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload
    },
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
      });
  },
});

export const { setSelectedPatient } = patientSlice.actions
export default patientSlice.reducer;