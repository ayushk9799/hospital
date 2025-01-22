import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";

// Create baby record
export const createBaby = createAsyncThunk(
  "babies/createBaby",
  async (babyData) => {
    try {
      const response = await fetch(`${Backend_URL}/api/babies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(babyData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register baby");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error.message || "Failed to register baby";
    }
  }
);

// Get babies by mother's IPD admission
export const getBabiesByAdmission = createAsyncThunk(
  "babies/getBabiesByAdmission",
  async (ipdAdmissionId) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/babies/admission/${ipdAdmissionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch baby records");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error.message || "Failed to fetch baby records";
    }
  }
);

const initialState = {
  babies: [],
  currentBaby: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const babySlice = createSlice({
  name: "babies",
  initialState,
  reducers: {
    resetBabyState: (state) => {
      state.status = "idle";
      state.error = null;
    },
    setCurrentBaby: (state, action) => {
      state.currentBaby = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Baby
      .addCase(createBaby.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createBaby.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.babies.push(action.payload);
        state.currentBaby = action.payload;
      })
      .addCase(createBaby.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Get Babies by Admission
      .addCase(getBabiesByAdmission.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getBabiesByAdmission.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.babies = action.payload;
      })
      .addCase(getBabiesByAdmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { resetBabyState, setCurrentBaby } = babySlice.actions;

export default babySlice.reducer;
