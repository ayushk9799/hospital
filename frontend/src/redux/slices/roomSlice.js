import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching rooms
export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async () => {
  const response = await axios.get('/api/rooms');
  return response.data;
});

// Async thunk for creating a room
export const createRoom = createAsyncThunk('rooms/createRoom', async (roomData) => {
  const response = await axios.post('/api/rooms', roomData);
  return response.data;
});

// Async thunk for updating a room
export const updateRoom = createAsyncThunk('rooms/updateRoom', async ({ id, roomData }) => {
  const response = await axios.put(`/api/rooms/${id}`, roomData);
  return response.data;
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
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const index = state.rooms.findIndex(room => room._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      });
  },
});

export default roomSlice.reducer;
