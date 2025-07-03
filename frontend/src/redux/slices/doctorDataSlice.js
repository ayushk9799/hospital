import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Async thunk for updating doctor data
export const updateDoctorData = createLoadingAsyncThunk(
  "doctorData/updateDoctorData",
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/doctor/doctor-data/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(doctorData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update doctor data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Async thunk for fetching all doctor data
export const fetchAllDoctorData = createLoadingAsyncThunk(
  "doctorData/fetchAllDoctorData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/doctor/doctor-data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all doctor data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Async thunk for fetching doctor data
export const fetchDoctorData = createLoadingAsyncThunk(
  "doctorData/fetchDoctorData",
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/doctor/doctor-data/${doctorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctor data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

const initialState = {
  currentDoctorData: {
    medicines: [],
    diagnosis: [],
    comorbidities: [],
    complaints: [],
  },
  allDoctorData: [],
  copiedData: null,
  status: "idle",
  error: null,
  updateStatus: "idle",
  updateError: null,
};

const doctorDataSlice = createSlice({
  name: "doctorData",
  initialState,
  reducers: {
    resetDoctorData: (state) => {
      state.currentDoctorData = initialState.currentDoctorData;
      state.status = "idle";
      state.error = null;
    },
    copyDoctorData: (state, action) => {
      // If payload is provided, use it; otherwise use currentDoctorData
      const dataTosCopy = action.payload || state.currentDoctorData;
      state.copiedData = {
        medicines: dataTosCopy.medicines || [],
        diagnosis: dataTosCopy.diagnosis || [],
        comorbidities: dataTosCopy.comorbidities || [],
      };
    },
    clearCopiedData: (state) => {
      state.copiedData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchDoctorData
      .addCase(fetchDoctorData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDoctorData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentDoctorData = {
          medicines: action.payload.medicines || [],
          diagnosis: action.payload.diagnosis || [],
          comorbidities: action.payload.comorbidities || [],
          complaints: action.payload.complaints || [],
          doctor: action.payload.doctor || "",
        };
        state.error = null;
      })
      .addCase(fetchDoctorData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handle fetchAllDoctorData
      .addCase(fetchAllDoctorData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllDoctorData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allDoctorData = action.payload;
        state.error = null;
      })
      .addCase(fetchAllDoctorData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handle updateDoctorData
      .addCase(updateDoctorData.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(updateDoctorData.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.currentDoctorData = {
          medicines: action.payload.medicines || [],
          diagnosis: action.payload.diagnosis || [],
          comorbidities: action.payload.comorbidities || [],
          complaints: action.payload.complaints || [],
          doctor: action.payload.doctor || "",
        };
        const index = state.allDoctorData.findIndex(
          (d) => d.doctor === action.payload.doctor
        );
        if (index !== -1) {
          state.allDoctorData[index] = action.payload;
        } else {
          state.allDoctorData.push(action.payload);
        }
        state.updateError = null;
      })
      .addCase(updateDoctorData.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      });
  },
});

export const { resetDoctorData, copyDoctorData, clearCopiedData } =
  doctorDataSlice.actions;
export default doctorDataSlice.reducer;
