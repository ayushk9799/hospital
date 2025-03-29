import { createSlice } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Fetch hospital settings
export const fetchHospitalSettings = createLoadingAsyncThunk(
  "hospitalSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/hospitals/settings`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch hospital settings");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update hospital settings
export const updateHospitalSettings = createLoadingAsyncThunk(
  "hospitalSettings/update",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/postsettings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(settings),
        }
      );
      if (!response.ok) throw new Error("Failed to update hospital settings");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const hospitalSettingsSlice = createSlice({
  name: "hospitalSettings",
  initialState: {
    settings: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitalSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHospitalSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.settings = action.payload;
      })
      .addCase(fetchHospitalSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateHospitalSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export default hospitalSettingsSlice.reducer;
