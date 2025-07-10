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
  },
  { useGlobalLoader: true }
);

// Create baby record
export const editBaby = createLoadingAsyncThunk(
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
export const getBabiesByAdmission = createLoadingAsyncThunk(
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
export const fetchAllBabies = createLoadingAsyncThunk(
  "babies/fetchAllBabies",
  async (filters = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.startDate) {
        queryParams.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append("endDate", filters.endDate);
      }
      if (filters.gender && filters.gender !== "All") {
        queryParams.append("gender", filters.gender);
      }

      const queryString = queryParams.toString();
      const url = `${Backend_URL}/api/babies${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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

// Add this thunk after fetchAllBabies
export const searchBabyByNumber = createLoadingAsyncThunk(
  "babies/searchByNumber",
  async (searchNumber) => {
    try {
      const response = await fetch(`${Backend_URL}/api/babies/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ searchNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to search babies");
      }

      return await response.json();
    } catch (error) {
      throw error.message || "Failed to search babies";
    }
  }
);

const initialState = {
  babies: [], // all babies
  currentPatientBabies: [], // babies for specific patient
  searchResults: [],
  status: "idle",
  fetchCurrentPatientBabiesStatus: "idle",
  createBabyStatus: "idle",
  editBabyStatus: "idle",
  searchStatus: "idle",
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
        const index = state.babies.findIndex(
          (baby) => baby._id === action.payload._id
        );
        if (index !== -1) {
          state.babies[index] = action.payload;
        }
        const index2 = state.currentPatientBabies.findIndex(
          (baby) => baby._id === action.payload._id
        );
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
      })
      // Search Baby by Number
      .addCase(searchBabyByNumber.pending, (state) => {
        state.searchStatus = "loading";
        state.error = null;
      })
      .addCase(searchBabyByNumber.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload;
      })
      .addCase(searchBabyByNumber.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const { resetBabyState } = babySlice.actions;

export default babySlice.reducer;
