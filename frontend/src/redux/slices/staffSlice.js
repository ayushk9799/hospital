import { Backend_URL } from '../../assets/Data';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchStaffMembers = createAsyncThunk(
  'staff/fetchStaffMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/staff`, {
        headers: {'Content-Type':'application/json'},
        credentials: 'include'
      });
      if (response.status === 500) {
        throw new Error('Server error: 500 Internal Server Error');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createStaffMember = createAsyncThunk(
  'staff/createStaffMember',
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/staff`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        credentials: 'include',
        body: JSON.stringify(staffData)
      });
      if (response.status === 500) {
        throw new Error('Server error: 500 Internal Server Error');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.staff;
    } catch (error) {
      return rejectWithValue(error.message);
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
  
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffMembers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStaffMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staffMembers = action.payload;
        state.doctors = state.staffMembers?.filter(
          (staff) => staff.roles.includes('doctor')
        );
      })
      .addCase(fetchStaffMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
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
        state.error = action.payload;
      });
  }
});

export const { getDoctors } = staffSlice.actions;
export default staffSlice.reducer;
