import { Backend_URL } from '../../assets/Data';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/staff/me`, {
        method: 'GET',
        headers: {
          
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  if (response.status === 500) {
    throw new Error('Server error: 500 Internal Server Error');
  }
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    status: 'idle',
    error: null,
    isAuthenticated: false, // Added isAuthenticated to the initial state
  },
  reducers: {
    clearUserData: (state) => {
      state.userData = null;
      state.status = 'idle';
      state.error = null;
      state.isAuthenticated = false; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userData = action.payload;
        state.isAuthenticated = true; // Set isAuthenticated to true when user data is successfully fetched
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false; // Set isAuthenticated to false when fetching user data fails
      });
  },
});

export const { clearUserData } = userSlice.actions;

export default userSlice.reducer;
