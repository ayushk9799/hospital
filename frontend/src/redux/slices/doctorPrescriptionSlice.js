import { createSlice } from "@reduxjs/toolkit";
import { Backend_URL } from "../../assets/Data";
import { DEFAULT_PRESCRIPTION_FORM_CONFIG } from "../../config/opdPrescriptionConfig";
import createLoadingAsyncThunk from "./createLoadingAsyncThunk";

export const fetchDoctorPrescriptionTemplates = createLoadingAsyncThunk(
  "doctorPrescription/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/prescription-templates/default`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch templates");
      }
      return data.template;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

export const saveDoctorPrescriptionTemplate = createLoadingAsyncThunk(
  "doctorPrescription/saveTemplate",
  async (templateData, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/prescription-templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(templateData),
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to save template");
      }
      // After saving, fetch all templates again to have the fresh data.
      dispatch(fetchDoctorPrescriptionTemplates());
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { useGlobalLoader: true }
);

const initialState = {
  templates: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedTemplate: null,
  formConfig: null,
  selectedDoctors: [],
};

const doctorPrescriptionSlice = createSlice({
  name: "doctorPrescription",
  initialState,
  reducers: {
    selectTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
      state.formConfig = action.payload.value;
      state.selectedDoctors = action.payload.associatedDoctors || [];
    },
    updateFormConfig: (state, action) => {
      state.formConfig = action.payload;
    },
    updateSelectedDoctors: (state, action) => {
      state.selectedDoctors = action.payload;
    },
    createNewTemplate: (state) => {
      state.selectedTemplate = {
        name: "New Template",
        value: DEFAULT_PRESCRIPTION_FORM_CONFIG,
        associatedDoctors: [],
      };
      state.formConfig = DEFAULT_PRESCRIPTION_FORM_CONFIG;
      state.selectedDoctors = [];
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
      state.formConfig = null;
      state.selectedDoctors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorPrescriptionTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDoctorPrescriptionTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.templates = action.payload;
      })
      .addCase(fetchDoctorPrescriptionTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(saveDoctorPrescriptionTemplate.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveDoctorPrescriptionTemplate.fulfilled, (state) => {
        state.status = "succeeded";
        // No need to update templates here because fetch is re-dispatched
      })
      .addCase(saveDoctorPrescriptionTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  selectTemplate,
  updateFormConfig,
  updateSelectedDoctors,
  createNewTemplate,
  clearSelectedTemplate,
} = doctorPrescriptionSlice.actions;

export default doctorPrescriptionSlice.reducer;
