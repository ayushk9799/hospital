import { Backend_URL } from '../../assets/Data';
import { createSlice } from '@reduxjs/toolkit';
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Async thunk for fetching rooms
export const fetchRooms = createLoadingAsyncThunk(
  'rooms/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/rooms`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Async thunk for creating a room
export const createRoom = createLoadingAsyncThunk(
  'rooms/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(roomData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    status: 'idle',
    createRoomStatus: 'idle',
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
        state.error = action.payload;
      })
      .addCase(createRoom.pending, (state) => {
        state.createRoomStatus = 'loading';
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.createRoomStatus = 'succeeded';
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.createRoomStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export default roomSlice.reducer;
