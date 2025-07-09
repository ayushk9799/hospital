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
  }, 
  { useGlobalLoader: true }
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
  },
  { useGlobalLoader: true }
);

export const updatePrefixData = createLoadingAsyncThunk(
  "hospitalSettings/updatePrefixData",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/registration/settings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(settings),
        }
      );
      if (!response.ok) throw new Error("Failed to update prefix settings");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const fetchPrefixData = createLoadingAsyncThunk(
  "hospitalSettings/prefixData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/registration/settings`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch prefix data");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

const hospitalSettingsSlice = createSlice({
  name: "hospitalSettings",
  initialState: {
    settings: null,
    status: "idle",
    error: null,
    prefixData: null,
    prefixDataStatus: "idle",
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
      })
      .addCase(fetchPrefixData.pending, (state) => {
        state.prefixDataStatus = "loading";
      })
      .addCase(fetchPrefixData.fulfilled, (state, action) => {
        state.prefixDataStatus = "succeeded";
        state.prefixData = action.payload;
      })
      .addCase(fetchPrefixData.rejected, (state, action) => {
        state.prefixDataStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updatePrefixData.pending, (state) => {
        state.prefixDataStatus = "loading";
      })
      .addCase(updatePrefixData.fulfilled, (state, action) => {
        state.prefixDataStatus = "succeeded";
        state.prefixData = action.payload;
      })
      .addCase(updatePrefixData.rejected, (state, action) => {
        state.prefixDataStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default hospitalSettingsSlice.reducer;
