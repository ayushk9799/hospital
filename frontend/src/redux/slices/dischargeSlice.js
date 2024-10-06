import { Backend_URL } from '../../assets/Data';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for discharging a patient
export const dischargePatient = createAsyncThunk(
  'discharge/dischargePatient',
  async (dischargeData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/patients/discharge/${dischargeData.patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dischargeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dischargeSlice = createSlice({
  name: 'discharge',
  initialState: {
    status: 'idle',
    error: null,
    dischargeData: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(dischargePatient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(dischargePatient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dischargeData = action.payload;
      })
      .addCase(dischargePatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default dischargeSlice.reducer;