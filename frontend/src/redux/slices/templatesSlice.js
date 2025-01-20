import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";
import { Backend_URL } from "../../assets/Data";

// Async thunk for fetching templates
export const fetchTemplates = createLoadingAsyncThunk(
  "templates/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/read`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

// Update the existing updateDiagnosisTemplate to handle both diagnosis and lab test templates
export const updateTemplate = createLoadingAsyncThunk(
  "templates/updateTemplate",
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(templateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating service bill collections
export const updateServiceBillCollections = createAsyncThunk(
  "templates/updateServiceBillCollections",
  async (serviceBillCollections, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/service_collections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(serviceBillCollections),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update service bill collections");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  labTestsTemplate: [],
  headerTemplate: "",
  diagnosisTemplate: [],
  dischargeSummaryTemplate: "",
  opdPrescriptionTemplate: "",
  status: "idle",
  error: null,
  serviceBillCollections: [],
};

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.labTestsTemplate = action.payload.labTestsTemplate;
        state.headerTemplate = action.payload.headerTemplate;
        state.diagnosisTemplate = action.payload.diagnosisTemplate;
        state.dischargeSummaryTemplate = action.payload.dischargeSummaryTemplate;
        state.opdPrescriptionTemplate = action.payload.opdPrescriptionTemplate;
        state.comorbidities = action.payload.comorbidities;
        state.medicinelist = action.payload.medicinelist;
        state.serviceBillCollections = action.payload.service_collections;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message || "Failed to fetch templates";
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        // Update both diagnosis and lab test templates based on the response
        if (action.payload.diagnosisTemplate) {
          state.diagnosisTemplate = action.payload.diagnosisTemplate;
        }
        if (action.payload.labTestsTemplate) {
          state.labTestsTemplate = action.payload.labTestsTemplate;
        }
        if (action.payload.headerTemplate) {
          state.headerTemplate = action.payload.headerTemplate;
        }
        if (action.payload.dischargeSummaryTemplate) {
          state.dischargeSummaryTemplate = action.payload.dischargeSummaryTemplate;
        }
        if (action.payload.opdPrescriptionTemplate) {
          state.opdPrescriptionTemplate = action.payload.opdPrescriptionTemplate;
        }
      })
      .addCase(updateServiceBillCollections.fulfilled, (state, action) => {
        state.serviceBillCollections = action.payload;
      });
  },
});

export default templatesSlice.reducer;
