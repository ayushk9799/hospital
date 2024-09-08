import { Backend_URL } from '../../assets/Data';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchStaffMembers = createAsyncThunk(
  'staff/fetchStaffMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/staff`,{headers:{'Content-Type':'application/json'},credentials:'include'});
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const createStaffMember = createAsyncThunk(
  'staff/createStaffMember',
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${Backend_URL}/api/staff`, staffData);
      return response.data.staff;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);




const staffSlice = createSlice({
  name: 'staff',
  initialState: {
    staffMembers: [],
    doctors: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    getDoctors: (state, action) => {
      state.doctors = state.staffMembers?.filter(
        (staff) => staff.role.includes('doctor')
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffMembers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStaffMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staffMembers = action.payload;
        console.log(state.staffMembers)
        console.log(action.payload)
      })
      .addCase(fetchStaffMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.error;
      })
      .addCase(createStaffMember.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createStaffMember.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staffMembers.push(action.payload);
      })
      .addCase(createStaffMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.error;
        
      })
     
}});
export const { getDoctors } = staffSlice.actions;
export default staffSlice.reducer;
