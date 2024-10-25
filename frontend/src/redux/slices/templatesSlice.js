import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import  createLoadingAsyncThunk  from "./createLoadingAsyncThunk";
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
  },
  { useGlobalLoader: true }
);

const initialState = {
  labTestsTemplate: [],
  headerTemplate: {},
  diagnosisTemplate: [],
  status: "idle", 
  error: null,
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
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message || "Failed to fetch templates";
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        if (action.payload.diagnosisTemplate) {
          state.diagnosisTemplate = action.payload.diagnosisTemplate;
        }
        if (action.payload.labTestsTemplate) {
          // Check if the new template already exists
          const existingTemplateIndex = state.labTestsTemplate.findIndex(
            (template) => template.name === action.payload.labTestsTemplate.name
          );

          if (existingTemplateIndex !== -1) {
            // Update existing template
            state.labTestsTemplate[existingTemplateIndex] = action.payload.labTestsTemplate;
          } else {
            // Add new template
            state.labTestsTemplate.push(action.payload.labTestsTemplate);
          }
        }
        if (action.payload.headerTemplate) {
          state.headerTemplate = action.payload.headerTemplate;
        }
      });
  },
});

export default templatesSlice.reducer;
