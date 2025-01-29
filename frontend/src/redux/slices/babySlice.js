import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Create baby record
export const createBaby = createLoadingAsyncThunk(
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
  },  { useGlobalLoader: true }
);

// Create baby record
export const editBaby = createAsyncThunk(
  "babies/saveCertificate",
  async (babyData) => {
    try {
      const response = await fetch(`${Backend_URL}/api/babies/`, {
        method: "PUT",
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

// Create baby record
export const fetchAllBabies = createAsyncThunk(
  "babies/fetchAllBabies",
  async () => {
    try {
      const response = await fetch(`${Backend_URL}/api/babies/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch babies");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error.message || "Failed to fetch babies";
    }
  }
);

const initialState = {
  babies: [], // all babies
  currentPatientBabies: [], // babies for specific patient
  status: 'idle',
  fetchCurrentPatientBabiesStatus: 'idle',
  createBabyStatus: 'idle',
  editBabyStatus: 'idle',
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
  },
  extraReducers: (builder) => {
    builder
      // Create Baby
      .addCase(createBaby.pending, (state) => {
        state.createBabyStatus = "loading";
        state.error = null;
      })
      .addCase(createBaby.fulfilled, (state, action) => {
        state.createBabyStatus = "succeeded";
        state.babies.unshift(action.payload);
        state.currentPatientBabies.unshift(action.payload);
      })
      .addCase(createBaby.rejected, (state, action) => {
        state.createBabyStatus = "failed";
        state.error = action.error.message;
      })
      // Edit Baby
      .addCase(editBaby.pending, (state) => {
        state.editBabyStatus = "loading";
        state.error = null;
      })
      .addCase(editBaby.fulfilled, (state, action) => {
        state.editBabyStatus = "succeeded";
        // Update the baby in the babies array
        const index = state.babies.findIndex(baby => baby._id === action.payload._id);
        if (index !== -1) {
          state.babies[index] = action.payload;
        }
        const index2 = state.currentPatientBabies.findIndex(baby => baby._id === action.payload._id);
        if (index !== -1) {
          state.currentPatientBabies[index2] = action.payload;
        }
      })
      .addCase(editBaby.rejected, (state, action) => {
        state.editBabyStatus = "failed";
        state.error = action.error.message;
      })
      // Get Babies by Admission
      .addCase(getBabiesByAdmission.pending, (state) => {
        state.fetchCurrentPatientBabiesStatus = "loading";
        state.error = null;
      })
      .addCase(getBabiesByAdmission.fulfilled, (state, action) => {
        state.fetchCurrentPatientBabiesStatus = "succeeded";
        state.currentPatientBabies = action.payload;
      })
      .addCase(getBabiesByAdmission.rejected, (state, action) => {
        state.fetchCurrentPatientBabiesStatus = "failed";
        state.error = action.error.message;
      })
      // Add fetchAllBabies cases
      .addCase(fetchAllBabies.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllBabies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.babies = action.payload;
      })
      .addCase(fetchAllBabies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { resetBabyState } = babySlice.actions;

export default babySlice.reducer;
