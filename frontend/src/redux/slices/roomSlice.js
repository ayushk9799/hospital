import { Backend_URL } from '../../assets/Data';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching rooms
export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async () => {
  const response = await fetch(`${Backend_URL}/api/rooms`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }, // Include credentials
  });
  if(response.status === 500){
    throw new Error('Server Error');
  } 
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
});

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default roomSlice.reducer;
