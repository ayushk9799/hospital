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

// Add new async thunks
export const editTemplate = createLoadingAsyncThunk(
  "templates/editTemplate",
  async ({ field, index, template }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/edit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            field,
            index,
            newValue: template,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update template");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTemplate = createLoadingAsyncThunk(
  "templates/deleteTemplate",
  async ({ field, index }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/template/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            field,
            index,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to delete template");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  birthCertificateTemplate: "",
  labTestsTemplate: [],
  headerTemplateArray: [],
  diagnosisTemplate: [],
  mergeTemplate: "",
  dischargeSummaryTemplateArray: [],
  opdPrescriptionTemplateArray: [],
  opdRxTemplateArray: [],
  consentFormTemplateArray: [],
  status: "idle",
  error: null,
  serviceBillCollections: [],
  dischargeFormTemplates: null,
  updateTempleteStatus: "idle",
  labBillingTemplate: "",
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
        state.headerTemplateArray = action.payload.headerTemplateArray || [];
        state.headerTemplate = action.payload.headerTemplate || "";
        state.dischargeSummaryTemplate =
          action.payload.dischargeSummaryTemplate || "";
        state.diagnosisTemplate = action.payload.diagnosisTemplate;
        state.dischargeSummaryTemplateArray =
          action.payload.dischargeSummaryTemplateArray || [];
        state.opdPrescriptionTemplateArray =
          action.payload.opdPrescriptionTemplateArray || [];
        state.opdRxTemplateArray = action.payload.opdRxTemplateArray || [];
        state.comorbidities = action.payload.comorbidities;
        state.medicinelist = action.payload.medicinelist;
        state.mergeTemplate = action.payload.mergeTemplate;
        state.serviceBillCollections = action.payload.service_collections;
        state.dischargeFormTemplates = action.payload.dischargeFormTemplates;
        state.consentFormTemplateArray = action.payload.consentFormArray;
        state.birthCertificateTemplate =
          action.payload.birthCertificateTemplate;
        state.labReportUiTemplate = action.payload.labReportUiTemplate;
        state.labBillingTemplate = action.payload.labBillingTemplate || "";
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message || "Failed to fetch templates";
      })
      .addCase(updateTemplate.pending, (state) => {
        state.updateTempleteStatus = "loading";
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        // Update both diagnosis and lab test templates based on the response
        state.updateTempleteStatus = "succeeded";
        if (action.payload.diagnosisTemplate) {
          state.diagnosisTemplate = action.payload.diagnosisTemplate;
        }
        if(action.payload.medicinelist)
        {
          state.medicinelist  =action.payload.medicinelist
        }
        if(action.payload.comorbidities)
        {
          state.comorbidities=action.payload.comorbidities
        }
        if (action.payload.labTestsTemplate) {
          state.labTestsTemplate = action.payload.labTestsTemplate;
        }
        if (action.payload.headerTemplateArray) {
          state.headerTemplateArray = action.payload.headerTemplateArray || [];
        }
        if (action.payload.dischargeSummaryTemplateArray) {
          state.dischargeSummaryTemplateArray =
            action.payload.dischargeSummaryTemplateArray || [];
        }
        if (action.payload.opdPrescriptionTemplateArray) {
          state.opdPrescriptionTemplateArray =
            action.payload.opdPrescriptionTemplateArray || [];
        }
        if (action.payload.opdRxTemplateArray) {
          state.opdRxTemplateArray = action.payload.opdRxTemplateArray || [];
        }
        if (action.payload.dischargeFormTemplates) {
          state.dischargeFormTemplates = action.payload.dischargeFormTemplates;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.updateTempleteStatus = "failed";
      })
      .addCase(updateServiceBillCollections.fulfilled, (state, action) => {
        state.serviceBillCollections = action.payload;
      })
      .addCase(editTemplate.fulfilled, (state, action) => {
        state.labTestsTemplate = action.payload.labTestsTemplate;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.labTestsTemplate = action.payload.labTestsTemplate;
      });
  },
});

export default templatesSlice.reducer;
