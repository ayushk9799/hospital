import { Backend_URL } from '../../assets/Data';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async ({ name, staffIds }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, staffIds }),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addDoctorToDepartment = createAsyncThunk(
  'departments/addDoctorToDepartment',
  async ({ departmentId, doctorId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments/${departmentId}/addDoctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ doctorId }),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeDoctorFromDepartment = createAsyncThunk(
  'departments/removeDoctorFromDepartment',
  async ({ departmentId, doctorId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/departments/${departmentId}/removeDoctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ doctorId }),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    departments: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.error;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(addDoctorToDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(dep => dep._id === action.payload._id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(removeDoctorFromDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(dep => dep._id === action.payload._id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      });
  },
});

export default departmentSlice.reducer;
