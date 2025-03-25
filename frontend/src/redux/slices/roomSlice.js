import { Backend_URL } from "../../assets/Data";
import { createSlice } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Async thunk for fetching rooms
export const fetchRooms = createLoadingAsyncThunk(
  "rooms/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/rooms`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
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
  "rooms/createRoom",
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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

// Async thunk for updating a room
export const updateRoom = createLoadingAsyncThunk(
  "rooms/updateRoom",
  async ({ id, room }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(room),
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

// Async thunk for deleting a room
export const deleteRoom = createLoadingAsyncThunk(
  "rooms/deleteRoom",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/rooms/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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

// Async thunk for emptying beds
export const emptyBeds = createLoadingAsyncThunk(
  "rooms/emptyBeds",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/rooms/empty-beds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
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
  name: "rooms",
  initialState: {
    rooms: [],
    status: "idle",
    createRoomStatus: "idle",
    updateRoomStatus: "idle",
    deleteRoomStatus: "idle",
    emptyBedsStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createRoom.pending, (state) => {
        state.createRoomStatus = "loading";
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.createRoomStatus = "succeeded";
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.createRoomStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateRoom.pending, (state) => {
        state.updateRoomStatus = "loading";
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.updateRoomStatus = "succeeded";
        const index = state.rooms.findIndex(
          (room) => room._id === action.payload._id
        );
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.updateRoomStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteRoom.pending, (state) => {
        state.deleteRoomStatus = "loading";
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.deleteRoomStatus = "succeeded";
        state.rooms = state.rooms.filter(
          (room) => room._id !== action.payload.room._id
        );
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.deleteRoomStatus = "failed";
        state.error = action.payload;
      })
      .addCase(emptyBeds.pending, (state) => {
        state.emptyBedsStatus = "loading";
      })
      .addCase(emptyBeds.fulfilled, (state, action) => {
        state.emptyBedsStatus = "succeeded";
        action.payload.rooms.forEach((updatedRoom) => {
          const index = state.rooms.findIndex(
            (room) => room._id === updatedRoom._id
          );
          if (index !== -1) {
            state.rooms[index] = updatedRoom;
          }
        });
      })
      .addCase(emptyBeds.rejected, (state, action) => {
        state.emptyBedsStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default roomSlice.reducer;
