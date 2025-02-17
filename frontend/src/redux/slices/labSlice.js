import { createSlice } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Async thunks
export const fetchLabRegistrations = createLoadingAsyncThunk(
  "lab/fetchRegistrations",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
      }).toString();
      const response = await fetch(
        `${Backend_URL}/api/lab/registrations?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(
          data.message || "Failed to fetch lab registrations"
        );
      }
      return data.registrations;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const createLabRegistration = createLoadingAsyncThunk(
  "lab/createRegistration",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Backend_URL}/api/lab/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(
          data.message || "Failed to create lab registration"
        );
      }
      return data.labRegistration;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const updateTestStatus = createLoadingAsyncThunk(
  "lab/updateTestStatus",
  async ({ registrationId, testName, newStatus }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/lab/update-test-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId, testName, newStatus }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update test status");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

const initialState = {
  registrations: [],
  registrationsStatus: "idle",
  createRegistrationStatus: "idle",
  updateTestStatus: "idle",
  error: null,
};

const labSlice = createSlice({
  name: "lab",
  initialState,
  reducers: {
    setCreateRegistrationStatusIdle: (state) => {
      state.createRegistrationStatus = "idle";
    },
    setUpdateTestStatusIdle: (state) => {
      state.updateTestStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lab registrations
      .addCase(fetchLabRegistrations.pending, (state) => {
        state.registrationsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchLabRegistrations.fulfilled, (state, action) => {
        state.registrationsStatus = "succeeded";
        state.registrations = action.payload;
      })
      .addCase(fetchLabRegistrations.rejected, (state, action) => {
        state.registrationsStatus = "failed";
        state.error = action.payload;
      })
      // Create lab registration
      .addCase(createLabRegistration.pending, (state) => {
        state.createRegistrationStatus = "loading";
        state.error = null;
      })
      .addCase(createLabRegistration.fulfilled, (state, action) => {
        state.createRegistrationStatus = "succeeded";
        state.registrations.push(action.payload);
      })
      .addCase(createLabRegistration.rejected, (state, action) => {
        state.createRegistrationStatus = "failed";
        state.error = action.payload;
      })
      // Update test status
      .addCase(updateTestStatus.pending, (state) => {
        state.updateTestStatus = "loading";
        state.error = null;
      })
      .addCase(updateTestStatus.fulfilled, (state, action) => {
        state.updateTestStatus = "succeeded";
        const index = state.registrations.findIndex(
          (reg) => reg._id === action.payload.registration._id
        );
        if (index !== -1) {
          state.registrations[index] = action.payload.registration;
        }
      })
      .addCase(updateTestStatus.rejected, (state, action) => {
        state.updateTestStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { setCreateRegistrationStatusIdle, setUpdateTestStatusIdle } =
  labSlice.actions;
export default labSlice.reducer;
