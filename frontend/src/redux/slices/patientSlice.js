import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Backend_URL } from '../../assets/Data';

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async () => {
    const response = await fetch(`${Backend_URL}/api/patients/details`,{headers:{'Content-Type':'application/json'},credentials:'include'});
   const data=await response.json();
   console.log(data)
    return data;
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState: {
    patientlist: [],
    status: 'idle',
    error: null,
  },
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload)
        state.patientlist = action.payload;
        console.log(state.patientlist)
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default patientSlice.reducer;