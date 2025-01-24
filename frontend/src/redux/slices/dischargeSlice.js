import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";

// Async thunk for discharging a patient
export const dischargePatient = createAsyncThunk(
  "discharge/dischargePatient",
  async (dischargeData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/discharge/${
          dischargeData.patientId || dischargeData._id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(dischargeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const updatedPatient = await response.json();
      return updatedPatient.admission;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New saveDischargeData thunk
export const saveDischargeData = createAsyncThunk(
  "discharge/saveDischargeData",
  async (dischargeData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/patients/SaveButNotDischarge/${
          dischargeData.patientId || dischargeData._id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(dischargeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dischargeSlice = createSlice({
  name: "discharge",
  initialState: {
    status: "idle",
    savingStatus: "idle",
    error: null,
    dischargeData: null,
    formConfig: null,
  },
  reducers: {
    setDischargeData: (state, action) => {
      state.dischargeData = action.payload;
    },
    setFormConfig: (state, action) => {
      state.formConfig = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(dischargePatient.pending, (state) => {
        state.status = "loading";
      })
      .addCase(dischargePatient.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dischargeData = action.payload.admission.dischargeData;
        state.formConfig = action.payload.admission.formConfig;
      })
      .addCase(dischargePatient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(saveDischargeData.pending, (state) => {
        state.savingStatus = "loading";
      })
      .addCase(saveDischargeData.fulfilled, (state, action) => {
        state.savingStatus = "succeeded";
        state.dischargeData = action.payload.admission.dischargeData;
        state.formConfig = action.payload.admission.formConfig;
      })
      .addCase(saveDischargeData.rejected, (state, action) => {
        state.savingStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setDischargeData, setFormConfig } = dischargeSlice.actions;
export default dischargeSlice.reducer;
