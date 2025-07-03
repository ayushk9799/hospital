import { createSlice } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

// Fetch all prescription templates
export const fetchPrescriptionTemplates = createLoadingAsyncThunk(
  "prescriptionTemplates/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/prescription-templates`,
        {
          credentials: "include",
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch prescription templates");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Save (create/update/delete) prescription templates array
export const savePrescriptionTemplates = createLoadingAsyncThunk(
  "prescriptionTemplates/save",
  async (templatesArray, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/prescription-templates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ templates: templatesArray }),
        }
      );
      if (!response.ok)
        throw new Error("Failed to save prescription templates");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const prescriptionTemplateSlice = createSlice({
  name: "prescriptionTemplates",
  initialState: {
    templates: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptionTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPrescriptionTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload;
      })
      .addCase(fetchPrescriptionTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(savePrescriptionTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(savePrescriptionTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload;
      })
      .addCase(savePrescriptionTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default prescriptionTemplateSlice.reducer;
